'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, Sparkles, Zap, Crown, Loader2, Star, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Script from 'next/script'

declare global {
  interface Window {
    Razorpay: any
  }
}

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 'Free',
    period: '',
    description: 'Perfect for getting started',
    icon: Sparkles,
    color: 'from-gray-500 to-gray-600',
    postsPerMonth: '5 AI posts/month',
    linkedinAccounts: '1 LinkedIn account',
    features: [
      '5 AI-generated posts/month',
      '50 lead discoveries/week',
      '5 viral predictions/month',
      'Audience growth tracker',
      'Best time to post AI',
      '5 AI content ideas/week',
      'Basic post score (24h after)',
      'Trending topics access',
      '12+ post templates',
      'Basic scheduling',
      'Email support',
    ],
    buttonText: 'Current Plan',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: 'per month',
    description: 'For serious content creators',
    icon: Zap,
    color: 'from-[#0a66c2] to-blue-600',
    postsPerMonth: '100 AI posts/month',
    comparison: '20x more than Free',
    linkedinAccounts: '5 LinkedIn accounts',
    features: [
      '100 AI-generated posts/month',
      '500 lead discoveries/week',
      '100 viral predictions/month',
      'Audience growth + insights',
      'Track 3 competitors',
      'Top 10 engagers tracking',
      '20 AI comment replies/month',
      '20 AI content ideas/week',
      'Full post performance autopsy',
      'Advanced analytics dashboard',
      'A/B testing (2 variants)',
      'Priority support',
      'Custom hashtag suggestions',
    ],
    buttonText: 'Upgrade to Pro',
    popular: true,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '$79',
    period: 'per month',
    description: 'For growing businesses',
    icon: Star,
    color: 'from-purple-500 to-purple-600',
    postsPerMonth: '500 AI posts/month',
    comparison: '100x more than Free',
    linkedinAccounts: '10 LinkedIn accounts',
    features: [
      '500 AI-generated posts/month',
      '2000 lead discoveries/week',
      'Unlimited viral predictions',
      'Advanced audience intelligence',
      'Track 10 competitors',
      'Top 50 engagers tracking',
      '100 AI comment replies/month',
      '50 AI content ideas/week',
      'Team collaboration (5 users)',
      'Content calendar',
      'A/B testing (5 variants)',
      'Custom branding',
      'API access',
      'White-label reports',
    ],
    buttonText: 'Upgrade to Standard',
    popular: false,
  },
  {
    id: 'custom',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Tailored to your needs',
    icon: Crown,
    color: 'from-orange-500 to-red-600',
    postsPerMonth: 'Unlimited',
    linkedinAccounts: 'Unlimited accounts',
    features: [
      'Unlimited AI posts',
      'Unlimited lead discoveries',
      'Unlimited competitors',
      'Unlimited team members',
      'Dedicated account manager',
      'Custom AI training',
      'White-label platform',
      'SLA guarantee (99.9% uptime)',
      'Custom integrations',
      'Enterprise security (SOC 2)',
      'Onboarding & training',
      '24/7 priority support',
    ],
    buttonText: 'Contact Sales',
    popular: false,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState('free')
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('plan')
          .eq('user_id', user.id)
          .single()

        if (subscription) {
          setCurrentPlan(subscription.plan)
        }
      }
    }
    fetchSubscription()
  }, [])

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free' || planId === currentPlan) return

    // Custom plan requires contact form
    if (planId === 'custom') {
      setShowContactModal(true)
      return
    }

    setLoading(planId)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please login to upgrade')
        setLoading(null)
        return
      }

      // Create Razorpay order
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create order')
      }

      const orderData = await orderResponse.json()

      // Initialize Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LinkedAI',
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan Subscription`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Verify payment
          const verifyResponse = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              plan: planId,
            }),
          })

          if (verifyResponse.ok) {
            toast.success('Payment successful! Plan upgraded.')
            setCurrentPlan(planId)
          } else {
            toast.error('Payment verification failed')
          }
          setLoading(null)
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#0a66c2',
        },
        modal: {
          ondismiss: function () {
            setLoading(null)
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Failed to process payment')
      setLoading(null)
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Unlock powerful features and grow your LinkedIn presence with our flexible pricing plans
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {plans.map((plan) => {
              const Icon = plan.icon
              const isCurrentPlan = currentPlan === plan.id
              const isLoading = loading === plan.id

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl border-2 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col ${
                    plan.popular
                      ? 'border-[#0a66c2] lg:scale-105'
                      : 'border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-[#0a66c2] to-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-grow">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Plan Name */}
                    <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 text-sm text-center mb-6 min-h-[40px] flex items-center justify-center">
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="text-center mb-6 py-4 border-y border-gray-100">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-gray-900">
                          {plan.price}
                        </span>
                      </div>
                      {plan.period && <span className="text-gray-500 text-sm mt-1 block">/{plan.period}</span>}
                    </div>

                    {/* Key Metrics */}
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-4 mb-6 border border-gray-100">
                      <div className="text-sm font-semibold text-[#0a66c2] mb-1">{plan.postsPerMonth}</div>
                      {plan.comparison && (
                        <div className="text-xs text-gray-500 mb-2">{plan.comparison}</div>
                      )}
                      <div className="text-sm font-semibold text-gray-700">{plan.linkedinAccounts}</div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-6 flex-grow">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Button */}
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isCurrentPlan || isLoading || (plan.id !== 'free' && !razorpayLoaded)}
                      className={`w-full py-3.5 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 mt-auto ${
                        isCurrentPlan
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : plan.popular
                          ? 'bg-gradient-to-r from-[#0a66c2] to-blue-600 hover:from-[#004182] hover:to-blue-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl'
                          : plan.id === 'custom'
                          ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl'
                          : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-[#0a66c2]'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : (
                        plan.buttonText
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* FAQ or Additional Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Can I change my plan later?
                </h3>
                <p className="text-gray-600">
                  Yes, you can upgrade or downgrade your plan at any time. Changes will take effect immediately.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600">
                  We accept all major credit/debit cards, UPI, net banking, and wallets through Razorpay.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Is there a refund policy?
                </h3>
                <p className="text-gray-600">
                  We offer a 7-day money-back guarantee. If you're not satisfied, contact support for a full refund.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Modal for Custom Plan */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Contact Sales</h3>
                  <p className="text-sm text-gray-600">Get a custom plan tailored to your needs</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-gray-700">
                  Our custom plan is perfect for enterprises and agencies with specific requirements. Get in touch with our sales team to discuss:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Custom post limits and AI credits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Dedicated account manager</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Custom integrations and features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Enterprise SLA and support</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <a
                  href="/contact"
                  className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-medium transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact Sales Team
                </a>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
