import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check subscription limits
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan, content_ideas_limit')
      .eq('user_id', user.id)
      .single()

    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 403 })
    }

    // Get user's profile and posting history
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const { data: recentPosts } = await supabase
      .from('posts')
      .select('content, created_at')
      .eq('user_id', user.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(10)

    // Get trending topics
    const { data: trending } = await supabase
      .from('trending_topics')
      .select('*')
      .eq('velocity', 'rising')
      .order('trend_score', { ascending: false })
      .limit(5)

    // Get top performing posts to understand what works
    const { data: topPosts } = await supabase
      .from('posts')
      .select('id, content')
      .eq('user_id', user.id)
      .eq('status', 'published')
      .limit(5)

    const { data: topAnalytics } = await supabase
      .from('post_analytics')
      .select('post_id, views, likes, comments')
      .in('post_id', topPosts?.map(p => p.id) || [])
      .order('likes', { ascending: false })
      .limit(3)

    // Generate content ideas using AI
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const ideaPrompt = `You are a LinkedIn content strategist. Generate 5 personalized content ideas.

User Profile:
- Name: ${profile?.full_name || 'Unknown'}
- Bio: ${profile?.bio || 'Not provided'}
- Industry: ${profile?.company || 'General'}

Recent Posts Topics:
${recentPosts?.slice(0, 5).map(p => `- "${p.content.substring(0, 100)}..."`).join('\n') || 'None'}

Trending Topics:
${trending?.map(t => `- ${t.topic} (${t.hashtag})`).join('\n') || 'None'}

Generate 5 unique content ideas that:
1. Are different from recent posts (avoid repetition)
2. Leverage trending topics when relevant
3. Match the user's professional brand
4. Have high engagement potential
5. Are actionable and specific

Provide response in this EXACT JSON format (no markdown):
{
  "ideas": [
    {
      "title": "<catchy title>",
      "description": "<2-3 sentence description>",
      "content_type": "<article|story|tips|question|announcement>",
      "reasoning": "<why this will perform well>",
      "suggested_hooks": ["<hook 1>", "<hook 2>"],
      "relevant_hashtags": ["<tag1>", "<tag2>", "<tag3>"],
      "predicted_virality_score": <number 0-100>,
      "trending_topic_id": "<topic from trending list or null>"
    }
  ]
}`

    const result = await model.generateContent(ideaPrompt)
    const response = result.response.text()

    let generatedIdeas
    try {
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      generatedIdeas = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('Failed to parse AI ideas:', response)
      throw new Error('Invalid AI response format')
    }

    // Save ideas to database
    const ideasToInsert = generatedIdeas.ideas.map((idea: any) => ({
      user_id: user.id,
      title: idea.title,
      description: `${idea.description}\n\n**Reasoning:** ${idea.reasoning}\n\n**Suggested Hooks:**\n${idea.suggested_hooks.map((h: string) => `- ${h}`).join('\n')}\n\n**Hashtags:** ${idea.relevant_hashtags.join(' ')}`,
      content_type: idea.content_type,
      status: 'new',
      priority: idea.predicted_virality_score >= 70 ? 1 : idea.predicted_virality_score >= 50 ? 2 : 3,
      predicted_virality_score: idea.predicted_virality_score,
      auto_generated: true
    }))

    const { data: savedIdeas, error: saveError } = await supabase
      .from('content_ideas')
      .insert(ideasToInsert)
      .select()

    if (saveError) {
      console.error('Error saving content ideas:', saveError)
    }

    return NextResponse.json({
      ideas: savedIdeas || generatedIdeas.ideas,
      count: savedIdeas?.length || generatedIdeas.ideas.length,
      message: 'Content ideas generated successfully'
    })

  } catch (error) {
    console.error('Content ideas generation error:', error)
    return NextResponse.json({
      error: 'Failed to generate content ideas',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET: Fetch existing content ideas
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'new'
    const limit = parseInt(searchParams.get('limit') || '20')

    const { data: ideas, error } = await supabase
      .from('content_ideas')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', status)
      .order('priority', { ascending: true })
      .order('predicted_virality_score', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching content ideas:', error)
      return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 })
    }

    return NextResponse.json({ ideas })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
