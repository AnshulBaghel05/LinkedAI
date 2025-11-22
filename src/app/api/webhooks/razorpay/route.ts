import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyWebhookSignature } from '@/lib/razorpay/server'

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    const payload = await request.text()

    // Verify webhook signature
    const isValid = verifyWebhookSignature(payload, signature)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      )
    }

    const event = JSON.parse(payload)
    const supabase = await createClient()

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        // Payment was successful
        const paymentId = event.payload.payment.entity.id
        const orderId = event.payload.payment.entity.order_id
        const notes = event.payload.payment.entity.notes

        if (notes && notes.user_id && notes.plan) {
          // Update subscription status
          await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              razorpay_payment_id: paymentId,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', notes.user_id)
        }
        break

      case 'payment.failed':
        // Payment failed
        const failedNotes = event.payload.payment.entity.notes

        if (failedNotes && failedNotes.user_id) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', failedNotes.user_id)
        }
        break

      case 'subscription.cancelled':
        // Subscription was cancelled
        const subscriptionId = event.payload.subscription.entity.id

        await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_subscription_id', subscriptionId)
        break

      default:
        console.log('Unhandled webhook event:', event.event)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
