import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function GET() {
  try {
    console.log('Testing Resend configuration...')
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'SET' : 'NOT SET')
    console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || 'NOT SET')

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        error: 'RESEND_API_KEY not set in environment variables'
      }, { status: 500 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    console.log('Attempting to send test email...')

    const { data, error } = await resend.emails.send({
      from: 'LinkedAI <noreply@linkedai.site>',
      to: ['ansbaghel1234@gmail.com'], // Change this to your email
      subject: 'Test Email from LinkedAI',
      html: '<h1>This is a test email</h1><p>If you receive this, Resend is working!</p>',
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({
        error: 'Failed to send email',
        details: error
      }, { status: 500 })
    }

    console.log('Email sent successfully! Email ID:', data?.id)

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      emailId: data?.id,
      config: {
        apiKeySet: !!process.env.RESEND_API_KEY,
        fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@linkedai.site'
      }
    })

  } catch (error: any) {
    console.error('Test email error:', error)
    return NextResponse.json({
      error: 'Unexpected error',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
