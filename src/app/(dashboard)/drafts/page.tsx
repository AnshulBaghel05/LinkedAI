'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, Edit, Trash2, Calendar, Search, Wand2, Filter, MoreVertical, Clock, Tag } from 'lucide-react'

export default function DraftsPage() {
  const [drafts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState('all')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-[#0a66c2] to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Drafts</h1>
            <p className="text-gray-600">Review and polish your saved posts</p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{drafts.length}</div>
          <div className="text-sm text-gray-500">Total Drafts</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="text-2xl font-bold text-[#0a66c2]">0</div>
          <div className="text-sm text-gray-500">This Week</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="text-2xl font-bold text-green-600">0</div>
          <div className="text-sm text-gray-500">Published</div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search drafts by content or tags..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2] transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center gap-2 text-gray-700 font-medium transition-colors">
              <Filter className="w-5 h-5" />
              <span className="hidden lg:inline">Filter</span>
            </button>
            <button className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center gap-2 text-gray-700 font-medium transition-colors">
              <Clock className="w-5 h-5" />
              <span className="hidden lg:inline">Recent</span>
            </button>
          </div>
        </div>
      </div>

      {/* Drafts List */}
      {drafts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No drafts yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Start creating amazing LinkedIn content and save your posts as drafts to refine them later
          </p>
          <Link href="/generate">
            <Button className="bg-[#0a66c2] hover:bg-[#004182] text-white px-6 py-6 text-base rounded-xl shadow-lg shadow-blue-500/20">
              <Wand2 className="w-5 h-5 mr-2" />
              Generate Your First Post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft, index) => (
            <div
              key={draft.id}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
            >
              {/* Draft Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#0a66c2] to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(draft.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{draft.word_count} words</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Draft Content */}
              <div className="p-6">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-4">
                  {draft.content}
                </p>

                {/* Tags */}
                {draft.tags && draft.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {draft.tags.map((tag: string, tagIndex: number) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 bg-blue-50 text-[#0a66c2] text-sm rounded-full border border-blue-100 flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
                      <Edit className="w-4 h-4" />
                      Edit Draft
                    </button>
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
                      <Calendar className="w-4 h-4" />
                      Schedule
                    </button>
                  </div>
                  <button className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Action */}
      {drafts.length > 0 && (
        <div className="mt-6 text-center">
          <Link href="/generate">
            <button className="px-6 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium inline-flex items-center gap-2 shadow-sm transition-all hover:shadow">
              <Wand2 className="w-5 h-5" />
              Create New Draft
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}
