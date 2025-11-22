<div align="center">

# LinkedAI ✨

### Your AI-Powered LinkedIn Content Companion

**Generate viral LinkedIn posts in seconds. Schedule smarter. Grow faster.**

[🚀 Live Demo](http://localhost:3000) • [📖 Documentation](#setup) • [💬 Support](#support)

---

</div>

## 🎯 What is LinkedAI?

LinkedAI transforms your LinkedIn presence with AI-powered content generation and intelligent scheduling. Stop staring at blank screens - let our AI ghostwriter craft compelling posts while you focus on what matters: building your brand.

### ✨ Why LinkedAI?

- **Write 10x Faster** - Generate professional LinkedIn posts in seconds with Google Gemini AI
- **Never Miss a Post** - Smart scheduling with content calendar and automated publishing
- **Stay On Brand** - Custom brand voice settings ensure every post sounds like you
- **Create More, Spend Less** - Free tier with 5 posts/month, powered by free AI models

---

## 🚀 Key Features

### 🤖 AI Content Generation
- **Smart Post Generator** - Create engaging posts from just a topic
- **Multiple Variations** - Generate 3+ variations and pick the best one
- **Template Library** - 12+ proven templates for thought leadership, announcements, tips
- **Tone & Style Control** - Professional, casual, or inspirational - you choose
- **AI Improver** - Refine existing posts with AI suggestions

### 📅 Content Management
- **Visual Calendar** - Drag-and-drop scheduling interface
- **Batch Creation** - Generate a week's worth of content in minutes
- **Live Preview** - See exactly how your post will look on LinkedIn
- **Draft System** - Save, edit, and perfect posts before publishing

### 🎨 Brand Consistency
- **Brand Voice Settings** - Define your unique tone and style
- **Custom Templates** - Create reusable templates for common post types
- **Hashtag Manager** - Save and reuse your best-performing hashtags

### 📊 Analytics & Insights
- **Usage Dashboard** - Track your monthly post limits
- **Activity Logs** - Full history of generated and published posts
- **Account Management** - Manage multiple LinkedIn accounts (Pro plan)

### 🔗 LinkedIn Integration
- **Direct Publishing** - Post to LinkedIn with one click
- **OAuth Authentication** - Secure LinkedIn account connection
- **Multi-Account Support** - Manage up to 10 LinkedIn profiles (Standard plan)

### 💎 Media Uploads
- **Image Uploads** - Up to 10 images per post (carousel posts)
- **Video Support** - Upload videos up to 16MB
- **Document Sharing** - Attach PDFs and documents

---

## 💰 Pricing Plans

| Feature | Free | Pro | Standard |
|---------|------|-----|----------|
| **Price** | $0 | $29/mo | $79/mo |
| **Posts/Month** | 5 | 100 | 500 |
| **LinkedIn Accounts** | 1 | 5 | 10 |
| **AI Generation** | ✅ | ✅ | ✅ |
| **Templates** | ✅ | ✅ | ✅ |
| **Scheduling** | ✅ | ✅ | ✅ |
| **Brand Voice** | ❌ | ✅ | ✅ |
| **Analytics** | Basic | Advanced | Advanced |
| **Priority Support** | ❌ | ✅ | ✅ |

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, Server Actions |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth + LinkedIn OAuth |
| **AI Engine** | Google Gemini 1.5 Flash (FREE) |
| **Payments** | Razorpay (Live Mode) |
| **File Storage** | UploadThing (2GB Free) |
| **Deployment** | Vercel (recommended) |

</div>

**Why These Choices?**
- ✅ **Google Gemini** - Free tier with 1,500 requests/day vs OpenAI's paid-only API
- ✅ **Supabase** - Free database, auth, and real-time subscriptions
- ✅ **Next.js 16** - Latest features with Turbopack for fast development
- ✅ **UploadThing** - 2GB free storage vs AWS S3 setup complexity

---

## 🚦 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free)
- Google Gemini API key (free)

### 1️⃣ Clone & Install

```bash
git clone https://github.com/yourusername/linkedin-scheduler.git
cd linkedin-scheduler
npm install
```

### 2️⃣ Environment Setup

Create `.env.local` file:

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI (FREE)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback

# Payments (Optional)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# File Uploads (Optional)
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3️⃣ Get API Keys (All FREE)

**Supabase Database**
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy URL and anon key from Settings → API

**Google Gemini AI**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Get API Key"
3. Copy your free API key (1,500 requests/day)

**LinkedIn OAuth**
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Create new app
3. Add redirect URL: `http://localhost:3000/api/auth/linkedin/callback`
4. Copy Client ID and Secret

**UploadThing (Optional)**
1. Visit [uploadthing.com](https://uploadthing.com)
2. Create account and app
3. Copy Secret and App ID (2GB free)

### 4️⃣ Database Setup

Run migrations in Supabase SQL Editor:

```sql
-- Check supabase/schema.sql for full schema
-- Tables: users, posts, subscriptions, linkedin_accounts, etc.
```

### 5️⃣ Launch

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
linkedin-scheduler/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Authentication pages
│   │   │   ├── login/           # Login page
│   │   │   └── signup/          # Signup page
│   │   ├── (dashboard)/         # Protected dashboard
│   │   │   ├── dashboard/       # Main dashboard
│   │   │   ├── generate/        # AI post generator
│   │   │   ├── calendar/        # Content calendar
│   │   │   ├── templates/       # Template library
│   │   │   ├── analytics/       # Analytics dashboard
│   │   │   ├── settings/        # User settings
│   │   │   └── pricing/         # Subscription plans
│   │   ├── (marketing)/         # Public pages
│   │   │   ├── page.tsx         # Landing page
│   │   │   ├── demo/            # Product demo
│   │   │   └── blog/            # Blog (future)
│   │   └── api/                 # API routes
│   │       ├── generate/        # AI generation endpoints
│   │       ├── posts/           # Post management
│   │       ├── auth/            # Authentication
│   │       ├── uploadthing/     # File uploads
│   │       └── webhooks/        # Payment webhooks
│   ├── components/
│   │   ├── ui/                  # Reusable UI components
│   │   ├── landing/             # Landing page sections
│   │   ├── dashboard/           # Dashboard widgets
│   │   ├── editor/              # Post editor
│   │   ├── post-preview/        # LinkedIn preview
│   │   └── settings/            # Settings panels
│   ├── lib/
│   │   ├── supabase/            # Database client
│   │   ├── gemini/              # AI client
│   │   ├── uploadthing/         # File upload
│   │   ├── templates/           # Post templates
│   │   ├── usage/               # Usage limits
│   │   └── utils/               # Helper functions
│   └── types/                   # TypeScript definitions
├── public/                      # Static assets
└── supabase/                    # Database migrations
```

---

## 🎨 Features Walkthrough

### 1. AI Post Generator
Navigate to `/generate` to create posts:
- Enter a topic (e.g., "Remote work productivity")
- Choose style (Professional, Casual, Inspirational)
- Select tone (Informative, Motivational, Storytelling)
- Pick length (1-5 paragraphs)
- Generate 3 variations instantly

### 2. Template Library
Browse 12+ pre-made templates at `/templates`:
- Thought Leadership
- Product Announcements
- Educational Posts
- Engagement Questions
- Success Stories
- Quick Tips

### 3. Content Calendar
Schedule posts visually at `/calendar`:
- Drag-and-drop interface
- Multi-month view
- Auto-posting to LinkedIn
- Batch scheduling

### 4. Brand Voice Settings
Define your style at `/settings`:
- Default tone and length
- Custom writing style
- Emoji preferences
- Hashtag collections

---

## 🔧 Development

### Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
```

### Environment

- **Development**: `http://localhost:3000`
- **Production**: Deploy to Vercel with environment variables

### Key Files

- `src/lib/gemini/client.ts` - AI generation logic
- `src/lib/usage/limits.ts` - Usage enforcement
- `src/lib/templates/index.ts` - Template definitions
- `src/app/api/generate/route.ts` - Main generation endpoint

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

### Environment Variables

Add all `.env.local` variables to Vercel:
1. Project Settings → Environment Variables
2. Add each variable from `.env.local`
3. Redeploy

### Post-Deployment

1. Update LinkedIn OAuth redirect URL to production URL
2. Update `NEXT_PUBLIC_APP_URL` to production domain
3. Test authentication and AI generation
4. Configure Razorpay webhook endpoint

---

## 📊 Usage Limits

| Plan | Posts/Month | AI Requests | LinkedIn Accounts | Storage |
|------|-------------|-------------|-------------------|---------|
| **Free** | 5 | Unlimited* | 1 | 100MB |
| **Pro** | 100 | Unlimited* | 5 | 1GB |
| **Standard** | 500 | Unlimited* | 10 | 5GB |

*Subject to Gemini API limits: 15 req/min, 1,500 req/day (free tier)

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file

---

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/linkedin-scheduler/issues)
- **Email**: support@linkedai.com
- **Docs**: [Documentation](https://docs.linkedai.com)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Supabase](https://supabase.com) - Backend as a service
- [Google Gemini](https://ai.google.dev) - Free AI API
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [UploadThing](https://uploadthing.com) - File uploads
- [Razorpay](https://razorpay.com) - Payment processing

---

<div align="center">

**Made with ❤️ by LinkedAI Team**

[⭐ Star us on GitHub](https://github.com/yourusername/linkedin-scheduler) • [🐦 Follow on Twitter](https://twitter.com/linkedai)

</div>
