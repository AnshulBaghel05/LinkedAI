import { Job } from 'bull'
import { PublishPostJobData, getScheduledPostsQueue } from './scheduled-posts'
import { createAdminClient } from '@/lib/supabase/server'
import { postToLinkedIn } from '@/lib/linkedin/client'

// Process a single job - publish post to LinkedIn
export async function processPublishPost(job: Job<PublishPostJobData>) {
  const { postId, userId, content, linkedInUserId, linkedInAccessToken } = job.data

  console.log(`[Worker] Processing job ${job.id} - Publishing post ${postId}`)

  try {
    // Update job progress
    await job.progress(10)

    // Create admin Supabase client (bypasses RLS)
    const supabase = createAdminClient()

    // Check if post still exists and is in scheduled status
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (fetchError || !post) {
      throw new Error(`Post ${postId} not found or deleted`)
    }

    if (post.status !== 'scheduled') {
      console.log(`[Worker] Post ${postId} is not scheduled (status: ${post.status}), skipping`)
      return {
        success: false,
        reason: 'Post no longer scheduled',
        status: post.status,
      }
    }

    await job.progress(30)

    // Publish to LinkedIn
    console.log(`[Worker] Posting to LinkedIn for post ${postId}`)
    const linkedInData = await postToLinkedIn(
      linkedInAccessToken,
      linkedInUserId,
      content
    )

    await job.progress(70)

    console.log(`[Worker] Successfully posted to LinkedIn: ${linkedInData.id}`)

    const now = new Date()

    // Update post status in database
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        status: 'published',
        published_at: now.toISOString(),
        linkedin_post_id: linkedInData.id,
        updated_at: now.toISOString(),
      })
      .eq('id', postId)

    if (updateError) {
      console.error(`[Worker] Failed to update post ${postId}:`, updateError)
      throw new Error(`Failed to update post status: ${updateError.message}`)
    }

    await job.progress(90)

    // Log activity
    await supabase.from('user_activity_logs').insert({
      user_id: userId,
      activity_type: 'post_published',
      activity_data: {
        post_id: postId,
        linkedin_post_id: linkedInData.id,
        published_at: now.toISOString(),
        automated: true,
        source: 'bull_queue',
      },
    })

    await job.progress(100)

    console.log(`[Worker] Job ${job.id} completed successfully`)

    return {
      success: true,
      postId,
      linkedInPostId: linkedInData.id,
      publishedAt: now.toISOString(),
    }
  } catch (error: any) {
    console.error(`[Worker] Job ${job.id} failed:`, error)

    // Update post status to failed in database
    try {
      const supabase = createAdminClient()
      await supabase
        .from('posts')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId)
    } catch (dbError) {
      console.error(`[Worker] Failed to update post ${postId} status to failed:`, dbError)
    }

    throw error // Re-throw to trigger Bull retry mechanism
  }
}

// Start the worker to process jobs
export async function startWorker() {
  const queue = getScheduledPostsQueue()

  console.log('[Worker] Starting worker to process scheduled posts...')

  // Process jobs from the queue
  queue.process('*', async (job) => {
    return await processPublishPost(job)
  })

  // Handle global errors
  queue.on('error', (error) => {
    console.error('[Worker] Queue error:', error)
  })

  console.log('[Worker] Worker started successfully')

  return queue
}

// Process waiting/delayed jobs (for Vercel cron)
export async function processWaitingJobs() {
  try {
    const queue = getScheduledPostsQueue()

    console.log('[Worker] Checking for jobs to process...')

    // Get delayed jobs that are ready to run
    const delayedJobs = await queue.getDelayed(0, 100) // Get up to 100 delayed jobs
    const now = Date.now()

    let processedCount = 0

    for (const job of delayedJobs) {
      // Check if job is ready to run (delay has passed)
      const jobDelay = job.opts.delay || 0
      const jobCreatedAt = job.timestamp
      const jobReadyTime = jobCreatedAt + jobDelay

      if (now >= jobReadyTime) {
        console.log(`[Worker] Processing delayed job ${job.id}`)
        try {
          // Promote delayed job to waiting
          await job.promote()
          processedCount++
        } catch (error: any) {
          console.error(`[Worker] Error promoting job ${job.id}:`, error.message)
        }
      }
    }

    // Process waiting jobs
    const waitingJobs = await queue.getWaiting(0, 10) // Process up to 10 waiting jobs per run

    for (const job of waitingJobs) {
      try {
        console.log(`[Worker] Processing waiting job ${job.id}`)
        await processPublishPost(job)
        processedCount++
      } catch (error: any) {
        console.error(`[Worker] Error processing job ${job.id}:`, error.message)
      }
    }

    console.log(`[Worker] Processed ${processedCount} job(s)`)

    return {
      success: true,
      processed: processedCount,
      delayedChecked: delayedJobs.length,
      waitingChecked: waitingJobs.length,
    }
  } catch (error: any) {
    console.error('[Worker] Error processing jobs:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}
