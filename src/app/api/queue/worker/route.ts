import { NextRequest, NextResponse } from 'next/server'
import { processWaitingJobs } from '@/lib/queue/worker'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes for processing jobs

/**
 * Worker endpoint to process scheduled post jobs
 * This endpoint should be called by Vercel Cron every minute
 *
 * How it works:
 * 1. Checks Bull queue for jobs that are ready to run
 * 2. Processes each job (publishes to LinkedIn)
 * 3. Updates database with publish status
 * 4. Returns summary of processed jobs
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security (supports both Vercel cron and external services like cron-job.org)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // Allow both Bearer token and simple secret in query params for external cron services
    const secretFromQuery = request.nextUrl.searchParams.get('secret')

    const isAuthorized =
      (authHeader && cronSecret && authHeader === `Bearer ${cronSecret}`) ||
      (secretFromQuery && cronSecret && secretFromQuery === cronSecret)

    if (!isAuthorized) {
      console.error('[Worker API] Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    console.log(`[Worker API] Starting job processing at ${now.toISOString()}`)

    // Process waiting/delayed jobs
    const result = await processWaitingJobs()

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Failed to process jobs',
          details: result.error,
        },
        { status: 500 }
      )
    }

    console.log(`[Worker API] Successfully processed ${result.processed} job(s)`)

    return NextResponse.json({
      success: true,
      message: `Processed ${result.processed} scheduled post(s)`,
      timestamp: now.toISOString(),
      processed: result.processed,
      delayedChecked: result.delayedChecked,
      waitingChecked: result.waitingChecked,
    })
  } catch (error: any) {
    console.error('[Worker API] Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * Alternative endpoint for manual trigger
 * Can be called via POST from admin panel or testing
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization (could be admin user or API key)
    const { data: { user }, error: authError } = await (await import('@/lib/supabase/server')).createClient().auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`[Worker API] Manual trigger by user ${user.id}`)

    const result = await processWaitingJobs()

    return NextResponse.json({
      success: true,
      message: `Manually processed ${result.processed} job(s)`,
      ...result,
    })
  } catch (error: any) {
    console.error('[Worker API] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process jobs',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
