# Free Open-Source Scheduling Alternatives for LinkedAI

**Date**: December 12, 2025
**Problem**: Client-side polling only works when browser is open. Need server-side scheduling solution.

---

## Why Client-Side Polling Isn't Working

**Current Issue:**
- Client-side polling (`useScheduledPostsPolling`) **only runs when the user has their browser tab open**
- When user closes browser → polling stops → posts don't publish
- This defeats the purpose of scheduling posts

**What You Need:**
- **Server-side** job scheduler that runs 24/7
- Works independently of user's browser
- Triggers scheduled posts automatically at the right time

---

## ✅ Recommended Solutions (Free & Open-Source)

### 1. **node-cron** (Best for Vercel/Next.js)
**GitHub**: https://github.com/node-cron/node-cron
**NPM**: `npm install node-cron`
**Stars**: 9.2k+ ⭐

**Pros:**
- ✅ Simple, lightweight (no dependencies)
- ✅ Cron syntax (e.g., `* * * * *`)
- ✅ Works great with Next.js API routes
- ✅ Can run in background on server

**Cons:**
- ❌ Requires persistent server (Vercel serverless functions timeout after 10s on Free)
- ❌ Not ideal for Vercel Free plan

**Best For:** VPS hosting (Railway, Render, Fly.io)

**Example:**
```javascript
const cron = require('node-cron');

// Run every minute to check for scheduled posts
cron.schedule('* * * * *', async () => {
  console.log('Checking for scheduled posts...');
  await checkAndPublishScheduledPosts();
});
```

---

### 2. **Bree** (Robust Job Scheduler) ⭐ RECOMMENDED
**GitHub**: https://github.com/breejs/bree
**NPM**: `npm install bree`
**Stars**: 3k+ ⭐

**Pros:**
- ✅ Built specifically for Node.js job scheduling
- ✅ Supports cron syntax, dates, intervals
- ✅ Worker threads for better performance
- ✅ TypeScript support
- ✅ Job retries and error handling
- ✅ Can run jobs in separate processes

**Cons:**
- ❌ Requires persistent server (not for Vercel Free)
- ❌ More complex setup than node-cron

**Best For:** VPS hosting with long-running processes

**Example:**
```javascript
const Bree = require('bree');

const bree = new Bree({
  jobs: [
    {
      name: 'publish-scheduled-posts',
      interval: 'every 1 minute', // or cron: '* * * * *'
      path: './jobs/publish-scheduled-posts.js'
    }
  ]
});

await bree.start();
```

---

### 3. **Bull / BullMQ** (Redis-Based Queue) ⭐ HIGHLY RECOMMENDED
**GitHub**: https://github.com/OptimalBits/bull (Bull) or https://github.com/taskforcesh/bullmq (BullMQ)
**NPM**: `npm install bull` or `npm install bullmq`
**Stars**: Bull: 15k+, BullMQ: 5k+ ⭐

**Pros:**
- ✅ Production-ready, battle-tested
- ✅ Delayed jobs (perfect for scheduled posts!)
- ✅ Job retries, prioritization
- ✅ Multiple workers
- ✅ Excellent dashboard (Bull Board)
- ✅ Works with serverless (if you keep Redis connection alive)

**Cons:**
- ❌ Requires Redis (free tier available on Upstash, Redis Cloud)
- ❌ Additional infrastructure

**Best For:** Production apps with moderate-high traffic

**Example:**
```javascript
const Queue = require('bull');
const postQueue = new Queue('scheduled-posts', process.env.REDIS_URL);

// Add job with delay
await postQueue.add(
  { postId: '123', content: 'Hello LinkedIn!' },
  { delay: calculateDelayInMs(scheduledTime) }
);

// Process jobs
postQueue.process(async (job) => {
  await publishToLinkedIn(job.data);
});
```

**Free Redis Providers:**
- Upstash (10k commands/day free): https://upstash.com
- Redis Cloud (30MB free): https://redis.com/try-free/

---

### 4. **Agenda** (MongoDB-Based)
**GitHub**: https://github.com/agenda/agenda
**NPM**: `npm install agenda`
**Stars**: 9k+ ⭐

**Pros:**
- ✅ MongoDB-backed (persistent)
- ✅ Cron-style scheduling
- ✅ Job priorities, concurrency control
- ✅ Built-in web UI (agenda-ui)

**Cons:**
- ❌ Requires MongoDB (but MongoDB Atlas has free tier)
- ❌ Heavier than Bree or node-cron

