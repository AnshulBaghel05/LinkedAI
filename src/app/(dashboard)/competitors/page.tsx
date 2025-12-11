'use client'

import { Users2, TrendingUp, Eye, Calendar, AlertCircle } from 'lucide-react'
import PlanProtectedRoute from '@/components/auth/PlanProtectedRoute'

export default function CompetitorsPage() {
  return (
    <PlanProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0a66c2] to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Users2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Competitor Analysis</h1>
                <p className="text-gray-600">Track and analyze your competitors' LinkedIn performance</p>
              </div>
            </div>
          </div>

          {/* Coming Soon Banner */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon!</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We're building powerful competitor analysis tools to help you stay ahead of the competition.
              Track your competitors' posting frequency, engagement rates, and top-performing content.
            </p>
          </div>

          {/* Feature Preview Cards */}
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Track Competitors</h3>
              <p className="text-sm text-gray-600">
                Monitor your competitors' LinkedIn profiles and get real-time updates on their activity.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Performance Metrics</h3>
              <p className="text-sm text-gray-600">
                Compare engagement rates, posting frequency, and content performance against your competitors.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Content Insights</h3>
              <p className="text-sm text-gray-600">
                Discover what types of content work best for your competitors and adapt your strategy.
              </p>
            </div>
          </div>

          {/* Notification Banner */}
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">📬 Get Notified</h3>
            <p className="text-sm text-blue-800">
              This feature is currently in development. Want to be notified when it's ready? Contact us at{' '}
              <a href="mailto:support@linkedai.site" className="font-medium underline">
                support@linkedai.site
              </a>
            </p>
          </div>
        </div>
      </div>
    </PlanProtectedRoute>
  )
}
