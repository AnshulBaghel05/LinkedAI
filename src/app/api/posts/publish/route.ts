import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPrimaryLinkedInAccount } from '@/lib/linkedin/accounts'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { postId } = body

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    // Get post details
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Get primary LinkedIn account
    const linkedInAccount = await getPrimaryLinkedInAccount(user.id)

    if (!linkedInAccount) {
      return NextResponse.json(
        { error: 'LinkedIn not connected. Please connect your LinkedIn account in settings.' },
        { status: 403 }
      )
    }

    if (!linkedInAccount.linkedin_access_token) {
      return NextResponse.json(
        { error: 'LinkedIn access token not found. Please reconnect your LinkedIn account.' },
        { status: 403 }
      )
    }

    // Publish to LinkedIn using v2 API
    try {
      // First, get the user's LinkedIn URN
      const userInfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${linkedInAccount.linkedin_access_token}`,
        },
      })

      if (!userInfoResponse.ok) {
        throw new Error('Failed to get LinkedIn user info')
      }

      const userInfo = await userInfoResponse.json()
      const authorUrn = `urn:li:person:${userInfo.sub}`

      // Create the post
      const linkedInResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${linkedInAccount.linkedin_access_token}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          author: authorUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: post.content,
              },
              shareMediaCategory: 'NONE',
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
          },
        }),
      })

      if (!linkedInResponse.ok) {
        const errorData = await linkedInResponse.text()
        console.error('LinkedIn API Error:', errorData)
        throw new Error('Failed to publish to LinkedIn')
      }

      const linkedInData = await linkedInResponse.json()
      const linkedInPostId = linkedInData.id

      // Update post status in database
      await supabase
        .from('posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          linkedin_post_id: linkedInPostId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId)

      return NextResponse.json({
        success: true,
        linkedInPostId,
        message: 'Post published to LinkedIn successfully',
      })
    } catch (linkedInError: any) {
      console.error('LinkedIn publishing error:', linkedInError)
      return NextResponse.json(
        { error: linkedInError.message || 'Failed to publish to LinkedIn' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error publishing post:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to publish post' },
      { status: 500 }
    )
  }
}
