import { NextRequest, NextResponse } from 'next/server'
import { getScheduledPostsQueue } from '@/lib/queue/scheduled-posts'

export const dynamic = 'force-dynamic'

/**
 * Debug endpoint to inspect queue state
 * Visit: /api/queue/debug
 */
export async function GET(request: NextRequest) {
  try {
    const queue = getScheduledPostsQueue()

    // Get jobs in different states
    const [delayedJobs, waitingJobs, activeJobs, completedJobs, failedJobs] = await Promise.all([
      queue.getDelayed(0, 10),
      queue.getWaiting(0, 10),
      queue.getActive(0, 10),
      queue.getCompleted(0, 10),
      queue.getFailed(0, 10),
    ])

    // Get detailed info about waiting jobs
    const waitingDetails = await Promise.all(
      waitingJobs.map(async (job) => ({
        id: job.id,
        name: job.name,
        data: job.data,
        timestamp: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        attemptsMade: job.attemptsMade,
        delay: job.opts.delay,
      }))
    )

    const delayedDetails = await Promise.all(
      delayedJobs.map(async (job) => ({
        id: job.id,
        name: job.name,
        postId: job.data.postId,
        scheduledFor: job.data.scheduledFor,
        timestamp: job.timestamp,
        delay: job.opts.delay,
        readyTime: new Date(job.timestamp + (job.opts.delay || 0)).toISOString(),
      }))
    )

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      counts: {
        delayed: delayedJobs.length,
        waiting: waitingJobs.length,
        active: activeJobs.length,
        completed: completedJobs.length,
        failed: failedJobs.length,
      },
      delayed: delayedDetails,
      waiting: waitingDetails,
    })
  } catch (error: any) {
    console.error('[Queue Debug] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}
