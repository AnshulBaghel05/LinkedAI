import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content, topic, status = 'draft' } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Insert post into database
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content,
        topic,
        status,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving post:', error)
      return NextResponse.json(
        { error: 'Failed to save post' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      post,
    })
  } catch (error) {
    console.error('Error saving post:', error)
    return NextResponse.json(
      { error: 'Failed to save post' },
      { status: 500 }
    )
  }
}
