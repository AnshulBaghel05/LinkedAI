import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendPaymentReminderEmail } from '@/lib/email/templates'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes for cron job

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.error('[payment-reminders] Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const now = new Date()

    // Calculate date 3 days from now
    const threeDaysFromNow = new Date(now)
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
    threeDaysFromNow.setHours(0, 0, 0, 0) // Start of day

    const threeDaysFromNowEnd = new Date(threeDaysFromNow)
    threeDaysFromNowEnd.setHours(23, 59, 59, 999) // End of day

    console.log(`[payment-reminders] Running cron job at ${now.toISOString()}`)
    console.log(`[payment-reminders] Looking for renewals between ${threeDaysFromNow.toISOString()} and ${threeDaysFromNowEnd.toISOString()}`)

    // Find subscriptions that renew in 3 days and haven't been reminded yet
    const { data: subscriptionsToRemind, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*, profiles!inner(email, full_name)')
      .eq('status', 'active')
      .neq('plan', 'free') // Only remind paid users
      .eq('payment_reminder_sent', false)
      .not('next_billing_date', 'is', null)
      .gte('next_billing_date', threeDaysFromNow.toISOString())
      .lte('next_billing_date', threeDaysFromNowEnd.toISOString())

    if (fetchError) {
      console.error('[payment-reminders] Error fetching subscriptions:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions', details: fetchError },
        { status: 500 }
      )
    }

    if (!subscriptionsToRemind || subscriptionsToRemind.length === 0) {
      console.log('[payment-reminders] No reminders to send today')
      return NextResponse.json({
        message: 'No payment reminders to send',
        date: now.toISOString(),
        reminder_count: 0,
      })
    }

    console.log(`[payment-reminders] Found ${subscriptionsToRemind.length} subscriptions to remind`)

    const results = []

    for (const subscription of subscriptionsToRemind) {
      try {
        const profile = subscription.profiles as any

        if (!profile?.email) {
          console.error(`[payment-reminders] No email for user ${subscription.user_id}`)
          results.push({
            user_id: subscription.user_id,
            success: false,
            error: 'No email address',
          })
          continue
        }

        // Format billing date nicely
        const billingDate = new Date(subscription.next_billing_date)
        const formattedDate = billingDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })

        // Send payment reminder email
        const emailResult = await sendPaymentReminderEmail({
          to: profile.email,
          name: profile.full_name || 'there',
          plan: subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1), // Capitalize
          billingDate: formattedDate,
          billingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://linkedai.site'}/settings/billing`,
        })

        if (!emailResult.success) {
          console.error(`[payment-reminders] Failed to send email to ${profile.email}:`, emailResult.error)
          results.push({
            user_id: subscription.user_id,
            success: false,
            error: 'Failed to send email',
          })
          continue
        }

        // Create in-app notification
        await supabase.from('notifications').insert({
          user_id: subscription.user_id,
          type: 'payment_reminder',
          title: 'Subscription Renewal Reminder',
          message: `Your ${subscription.plan} subscription will renew on ${formattedDate}. Make sure your payment method is up to date.`,
          data: {
            plan: subscription.plan,
            billing_date: subscription.next_billing_date,
          },
        })

        // Mark reminder as sent
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            payment_reminder_sent: true,
            updated_at: now.toISOString(),
          })
          .eq('user_id', subscription.user_id)

        if (updateError) {
          console.error(`[payment-reminders] Error updating reminder status for ${subscription.user_id}:`, updateError)
        }

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

        console.log(`[payment-reminders] Successfully sent reminder to ${profile.email}`)
        results.push({
          user_id: subscription.user_id,
          success: true,
          email: profile.email,
          plan: subscription.plan,
          billing_date: formattedDate,
        })
      } catch (error: any) {
        console.error(`[payment-reminders] Error processing ${subscription.user_id}:`, error)
        results.push({
          user_id: subscription.user_id,
          success: false,
          error: error.message,
        })
      }
    }

    const successCount = results.filter((r) => r.success).length

    console.log(`[payment-reminders] Sent ${successCount} of ${subscriptionsToRemind.length} reminders`)

    return NextResponse.json({
      message: `Sent ${successCount} of ${subscriptionsToRemind.length} payment reminders`,
      date: now.toISOString(),
      total: subscriptionsToRemind.length,
      reminder_count: successCount,
      results,
    })
  } catch (error: any) {
    console.error('[payment-reminders] Cron job error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to run cron job' },
      { status: 500 }
    )
  }
}
