import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendPaymentReminderEmail } from '@/lib/email/templates'
import { updateAccountLimit } from '@/lib/linkedin/accounts'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes for cron job

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.error('[subscription-management] Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const now = new Date()

    console.log(`[subscription-management] Running unified cron job at ${now.toISOString()}`)

    const results = {
      resets: [],
      reminders: [],
      downgrades: [],
    }

    // ===== TASK 1: Reset Subscriptions on Anniversary =====
    const today = now.getDate()
    console.log(`[subscription-management] Task 1: Checking resets for day ${today}`)

    const { data: subscriptionsToReset } = await supabase
      .from('subscriptions')
      .select('*, profiles!inner(email, full_name)')
      .eq('billing_anniversary_day', Math.min(today, 28))
      .eq('status', 'active')
      .neq('plan', 'free')
      .not('next_billing_date', 'is', null)

    if (subscriptionsToReset && subscriptionsToReset.length > 0) {
      console.log(`[subscription-management] Found ${subscriptionsToReset.length} subscriptions to reset`)

      for (const subscription of subscriptionsToReset) {
        try {
          const nextBillingDate = new Date(subscription.next_billing_date)
          if (nextBillingDate > now) {
            continue // Skip if not due yet
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
            console.error(`[subscription-management] Reset error for ${subscription.user_id}:`, resetError)
            results.resets.push({ user_id: subscription.user_id, success: false, error: resetError.message })
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

          console.log(`[subscription-management] Reset successful for ${subscription.user_id}`)
          results.resets.push({
            user_id: subscription.user_id,
            success: true,
            plan: subscription.plan,
          })
        } catch (error: any) {
          console.error(`[subscription-management] Reset processing error:`, error)
          results.resets.push({ user_id: subscription.user_id, success: false, error: error.message })
        }
      }
    }

    // ===== TASK 2: Send Payment Reminders (3 days before) =====
    const threeDaysFromNow = new Date(now)
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
    threeDaysFromNow.setHours(0, 0, 0, 0)

    const threeDaysFromNowEnd = new Date(threeDaysFromNow)
    threeDaysFromNowEnd.setHours(23, 59, 59, 999)

    console.log(`[subscription-management] Task 2: Checking reminders for ${threeDaysFromNow.toISOString()}`)

    const { data: subscriptionsToRemind } = await supabase
      .from('subscriptions')
      .select('*, profiles!inner(email, full_name)')
      .eq('status', 'active')
      .neq('plan', 'free')
      .eq('payment_reminder_sent', false)
      .not('next_billing_date', 'is', null)
      .gte('next_billing_date', threeDaysFromNow.toISOString())
      .lte('next_billing_date', threeDaysFromNowEnd.toISOString())

    if (subscriptionsToRemind && subscriptionsToRemind.length > 0) {
      console.log(`[subscription-management] Found ${subscriptionsToRemind.length} reminders to send`)

      for (const subscription of subscriptionsToRemind) {
        try {
          const profile = subscription.profiles as any

          if (!profile?.email) {
            results.reminders.push({ user_id: subscription.user_id, success: false, error: 'No email' })
            continue
          }

          const billingDate = new Date(subscription.next_billing_date)
          const formattedDate = billingDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })

          // Send email
          const emailResult = await sendPaymentReminderEmail({
            to: profile.email,
            name: profile.full_name || 'there',
            plan: subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1),
            billingDate: formattedDate,
            billingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://linkedai.site'}/settings/billing`,
          })

          if (!emailResult.success) {
            results.reminders.push({ user_id: subscription.user_id, success: false, error: 'Email failed' })
            continue
          }

          // Create notification
          await supabase.from('notifications').insert({
            user_id: subscription.user_id,
            type: 'payment_reminder',
            title: 'Subscription Renewal Reminder',
            message: `Your ${subscription.plan} subscription will renew on ${formattedDate}. Make sure your payment method is up to date.`,
            data: { plan: subscription.plan, billing_date: subscription.next_billing_date },
          })

          // Mark as sent
          await supabase
            .from('subscriptions')
            .update({ payment_reminder_sent: true, updated_at: now.toISOString() })
            .eq('user_id', subscription.user_id)

          // Log activity
          await supabase.from('user_activity_logs').insert({
            user_id: subscription.user_id,
            activity_type: 'payment_reminder_sent',
            activity_data: {
              plan: subscription.plan,
              billing_date: subscription.next_billing_date,
              email: profile.email,
              sent_at: now.toISOString(),
            },
          })

          console.log(`[subscription-management] Reminder sent to ${profile.email}`)
          results.reminders.push({
            user_id: subscription.user_id,
            success: true,
            email: profile.email,
          })
        } catch (error: any) {
          console.error(`[subscription-management] Reminder processing error:`, error)
          results.reminders.push({ user_id: subscription.user_id, success: false, error: error.message })
        }
      }
    }

    // ===== TASK 3: Handle Grace Periods (downgrade after 3 days) =====
    const gracePeriodExpired = new Date(now)
    gracePeriodExpired.setDate(gracePeriodExpired.getDate() - 3)

    console.log(`[subscription-management] Task 3: Checking downgrades before ${gracePeriodExpired.toISOString()}`)

    const { data: expiredSubscriptions } = await supabase
      .from('subscriptions')
      .select('*, profiles!inner(email, full_name)')
      .eq('status', 'active')
      .neq('plan', 'free')
      .not('next_billing_date', 'is', null)
      .lt('next_billing_date', gracePeriodExpired.toISOString())

    if (expiredSubscriptions && expiredSubscriptions.length > 0) {
      console.log(`[subscription-management] Found ${expiredSubscriptions.length} subscriptions to downgrade`)

      for (const subscription of expiredSubscriptions) {
        try {
          const oldPlan = subscription.plan

          // Call downgrade function
          const { error: downgradeError } = await supabase.rpc('downgrade_to_free_plan', {
            p_user_id: subscription.user_id,
          })

          if (downgradeError) {
            results.downgrades.push({ user_id: subscription.user_id, success: false, error: downgradeError.message })
            continue
          }

          // Update account limit
          try {
            await updateAccountLimit(subscription.user_id, 'free')
          } catch (accountError) {
            console.error(`[subscription-management] Account limit error:`, accountError)
          }

          // Create notification
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

          console.log(`[subscription-management] Downgraded ${subscription.user_id} from ${oldPlan} to free`)
          results.downgrades.push({
            user_id: subscription.user_id,
            success: true,
            old_plan: oldPlan,
          })
        } catch (error: any) {
          console.error(`[subscription-management] Downgrade processing error:`, error)
          results.downgrades.push({ user_id: subscription.user_id, success: false, error: error.message })
        }
      }
    }

    // Summary
    const summary = {
      resets: {
        total: results.resets.length,
        successful: results.resets.filter((r: any) => r.success).length,
      },
      reminders: {
        total: results.reminders.length,
        successful: results.reminders.filter((r: any) => r.success).length,
      },
      downgrades: {
        total: results.downgrades.length,
        successful: results.downgrades.filter((r: any) => r.success).length,
      },
    }

    console.log(`[subscription-management] Complete. Resets: ${summary.resets.successful}/${summary.resets.total}, Reminders: ${summary.reminders.successful}/${summary.reminders.total}, Downgrades: ${summary.downgrades.successful}/${summary.downgrades.total}`)

    return NextResponse.json({
      message: 'Subscription management tasks completed',
      date: now.toISOString(),
      summary,
      results,
    })
  } catch (error: any) {
    console.error('[subscription-management] Cron job error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to run cron job' },
      { status: 500 }
    )
  }
}
