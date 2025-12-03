import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const clientId = process.env.LINKEDIN_CLIENT_ID
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'LinkedIn OAuth is not configured' },
      { status: 500 }
    )
  }

  // LinkedIn OAuth 2.0 authorization URL
  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization')

  // Add required parameters
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('client_id', clientId)
  authUrl.searchParams.append('redirect_uri', redirectUri)
  authUrl.searchParams.append('scope', 'openid profile email w_member_social') // Updated scopes for LinkedIn API v2

  // Generate state for CSRF protection (optional but recommended)
  const state = Math.random().toString(36).substring(7)
  authUrl.searchParams.append('state', state)

  // Redirect to LinkedIn authorization page
  return NextResponse.redirect(authUrl.toString())
}
