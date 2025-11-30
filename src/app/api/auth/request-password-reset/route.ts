import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    console.log('Password reset request for:', email)

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Try to get user by email from auth.users using getUserByEmail
    let userId: string | null = null

    try {
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email)

      if (authError) {
        console.log('Auth error:', authError.message)
      }

      if (authUser?.user) {
        userId = authUser.user.id
        console.log('Found user:', userId)
      }
    } catch (err) {
      console.error('Error checking user:', err)
    }

    // Don't reveal if email exists or not for security
    if (!userId) {
      console.log('User not found:', email)
      // Still return success to prevent email enumeration
      return NextResponse.json(
        { success: true, message: 'If an account exists with this email, a password reset link has been sent.' },
        { status: 200 }
      )
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Store token in database
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: userId,
        token,
        email,
        expires_at: expiresAt.toISOString(),
      })

    if (tokenError) {
      console.error('Failed to create reset token:', tokenError)
      return NextResponse.json(
        { error: 'Failed to process password reset request' },
        { status: 500 }
      )
    }

    // Generate reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

    // Send email via Resend using the password-reset template
    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@linkedai.site',
      to: [email],
      subject: 'Reset your LinkedAI password',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password - LinkedAI</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">

                            <!-- Header -->
                            <tr>
                                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #0a66c2 0%, #004182 100%);">
                                    <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #ffffff;">LinkedAI</h1>
                                    <p style="margin: 8px 0 0; font-size: 14px; color: #e0e7ff;">AI-Powered LinkedIn Content Scheduler</p>
                                </td>
                            </tr>

                            <!-- Body -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #111827;">Reset your password</h2>

                                    <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #6b7280;">
                                        We received a request to reset your password. Click the button below to create a new password.
                                    </p>

                                    <!-- Button -->
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="center" style="padding: 16px 0 32px;">
                                                <a href="${resetLink}" style="display: inline-block; background-color: #0a66c2; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 12px; box-shadow: 0 2px 4px rgba(10, 102, 194, 0.3);">
                                                    Reset Password
                                                </a>
                                            </td>
                                        </tr>
                                    </table>

                                    <p style="margin: 0 0 8px; font-size: 14px; line-height: 20px; color: #6b7280;">
                                        Or copy and paste this link into your browser:
                                    </p>
                                    <p style="margin: 0 0 32px; font-size: 14px; word-break: break-all; color: #0a66c2;">
                                        ${resetLink}
                                    </p>

                                    <!-- Info Box -->
                                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                                        <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 20px;">
                                            <strong>⏰ This link expires in 1 hour</strong> for security reasons. If it expires, you can request a new one.
                                        </p>
                                    </div>

                                    <!-- Security Notice -->
                                    <div style="padding-top: 24px; border-top: 1px solid #e5e7eb;">
                                        <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 20px;">
                                            If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.
                                        </p>
                                    </div>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                                    <p style="margin: 0 0 12px; font-size: 12px; color: #6b7280; text-align: center;">
                                        Need help? Contact us at <a href="mailto:support@linkedai.site" style="color: #0a66c2; text-decoration: none;">support@linkedai.site</a>
                                    </p>
                                    <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                                        © 2025 LinkedAI. All rights reserved.
                                    </p>
                                    <p style="margin: 8px 0 0; font-size: 12px; color: #9ca3af; text-align: center;">
                                        <a href="https://www.linkedai.site" style="color: #0a66c2; text-decoration: none;">Visit our website</a> ·
                                        <a href="https://www.linkedai.site/privacy" style="color: #0a66c2; text-decoration: none;">Privacy Policy</a> ·
                                        <a href="https://www.linkedai.site/terms" style="color: #0a66c2; text-decoration: none;">Terms of Service</a>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
      `,
    })

    if (emailError) {
      console.error('Failed to send password reset email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500 }
      )
    }

    console.log('Password reset email sent successfully to:', email)

    return NextResponse.json(
      { success: true, message: 'If an account exists with this email, a password reset link has been sent.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
