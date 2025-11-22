import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('LinkedIn OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent(errorDescription || 'LinkedIn connection failed')}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/settings?error=No authorization code received', request.url)
    )
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange failed:', errorData)
      throw new Error('Failed to exchange authorization code')
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Get LinkedIn user info
    const userInfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch LinkedIn user info')
    }

    const userInfo = await userInfoResponse.json()
    const linkedinUserId = userInfo.sub

    // Update user profile in Supabase
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        linkedin_connected: true,
        linkedin_access_token: accessToken,
        linkedin_user_id: linkedinUserId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Failed to update profile:', updateError)
      throw new Error('Failed to save LinkedIn connection')
    }

    // Redirect to settings with success message
    return NextResponse.redirect(
      new URL('/settings?success=LinkedIn connected successfully!', request.url)
    )
  } catch (error) {
    console.error('LinkedIn OAuth callback error:', error)
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent('Failed to connect LinkedIn. Please try again.')}`, request.url)
    )
  }
}
