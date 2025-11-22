import Razorpay from 'razorpay'

// Initialize Razorpay instance
export function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are not configured')
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  })
}

// Plan configurations
export const PLAN_CONFIGS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    posts_limit: 5,
    ai_credits: 5,
    features: [
      '5 posts per month',
      '5 AI generations',
      'Basic analytics',
      'Email support',
      'LinkedIn connection',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 99900, // ₹999 in paise
    posts_limit: 25, // 5x of free (5 x 5 = 25)
    ai_credits: 25,
    features: [
      '25 posts per month (5x Free)',
      '25 AI generations',
      'Advanced analytics',
      'Priority email support',
      'Custom scheduling',
      'LinkedIn analytics',
      'Post templates',
    ],
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    price: 299900, // ₹2,999 in paise
    posts_limit: 100, // 20x of free (5 x 20 = 100)
    ai_credits: 100,
    features: [
      '100 posts per month (20x Free)',
      '100 AI generations',
      'Advanced analytics & insights',
      'Priority support (24/7)',
      'Custom scheduling',
      'LinkedIn analytics',
      'Post templates library',
      'Team collaboration (up to 3 users)',
      'Content calendar',
      'Engagement tracking',
    ],
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    price: 0, // Contact for pricing
    posts_limit: -1, // Custom
    ai_credits: -1, // Custom
    features: [
      'Custom posts limit',
      'Custom AI generations',
      'Dedicated account manager',
      '24/7 Priority support',
      'Custom integrations',
      'Advanced analytics & reporting',
      'Unlimited team members',
      'API access',
      'White-label options',
      'Custom features on demand',
      'SLA guarantees',
      'Training & onboarding',
    ],
  },
}

// Create Razorpay order
export async function createRazorpayOrder(amount: number, notes?: any) {
  const razorpay = getRazorpayInstance()

  try {
    const order = await razorpay.orders.create({
      amount: amount, // Amount in paise
      currency: 'INR',
      notes: notes || {},
    })

    return order
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    throw error
  }
}

// Verify Razorpay payment signature
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const crypto = require('crypto')
  const keySecret = process.env.RAZORPAY_KEY_SECRET!

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  return generatedSignature === signature
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const crypto = require('crypto')
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!

  if (!webhookSecret) {
    throw new Error('Razorpay webhook secret is not configured')
  }

  const generatedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex')

  return generatedSignature === signature
}
