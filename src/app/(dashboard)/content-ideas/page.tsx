'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lightbulb, Sparkles, Copy, Check, RefreshCw, TrendingUp, Users, Briefcase, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

export default function ContentIdeasPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        }
      }
      setLoading(false)
    }

    getProfile()
  }, [])

  const handleGenerate = async () => {
    setGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setGenerating(false)
  }

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Mock content ideas
  const contentIdeas = [
    {
      id: 1,
      category: 'Industry Insights',
      icon: TrendingUp,
      color: 'from-blue-500 to-purple-500',
      title: 'The Future of AI in Your Industry',
      description: 'Share your perspective on how AI is transforming your industry and what professionals should prepare for.',
      hooks: [
        '3 AI trends that will reshape our industry in 2025',
        'Why most professionals are unprepared for the AI revolution',
        'I\'ve been tracking AI developments for 5 years. Here\'s what surprised me...',
      ],
    },
    {
      id: 2,
      category: 'Personal Story',
      icon: Users,
      color: 'from-green-500 to-teal-500',
      title: 'Career Lesson Learned',
      description: 'Share a valuable lesson from your professional journey that others can learn from.',
      hooks: [
        'My biggest career mistake taught me this valuable lesson',
        'What I wish I knew 5 years ago about career growth',
        'The hard truth about success nobody talks about',
      ],
    },
    {
      id: 3,
      category: 'How-To Guide',
      icon: BookOpen,
      color: 'from-orange-500 to-red-500',
      title: 'Practical Skills Tutorial',
      description: 'Create a step-by-step guide teaching a specific skill or process in your expertise area.',
      hooks: [
        '5 steps to master [skill] in 30 days',
        'The framework I use to [achieve result]',
        'How to [solve problem] without [common pain point]',
      ],
    },
    {
      id: 4,
      category: 'Industry News',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      title: 'React to Recent Development',
      description: 'Share your expert take on recent news or trends in your industry.',
      hooks: [
        'Everyone\'s talking about [news]. Here\'s what they\'re missing...',
        'Unpopular opinion about [trending topic]',
        'What [recent event] really means for professionals',
      ],
    },
    {
      id: 5,
      category: 'Behind-the-Scenes',
      icon: Briefcase,
      color: 'from-pink-500 to-rose-500',
      title: 'Day in the Life',
      description: 'Give followers a peek into your work routine or process.',
      hooks: [
        'My morning routine that 10x\'d my productivity',
        'A typical day as a [your role]',
        'The tools and systems I use daily',
      ],
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Content Ideas</h1>
                <p className="text-gray-600">AI-powered content suggestions to keep your feed active</p>
              </div>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 gap-2"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate More
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content Ideas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contentIdeas.map((idea) => (
            <div
              key={idea.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${idea.color} p-6`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <idea.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white/80 text-sm font-medium">{idea.category}</div>
                    <h3 className="text-xl font-bold text-white">{idea.title}</h3>
                  </div>
                </div>
                <p className="text-white/90 text-sm">{idea.description}</p>
              </div>

              {/* Content */}
              <div className="p-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Suggested Hooks:</h4>
                <div className="space-y-3">
                  {idea.hooks.map((hook, index) => (
                    <div
                      key={index}
                      className="group relative bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <p className="text-sm text-gray-700 pr-8">{hook}</p>
                      <button
                        onClick={() => copyToClipboard(hook, idea.id * 10 + index)}
                        className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedId === idea.id * 10 + index ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => {
                    toast.success('Opening in editor...')
                    // TODO: Navigate to generate page with this idea
                  }}
                >
                  Use This Idea
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Pro Tips for Great Content</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                  <span>Start with a compelling hook that stops the scroll</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                  <span>Share personal stories and real experiences</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                  <span>End with a question to encourage engagement</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                  <span>Post consistently - aim for 3-5 times per week</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
