import { Resend } from 'resend'
import fs from 'fs'
import path from 'path'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'LinkedAI <noreply@linkedai.site>'

// Helper function to load HTML template
function loadTemplate(templateName: string): string {
  const templatePath = path.join(process.cwd(), 'email-templates', `${templateName}.html`)
  return fs.readFileSync(templatePath, 'utf-8')
}

// Helper function to replace variables in template
function replaceVariables(template: string, variables: Record<string, string>): string {
  let result = template
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value)
  })
  return result
}

// Email sending functions

export interface PaymentSuccessEmailParams {
  to: string
  name: string
  plan: string
  amount: string
  currency?: string
  invoiceUrl: string
  nextBillingDate: string
}

export async function sendPaymentSuccessEmail(params: PaymentSuccessEmailParams) {
  try {
    const template = loadTemplate('payment-success')
    const html = replaceVariables(template, {
      name: params.name,
      plan: params.plan,
      amount: params.amount,
      currency: params.currency || 'INR',
      invoiceUrl: params.invoiceUrl,
      nextBillingDate: params.nextBillingDate,
    })

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.to],
      subject: `Payment Successful - LinkedAI ${params.plan}`,
      html,
    })

    if (error) {
      console.error('Failed to send payment success email:', error)
      return { success: false, error }
    }

    console.log('Payment success email sent:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending payment success email:', error)
    return { success: false, error }
  }
}

export interface PaymentFailedEmailParams {
  to: string
  name: string
  plan: string
  amount: string
  retryUrl: string
}

export async function sendPaymentFailedEmail(params: PaymentFailedEmailParams) {
  try {
    const template = loadTemplate('payment-failed')
    const html = replaceVariables(template, {
      name: params.name,
      plan: params.plan,
      amount: params.amount,
      retryUrl: params.retryUrl,
    })

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.to],
      subject: 'Payment Failed - LinkedAI Subscription',
      html,
    })

    if (error) {
      console.error('Failed to send payment failed email:', error)
      return { success: false, error }
    }

    console.log('Payment failed email sent:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending payment failed email:', error)
    return { success: false, error }
  }
}

export interface WelcomeEmailParams {
  to: string
  name: string
  email: string
}

export async function sendWelcomeEmail(params: WelcomeEmailParams) {
  try {
    const template = loadTemplate('welcome-email')
    const html = replaceVariables(template, {
      name: params.name,
      email: params.email,
    })

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.to],
      subject: 'Welcome to LinkedAI! 🎉',
      html,
    })

    if (error) {
      console.error('Failed to send welcome email:', error)
      return { success: false, error }
    }

    console.log('Welcome email sent:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error }
  }
}

export interface EmailConfirmationParams {
  to: string
  email: string
  confirmationLink: string
}

export async function sendEmailConfirmation(params: EmailConfirmationParams) {
  try {
    const template = loadTemplate('email-confirmation')
    const html = replaceVariables(template, {
      email: params.email,
      confirmationLink: params.confirmationLink,
    })

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.to],
      subject: 'Confirm your LinkedAI email address',
      html,
    })

    if (error) {
      console.error('Failed to send email confirmation:', error)
      return { success: false, error }
    }

    console.log('Email confirmation sent:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending email confirmation:', error)
    return { success: false, error }
  }
}

export interface PostPublishedEmailParams {
  to: string
  name: string
  postContent: string
  postUrl: string
  scheduledDate: string
  dashboardUrl: string
}

export async function sendPostPublishedEmail(params: PostPublishedEmailParams) {
  try {
    const template = loadTemplate('post-published')
    const html = replaceVariables(template, {
      name: params.name,
      postContent: params.postContent.substring(0, 150), // Limit to 150 chars
      postUrl: params.postUrl,
      scheduledDate: params.scheduledDate,
      dashboardUrl: params.dashboardUrl,
    })

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.to],
      subject: 'Your LinkedIn post is live! 📊',
      html,
    })

    if (error) {
      console.error('Failed to send post published email:', error)
      return { success: false, error }
    }

    console.log('Post published email sent:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending post published email:', error)
    return { success: false, error }
  }
}

export interface UsageLimitWarningParams {
  to: string
  name: string
  currentPlan: string
  postsUsed: string
  postsLimit: string
  upgradeUrl: string
}

export async function sendUsageLimitWarning(params: UsageLimitWarningParams) {
  try {
    const template = loadTemplate('usage-limit-warning')
    const html = replaceVariables(template, {
      name: params.name,
      currentPlan: params.currentPlan,
      postsUsed: params.postsUsed,
      postsLimit: params.postsLimit,
      upgradeUrl: params.upgradeUrl,
    })

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.to],
      subject: "You're approaching your LinkedAI limits",
      html,
    })

    if (error) {
      console.error('Failed to send usage limit warning:', error)
      return { success: false, error }
    }

    console.log('Usage limit warning sent:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending usage limit warning:', error)
    return { success: false, error }
  }
}

export interface PaymentReminderParams {
  to: string
  name: string
  plan: string
  billingDate: string
  billingUrl: string
}

export async function sendPaymentReminderEmail(params: PaymentReminderParams) {
  try {
    // Inline HTML template (can be moved to external file later)
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Reminder - LinkedAI</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #0a66c2;">LinkedAI</h1>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 0 40px 40px;">
                      <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #111827;">Your subscription is renewing soon</h2>
                      <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #6b7280;">
                        Hi ${params.name},
                      </p>
                      <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #6b7280;">
                        This is a friendly reminder that your <strong>${params.plan}</strong> subscription will renew on <strong>${params.billingDate}</strong>.
                      </p>

                      <div style="background-color: #f9fafb; border-left: 4px solid #0a66c2; padding: 16px; margin-bottom: 24px;">
                        <p style="margin: 0; font-size: 14px; color: #374151;">
                          <strong>What happens next?</strong>
                        </p>
                        <ul style="margin: 12px 0 0; padding-left: 20px; font-size: 14px; color: #6b7280;">
                          <li>Your subscription will automatically renew on ${params.billingDate}</li>
                          <li>Your usage credits will be reset to full capacity</li>
                          <li>You'll have 3 days grace period if payment fails</li>
                        </ul>
                      </div>

                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 16px 0;">
                            <a href="${params.billingUrl}" style="display: inline-block; background-color: #0a66c2; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 12px;">
                              Manage Billing
                            </a>
                          </td>
                        </tr>
                      </table>

                      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 14px; color: #6b7280;">
                          <strong>Need help?</strong> Contact our support team anytime.
                        </p>
                        <p style="margin: 12px 0 0; font-size: 14px; color: #6b7280;">
                          If you want to cancel or change your plan, visit your billing settings.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px;">
                      <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                        © ${new Date().getFullYear()} LinkedAI. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.to],
      subject: `Your LinkedAI ${params.plan} subscription renews in 3 days`,
      html,
    })

    if (error) {
      console.error('Failed to send payment reminder email:', error)
      return { success: false, error }
    }

    console.log('Payment reminder email sent:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending payment reminder email:', error)
    return { success: false, error }
  }
}

// Export all email functions
export const emailTemplates = {
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendWelcomeEmail,
  sendEmailConfirmation,
  sendPostPublishedEmail,
  sendUsageLimitWarning,
  sendPaymentReminderEmail,
}
