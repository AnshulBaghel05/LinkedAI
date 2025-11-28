import { NextAuthOptions } from 'next-auth'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import LinkedInProvider from 'next-auth/providers/linkedin'
import GoogleProvider from 'next-auth/providers/google'

// Get environment variables with defaults for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const linkedinClientId = process.env.LINKEDIN_CLIENT_ID || ''
const linkedinClientSecret = process.env.LINKEDIN_CLIENT_SECRET || ''

export const authOptions: NextAuthOptions = {
  // Use Supabase adapter for session and user management
  adapter: SupabaseAdapter({
    url: supabaseUrl,
    secret: supabaseServiceKey,
  }),

  // Authentication providers
  providers: [
    // LinkedIn OAuth
    LinkedInProvider({
      clientId: linkedinClientId,
      clientSecret: linkedinClientSecret,
      authorization: {
        params: {
          scope: 'openid profile email w_member_social',
        },
      },
    }),

    // Google OAuth (optional - requires setup)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // Email magic link support can be added later by:
    // 1. Install nodemailer: npm install nodemailer
    // 2. Uncomment the EmailProvider code below
    // 3. Configure RESEND_API_KEY in .env.local

    // ...(process.env.RESEND_API_KEY
    //   ? [
    //       EmailProvider({
    //         server: {
    //           host: 'smtp.resend.com',
    //           port: 465,
    //           auth: {
    //             user: 'resend',
    //             pass: process.env.RESEND_API_KEY,
    //           },
    //         },
    //         from: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
    //       }),
    //     ]
    //   : []),
  ],

  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
  },

  // Custom pages
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
    verifyRequest: '/verify-request',
  },

  // Callbacks
  callbacks: {
    // JWT callback - Add user data to token
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }

      // Store LinkedIn access token if available
      if (account?.provider === 'linkedin') {
        token.linkedinAccessToken = account.access_token
        token.linkedinRefreshToken = account.refresh_token
        token.linkedinExpiresAt = account.expires_at
      }

      return token
    },

    // Session callback - Add user data to session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
      }

      return session
    },

    // Sign in callback - Custom logic after sign in
    async signIn({ user, account, profile }) {
      // Allow all sign ins
      return true
    },

    // Redirect callback - Control where users go after sign in
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after sign in
      if (url.startsWith(baseUrl)) return url
      else if (url.startsWith('/')) return `${baseUrl}${url}`
      return `${baseUrl}/dashboard`
    },
  },

  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',

  // Security options
  secret: process.env.NEXTAUTH_SECRET,
}
