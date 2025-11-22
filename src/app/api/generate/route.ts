import { NextRequest, NextResponse } from 'next/server'
import { generateLinkedInPost, generatePostVariations } from '@/lib/gemini/client'
import { createClient } from '@/lib/supabase/server'
import { canGenerateAI } from '@/lib/usage/limits'

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

    const { topic, style = 'professional', tone = 'informative', length = 3, count = 1 } = await request.json()

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    let posts: string[]

    if (count > 1) {
      // Generate multiple variations
      posts = await generatePostVariations(topic, style, tone, length, count)
    } else {
      // Generate single post
      const post = await generateLinkedInPost(topic, style, tone, length)
      posts = [post]
    }

    // Log activity
    await supabase.from('user_activity_logs').insert({
      user_id: user.id,
      activity_type: 'post_created',
      activity_data: { topic, style, tone, length, count },
    })

    return NextResponse.json({ posts })
  } catch (error: any) {
    console.error('Generate error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate posts' },
      { status: 500 }
    )
  }
}
