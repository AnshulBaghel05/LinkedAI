import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error_code = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')

  // Log for debugging
  console.log('Auth callback:', { code, error_code, error_description, url: requestUrl.toString() })

  // If there's an error from Supabase, redirect to login with error
  if (error_code) {
    console.error('Supabase auth error:', error_code, error_description)
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${error_description || error_code}`)
  }

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    console.log('Exchange result:', { hasSession: !!data?.session, error: error?.message })

    if (!error && data?.session) {
      // Successfully exchanged code for session
      // Always redirect to reset-password for email-based auth
      console.log('Redirecting to reset-password')
      return NextResponse.redirect(`${requestUrl.origin}/reset-password`)
    }

    // Log the error
    console.error('Session exchange failed:', error)
  }

  // If no code or exchange failed, redirect to login
  console.log('No code or exchange failed, redirecting to login')
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
