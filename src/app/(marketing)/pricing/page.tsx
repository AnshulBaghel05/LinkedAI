'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, Zap, Star, Crown } from 'lucide-react'

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
    buttonText: 'Get Started Free',
    buttonLink: '/signup',
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
    buttonText: 'Start Free Trial',
    buttonLink: '/signup?plan=pro',
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
    buttonText: 'Start Free Trial',
    buttonLink: '/signup?plan=standard',
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
    buttonLink: '/contact',
    popular: false,
  },
]

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 gradient-mesh">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="inline-block px-4 py-1.5 bg-[#0a66c2]/10 text-[#0a66c2] text-sm font-medium rounded-full mb-4">
            Pricing
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free and scale as you grow. All plans include 100% FREE AI generation powered by Google Gemini.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-[#0a66c2] scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#0a66c2] text-white text-sm font-semibold rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="p-6">
                  {/* Plan Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                      <plan.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      {plan.period && <span className="text-gray-600">/{plan.period.split(' ')[1]}</span>}
                    </div>
                    {plan.comparison && (
                      <p className="text-sm text-green-600 mt-1">{plan.comparison}</p>
                    )}
                  </div>

                  {/* Posts & Accounts */}
                  <div className="mb-6 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">AI Posts</span>
                      <span className="font-semibold text-gray-900">{plan.postsPerMonth}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">LinkedIn Accounts</span>
                      <span className="font-semibold text-gray-900">{plan.linkedinAccounts}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link href={plan.buttonLink} className="block">
                    <Button
                      size="lg"
                      className={`w-full ${
                        plan.popular
                          ? 'bg-[#0a66c2] hover:bg-[#004182] text-white'
                          : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200'
                      }`}
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Feature Comparison
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Compare all features across plans
          </p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-900">Free</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-900 bg-blue-50">Pro</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-900">Standard</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-sm text-gray-700">AI Post Generation</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">5/month</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900 bg-blue-50">100/month</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">500/month</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-sm text-gray-700">Lead Discovery</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">50/week</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900 bg-blue-50">500/week</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">2000/week</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-sm text-gray-700">Viral Predictions</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">5/month</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900 bg-blue-50">100/month</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">Unlimited</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-sm text-gray-700">Competitor Tracking</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-400">—</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900 bg-blue-50">3 competitors</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">10 competitors</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-sm text-gray-700">Top Engagers</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-400">—</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900 bg-blue-50">Top 10</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">Top 50</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-sm text-gray-700">AI Comment Replies</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-400">—</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900 bg-blue-50">20/month</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">100/month</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-sm text-gray-700">Content Ideas</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">5/week</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900 bg-blue-50">20/week</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">50/week</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-sm text-gray-700">LinkedIn Accounts</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">1</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900 bg-blue-50">5</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">10</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-sm text-gray-700">Team Members</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">1</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900 bg-blue-50">1</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">5</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-sm text-gray-700">A/B Testing</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-400">—</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900 bg-blue-50">2 variants</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">5 variants</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-sm text-gray-700">API Access</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-400">—</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-400 bg-blue-50">—</td>
                  <td className="py-4 px-4 text-center text-sm"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="py-4 px-4 text-center text-sm"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-sm text-gray-700">White-label Options</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-400">—</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-400 bg-blue-50">—</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-400">—</td>
                  <td className="py-4 px-4 text-center text-sm"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-sm text-gray-700">Support</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">Email</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900 bg-blue-50">Priority</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">Priority</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">24/7 Dedicated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is the AI content generation really free?
              </h3>
              <p className="text-gray-600">
                Yes! We use Google Gemini 1.5 Flash which is 100% free. Your only limits are based on your plan tier (5 posts/month on Free, 100 on Pro, 500 on Standard).
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I upgrade or downgrade anytime?
              </h3>
              <p className="text-gray-600">
                Absolutely! You can change your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, changes take effect at the next billing cycle.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens when I hit my usage limits?
              </h3>
              <p className="text-gray-600">
                When you reach your monthly limit for AI posts or weekly limit for leads, you'll need to upgrade to continue. Your scheduled posts will still publish, but you won't be able to create new ones until the next cycle or you upgrade.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact support for a full refund within 14 days of your purchase.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#0a66c2] to-[#004182]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to grow your LinkedIn presence?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join thousands of professionals using LinkedAI to save time and grow their audience.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-[#0a66c2] hover:bg-gray-100">
              Start Free - No Credit Card Required
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