**Best For:** Apps already using MongoDB

**Example:**
```javascript
const Agenda = require('agenda');
const agenda = new Agenda({ db: { address: process.env.MONGODB_URI }});

agenda.define('publish scheduled post', async (job) => {
  const { postId } = job.attrs.data;
  await publishToLinkedIn(postId);
});

// Schedule job
await agenda.schedule('2025-12-12T10:00:00Z', 'publish scheduled post', { postId: '123' });
await agenda.start();
```

---

### 5. **Quirrel** (Serverless-First) ⭐ BEST FOR VERCEL
**GitHub**: https://github.com/quirrel-dev/quirrel
**Website**: https://quirrel.dev
**Stars**: 1.5k+ ⭐

**Pros:**
- ✅ Built specifically for Next.js + Vercel
- ✅ Works with serverless functions
- ✅ Simple API (`await Queue.enqueue()`)
- ✅ No Redis/MongoDB needed
- ✅ Free tier available

**Cons:**
- ❌ Hosted service (not fully self-hosted)
- ❌ Free tier limits (100 jobs/day)

**Best For:** Vercel/Next.js apps needing serverless scheduling

**Example:**
```javascript
import { Queue } from "quirrel/next";

export const PublishQueue = Queue(
  "api/queues/publish",
  async (job) => {
    await publishToLinkedIn(job);
  }
);

// Enqueue with delay
await PublishQueue.enqueue(
  { postId: '123' },
  { runAt: new Date('2025-12-12T10:00:00Z') }
);
```

---

### 6. **Vercel Cron Jobs** (Native Vercel Solution)
**Docs**: https://vercel.com/docs/cron-jobs
**Free Tier**: 2 cron jobs

**Pros:**
- ✅ Native Vercel integration
- ✅ No extra infrastructure
- ✅ Simple setup (vercel.json)

