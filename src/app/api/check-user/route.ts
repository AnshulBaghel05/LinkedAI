import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({
        error: 'Email parameter required. Use: /api/check-user?email=your@email.com'
      }, { status: 400 })
    }

    console.log('Checking user:', email)

    const supabase = createAdminClient()

    // Check if user exists
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email)

    if (authError) {
      console.error('Error checking user:', authError)
      return NextResponse.json({
        error: 'Error checking user',
        details: authError.message
      }, { status: 500 })
    }

    if (!authUser?.user) {
      return NextResponse.json({
        found: false,
        message: `User with email "${email}" not found in database`,
        suggestion: 'This user needs to sign up first before they can reset their password'
      })
    }

    return NextResponse.json({
      found: true,
      message: 'User exists!',
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        created_at: authUser.user.created_at,
        email_confirmed: authUser.user.email_confirmed_at ? true : false
      }
    })

  } catch (error: any) {
    console.error('Check user error:', error)
    return NextResponse.json({
      error: 'Unexpected error',
      message: error.message
    }, { status: 500 })
  }
}
