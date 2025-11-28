import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateReplyData } from '@/types/support'

// GET /api/support/tickets/[id]/replies - Get all replies for a ticket
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ticket ownership
    const { data: ticket } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Fetch replies with user information
    const { data: replies, error } = await supabase
      .from('support_replies')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('ticket_id', params.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching replies:', error)
      return NextResponse.json(
        { error: 'Failed to fetch replies' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      replies: replies || [],
    })
  } catch (error) {
    console.error('Error fetching replies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch replies' },
      { status: 500 }
    )
  }
}

// POST /api/support/tickets/[id]/replies - Add reply to ticket
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateReplyData = await request.json()
    const { message } = body

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Verify ticket ownership
    const { data: ticket } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Create reply
    const { data: reply, error } = await supabase
      .from('support_replies')
      .insert({
        ticket_id: params.id,
        user_id: user.id,
        message: message.trim(),
        is_staff: false,
      })
      .select(`
        *,
        profiles:user_id (
          full_name,
          email,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Error creating reply:', error)
      return NextResponse.json(
        { error: 'Failed to create reply' },
        { status: 500 }
      )
    }

    // Update ticket status if it was waiting for user
    if (ticket.status === 'waiting_user') {
      await supabase
        .from('support_tickets')
        .update({
          status: 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)
    }

    // Update ticket's updated_at timestamp
    await supabase
      .from('support_tickets')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    // Log notification
    console.log(`[SUPPORT] New reply added to ticket ${params.id} by user ${user.id}`)
    console.log(`[EMAIL] Would send reply notification to support team`)

    return NextResponse.json({
      success: true,
      reply,
      message: 'Reply added successfully',
    })
  } catch (error) {
    console.error('Error creating reply:', error)
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    )
  }
}