**Cons:**
- ❌ Free plan: Only 2 cron jobs
- ❌ Fixed schedule (can't schedule specific times per post)
- ❌ Max frequency: every minute

**Best For:** Simple periodic checks (already implemented)

**Your Current Setup:**
```json
{
  "crons": [{
    "path": "/api/cron/subscription-management",
    "schedule": "0 */6 * * *"
  }]
}
```

---

### 7. **GitHub Actions** (Free CI/CD Scheduling)
**Docs**: https://docs.github.com/en/actions
**Free Tier**: 2000 minutes/month

**Pros:**
- ✅ Completely free
- ✅ Cron scheduling
- ✅ No infrastructure needed

**Cons:**
- ❌ Minimum interval: 5 minutes
- ❌ Not real-time (GitHub may delay executions)
- ❌ Requires exposing API endpoint

**Best For:** Low-frequency tasks

**Example (.github/workflows/publish-posts.yml):**
```yaml
name: Publish Scheduled Posts
on:
  schedule:
    - cron: '*/5 * * * *' # Every 5 minutes
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger publish endpoint
        run: |
          curl -X POST https://your-app.vercel.app/api/scheduled-posts/publish-all \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

---

### 8. **EasyCron** (Free Cron Service)
**Website**: https://www.easycron.com
**Free Tier**: 1 cron job

**Pros:**
- ✅ Simple web-based cron
- ✅ Triggers HTTP endpoints
- ✅ No code changes needed

**Cons:**
- ❌ Only 1 free cron job
- ❌ External dependency

---

### 9. **cron-job.org** (Free Cron Service)
**Website**: https://cron-job.org
**Free Tier**: Unlimited cron jobs

**Pros:**
- ✅ Unlimited free cron jobs
- ✅ HTTP endpoint triggering
- ✅ Notifications on failures

**Cons:**
- ❌ External service
- ❌ Must manually configure each schedule

---

### 10. **Railway Cron Jobs** (If you switch to Railway)
**Website**: https://railway.app
**Free Tier**: $5 free credits/month

**Pros:**
- ✅ Native cron support
- ✅ Persistent server (not serverless)
- ✅ PostgreSQL included
- ✅ Better than Vercel Free for background jobs

**Cons:**
- ❌ Requires migration from Vercel
- ❌ Limited free credits

---

## 🎯 My Recommendations for Your Project

### Option 1: **Bull + Upstash Redis** (BEST - Production Ready)
**Why:**
- Delayed jobs perfect for scheduled posts
- Each post gets its own job scheduled at exact time
- Retries if LinkedIn API fails
- Dashboard to monitor jobs
- Free Redis tier from Upstash (10k commands/day)

**Implementation:**
1. Sign up for Upstash Redis (free): https://upstash.com
2. Install: `npm install bull`
3. Create `/lib/queue/scheduler.ts`:
```typescript
import Queue from 'bull';

export const postQueue = new Queue('scheduled-posts', process.env.REDIS_URL);

// When user schedules post
export async function schedulePost(postId: string, scheduledTime: Date, postData: any) {
  const delay = scheduledTime.getTime() - Date.now();

  await postQueue.add(
    { postId, ...postData },
    {
      delay: Math.max(delay, 0),
      jobId: postId, // Unique job ID
      removeOnComplete: true,
    }
  );
}

// Worker to process jobs
postQueue.process(async (job) => {
  const { postId, content } = job.data;
  await publishToLinkedIn(postId, content);
});
```

**Cost:** $0 (Upstash free tier)

---

### Option 2: **Quirrel** (EASIEST for Vercel)
**Why:**
- Built for Next.js + Vercel
- No infrastructure setup
- Simple API

**Implementation:**
1. Sign up: https://quirrel.dev
2. Install: `npm install quirrel`
3. Create job queue and enqueue posts with exact time

**Cost:** $0 for first 100 jobs/day

---

### Option 3: **Migrate to Railway** (BEST Long-Term)
**Why:**
- Persistent server (not serverless)
- Can run Bree, node-cron, Bull, anything
- Better for background jobs than Vercel Free
- PostgreSQL included
- Cron support

**Cost:** $5 free credits/month

---

### Option 4: **Database-Based Polling with Vercel Cron**
**Why:**
- No new infrastructure
- Use existing Vercel cron (runs every minute)
- Check database for posts due now

**Implementation:**
Already mostly implemented! Just need to:
1. Create `/api/cron/publish-scheduled-posts/route.ts` (similar to your current endpoint)
2. Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/publish-scheduled-posts",
      "schedule": "* * * * *"
    }
  ]
}
```

**Limitation:** Uses 1 of your 2 free cron slots

---

## 📊 Comparison Table

| Solution | Free Tier | Setup Complexity | Best For | Vercel Compatible |
|----------|-----------|------------------|----------|-------------------|
| **Bull + Upstash** | 10k commands/day | Medium | Production | ✅ Yes |
| **Quirrel** | 100 jobs/day | Low | Next.js/Vercel | ✅ Yes |
| **Vercel Cron** | 2 cron jobs | Low | Simple periodic | ✅ Native |
| **Railway Cron** | $5 credits/month | Low | Background jobs | ❌ Migration needed |
| **Bree** | Unlimited | Medium | VPS hosting | ⚠️ Needs persistent server |
| **node-cron** | Unlimited | Low | VPS hosting | ⚠️ Needs persistent server |
| **GitHub Actions** | 2000 min/month | Medium | Low-frequency | ✅ Yes (via webhook) |
| **cron-job.org** | Unlimited | Low | External trigger | ✅ Yes (via webhook) |

---

## 🚀 My #1 Recommendation: Bull + Upstash

### Setup Steps:

1. **Sign up for Upstash Redis** (free):
   - Go to https://upstash.com
   - Create database
   - Copy `REDIS_URL` (looks like: `rediss://default:...@...upstash.io:6379`)

2. **Install dependencies**:
```bash
npm install bull @types/bull
```

3. **Add to .env.local**:
```env
REDIS_URL=your_upstash_redis_url
```

4. **Create queue system** (`src/lib/queue/post-scheduler.ts`)
5. **Create worker API route** (`src/app/api/queue/worker/route.ts`)
6. **Update post scheduling** to use queue instead of storing in DB

### Why This is Best:
- ✅ Each post scheduled at EXACT time (not polling)
- ✅ Works 24/7 even if browser closed
- ✅ Automatic retries if LinkedIn API fails
- ✅ Dashboard to monitor jobs
- ✅ Scales to thousands of scheduled posts
- ✅ Free tier sufficient for your needs
- ✅ Production-ready (used by companies like Uber, Microsoft)

---

## Next Steps

1. Choose solution based on your needs
2. If choosing Bull: I can help implement the full queue system
3. If choosing Vercel Cron: Update existing implementation to be server-side
4. If choosing Railway: I can help migrate from Vercel

Let me know which option you prefer and I'll help implement it!
