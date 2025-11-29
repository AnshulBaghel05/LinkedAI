import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'
  const type = requestUrl.searchParams.get('type')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if this is a password recovery flow
      if (type === 'recovery') {
        return NextResponse.redirect(`${requestUrl.origin}/reset-password`)
      }

      // For other auth flows (signup confirmation, etc.)
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    }
  }

  // If there's an error or no code, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
