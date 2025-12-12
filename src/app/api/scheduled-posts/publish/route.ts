import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { postToLinkedIn } from '@/lib/linkedin/client'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Create authenticated supabase client (uses user's session)
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('[Publish] Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Publish] Checking scheduled posts for user:', user.id)

    const now = new Date()
    console.log('[Publish] Current time:', now.toISOString())

    // Get user's LinkedIn access token from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('linkedin_access_token, linkedin_user_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('[Publish] Error fetching profile:', profileError)
      return NextResponse.json({
        message: 'No posts to publish',
        published: 0,
      })
    }

    console.log('[Publish] Profile found, has LinkedIn token:', !!profile.linkedin_access_token)

    // Find all posts for this user that are scheduled and due to be published
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'scheduled')
      .lte('scheduled_for', now.toISOString())
      .order('scheduled_for', { ascending: true })

    if (fetchError) {
      console.error('[Publish] Error fetching scheduled posts:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch scheduled posts' },
        { status: 500 }
      )
    }

    console.log('[Publish] Found', scheduledPosts?.length || 0, 'scheduled posts')

    if (!scheduledPosts || scheduledPosts.length === 0) {
      return NextResponse.json({
        message: 'No posts to publish',
        published: 0,
      })
    }

    const results = []

    // Process each scheduled post
    for (const post of scheduledPosts) {
      try {
        console.log('[Publish] Processing post:', post.id, 'scheduled for:', post.scheduled_for)

        // Get LinkedIn access token from profile
        const accessToken = profile.linkedin_access_token

        if (!accessToken) {
          console.error(`[Publish] No LinkedIn access token for post ${post.id}`)
          results.push({
            postId: post.id,
            success: false,
            error: 'No LinkedIn access token',
          })
          continue
        }

        // Post to LinkedIn using helper library
        console.log('[Publish] Posting to LinkedIn for post:', post.id)
        const linkedInData = await postToLinkedIn(
          accessToken,
          profile.linkedin_user_id,
          post.content
        )
        console.log('[Publish] Successfully posted to LinkedIn:', linkedInData.id)

        // Update post status to published
        await supabase
          .from('posts')
          .update({
            status: 'published',
            published_at: now.toISOString(),
            linkedin_post_id: linkedInData.id,
            updated_at: now.toISOString(),
          })
          .eq('id', post.id)

        // Log activity
        await supabase.from('user_activity_logs').insert({
          user_id: post.user_id,
          activity_type: 'post_published',
          activity_data: {
            post_id: post.id,
            linkedin_post_id: linkedInData.id,
            published_at: now.toISOString(),
            automated: true,
            source: 'client_polling',
          },
        })

        results.push({
          postId: post.id,
          success: true,
          linkedInPostId: linkedInData.id,
        })
      } catch (error: any) {
        console.error(`[Publish] Error publishing post ${post.id}:`, error)
        results.push({
          postId: post.id,
          success: false,
          error: error.message,
        })
      }
    }

    const successCount = results.filter((r) => r.success).length
    console.log('[Publish] Completed. Success:', successCount, 'Total:', scheduledPosts.length)

    return NextResponse.json({
      message: `Published ${successCount} of ${scheduledPosts.length} scheduled posts`,
      published: successCount,
      total: scheduledPosts.length,
      results,
    })
  } catch (error: any) {
    console.error('[Publish] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to publish scheduled posts' },
      { status: 500 }
    )
  }
}
