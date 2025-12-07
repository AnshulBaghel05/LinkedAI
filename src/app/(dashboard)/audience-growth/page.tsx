'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LineChart, Users, TrendingUp, TrendingDown, Calendar, ArrowUp, ArrowDown } from 'lucide-react'

export default function AudienceGrowthPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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

  // Mock data for demonstration
  const stats = {
    totalFollowers: 2847,
    weeklyGrowth: 127,
    growthRate: 4.7,
    avgEngagement: 3.2,
  }

  const weeklyData = [
    { day: 'Mon', followers: 2720 },
    { day: 'Tue', followers: 2745 },
    { day: 'Wed', followers: 2765 },
    { day: 'Thu', followers: 2790 },
    { day: 'Fri', followers: 2815 },
    { day: 'Sat', followers: 2830 },
    { day: 'Sun', followers: 2847 },
  ]

  const insights = [
    {
      title: 'Peak Growth Day',
      value: 'Thursday',
      change: '+45 followers',
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Best Performing Post',
      value: 'AI in Marketing',
      change: '+89 followers',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Engagement Rate',
      value: '3.2%',
      change: '+0.5% from last week',
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <LineChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Audience Growth</h1>
              <p className="text-gray-600">Track your LinkedIn audience growth and engagement</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Followers</span>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalFollowers.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUp className="w-4 h-4" />
              <span>{stats.weeklyGrowth} this week</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Growth Rate</span>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.growthRate}%
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUp className="w-4 h-4" />
              <span>+1.2% from last week</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Weekly Growth</span>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              +{stats.weeklyGrowth}
            </div>
            <div className="text-sm text-gray-600">Last 7 days</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Avg Engagement</span>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.avgEngagement}%
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUp className="w-4 h-4" />
              <span>+0.5% this week</span>
            </div>
          </div>
        </div>

        {/* Growth Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
          <h3 className="font-semibold text-gray-900 mb-6">7-Day Growth Trend</h3>
          <div className="h-64 flex items-end justify-between gap-4">
            {weeklyData.map((data, index) => {
              const height = ((data.followers - 2700) / (2847 - 2700)) * 100
              return (
                <div key={data.day} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100%' }}>
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg absolute bottom-0 transition-all duration-500"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <div className="mt-2 text-sm font-medium text-gray-600">{data.day}</div>
                  <div className="text-xs text-gray-500">{data.followers}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insights.map((insight, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className={`w-12 h-12 ${insight.bg} rounded-xl flex items-center justify-center mb-4`}>
                <insight.icon className={`w-6 h-6 ${insight.color}`} />
              </div>
              <h3 className="text-sm text-gray-600 mb-2">{insight.title}</h3>
              <div className="text-2xl font-bold text-gray-900 mb-1">{insight.value}</div>
              <div className={`text-sm ${insight.color}`}>{insight.change}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
