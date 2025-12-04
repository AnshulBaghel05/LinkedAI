/**
 * Cloudflare Workers Cron Triggers
 *
 * This worker handles scheduled cron jobs for the LinkedIn Scheduler.
 * It triggers API endpoints at scheduled intervals.
 *
 * Cron Schedule:
 * - Post Publishing: Every 15 minutes
 * - Analytics Sync: Every 6 hours
 *
 * Setup:
 * 1. Install Wrangler: npm install -g wrangler
 * 2. Login: wrangler login
 * 3. Deploy: wrangler deploy
 * 4. Set secret: wrangler secret put CRON_SECRET
 */

export default {
  /**
   * Scheduled event handler
   * Triggered by Cloudflare Cron Triggers
   */
  async scheduled(event, env, ctx) {
    // Get the current time
    const now = new Date()
    const minute = now.getUTCMinutes()
    const hour = now.getUTCHours()

    console.log(`[Cron] Triggered at ${now.toISOString()}`)

    // Publish Scheduled Posts - Every 15 minutes
    if (minute % 15 === 0) {
      console.log('[Cron] Running: Publish Scheduled Posts')
      ctx.waitUntil(publishScheduledPosts(env))
    }

    // Sync Analytics - Every 6 hours (at :00 minutes)
    if (hour % 6 === 0 && minute === 0) {
      console.log('[Cron] Running: Sync Analytics')
      ctx.waitUntil(syncAnalytics(env))
    }
  },

  /**
   * HTTP handler for manual triggers and testing
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        worker: 'cron-worker'
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Manual trigger for publish (for testing)
    if (url.pathname === '/trigger/publish' && request.method === 'POST') {
      const result = await publishScheduledPosts(env)
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Manual trigger for analytics (for testing)
    if (url.pathname === '/trigger/analytics' && request.method === 'POST') {
      const result = await syncAnalytics(env)
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response('Cloudflare Workers Cron - LinkedIn Scheduler', {
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}

/**
 * Publish Scheduled Posts
 * Calls the API endpoint to publish posts scheduled for now
 */
async function publishScheduledPosts(env) {
  try {
    const response = await fetch('https://www.linkedai.site/api/cron/publish-scheduled', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CRON_SECRET}`,
        'User-Agent': 'Cloudflare-Workers-Cron/1.0',
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    console.log('[Publish] Status:', response.status)
    console.log('[Publish] Response:', JSON.stringify(data))

    return {
      job: 'publish-scheduled-posts',
      status: response.status,
      success: response.ok,
      data: data,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('[Publish] Error:', error.message)
    return {
      job: 'publish-scheduled-posts',
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Sync Analytics
 * Calls the API endpoint to sync LinkedIn analytics
 */
async function syncAnalytics(env) {
  try {
    const response = await fetch('https://www.linkedai.site/api/cron/sync-analytics', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CRON_SECRET}`,
        'User-Agent': 'Cloudflare-Workers-Cron/1.0',
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    console.log('[Analytics] Status:', response.status)
    console.log('[Analytics] Response:', JSON.stringify(data))

    return {
      job: 'sync-analytics',
      status: response.status,
      success: response.ok,
      data: data,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('[Analytics] Error:', error.message)
    return {
      job: 'sync-analytics',
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}
