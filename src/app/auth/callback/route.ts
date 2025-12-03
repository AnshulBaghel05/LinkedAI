import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  console.log('[Auth Callback] Request params:', {
    hasCode: !!code,
    next,
    error,
    errorDescription,
    pathname: requestUrl.pathname
  })

  // Handle OAuth errors
  if (error) {
    console.error('[Auth Callback] OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    )
  }

  // Exchange code for session
  if (code) {
    try {
      const supabase = await createClient()
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('[Auth Callback] Exchange error:', exchangeError)
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, request.url)
        )
      }

      console.log('[Auth Callback] Session exchanged successfully for user:', data.user?.email)

      // Check if this is a LinkedIn connection from settings (user already logged in)
      const linkedinConnect = requestUrl.searchParams.get('linkedin_connect')

      if (linkedinConnect === 'true' && next === '/settings') {
        console.log('[Auth Callback] LinkedIn account connection detected')

        // Check if user has LinkedIn identity
        const linkedinIdentity = data.user?.identities?.find(
          (identity: any) => identity.provider === 'linkedin_oidc'
        )

        if (linkedinIdentity) {
          // TODO: Store LinkedIn account in your linkedin_accounts table
          // You can access LinkedIn data from linkedinIdentity.identity_data
          console.log('[Auth Callback] LinkedIn identity:', {
            provider: linkedinIdentity.provider,
            id: linkedinIdentity.id,
            email: linkedinIdentity.identity_data?.email
          })

          return NextResponse.redirect(
            new URL('/settings?success=LinkedIn account connected successfully!', request.url)
          )
        }
      }

      // Determine redirect based on 'next' parameter
      // All successful authentications go to their specified destination or dashboard
      const redirectPath = next || '/dashboard'

      console.log('[Auth Callback] Redirecting to:', redirectPath)
      return NextResponse.redirect(new URL(redirectPath, request.url))

    } catch (err) {
      console.error('[Auth Callback] Unexpected error:', err)
      return NextResponse.redirect(
        new URL('/login?error=Authentication failed', request.url)
      )
    }
  }

  // No code provided - redirect to login
  console.warn('[Auth Callback] No code provided')
  return NextResponse.redirect(new URL('/login', request.url))
}
