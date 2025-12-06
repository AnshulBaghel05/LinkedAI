'use client'

import { useEffect, useRef } from 'react'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import {
  Sparkles, TrendingUp, Clock, Edit, BarChart, Users, Zap, CheckCircle2,
  Calendar, Hash, Send, Eye, PieChart, Bell, Target, LineChart,
  MessageSquare, Lightbulb, Shield, Brain, Trophy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const allFeatures = [
  // CORE FEATURES
  {
    icon: Sparkles,
    title: 'AI Content Generation',
    description: 'Generate engaging LinkedIn posts with our advanced AI powered by Google Gemini 1.5 Flash (100% FREE).',
    details: ['Multiple writing styles', 'Industry-specific content', 'Tone customization', 'Hook optimization'],
    mockup: 'ai-generation',
    badge: 'Core',
    plan: 'Free'
  },
  {
    icon: Clock,
    title: 'Smart Scheduling',
    description: 'Schedule posts at optimal times when your audience is most active.',
    details: ['Best time suggestions', 'Queue management', 'Auto-posting', 'Time zone support'],
    mockup: 'scheduling',
    badge: 'Core',
    plan: 'Free'
  },
  {
    icon: Edit,
    title: 'Post Editor & Templates',
    description: 'Edit and refine AI-generated content with 12+ professional templates.',
    details: ['Live preview', 'Character counter', 'Hashtag suggestions', '12+ templates'],
    mockup: 'editor',
    badge: 'Core',
    plan: 'Free'
  },

  // NEW UNIQUE FEATURES
  {
    icon: Users,
    title: 'Lead Generation & Discovery',
    description: 'Find and track LinkedIn leads by job title, company, and industry. Export to CRM.',
    details: ['50 leads/mo (Free)', '500 leads/mo (Pro)', 'Lead scoring 0-100', 'CSV/JSON export'],
    mockup: 'lead-generation',
    badge: 'New',
    plan: 'Free'
  },
  {
    icon: Target,
    title: 'Viral Content Predictor',
    description: 'AI predicts your post\'s virality BEFORE publishing with actionable improvement tips.',
    details: ['Virality score 0-100', 'Improvement suggestions', '5 predictions/mo (Free)', '100 predictions/mo (Pro)'],
    mockup: 'viral-predictor',
    badge: 'New',
    plan: 'Free'
  },
  {
    icon: LineChart,
    title: 'Audience Growth Tracker',
    description: 'Track follower growth over time with detailed charts and predictions.',
    details: ['Daily snapshots', '7d, 30d charts', 'Growth velocity', 'Milestone alerts'],
    mockup: 'audience-growth',
    badge: 'New',
    plan: 'Free'
  },
  {
    icon: TrendingUp,
    title: 'Best Time to Post AI',
    description: 'AI analyzes YOUR audience to find optimal posting times.',
    details: ['Personalized analysis', 'Day/hour heatmap', 'Auto-schedule at best time', 'Weekly reports'],
    mockup: 'best-time',
    badge: 'Core',
    plan: 'Free'
  },
  {
    icon: Eye,
    title: 'Competitor Intelligence',
    description: 'Monitor competitor posts and performance to stay ahead.',
    details: ['Track 3 competitors (Pro)', 'Performance benchmarks', 'Content gap analysis', 'Trending topics'],
    mockup: 'competitors',
    badge: 'New',
    plan: 'Pro'
  },
  {
    icon: MessageSquare,
    title: 'Top Engagers & AI Replies',
    description: 'Identify your most engaged followers and auto-generate comment responses.',
    details: ['Top 10 supporters', '20 AI replies/mo (Pro)', 'Sentiment analysis', 'One-click posting'],
    mockup: 'top-engagers',
    badge: 'New',
    plan: 'Pro'
  },
  {
    icon: Brain,
    title: 'Post Performance Autopsy',
    description: 'AI explains WHY your post succeeded/failed 24h after publishing.',
    details: ['Success factors', 'Improvement areas', 'Key learnings', 'Recommended actions'],
    mockup: 'post-insights',
    badge: 'New',
    plan: 'Pro'
  },
  {
    icon: Lightbulb,
    title: 'AI Content Ideas',
    description: 'Never run out of ideas. AI suggests personalized topics weekly.',
    details: ['5 ideas/week (Free)', '20 ideas/week (Pro)', 'Trending integration', 'Predicted virality'],
    mockup: 'content-ideas',
    badge: 'New',
    plan: 'Free'
  },
  {
    icon: BarChart,
    title: 'Advanced Analytics',
    description: 'Track performance with detailed analytics and insights.',
    details: ['Engagement metrics', 'Growth tracking', 'Content performance', 'Audience demographics'],
    mockup: 'analytics',
    badge: 'Core',
    plan: 'Pro'
  },
]

function FeatureMockup({ type }: { type: string }) {
  const mockupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mockupRef.current) return

    // Hover animation
    const element = mockupRef.current

    const handleMouseEnter = () => {
      gsap.to(element, {
        scale: 1.05,
        rotateY: 5,
        duration: 0.3,
        ease: 'power2.out'
      })
    }

    const handleMouseLeave = () => {
      gsap.to(element, {
        scale: 1,
        rotateY: 0,
        duration: 0.3,
        ease: 'power2.out'
      })
    }

    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  // ... (keep all existing mockup components, just add ref)

  if (type === 'lead-generation') {
    return (
      <div ref={mockupRef} className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 transform-gpu">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-gray-900">Lead Discovery</span>
          <Users className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          {[
            { name: 'Sarah Johnson', title: 'VP Marketing', company: 'TechCorp', score: 94 },
            { name: 'Mike Chen', title: 'CEO', company: 'StartupX', score: 87 },
            { name: 'Emma Davis', title: 'Director', company: 'InnovateCo', score: 82 },
          ].map((lead, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                {lead.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                <div className="text-xs text-gray-500">{lead.title} at {lead.company}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-green-600">{lead.score}</div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Weekly Limit</span>
            <span className="font-bold text-blue-600">7/10 used</span>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'viral-predictor') {
    return (
      <div ref={mockupRef} className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 transform-gpu">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-purple-600" />
          <span className="font-medium text-gray-900">Virality Prediction</span>
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Virality Score</span>
            <span className="text-2xl font-bold text-purple-600">87/100</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-[87%]" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2 p-2 bg-green-50 rounded">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
            <span className="text-xs text-gray-700">Strong hook detected</span>
          </div>
          <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded">
            <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5" />
            <span className="text-xs text-gray-700">Add a question to boost engagement +15%</span>
          </div>
        </div>
        <div className="mt-4 text-center">
          <span className="text-xs text-gray-500">Predicted: 12K views, 840 likes</span>
        </div>
      </div>
    )
  }

  if (type === 'audience-growth') {
    return (
      <div ref={mockupRef} className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 transform-gpu">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-gray-900">Follower Growth</span>
          <LineChart className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">+284</div>
            <div className="text-xs text-gray-600">This Week</div>
            <div className="text-xs text-green-600">+18%</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">2.4K</div>
            <div className="text-xs text-gray-600">Total</div>
            <div className="text-xs text-green-600">+24%</div>
          </div>
        </div>
        <div className="flex items-end gap-1 h-20">
          {[30, 45, 38, 52, 48, 60, 55, 68, 62, 75, 70, 82].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t hover:opacity-80 transition-opacity"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="mt-4 text-center text-xs text-gray-500">
          30-day growth trend
        </div>
      </div>
    )
  }

  if (type === 'best-time') {
    return (
      <div ref={mockupRef} className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 transform-gpu">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-gray-900">Best Times</span>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-7 gap-1 mb-3">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-center text-xs text-gray-500">{d}</div>
          ))}
        </div>
        <div className="space-y-1">
          {['9AM', '12PM', '3PM', '6PM'].map((time, row) => (
            <div key={time} className="grid grid-cols-7 gap-1">
              {[1,2,3,4,5,6,7].map((day) => {
                const isHot = (row === 1 && day === 3) || (row === 2 && day === 5)
                const isWarm = (row === 0 && day === 2) || (row === 3 && day === 4)
                return (
                  <div
                    key={day}
                    className={`aspect-square rounded flex items-center justify-center text-xs ${
                      isHot ? 'bg-green-500 text-white' :
                      isWarm ? 'bg-yellow-400 text-gray-800' :
                      'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isHot && '🔥'}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-700">Best: <span className="font-medium">Wed 12PM</span></span>
          </div>
        </div>
      </div>
    )
  }

  // Keep existing mockups and add ref to them...
  if (type === 'ai-generation') {
    return (
      <div ref={mockupRef} className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 transform-gpu">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#0a66c2]/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#0a66c2]" />
          </div>
          <span className="font-medium text-gray-900">AI Writing</span>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-200 rounded-full w-full animate-pulse" />
          <div className="h-3 bg-gray-200 rounded-full w-4/5 animate-pulse" style={{ animationDelay: '0.1s' }} />
          <div className="h-3 bg-gray-200 rounded-full w-3/4 animate-pulse" style={{ animationDelay: '0.2s' }} />
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-[#0a66c2]/10 text-[#0a66c2] text-xs rounded-full">#leadership</span>
          <span className="px-2 py-1 bg-[#0a66c2]/10 text-[#0a66c2] text-xs rounded-full">#growth</span>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 h-2 bg-green-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full w-[85%]" />
          </div>
          <span className="text-xs text-green-600 font-medium">85% optimized</span>
        </div>
      </div>
    )
  }

  // Add other existing mockups similarly...
  return <div ref={mockupRef} className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 transform-gpu h-64 flex items-center justify-center text-gray-400">Mockup: {type}</div>
}

export default function FeaturesPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Hero animation
    if (heroRef.current) {
      gsap.from(heroRef.current.children, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out'
      })
    }

    // Feature cards scroll animation
    if (featuresRef.current) {
      const features = featuresRef.current.querySelectorAll('.feature-card')

      features.forEach((feature, index) => {
        gsap.from(feature, {
          scrollTrigger: {
            trigger: feature,
            start: 'top 80%',
            end: 'top 50%',
            toggleActions: 'play none none reverse'
          },
          opacity: 0,
          x: index % 2 === 0 ? -50 : 50,
          duration: 0.8,
          ease: 'power3.out'
        })
      })
    }
  }, [])

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-16 gradient-mesh">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="inline-block px-4 py-1.5 bg-[#0a66c2]/10 text-[#0a66c2] text-sm font-medium rounded-full mb-4">
            Features
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            The Most Complete LinkedIn Tool
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            AI content generation, lead discovery, viral predictions, competitor tracking, and more—all in one platform.
          </p>
          <Link href="/signup">
            <Button size="lg">Start Free Trial - No Credit Card</Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section ref={featuresRef} className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-24">
            {allFeatures.map((feature, index) => (
              <div key={index} className={`feature-card grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#0a66c2]/10 flex items-center justify-center">
                      <feature.icon className="w-8 h-8 text-[#0a66c2]" />
                    </div>
                    <div>
                      {feature.badge && (
                        <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                          feature.badge === 'New' ? 'bg-green-100 text-green-700' :
                          feature.badge === 'Core' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {feature.badge}
                        </span>
                      )}
                      {feature.plan && (
                        <span className="ml-2 text-xs text-gray-500">· {feature.plan}</span>
                      )}
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{feature.title}</h2>
                  <p className="text-lg text-gray-600 mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#057642] flex-shrink-0" />
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`flex items-center justify-center ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                  <FeatureMockup type={feature.mockup} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#0a66c2] to-[#004182]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to dominate LinkedIn?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join thousands using LinkedAI for lead generation, viral content, and growth tracking.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-[#0a66c2] hover:bg-gray-100">
              Start Free - 5 AI Posts + 50 Leads/Month
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
