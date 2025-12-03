import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  // If there's an auth code in the URL and we're not already on the callback route
  // Exclude API routes (LinkedIn OAuth, NextAuth) from this redirect
  if (code &&
      !requestUrl.pathname.startsWith('/auth/callback') &&
      !requestUrl.pathname.startsWith('/api/auth')) {
    // Only redirect Supabase auth codes (password reset, Google OAuth)
    // This allows LinkedIn OAuth and other API-based auth to work normally
    const callbackUrl = new URL('/auth/callback', request.url)
    callbackUrl.searchParams.set('code', code)
    callbackUrl.searchParams.set('next', '/reset-password')

    return NextResponse.redirect(callbackUrl)
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * - api/linkedin-oauth (LinkedIn OAuth routes - must be excluded)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/linkedin-oauth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
