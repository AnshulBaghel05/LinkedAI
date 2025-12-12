import { NextRequest, NextResponse } from 'next/server'
import { getQueueStats, getScheduledPostsQueue } from '@/lib/queue/scheduled-posts'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Queue monitoring dashboard endpoint
 * Returns statistics and job details from Bull queue
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`[Dashboard] User ${user.id} requesting queue stats`)

    // Get queue statistics
    const stats = await getQueueStats()

    if (!stats) {
      return NextResponse.json(
        { error: 'Failed to fetch queue statistics' },
        { status: 500 }
      )
    }

    // Get sample jobs from different states
    const queue = getScheduledPostsQueue()
    const [delayedJobs, activeJobs, failedJobs] = await Promise.all([
      queue.getDelayed(0, 5), // Get first 5 delayed jobs
      queue.getActive(0, 5),   // Get first 5 active jobs
      queue.getFailed(0, 5),   // Get first 5 failed jobs
    ])

    // Format job data for response
    const formatJob = (job: any) => ({
      id: job.id,
      data: job.data,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      progress: job.progress(),
      delay: job.opts.delay,
    })

    const dashboard = {
      stats,
      timestamp: new Date().toISOString(),
      samples: {
        delayed: delayedJobs.map(formatJob),
        active: activeJobs.map(formatJob),
        failed: failedJobs.map(formatJob),
      },
      info: {
        queueName: queue.name,
        isPaused: await queue.isPaused(),
      },
    }

    return NextResponse.json(dashboard)
  } catch (error: any) {
    console.error('[Dashboard] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch dashboard data',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * Admin actions endpoint
 * POST to perform actions like clean, pause, resume
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    const queue = getScheduledPostsQueue()

    switch (action) {
      case 'clean':
        // Clean up old completed jobs
        await queue.clean(24 * 60 * 60 * 1000, 'completed')
        await queue.clean(7 * 24 * 60 * 60 * 1000, 'failed')
        return NextResponse.json({ success: true, message: 'Queue cleaned' })

      case 'pause':
        await queue.pause()
        return NextResponse.json({ success: true, message: 'Queue paused' })

      case 'resume':
        await queue.resume()
        return NextResponse.json({ success: true, message: 'Queue resumed' })

      case 'empty':
        // Only allow this in development/testing
        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
        }
        await queue.empty()
        return NextResponse.json({ success: true, message: 'Queue emptied' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('[Dashboard] Action error:', error)
    return NextResponse.json(
      {
        error: 'Failed to perform action',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
