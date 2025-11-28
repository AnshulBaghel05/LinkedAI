import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { addLinkedInAccount } from '@/lib/linkedin/accounts'

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
    // Verify environment variables
    const clientId = process.env.LINKEDIN_CLIENT_ID
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI

    console.log('LinkedIn OAuth Debug:', {
      clientId: clientId?.slice(0, 5) + '...',
      hasSecret: !!clientSecret,
      redirectUri,
    })

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('LinkedIn OAuth configuration missing')
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    })

    const responseText = await tokenResponse.text()

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        body: responseText,
      })
      throw new Error(`LinkedIn API error: ${responseText}`)
    }

    const tokenData = JSON.parse(responseText)
    const accessToken = tokenData.access_token
    const refreshToken = tokenData.refresh_token
    const expiresIn = tokenData.expires_in

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
    const profileName = userInfo.name || userInfo.given_name
    const profilePictureUrl = userInfo.picture

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Use admin client to ensure profile exists
    const adminClient = createAdminClient()

    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id, subscription_plan, linkedin_accounts_limit')
      .eq('id', user.id)
      .maybeSingle()

    if (!existingProfile) {
      // Create profile if it doesn't exist
      await adminClient.from('profiles').insert({
        id: user.id,
        email: user.email,
        subscription_plan: 'free',
        posts_remaining: 5,
        posts_limit: 5,
        posts_used: 0,
        linkedin_connected: false, // Will be set to true by addLinkedInAccount
        google_calendar_enabled: false,
        linkedin_accounts_limit: 1,
      })
    }

    // Add LinkedIn account using the new multi-account system
    const result = await addLinkedInAccount({
      userId: user.id,
      linkedinUserId: linkedinUserId,
      accessToken: accessToken,
      refreshToken: refreshToken,
      tokenExpiresAt: expiresIn
        ? new Date(Date.now() + expiresIn * 1000).toISOString()
        : undefined,
      profileName: profileName,
      profilePictureUrl: profilePictureUrl,
      profileUrl: `https://www.linkedin.com/in/${linkedinUserId}`,
    })

    if (!result.success) {
      throw new Error(result.error || 'Failed to add LinkedIn account')
    }

    // Redirect to settings with success message
    return NextResponse.redirect(
      new URL('/settings?success=LinkedIn account connected successfully!', request.url)
    )
  } catch (error: any) {
    console.error('LinkedIn OAuth callback error:', error)
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent(error.message || 'Failed to connect LinkedIn. Please try again.')}`, request.url)
    )
  }
}
