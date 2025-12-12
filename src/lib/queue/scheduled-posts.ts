import Queue, { Job } from 'bull'
import { defaultQueueOptions, QUEUE_NAMES, JOB_NAMES } from './config'

// Job data types
export interface PublishPostJobData {
  postId: string
  userId: string
  content: string
  scheduledFor: string
  linkedInUserId: string
  linkedInAccessToken: string
}

// Create the scheduled posts queue
let scheduledPostsQueue: Queue<PublishPostJobData> | null = null

export function getScheduledPostsQueue(): Queue<PublishPostJobData> {
  // Singleton pattern - reuse queue instance
  if (!scheduledPostsQueue) {
    scheduledPostsQueue = new Queue<PublishPostJobData>(
      QUEUE_NAMES.SCHEDULED_POSTS,
      defaultQueueOptions
    )

    console.log('[Queue] Scheduled posts queue created')

    // Event listeners for monitoring
    scheduledPostsQueue.on('error', (error) => {
      console.error('[Queue] Error:', error)
    })

    scheduledPostsQueue.on('waiting', (jobId) => {
      console.log(`[Queue] Job ${jobId} is waiting`)
    })

    scheduledPostsQueue.on('active', (job) => {
      console.log(`[Queue] Job ${job.id} started processing`)
    })

    scheduledPostsQueue.on('completed', (job, result) => {
      console.log(`[Queue] Job ${job.id} completed successfully:`, result)
    })

    scheduledPostsQueue.on('failed', (job, err) => {
      console.error(`[Queue] Job ${job?.id} failed:`, err.message)
    })

    scheduledPostsQueue.on('stalled', (job) => {
      console.warn(`[Queue] Job ${job.id} stalled`)
    })
  }

  return scheduledPostsQueue
}

// Schedule a post to be published
export async function schedulePost(data: PublishPostJobData): Promise<Job<PublishPostJobData>> {
  const queue = getScheduledPostsQueue()

  const scheduledTime = new Date(data.scheduledFor)
  const now = new Date()
  const delay = scheduledTime.getTime() - now.getTime()

  console.log('[Queue] Scheduling post:', {
    postId: data.postId,
    scheduledFor: data.scheduledFor,
    delay: `${Math.round(delay / 1000)}s`,
  })

  // Add job to queue with delay
  const job = await queue.add(JOB_NAMES.PUBLISH_POST, data, {
    jobId: data.postId, // Use postId as unique job ID
    delay: Math.max(delay, 0), // Delay in milliseconds (minimum 0)
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  })

  console.log(`[Queue] Job ${job.id} added to queue (will run in ${Math.round(delay / 1000)}s)`)

  return job
}

// Cancel a scheduled post
export async function cancelScheduledPost(postId: string): Promise<boolean> {
  try {
    const queue = getScheduledPostsQueue()
    const job = await queue.getJob(postId)

    if (job) {
      await job.remove()
      console.log(`[Queue] Cancelled job ${postId}`)
      return true
    }

    console.warn(`[Queue] Job ${postId} not found`)
    return false
  } catch (error: any) {
    console.error(`[Queue] Error cancelling job ${postId}:`, error.message)
    return false
  }
}

// Get job status
export async function getJobStatus(postId: string) {
  try {
    const queue = getScheduledPostsQueue()
    const job = await queue.getJob(postId)

    if (!job) {
      return { status: 'not_found' }
    }

    const state = await job.getState()
    const progress = job.progress()

    return {
      status: state,
      progress,
      data: job.data,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
    }
  } catch (error: any) {
    console.error(`[Queue] Error getting job status ${postId}:`, error.message)
    return { status: 'error', error: error.message }
  }
}

// Get queue statistics
export async function getQueueStats() {
  try {
    const queue = getScheduledPostsQueue()

    const [
      waitingCount,
      activeCount,
      completedCount,
      failedCount,
      delayedCount,
    ] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ])

    return {
      waiting: waitingCount,
      active: activeCount,
      completed: completedCount,
      failed: failedCount,
      delayed: delayedCount,
      total: waitingCount + activeCount + delayedCount,
    }
  } catch (error: any) {
    console.error('[Queue] Error getting stats:', error.message)
    return null
  }
}

// Clean up old completed/failed jobs
export async function cleanQueue() {
  try {
    const queue = getScheduledPostsQueue()

    // Remove completed jobs older than 24 hours
    await queue.clean(24 * 60 * 60 * 1000, 'completed')

    // Remove failed jobs older than 7 days
    await queue.clean(7 * 24 * 60 * 60 * 1000, 'failed')

    console.log('[Queue] Cleaned old jobs')
  } catch (error: any) {
    console.error('[Queue] Error cleaning queue:', error.message)
  }
}

// Close queue connection (for graceful shutdown)
export async function closeQueue() {
  if (scheduledPostsQueue) {
    await scheduledPostsQueue.close()
    scheduledPostsQueue = null
    console.log('[Queue] Queue closed')
  }
}
