'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Wand2, Loader2, Sparkles, Plus, X, Lightbulb, Zap, Copy, Check, Save, Edit3, Hash, MessageSquare, Target } from 'lucide-react'
import toast from 'react-hot-toast'

const toneOptions = [
  { value: 'professional', label: 'Professional', icon: '💼', desc: 'Clear and business-focused' },
  { value: 'casual', label: 'Casual & Friendly', icon: '😊', desc: 'Approachable and warm' },
  { value: 'thought-leader', label: 'Thought Leader', icon: '🎯', desc: 'Authoritative insights' },
  { value: 'storytelling', label: 'Storytelling', icon: '📖', desc: 'Engaging narratives' },
  { value: 'educational', label: 'Educational', icon: '📚', desc: 'Teach and inform' },
]

const topicSuggestions = [
  'Leadership', 'AI & Tech', 'Career Growth', 'Productivity', 'Startups', 'Marketing'
]

interface GeneratedPost {
  topic: string
  hook: string
  body: string
  cta: string
  full_post: string
  suggested_hashtags: string[]
}

export default function GeneratePage() {
  const [topics, setTopics] = useState<string[]>([])
  const [newTopic, setNewTopic] = useState('')
  const [tone, setTone] = useState('professional')
  const [postsCount, setPostsCount] = useState(7)
  const [loading, setLoading] = useState(false)
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const addTopic = (topic?: string) => {
    const topicToAdd = topic || newTopic.trim()
    if (topicToAdd && !topics.includes(topicToAdd)) {
      setTopics([...topics, topicToAdd])
      setNewTopic('')
    }
  }

  const removeTopic = (topic: string) => {
    setTopics(topics.filter((t) => t !== topic))
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleGenerate = async () => {
    if (topics.length === 0) {
      toast.error('Please add at least one topic')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topics, tone, postsCount }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate posts')
      }

      setGeneratedPosts(data.posts)
      toast.success(`Generated ${data.posts.length} posts!`)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">AI Content Generator</h1>
          </div>
          <p className="text-gray-500">Create engaging LinkedIn posts powered by AI in seconds</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>5 credits remaining</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left Panel - Input Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Topics Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#0a66c2]" />
                <h2 className="font-semibold text-gray-900">Topics & Expertise</h2>
              </div>
              <p className="text-sm text-gray-500 mt-1">What do you want to write about?</p>
            </div>

            <div className="p-5">
              {/* Topic Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                  placeholder="Enter a topic..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2] focus:bg-white transition-colors"
                />
                <button
                  onClick={() => addTopic()}
                  className="px-4 py-2.5 bg-[#0a66c2] text-white rounded-xl hover:bg-[#004182] transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Topic Suggestions */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> Quick add:
                </p>
                <div className="flex flex-wrap gap-2">
                  {topicSuggestions.filter(s => !topics.includes(s)).slice(0, 4).map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => addTopic(suggestion)}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-[#0a66c2]/10 hover:text-[#0a66c2] transition-colors"
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Topics */}
              {topics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <span
                      key={topic}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0a66c2]/10 text-[#0a66c2] rounded-full text-sm font-medium group"
                    >
                      {topic}
                      <button
                        onClick={() => removeTopic(topic)}
                        className="w-4 h-4 rounded-full hover:bg-[#0a66c2]/20 flex items-center justify-center transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {topics.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Add topics to get started</p>
              )}
            </div>
          </div>

          {/* Tone Selection Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#0a66c2]" />
                <h2 className="font-semibold text-gray-900">Writing Style</h2>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 gap-2">
                {toneOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTone(option.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      tone === option.value
                        ? 'border-[#0a66c2] bg-[#0a66c2]/5'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{option.icon}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${tone === option.value ? 'text-[#0a66c2]' : 'text-gray-700'}`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-400">{option.desc}</p>
                    </div>
                    {tone === option.value && (
                      <Check className="w-5 h-5 text-[#0a66c2]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Posts Count & Generate */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-gray-700">Number of Posts</label>
              <span className="text-2xl font-bold text-[#0a66c2]">{postsCount}</span>
            </div>
            <input
              type="range"
              min={1}
              max={14}
              value={postsCount}
              onChange={(e) => setPostsCount(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#0a66c2] mb-6"
            />
            <div className="flex justify-between text-xs text-gray-400 mb-6">
              <span>1 post</span>
              <span>14 posts</span>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || topics.length === 0}
              className="w-full h-12 text-base gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating magic...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate {postsCount} Posts
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Panel - Generated Posts */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Generated Posts</h2>
            {generatedPosts.length > 0 && (
              <span className="text-sm text-gray-500">{generatedPosts.length} posts</span>
            )}
          </div>

          {generatedPosts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
              <div className="text-center max-w-sm mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-[#0a66c2]/10 to-[#0a66c2]/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-[#0a66c2]/40" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to create?</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Add your topics, choose a writing style, and let AI generate engaging LinkedIn posts for you.
                </p>
                <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">1</div>
                    Add topics
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">2</div>
                    Pick style
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">3</div>
                    Generate
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
              {generatedPosts.map((post, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Post Header */}
                  <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#0a66c2]/10 flex items-center justify-center text-xs font-medium text-[#0a66c2]">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-700">{post.topic}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => copyToClipboard(post.full_post, index)}
                        className="p-2 text-gray-400 hover:text-[#0a66c2] hover:bg-[#0a66c2]/10 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === index ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-5">
                    <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                      {post.full_post}
                    </p>

                    {/* Hashtags */}
                    {post.suggested_hashtags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                        <Hash className="w-4 h-4 text-gray-300" />
                        {post.suggested_hashtags.map((tag, i) => (
                          <span key={i} className="text-xs text-[#0a66c2] hover:underline cursor-pointer">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Post Actions */}
                  <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/30 flex items-center gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                    <Button size="sm" className="gap-1.5">
                      <Save className="w-3.5 h-3.5" />
                      Save Draft
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
