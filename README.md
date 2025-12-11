# LinkedAI - AI-Powered LinkedIn Content Scheduler

Complete SaaS platform for LinkedIn content creation, scheduling, and analytics powered by AI.

**Status**: ✅ Production Ready
**Version**: 2.1.0
**Last Updated**: December 11, 2025
**Live Site**: [linkedai.site](https://linkedai.site)
**Repository**: [github.com/AnshulBaghel05/LinkedAI](https://github.com/AnshulBaghel05/LinkedAI)

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/AnshulBaghel05/LinkedAI.git
cd LinkedAI

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev

# Open http://localhost:3000
```

📚 **Full Setup Guide**: [docs/01-ENVIRONMENT-SETUP.md](./docs/01-ENVIRONMENT-SETUP.md)

---

## ✨ What's New (v2.1.0)

### Recent Updates (December 2025):
- ✅ **Client-Side Polling** - Instant scheduled post publishing (~60 sec delay)
- ✅ **Removed External Dependencies** - No Cloudflare Workers or external cron needed
- ✅ **Zero Cost Scheduling** - Runs entirely in browser, works on Vercel Free
- ✅ **Fixed Subscription System** - Auto-creates subscriptions for all users
- ✅ **Plan Naming Standardized** - Consistent free/pro/standard/enterprise
- ✅ **Pricing Page Accessible** - Fixed routing issue
- ✅ **3D Components Fixed** - Three.js BufferAttribute issues resolved
- ✅ **Type Safety Improved** - Added TypeScript annotations
- ✅ **Authentication Flows** - All callback URLs verified and working
- ✅ **New Pages Added** - Competitors (coming soon), Top Engagers (coming soon)
- ✅ **Environment Setup** - Complete `.env.local` configuration
- ✅ **DMARC Email Security** - Configured SPF/DKIM/DMARC

---

## 📖 Documentation

| Guide | Description |
|-------|-------------|
| [01 - Environment Setup](./docs/01-ENVIRONMENT-SETUP.md) | Configure environment variables and API keys |
| [02 - Database Setup](./docs/02-DATABASE-SETUP.md) | Setup Supabase database and migrations |
| [03 - LinkedIn OAuth](./docs/03-LINKEDIN-OAUTH-SETUP.md) | Configure LinkedIn Developer App |
| [04 - Features Guide](./docs/04-FEATURES-GUIDE.md) | Complete list of all features by plan |
| [05 - Pricing Configuration](./docs/05-PRICING-CONFIGURATION.md) | How to change plans and pricing |
| [06 - Vercel Deployment](./docs/06-VERCEL-DEPLOYMENT.md) | Deploy to production |
| [07 - Auto-Posting Scheduler](./docs/07-AUTO-POSTING-SCHEDULER.md) | Setup cron jobs for automation |
| [08 - API Reference](./docs/08-API-REFERENCE.md) | API documentation (Enterprise) |
| [09 - Email Notifications](./docs/09-EMAIL-NOTIFICATIONS.md) | Setup Resend for emails |
| [10 - Troubleshooting](./docs/10-TROUBLESHOOTING.md) | Common issues and solutions |
| [11 - External Cron Setup](./docs/11-EXTERNAL-CRON-SETUP.md) | Free cron service for auto-posting ⭐ |

---

## ✨ Features by Plan

### Free Plan ($0/mo)
- ✅ AI Content Generation (Google Gemini 2.5 Flash)
- ✅ 20 posts per month
- ✅ 10 AI generations per month
- ✅ 12+ Template Library
- ✅ Draft Management
- ✅ Content Calendar
- ✅ Post Scheduling
- ✅ 1 LinkedIn account
- ✅ Notifications
- ✅ Support System
- ✅ Email support

### Pro Plan ($29/mo)
- ✅ All Free features
- ✅ **100 posts per month**
- ✅ **200 AI generations per month**
- ✅ **5 LinkedIn accounts**
- ✅ **Analytics Dashboard**
- ✅ **Best Time to Post AI**
- ✅ **Post Performance Insights**
- ✅ **Growth Tracking**
- ✅ **Engagement Analytics**
- ✅ Priority support (24h)

### Standard Plan ($79/mo)
- ✅ All Pro features
- ✅ **500 posts per month**
- ✅ **1000 AI generations per month**
- ✅ **10 LinkedIn accounts**
- ✅ **A/B Testing System**
- ✅ **Advanced Analytics**
- ✅ **Content Calendar Pro**
- ✅ **Team collaboration features**
- ✅ Priority support (12h)

### Enterprise Plan ($199/mo)
- ✅ All Standard features
- ✅ **Unlimited posts**
- ✅ **Unlimited AI generations**
- ✅ **Unlimited LinkedIn accounts**
- ✅ **Team Workspaces**
- ✅ **API Access**
- ✅ **Custom integrations**
- ✅ **White-label options**
- ✅ Dedicated support (6h)

📚 **Complete Feature List**: [docs/04-FEATURES-GUIDE.md](./docs/04-FEATURES-GUIDE.md)

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.0.7** - App Router + Turbopack + React 19
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Utility-first styling
- **Lucide Icons** - Beautiful icons
- **React Three Fiber** - 3D graphics
- **Framer Motion** - Animations

### Backend
- **Next.js API Routes** - Serverless functions
- **Supabase** - PostgreSQL + Authentication + Real-time
- **Row Level Security (RLS)** - Database-level security
- **Supabase Auth** - LinkedIn OAuth via linkedin_oidc provider

### AI & APIs
- **Google Gemini 2.5 Flash** - Free AI content generation
- **LinkedIn OAuth 2.0** - Authentication
- **LinkedIn Share API** - Post publishing
- **LinkedIn Analytics API** - Performance metrics

### Payments & Email
- **Razorpay** - Payment processing (INR/USD)
- **Resend** - Transactional emails (100/day free)

### File Upload
- **UploadThing** - Image/video uploads (2GB free)

### Scheduled Posts
- **Client-Side Polling** - Browser-based automatic publishing (60 sec intervals)
- No external cron services needed
- Works on Vercel Free plan

### Deployment
- **Vercel** - Hosting + CI/CD
- **GitHub** - Version control
- **Cloudflare** - DNS + CDN

---

## 📊 Database Schema

### Core Tables
- `profiles` - User accounts and settings
- `subscriptions` - User plans and limits (free/pro/standard/enterprise)
- `posts` - Published LinkedIn posts with analytics
- `drafts` - Unpublished content
- `templates` - Reusable content templates
- `schedules` - Auto-posting schedules

### LinkedIn Integration
- `linkedin_accounts` - Connected LinkedIn profiles
- Multi-account support per user
- OAuth token management

### Analytics & Insights
- `post_analytics` - Real-time performance metrics
- `user_analytics` - Aggregate user statistics
- `post_insights` - AI-generated insights

### Team Collaboration (Enterprise)
- `workspaces` - Team workspaces
- `workspace_members` - Team member roles
- `workspace_invitations` - Pending invites

### Advanced Features
- `ab_tests` - A/B test experiments
- `ab_test_variants` - Test variations with results
- `api_keys` - API access tokens (SHA-256 hashed)
- `support_tickets` - Help desk system
- `notifications` - Activity feed and alerts
- `leads` - Lead management (Standard+)

📚 **Full Schema**: `supabase/comprehensive-schema.sql`

---

## 🎯 Key Features Deep Dive

### 🤖 AI Content Generation
- Powered by **Google Gemini 2.5 Flash** (Free tier!)
- **12+ content types**: Tips, stories, polls, questions, how-to, case study
- **Tone customization**: Professional, casual, humorous, inspirational
- **Length control**: Short (50-150 words), Medium (150-300), Long (300-500)
- **Credits system**: 10-unlimited per month based on plan

### 📅 Auto-Posting Scheduler
- **Schedule posts** for future dates and times
- **Timezone support** - Posts at user's local time
- **Client-side polling** - Automatic check every 60 seconds
- **Instant publishing** - Posts publish within ~60 sec of scheduled time
- **Automatic publishing** to LinkedIn via API
- **Status tracking**: Scheduled → Publishing → Published
- **Zero cost** - No external services needed, works on Vercel Free

### 📊 Analytics Dashboard (Pro+)
- **Real-time metrics**: Views, likes, comments, shares
- **Trend charts**: 7/14/30/90 day views
- **Post performance table** with sorting
- **Best performing posts** identification
- **LinkedIn API integration** for live data
- **Growth tracking** over time

### 🎯 Best Time to Post AI (Pro+)
- **Analyzes historical performance** data
- **Recommends optimal posting times** based on engagement
- **Day-of-week insights** (Monday vs Friday performance)
- **Hour-of-day patterns** (morning vs evening)
- **Audience activity** analysis

### 🧪 A/B Testing System (Standard+)
- **Test 2-5 variants** of same post
- **Automatic performance tracking**
- **Statistical significance** calculation
- **Winner determination** based on engagement
- **Clone successful variants** feature

### 👥 Team Workspaces (Enterprise)
- **Unlimited workspaces** per account
- **Role-based permissions**: Owner, Admin, Editor, Viewer
- **Shared content calendar**
- **Member management** with invitations
- **Collaborative drafts**

### 🔌 API Access (Enterprise)
- **RESTful API** with authentication
- **Create/read/update/delete** posts programmatically
- **Access analytics** via API
- **Webhook support** for events
- **Rate limiting**: 1000 requests/hour
- **API key management** (SHA-256 hashed)

---

## 🔧 Environment Variables

### Required Variables

```bash
# Supabase (Database + Authentication)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google AI (Free tier available)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# LinkedIn OAuth (Required for login)
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=https://linkedai.site/auth/callback

# App Configuration
NEXT_PUBLIC_APP_URL=https://linkedai.site
NEXT_PUBLIC_APP_NAME=LinkedAI
NODE_ENV=production

# Security
JWT_SECRET=your_jwt_secret_here
```

### Optional Variables

```bash
# Razorpay (Payment Processing)
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=your_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Resend (Email Service)
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@linkedai.site

# UploadThing (File Uploads)
UPLOADTHING_SECRET=sk_live_xxx
UPLOADTHING_APP_ID=your_app_id

# Cron Jobs (Scheduled Publishing)
CRON_SECRET=your_random_secret_string

# Google Calendar API (Optional)
NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY=your_calendar_key

# Cloudflare (For Workers)
CLOUDFLARE_ACCOUNT_ID=your_account_id
```

📚 **Complete Setup**: [docs/01-ENVIRONMENT-SETUP.md](./docs/01-ENVIRONMENT-SETUP.md)

---

## 🚀 Deployment Guide

### Quick Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your repository
   - Click "Import"

3. **Add Environment Variables**
   - Copy all variables from `.env.local`
   - Paste in Vercel → Settings → Environment Variables

4. **Deploy!**
   - Click "Deploy"
   - Takes 2-3 minutes
   - Auto-deploys on every push

📚 **Full Deployment Guide**: [docs/06-VERCEL-DEPLOYMENT.md](./docs/06-VERCEL-DEPLOYMENT.md)

### Post-Deployment Checklist

- [ ] Update LinkedIn OAuth redirect URL in [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
- [ ] Run database migrations in Supabase Dashboard
- [ ] Test authentication flow (login/signup)
- [ ] Test post scheduling and publishing (client-side polling works automatically!)
- [ ] Verify payment integration (if enabled)
- [ ] Setup email service (Resend)
- [ ] Configure DNS for custom domain

---

## 🎨 Plan-Based Access Control

The app automatically shows/hides features based on subscription plan:

**Navigation Menu**:
- **Free Plan**: 9 basic features
- **Pro Plan**: + Analytics, Best Time to Post
- **Standard Plan**: + A/B Testing, Leads, Advanced Analytics
- **Enterprise Plan**: All 14+ features including Workspaces and API

**Route Protection**:
- Premium routes redirect to pricing page for non-subscribers
- Uses `<PlanProtectedRoute>` component for access control
- Real-time plan verification via Supabase

📚 **Configuration**: [docs/05-PRICING-CONFIGURATION.md](./docs/05-PRICING-CONFIGURATION.md)

---

## 🔐 Security Features

- ✅ **Row Level Security (RLS)** on all Supabase tables
- ✅ **OAuth 2.0** for LinkedIn authentication via Supabase Auth
- ✅ **Supabase Auth** with linkedin_oidc provider
- ✅ **Encrypted LinkedIn tokens** in database
- ✅ **API key hashing** (SHA-256)
- ✅ **CRON_SECRET validation** for scheduled jobs
- ✅ **Rate limiting** on API endpoints
- ✅ **CORS configuration** for API security
- ✅ **DMARC/SPF/DKIM** for email security
- ✅ **Environment variable** protection
- ✅ **SQL injection** prevention via Supabase client
- ✅ **XSS protection** via React

---

## 📈 Performance Optimizations

- ✅ **Next.js 16** with Turbopack for fast builds
- ✅ **Edge Runtime** for API routes
- ✅ **Database indexes** on frequently queried columns
- ✅ **Image optimization** via Next.js Image component
- ✅ **Code splitting** for smaller bundle sizes
- ✅ **Caching headers** for static assets
- ✅ **Pagination** for large datasets
- ✅ **Lazy loading** for components
- ✅ **React Server Components** for better performance

---

## 🔍 Monitoring & Analytics

### Built-in Monitoring
- **Vercel Analytics** - Traffic, performance, and Web Vitals
- **Supabase Dashboard** - Database health and queries
- **Resend Dashboard** - Email delivery rates
- **LinkedIn Developer Console** - API usage and limits
- **Cloudflare Dashboard** - Worker execution logs

### Recommended Tools
- **Sentry** - Error tracking and monitoring
- **LogRocket** - Session replay and debugging
- **UptimeRobot** - Uptime monitoring (free)
- **Google Analytics** - User behavior tracking

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Test cron job locally
npm run test:cron

# Test LinkedIn API integration
npm run test:linkedin

# Test payment flow
npm run test:payments

# Build for production (test for errors)
npm run build
```

---

## 🤝 Support & Community

### Support Tiers
- **Free Plan**: Email support (48h response)
- **Pro Plan**: Priority support (24h response)
- **Standard Plan**: Priority support (12h response)
- **Enterprise Plan**: Dedicated support (6h response) + Slack channel

### Get Help
1. Check [Documentation](./docs/)
2. Review [Troubleshooting Guide](./docs/10-TROUBLESHOOTING.md)
3. Create support ticket in app (Support → New Ticket)
4. Email: support@linkedai.site

---

## 🛣️ Roadmap

### Q1 2026
- [ ] Competitors tracking page (UI ready)
- [ ] Top Engagers page (UI ready)
- [ ] Instagram integration
- [ ] Twitter/X integration
- [ ] Content recycling feature

### Q2 2026
- [ ] AI image generation
- [ ] Video post support
- [ ] Mobile app (React Native)
- [ ] Chrome extension

### Q3 2026
- [ ] Slack integration
- [ ] Discord bot
- [ ] Zapier integration
- [ ] Advanced lead scoring

### Q4 2026
- [ ] White-label reseller program
- [ ] Multi-language support
- [ ] Advanced team analytics
- [ ] Custom AI model training

---

## 📝 Recent Changes (v2.1.0)

### Bug Fixes
- ✅ Fixed subscription not found error for existing users
- ✅ Fixed scheduled posts with client-side polling (instant publishing)
- ✅ Fixed pricing page route (was page-new.tsx)
- ✅ Fixed forgot-password redirect pattern
- ✅ Fixed Three.js BufferAttribute props in 3D components
- ✅ Fixed TypeScript implicit any types in analytics

### Improvements
- ✅ Standardized plan names across entire app
- ✅ Added auto-subscription creation for new users
- ✅ Improved type safety with proper annotations
- ✅ Added comprehensive documentation
- ✅ Updated README with current features

### Security
- ✅ Configured DMARC/SPF/DKIM for email security
- ✅ Removed sensitive credentials from documentation
- ✅ Verified all authentication callback URLs

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

---

## 🙏 Built With

- [Next.js](https://nextjs.org/) by Vercel
- [Supabase](https://supabase.com/) - Database + Auth
- [Google Gemini AI](https://ai.google.dev/) - AI Generation
- [LinkedIn API](https://docs.microsoft.com/linkedin/) - Social Integration
- [Razorpay](https://razorpay.com/) - Payments
- [Resend](https://resend.com/) - Email Service
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

## 🎉 Get Started

1. **Clone & Install**
   ```bash
   git clone https://github.com/AnshulBaghel05/LinkedAI.git
   cd LinkedAI
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env.local`
   - Add your API keys ([Setup Guide](./docs/01-ENVIRONMENT-SETUP.md))

3. **Setup Database**
   - Create Supabase project
   - Run migrations ([Database Setup](./docs/02-DATABASE-SETUP.md))

4. **Configure LinkedIn OAuth**
   - Create LinkedIn app
   - Add redirect URLs ([LinkedIn Setup](./docs/03-LINKEDIN-OAUTH-SETUP.md))

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. **Deploy to Production**
   - Push to GitHub
   - Connect to Vercel
   - Scheduled posts work automatically with client-side polling! ([Deployment Guide](./docs/06-VERCEL-DEPLOYMENT.md))

---

**Built with ❤️ using Next.js, TypeScript, AI, and dedication**

**Questions?** Check the [documentation](./docs/) or create a support ticket

**Ready to launch?** Follow the [deployment guide](./docs/06-VERCEL-DEPLOYMENT.md)

**Live Demo**: [linkedai.site](https://linkedai.site)
