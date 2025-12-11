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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()

    // Find all posts for this user that are scheduled and due to be published
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from('posts')
      .select('*, profiles!inner(linkedin_access_token, linkedin_user_id)')
      .eq('user_id', user.id)
      .eq('status', 'scheduled')
      .lte('scheduled_for', now.toISOString())
      .order('scheduled_for', { ascending: true })

    if (fetchError) {
      console.error('Error fetching scheduled posts:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch scheduled posts' },
        { status: 500 }
      )
    }

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
        // Get LinkedIn access token from profile
        const accessToken = post.profiles?.linkedin_access_token

        if (!accessToken) {
          console.error(`No LinkedIn access token for post ${post.id}`)
          results.push({
            postId: post.id,
            success: false,
            error: 'No LinkedIn access token',
          })
          continue
        }

        // Post to LinkedIn using helper library
        const linkedInData = await postToLinkedIn(
          accessToken,
          post.profiles?.linkedin_user_id,
          post.content
        )

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
        console.error(`Error publishing post ${post.id}:`, error)
        results.push({
          postId: post.id,
          success: false,
          error: error.message,
        })
      }
    }

    const successCount = results.filter((r) => r.success).length

    return NextResponse.json({
      message: `Published ${successCount} of ${scheduledPosts.length} scheduled posts`,
      published: successCount,
      total: scheduledPosts.length,
      results,
    })
  } catch (error: any) {
    console.error('Publish scheduled posts error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to publish scheduled posts' },
      { status: 500 }
    )
  }
}
