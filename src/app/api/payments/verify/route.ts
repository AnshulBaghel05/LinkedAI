import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyRazorpaySignature, PLAN_CONFIGS } from '@/lib/razorpay/server'
import { updateAccountLimit, getLinkedInAccountLimit } from '@/lib/linkedin/accounts'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, paymentId, signature, plan } = body

    // Verify payment signature
    const isValid = verifyRazorpaySignature(orderId, paymentId, signature)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    const planConfig = PLAN_CONFIGS[plan as keyof typeof PLAN_CONFIGS]
    const now = new Date()

    // Calculate anniversary day (cap at 28 to handle month-end dates)
    const anniversaryDay = Math.min(now.getDate(), 28)

    // Calculate next billing date (30 days from now, on anniversary day)
    const nextBillingDate = new Date(now)
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
    nextBillingDate.setDate(anniversaryDay)

    // Update subscription in database with anniversary billing
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        plan: plan,
        status: 'active',
        billing_anniversary_day: anniversaryDay,
        posts_limit: planConfig.posts_limit,
        posts_used: 0, // Reset usage on payment
        ai_generations_limit: planConfig.ai_credits,
        ai_generations_used: 0, // Reset usage on payment
        ai_credits_used: 0,
        razorpay_payment_id: paymentId,
        last_payment_date: now.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: nextBillingDate.toISOString(),
        next_billing_date: nextBillingDate.toISOString(),
        payment_reminder_sent: false,
        grace_period_end: null,
        updated_at: now.toISOString(),
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating subscription:', updateError)
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      )
    }

    // Update profile with new subscription plan
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_plan: plan,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Error updating profile:', profileError)
    }

    // Update LinkedIn account limit based on new plan
    const limitUpdateResult = await updateAccountLimit(user.id, plan)

    if (!limitUpdateResult.success) {
      console.error('Error updating account limit:', limitUpdateResult.error)
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and subscription updated',
      plan: plan,
      linkedin_accounts_limit: getLinkedInAccountLimit(plan),
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
