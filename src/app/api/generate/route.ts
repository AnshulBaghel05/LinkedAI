import { NextRequest, NextResponse } from 'next/server'
import { generateLinkedInPost, generatePostVariations } from '@/lib/gemini/client'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { canGenerateAI } from '@/lib/usage/limits'

interface GeneratedPost {
  topic: string
  hook: string
  body: string
  cta: string
  full_post: string
  suggested_hashtags: string[]
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check usage limits
    const limitCheck = await canGenerateAI(user.id)
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: limitCheck.reason },
        { status: 403 }
      )
    }

    // Accept both old format (topic, count) and new format (topics, postsCount) for backward compatibility
    const body = await request.json()
    const {
      topic,
      topics,
      style = 'professional',
      tone = 'informative',
      length = 3,
      count,
      postsCount
    } = body

    // Normalize parameters
    const topicsArray = topics || (topic ? [topic] : [])
    const totalCount = postsCount || count || 1

    // Validate topics
    if (!topicsArray || topicsArray.length === 0) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    // Calculate posts per topic
    const postsPerTopic = Math.max(1, Math.floor(totalCount / topicsArray.length))
    const allGeneratedPosts: GeneratedPost[] = []

    // Generate posts for each topic
    for (const topicItem of topicsArray) {
      let posts: string[]

      if (postsPerTopic > 1) {
        // Generate multiple variations
        posts = await generatePostVariations(topicItem, style, tone, length, postsPerTopic)
      } else {
        // Generate single post
        const post = await generateLinkedInPost(topicItem, style, tone, length)
        posts = [post]
      }

      // Format each post with structured data
      for (const postContent of posts) {
        const formattedPost = formatPostContent(postContent, topicItem)
        allGeneratedPosts.push(formattedPost)
      }

      // Break if we've reached the desired count
      if (allGeneratedPosts.length >= totalCount) {
        break
      }
    }

    // Trim to exact count if we generated too many
    const finalPosts = allGeneratedPosts.slice(0, totalCount)

    // Deduct posts from remaining count
    const postsGenerated = finalPosts.length

    // Use admin client to ensure profile exists and update posts tracking (bypasses RLS)
    const adminClient = createAdminClient()

    const { data: profile } = await adminClient
      .from('profiles')
      .select('id, posts_remaining, posts_limit, posts_used')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      // Create profile with default post limits using admin client (bypasses RLS)
      const { error: profileError } = await adminClient.from('profiles').insert({
        id: user.id,
        email: user.email,
        subscription_plan: 'free',
        posts_remaining: Math.max(0, 5 - postsGenerated), // Free plan starts with 5 posts
        posts_limit: 5,
        posts_used: postsGenerated,
        linkedin_connected: false,
        google_calendar_enabled: false,
      })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        return NextResponse.json(
          { error: `Failed to create user profile: ${profileError.message}` },
          { status: 500 }
        )
      }
    } else {
      // Deduct generated posts from remaining using admin client
      const newPostsRemaining = Math.max(0, (profile.posts_remaining || 5) - postsGenerated)
      const newPostsUsed = (profile.posts_used || 0) + postsGenerated

      const { error: updateError } = await adminClient
        .from('profiles')
        .update({
          posts_remaining: newPostsRemaining,
          posts_used: newPostsUsed
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Error updating profile:', updateError)
        return NextResponse.json(
          { error: `Failed to update posts tracking: ${updateError.message}` },
          { status: 500 }
        )
      }
    }

    // Log activity
    await supabase.from('user_activity_logs').insert({
      user_id: user.id,
      activity_type: 'post_created',
      activity_data: {
        topics: topicsArray,
        style,
        tone,
        length,
        count: finalPosts.length,
        posts_generated: postsGenerated
      },
    })

    return NextResponse.json({ posts: finalPosts, posts_generated: postsGenerated })
  } catch (error: any) {
    console.error('Generate error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate posts' },
      { status: 500 }
    )
  }
}

// Helper function to format post content into structured data
function formatPostContent(content: string, topic: string): GeneratedPost {
  const lines = content.split('\n').filter(line => line.trim())

  // Extract hook (first meaningful line)
  const hook = lines[0] || ''

  // Extract body (middle paragraphs)
  const bodyLines = lines.slice(1, -1)
  const body = bodyLines.join('\n\n')

  // Extract CTA (last line or sentence)
  const cta = lines[lines.length - 1] || ''

  // Extract hashtags from content
  const hashtagRegex = /#\w+/g
  const hashtags = content.match(hashtagRegex) || []
  const suggested_hashtags = [...new Set(hashtags)] // Remove duplicates

  // If no hashtags in content, suggest some based on topic
  if (suggested_hashtags.length === 0) {
    const topicWords = topic.split(' ').map(word =>
      '#' + word.replace(/[^a-zA-Z0-9]/g, '')
    )
    suggested_hashtags.push(...topicWords.slice(0, 3))
  }

  return {
    topic,
    hook: hook.replace(hashtagRegex, '').trim(),
    body: body.replace(hashtagRegex, '').trim(),
    cta: cta.replace(hashtagRegex, '').trim(),
    full_post: content,
    suggested_hashtags
  }
}
