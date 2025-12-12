import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { schedulePost } from '@/lib/queue/scheduled-posts'
import { getPrimaryLinkedInAccount } from '@/lib/linkedin/accounts'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId, scheduledFor, syncToGoogleCalendar } = await request.json()

    if (!postId || !scheduledFor) {
      return NextResponse.json(
        { error: 'Post ID and scheduled time are required' },
        { status: 400 }
      )
    }

    // Validate that scheduled time is in the future
    const scheduledDate = new Date(scheduledFor)
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      )
    }

    // Get primary LinkedIn account
    const linkedInAccount = await getPrimaryLinkedInAccount(user.id)

    if (!linkedInAccount) {
      return NextResponse.json(
        { error: 'Please connect your LinkedIn account first to schedule posts' },
        { status: 400 }
      )
    }

    if (!linkedInAccount.linkedin_access_token || !linkedInAccount.linkedin_user_id) {
      return NextResponse.json(
        { error: 'LinkedIn access token not found. Please reconnect your LinkedIn account.' },
        { status: 400 }
      )
    }

    // Get the post content first
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingPost) {
      console.error('Error fetching post:', fetchError)
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Update post with scheduled information in database
    const { data: post, error: updateError } = await supabase
      .from('posts')
      .update({
        status: 'scheduled',
        scheduled_for: scheduledDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating post:', updateError)
      return NextResponse.json(
        { error: 'Failed to schedule post' },
        { status: 500 }
      )
    }

    // Add job to Bull queue for automatic publishing
    try {
      const job = await schedulePost({
        postId: post.id,
        userId: user.id,
        content: post.content,
        scheduledFor: scheduledDate.toISOString(),
        linkedInUserId: linkedInAccount.linkedin_user_id,
        linkedInAccessToken: linkedInAccount.linkedin_access_token,
      })

      console.log(`[Schedule] Added post ${postId} to Bull queue with job ID ${job.id}`)
    } catch (queueError: any) {
      console.error('[Schedule] Failed to add job to queue:', queueError)

      // Revert post status if queue scheduling fails
      await supabase
        .from('posts')
        .update({
          status: 'draft',
          scheduled_for: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId)

      return NextResponse.json(
        { error: 'Failed to schedule post in queue. Please try again.' },
        { status: 500 }
      )
    }

    // If sync to Google Calendar is enabled, create calendar event
    let googleCalendarEventId = null
    if (syncToGoogleCalendar) {
      try {
        const calendarResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/create-event`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              postId: post.id,
              title: `📱 LinkedIn Post: ${post.topic || 'Untitled'}`,
              description: post.content,
              startTime: scheduledDate.toISOString(),
              endTime: new Date(scheduledDate.getTime() + 15 * 60000).toISOString(), // 15 min event
            }),
          }
        )

        if (calendarResponse.ok) {
          const { eventId } = await calendarResponse.json()
          googleCalendarEventId = eventId

          // Update post with Google Calendar event ID
          await supabase
            .from('posts')
            .update({
              google_calendar_event_id: eventId,
            })
            .eq('id', postId)
        }
      } catch (calendarError) {
        console.error('Error creating calendar event:', calendarError)
        // Don't fail the whole request if calendar sync fails
      }
    }

    // Log activity
    await supabase.from('user_activity_logs').insert({
      user_id: user.id,
      activity_type: 'post_scheduled',
      activity_data: {
        post_id: postId,
        scheduled_for: scheduledDate.toISOString(),
        synced_to_calendar: !!googleCalendarEventId
      },
    })

    return NextResponse.json({
      success: true,
      post,
      googleCalendarEventId,
      message: 'Post scheduled successfully',
    })
  } catch (error: any) {
    console.error('Error scheduling post:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to schedule post' },
      { status: 500 }
    )
  }
}
