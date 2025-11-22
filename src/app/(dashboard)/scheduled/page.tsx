'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Clock, Edit, Trash2, Calendar, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'

export default function ScheduledPage() {
  const [scheduledPosts] = useState<any[]>([])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#0a66c2] to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Scheduled Posts</h1>
            <p className="text-gray-600">Manage your queued content</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{scheduledPosts.length}</div>
                <div className="text-sm text-gray-500">Total Scheduled</div>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#0a66c2]" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">0</div>
                <div className="text-sm text-gray-500">This Week</div>
              </div>
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-500">Next 24h</div>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scheduled Posts List */}
      {scheduledPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Clock className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No scheduled posts</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Plan your content strategy by scheduling posts from your drafts or calendar
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/calendar">
              <Button className="bg-[#0a66c2] hover:bg-[#004182] text-white px-6 py-6 text-base rounded-xl shadow-lg shadow-blue-500/20">
                <Calendar className="w-5 h-5 mr-2" />
                Open Calendar
              </Button>
            </Link>
            <Link href="/drafts">
              <Button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-6 py-6 text-base rounded-xl shadow-sm">
                View Drafts
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {scheduledPosts.map((post, index) => (
            <div
              key={post.id}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
            >
              {/* Post Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-600">
                      {new Date(post.scheduled_for).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Ready to publish
                  </span>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-6">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-4 line-clamp-4">
                  {post.content}
                </p>

                {/* Post Meta */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag: string, tagIndex: number) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 bg-blue-50 text-[#0a66c2] text-sm rounded-full border border-blue-100"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
                      <Edit className="w-4 h-4" />
                      Edit Post
                    </button>
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                      <Calendar className="w-4 h-4" />
                      Reschedule
                    </button>
                  </div>
                  <button className="px-4 py-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {scheduledPosts.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-[#0a66c2]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Scheduling Tips</h3>
              <p className="text-sm text-gray-600 mb-3">
                Post during peak engagement hours (8-10 AM, 12-1 PM, 5-6 PM) for maximum reach.
              </p>
              <Link href="/calendar">
                <button className="text-sm font-medium text-[#0a66c2] hover:underline">
                  View optimal posting times →
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
