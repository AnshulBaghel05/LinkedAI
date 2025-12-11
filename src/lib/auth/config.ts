/**
 * NextAuth Configuration (CURRENTLY UNUSED)
 *
 * This file contains NextAuth.js configuration but is NOT currently used in the application.
 * The application uses Supabase Auth instead for all authentication flows:
 * - Email/Password login via Supabase Auth
 * - LinkedIn OAuth via Supabase Auth (linkedin_oidc provider)
 * - Password reset via Supabase Auth
 * - Email confirmation via Supabase Auth
 *
 * This file is kept for reference in case NextAuth is needed in the future.
 * To use NextAuth, you would need to:
 * 1. Create /api/auth/[...nextauth]/route.ts with NextAuth handler
 * 2. Set NEXTAUTH_SECRET and NEXTAUTH_URL in .env.local
 * 3. Update authentication flows to use NextAuth instead of Supabase
 *
 * Current auth implementation: See src/app/auth/callback/route.ts and src/middleware.ts
 */

import { NextAuthOptions } from 'next-auth'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import GoogleProvider from 'next-auth/providers/google'

// Get environment variables with defaults for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const authOptions: NextAuthOptions = {
  // Use Supabase adapter for session and user management
  adapter: SupabaseAdapter({
    url: supabaseUrl,
    secret: supabaseServiceKey,
  }),

  // Authentication providers
  providers: [
    // NOTE: LinkedIn OAuth is handled by Supabase Auth with linkedin_oidc provider
    // See src/app/(auth)/login/page.tsx and src/app/auth/callback/route.ts

    // Google OAuth (optional - requires setup)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
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
    async signIn() {
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
