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
// Standard plan names: 'free' | 'pro' | 'standard' | 'enterprise'
export const PLAN_CONFIGS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    posts_limit: 20,
    ai_credits: 10,
    linkedin_accounts: 1,
    features: [
      '20 posts per month',
      '10 AI generations',
      'Basic analytics',
      'Email support',
      '1 LinkedIn account',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 2900, // $29 in cents
    posts_limit: 100,
    ai_credits: 200,
    linkedin_accounts: 5,
    features: [
      '100 posts per month',
      '200 AI generations',
      'Advanced analytics',
      'Priority email support',
      '5 LinkedIn accounts',
      'Custom scheduling',
      'LinkedIn analytics',
      'Post templates',
    ],
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    price: 7900, // $79 in cents
    posts_limit: 500,
    ai_credits: 1000,
    linkedin_accounts: 10,
    features: [
      '500 posts per month',
      '1000 AI generations',
      'Advanced analytics & insights',
      'Priority support (24/7)',
      '10 LinkedIn accounts',
      'Custom scheduling',
      'LinkedIn analytics',
      'Post templates library',
      'Team collaboration (up to 3 users)',
      'Content calendar',
      'Engagement tracking',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0, // Contact for pricing
    posts_limit: -1, // Unlimited
    ai_credits: -1, // Unlimited
    linkedin_accounts: -1, // Unlimited
    features: [
      'Unlimited posts',
      'Unlimited AI generations',
      'Dedicated account manager',
      '24/7 Priority support',
      'Custom integrations',
      'Advanced analytics & reporting',
      'Unlimited team members',
      'Unlimited LinkedIn accounts',
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
      amount: amount, // Amount in cents for USD
      currency: 'USD',
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
  const keySecret = process.env.RAZORPAY_KEY_SECRET || ''

  if (!keySecret) {
    throw new Error('Razorpay key secret is not configured')
  }

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
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || ''

  if (!webhookSecret) {
    throw new Error('Razorpay webhook secret is not configured')
  }

  const generatedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex')

  return generatedSignature === signature
}
