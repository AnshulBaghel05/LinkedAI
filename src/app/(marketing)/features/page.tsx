import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { Sparkles, TrendingUp, Clock, Edit, BarChart, Users, Zap, CheckCircle2, Calendar, Hash, Send, Eye, PieChart, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const allFeatures = [
  {
    icon: Sparkles,
    title: 'AI Content Generation',
    description: 'Generate engaging LinkedIn posts with our advanced AI that understands your industry and voice.',
    details: ['Multiple writing styles', 'Industry-specific content', 'Tone customization', 'Hook optimization'],
    mockup: 'ai-generation',
  },
  {
    icon: Clock,
    title: 'Smart Scheduling',
    description: 'Schedule posts at optimal times when your audience is most active.',
    details: ['Best time suggestions', 'Queue management', 'Auto-posting', 'Time zone support'],
    mockup: 'scheduling',
  },
  {
    icon: BarChart,
    title: 'Analytics Dashboard',
    description: 'Track your content performance with detailed analytics and insights.',
    details: ['Engagement metrics', 'Growth tracking', 'Content performance', 'Audience insights'],
    mockup: 'analytics',
  },
  {
    icon: Edit,
    title: 'Post Editor',
    description: 'Edit and refine AI-generated content with our intuitive editor.',
    details: ['Live preview', 'Character counter', 'Hashtag suggestions', 'Formatting tools'],
    mockup: 'editor',
  },
  {
    icon: Users,
    title: 'Audience Insights',
    description: 'Understand who engages with your content and what they want.',
    details: ['Demographics', 'Engagement patterns', 'Top followers', 'Industry breakdown'],
    mockup: 'audience',
  },
  {
    icon: Zap,
    title: 'One-Click Publishing',
    description: 'Publish directly to LinkedIn without leaving our platform.',
    details: ['Direct integration', 'Multi-account support', 'Draft saving', 'Revision history'],
    mockup: 'publishing',
  },
]

function FeatureMockup({ type }: { type: string }) {
  if (type === 'ai-generation') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
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

  if (type === 'scheduling') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-gray-900">This Week</span>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-7 gap-1 mb-3">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-center text-xs text-gray-500">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[1,2,3,4,5,6,7].map((d) => (
            <div key={d} className={`aspect-square rounded-lg flex items-center justify-center text-sm ${d === 3 || d === 5 ? 'bg-[#0a66c2] text-white' : d === 2 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {d === 3 || d === 5 ? <Clock className="w-3 h-3" /> : d === 2 ? <CheckCircle2 className="w-3 h-3" /> : d}
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-[#0a66c2]/5 rounded-lg">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#0a66c2]" />
            <span className="text-sm text-gray-700">Best time: <span className="font-medium">9:00 AM</span></span>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'analytics') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-gray-900">Performance</span>
          <PieChart className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">12.4K</div>
            <div className="text-xs text-gray-600">Impressions</div>
            <div className="text-xs text-green-600">+24%</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">8.9%</div>
            <div className="text-xs text-gray-600">Engagement</div>
            <div className="text-xs text-green-600">+12%</div>
          </div>
        </div>
        <div className="flex items-end gap-1 h-16">
          {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
            <div key={i} className="flex-1 bg-[#0a66c2]/20 rounded-t hover:bg-[#0a66c2]/40 transition-colors" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (type === 'editor') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Edit className="w-5 h-5 text-gray-400" />
          <span className="font-medium text-gray-900">Post Editor</span>
        </div>
        <div className="border border-gray-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-gray-700 leading-relaxed">The best leaders I&apos;ve worked with share one trait: they listen more than they speak...</p>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>247 / 3000 characters</span>
          <Eye className="w-4 h-4" />
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition">
            <Hash className="w-4 h-4 inline mr-1" />Hashtags
          </button>
          <button className="px-3 py-1.5 bg-[#0a66c2] rounded-lg text-sm text-white">
            Preview
          </button>
        </div>
      </div>
    )
  }

  if (type === 'audience') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-gray-900">Top Engagers</span>
          <Users className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          {[
            { name: 'Sarah M.', role: 'Marketing Lead', engagement: 94 },
            { name: 'John D.', role: 'CEO', engagement: 87 },
            { name: 'Emily R.', role: 'Product Manager', engagement: 82 },
          ].map((user, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center text-white text-sm font-medium">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">{user.role}</div>
              </div>
              <div className="text-sm font-medium text-green-600">{user.engagement}%</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'publishing') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Send className="w-5 h-5 text-gray-400" />
          <span className="font-medium text-gray-900">Publish</span>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Ready to publish!</span>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3">
          <div className="w-10 h-10 rounded-full bg-[#0a66c2] flex items-center justify-center">
            <span className="text-white font-bold text-sm">in</span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">LinkedIn Profile</div>
            <div className="text-xs text-green-600">Connected</div>
          </div>
        </div>
        <button className="w-full py-2.5 bg-[#0a66c2] text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#004182] transition">
          <Zap className="w-4 h-4" />
          Publish Now
        </button>
      </div>
    )
  }

  return null
}

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 gradient-mesh">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="inline-block px-4 py-1.5 bg-[#0a66c2]/10 text-[#0a66c2] text-sm font-medium rounded-full mb-4">
            Features
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Powerful features for LinkedIn growth
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Everything you need to create, schedule, and analyze your LinkedIn content in one place.
          </p>
          <Link href="/signup">
            <Button size="lg">Start Free Trial</Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-24">
            {allFeatures.map((feature, index) => (
              <div key={index} className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                  <div className="w-16 h-16 rounded-2xl bg-[#0a66c2]/10 flex items-center justify-center mb-6">
                    <feature.icon className="w-8 h-8 text-[#0a66c2]" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{feature.title}</h2>
                  <p className="text-lg text-gray-600 mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#057642]" />
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
      <section className="py-20 bg-[#0a66c2]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to grow your LinkedIn presence?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join thousands of professionals using LinkedAI to create engaging content.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-[#0a66c2] hover:bg-gray-100">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
