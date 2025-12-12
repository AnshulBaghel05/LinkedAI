import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { updateAccountLimit } from '@/lib/linkedin/accounts'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes for cron job

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.error('[handle-grace-periods] Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const now = new Date()

    // Calculate date 3 days ago (grace period expired)
    const gracePeriodExpired = new Date(now)
    gracePeriodExpired.setDate(gracePeriodExpired.getDate() - 3)

    console.log(`[handle-grace-periods] Running cron job at ${now.toISOString()}`)
    console.log(`[handle-grace-periods] Looking for subscriptions past billing date before ${gracePeriodExpired.toISOString()}`)

    // Find subscriptions past their billing date + 3 day grace period
    const { data: expiredSubscriptions, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*, profiles!inner(email, full_name)')
      .eq('status', 'active')
      .neq('plan', 'free') // Only paid users can be downgraded
      .not('next_billing_date', 'is', null)
      .lt('next_billing_date', gracePeriodExpired.toISOString())

    if (fetchError) {
      console.error('[handle-grace-periods] Error fetching subscriptions:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions', details: fetchError },
        { status: 500 }
      )
    }

    if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
      console.log('[handle-grace-periods] No expired subscriptions to handle')
      return NextResponse.json({
        message: 'No expired subscriptions to downgrade',
        date: now.toISOString(),
        downgrade_count: 0,
      })
    }

    console.log(`[handle-grace-periods] Found ${expiredSubscriptions.length} subscriptions to downgrade`)

    const results = []

    for (const subscription of expiredSubscriptions) {
      try {
        const profile = subscription.profiles as any
        const oldPlan = subscription.plan

        // Call the downgrade_to_free_plan database function
        const { error: downgradeError } = await supabase.rpc('downgrade_to_free_plan', {
          p_user_id: subscription.user_id,
        })

        if (downgradeError) {
          console.error(`[handle-grace-periods] Error calling downgrade function for ${subscription.user_id}:`, downgradeError)
          results.push({
            user_id: subscription.user_id,
            success: false,
            error: downgradeError.message,
          })
          continue
        }

        // Update LinkedIn account limit to 1 (free plan)
        try {
          await updateAccountLimit(subscription.user_id, 'free')
        } catch (accountError) {
          console.error(`[handle-grace-periods] Error updating account limit for ${subscription.user_id}:`, accountError)
          // Don't fail the whole operation if just account limit update fails
        }

        // Create in-app notification
        await supabase.from('notifications').insert({
          user_id: subscription.user_id,
          type: 'subscription_downgraded',
          title: 'Subscription Downgraded',
          message: `Your ${oldPlan} subscription has been downgraded to the free plan due to non-payment. Your usage limits have been adjusted accordingly.`,
          data: {
            old_plan: oldPlan,
            new_plan: 'free',
            downgraded_at: now.toISOString(),
            reason: 'grace_period_expired',
          },
        })

        // Log activity
        await supabase.from('user_activity_logs').insert({
          user_id: subscription.user_id,
          activity_type: 'subscription_downgraded',
          activity_data: {
            old_plan: oldPlan,
            new_plan: 'free',
            reason: 'grace_period_expired',
            billing_date_missed: subscription.next_billing_date,
            downgraded_at: now.toISOString(),
          },
        })

        console.log(`[handle-grace-periods] Successfully downgraded user ${subscription.user_id} from ${oldPlan} to free`)
        results.push({
          user_id: subscription.user_id,
          success: true,
          old_plan: oldPlan,
          new_plan: 'free',
          email: profile?.email,
        })
      } catch (error: any) {
        console.error(`[handle-grace-periods] Error processing ${subscription.user_id}:`, error)
        results.push({
          user_id: subscription.user_id,
          success: false,
          error: error.message,
        })
      }
    }

    const successCount = results.filter((r) => r.success).length

    console.log(`[handle-grace-periods] Downgraded ${successCount} of ${expiredSubscriptions.length} subscriptions`)

    return NextResponse.json({
      message: `Downgraded ${successCount} of ${expiredSubscriptions.length} subscriptions to free plan`,
      date: now.toISOString(),
      total: expiredSubscriptions.length,
      downgrade_count: successCount,
      results,
    })
  } catch (error: any) {
    console.error('[handle-grace-periods] Cron job error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to run cron job' },
      { status: 500 }
    )
  }
}
