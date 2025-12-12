import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes for cron job

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.error('[reset-subscriptions] Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const now = new Date()
    const today = now.getDate()

    console.log(`[reset-subscriptions] Running cron job for day ${today}`)

    // Find all subscriptions that should reset today
    // Match on billing_anniversary_day and ensure we haven't reset already
    const { data: subscriptionsToReset, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*, profiles!inner(email, full_name)')
      .eq('billing_anniversary_day', Math.min(today, 28))
      .eq('status', 'active')
      .neq('plan', 'free') // Don't reset free plans
      .not('next_billing_date', 'is', null)

    if (fetchError) {
      console.error('[reset-subscriptions] Error fetching subscriptions:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions', details: fetchError },
        { status: 500 }
      )
    }

    if (!subscriptionsToReset || subscriptionsToReset.length === 0) {
      console.log('[reset-subscriptions] No subscriptions to reset today')
      return NextResponse.json({
        message: 'No subscriptions to reset',
        date: now.toISOString(),
        day: today,
        reset_count: 0,
      })
    }

    const results = []

    for (const subscription of subscriptionsToReset) {
      try {
        // Check if next_billing_date is today or past
        const nextBillingDate = new Date(subscription.next_billing_date)
        if (nextBillingDate > now) {
          console.log(`[reset-subscriptions] Skipping ${subscription.user_id}: next billing date is ${subscription.next_billing_date}`)
          continue
        }

        // Calculate new billing dates
        const newPeriodStart = nextBillingDate
        const newPeriodEnd = new Date(nextBillingDate)
        newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1)
        newPeriodEnd.setDate(subscription.billing_anniversary_day)

        const newNextBillingDate = new Date(newPeriodEnd)
        newNextBillingDate.setMonth(newNextBillingDate.getMonth() + 1)
        newNextBillingDate.setDate(subscription.billing_anniversary_day)

        // Reset subscription
        const { error: resetError } = await supabase
          .from('subscriptions')
          .update({
            posts_used: 0,
            ai_generations_used: 0,
            ai_credits_used: 0,
            leads_discovered_this_week: 0,
            predictions_this_week: 0,
            current_period_start: newPeriodStart.toISOString(),
            current_period_end: newPeriodEnd.toISOString(),
            next_billing_date: newNextBillingDate.toISOString(),
            payment_reminder_sent: false,
            updated_at: now.toISOString(),
          })
          .eq('user_id', subscription.user_id)

        if (resetError) {
          console.error(`[reset-subscriptions] Error resetting ${subscription.user_id}:`, resetError)
          results.push({
            user_id: subscription.user_id,
            success: false,
            error: resetError.message,
          })
          continue
        }

        // Log activity
        await supabase.from('user_activity_logs').insert({
          user_id: subscription.user_id,
          activity_type: 'subscription_reset',
          activity_data: {
            plan: subscription.plan,
            reset_date: now.toISOString(),
            anniversary_day: subscription.billing_anniversary_day,
            next_billing_date: newNextBillingDate.toISOString(),
          },
        })

        console.log(`[reset-subscriptions] Successfully reset subscription for user ${subscription.user_id}`)
        results.push({
          user_id: subscription.user_id,
          success: true,
          plan: subscription.plan,
          next_billing_date: newNextBillingDate.toISOString(),
        })
      } catch (error: any) {
        console.error(`[reset-subscriptions] Error processing ${subscription.user_id}:`, error)
        results.push({
          user_id: subscription.user_id,
          success: false,
          error: error.message,
        })
      }
    }

    const successCount = results.filter((r) => r.success).length

    console.log(`[reset-subscriptions] Reset ${successCount} of ${subscriptionsToReset.length} subscriptions`)

    return NextResponse.json({
      message: `Reset ${successCount} of ${subscriptionsToReset.length} subscriptions`,
      date: now.toISOString(),
      day: today,
      total: subscriptionsToReset.length,
      reset_count: successCount,
      results,
    })
  } catch (error: any) {
    console.error('[reset-subscriptions] Cron job error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to run cron job' },
      { status: 500 }
    )
  }
}
