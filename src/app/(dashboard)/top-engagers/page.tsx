'use client'

import { Heart, MessageCircle, Share2, Trophy, AlertCircle } from 'lucide-react'
import PlanProtectedRoute from '@/components/auth/PlanProtectedRoute'

export default function TopEngagersPage() {
  return (
    <PlanProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Top Engagers</h1>
                <p className="text-gray-600">Discover who engages most with your LinkedIn content</p>
              </div>
            </div>
          </div>

          {/* Coming Soon Banner */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon!</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We're building an advanced engagement tracking system to help you identify and nurture relationships
              with your most active supporters. Build stronger connections with those who matter most.
            </p>
          </div>

          {/* Feature Preview Cards */}
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Like Leaders</h3>
              <p className="text-sm text-gray-600">
                Identify profiles that consistently like your posts and show appreciation for your content.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Comment Champions</h3>
              <p className="text-sm text-gray-600">
                Track who leaves the most valuable comments and engages in meaningful conversations.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Share2 className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Share Superstars</h3>
              <p className="text-sm text-gray-600">
                Discover power users who amplify your reach by sharing your content with their networks.
              </p>
            </div>
          </div>

          {/* Use Cases */}
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">What You'll Be Able To Do:</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">✓</span>
                <span>Identify your most engaged followers and build stronger relationships</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">✓</span>
                <span>Thank top engagers personally to foster loyalty and community</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">✓</span>
                <span>Discover potential brand ambassadors and collaboration opportunities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">✓</span>
                <span>Track engagement patterns over time to optimize your content strategy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">✓</span>
                <span>Export engager lists for CRM integration and personalized outreach</span>
              </li>
            </ul>
          </div>

          {/* Notification Banner */}
          <div className="mt-8 bg-purple-50 border border-purple-100 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-purple-900 mb-2">🚀 Early Access</h3>
            <p className="text-sm text-purple-800">
              Want early access when this feature launches? Email us at{' '}
              <a href="mailto:support@linkedai.site" className="font-medium underline">
                support@linkedai.site
              </a>{' '}
              and tell us how you'd use this feature!
            </p>
          </div>
        </div>
      </div>
    </PlanProtectedRoute>
  )
}
