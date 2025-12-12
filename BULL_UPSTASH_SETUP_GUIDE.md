# Bull + Upstash Redis Setup Guide

Complete step-by-step guide to implement Bull job queue with Upstash Redis for LinkedAI.

---

## 🔴 STEP 1: Get Upstash Redis URL

### 1.1 Sign Up for Upstash (FREE)
1. Go to: **https://upstash.com**
2. Click **"Sign Up"** (top right)
3. Sign up using:
   - GitHub (recommended - 1 click)
   - Google
   - Email

### 1.2 Create Redis Database
1. After login, you'll see the dashboard
2. Click **"Create Database"** button
3. Fill in the form:
   - **Name**: `linkedai-scheduler` (or any name)
   - **Type**: Select **"Regional"** (free tier)
   - **Region**: Choose closest to your Vercel region
     - If unsure, choose: **US East (Virginia)** or **EU West (Ireland)**
   - **Eviction**: Keep default (no eviction)
   - **TLS**: Keep enabled ✅
4. Click **"Create"**

### 1.3 Get Your Redis URL
1. After creation, you'll see the database details page
2. Scroll down to **"REST API"** or **"Connection"** section
3. You'll see multiple connection strings. We need the **"REDIS_URL"**
4. Look for something like:
   ```
   REDIS_URL=rediss://default:AcU5AAIjcDE3ZTkyNDEyODY0Y...@us1-merry-firefly-12345.upstash.io:6379
   ```
5. **Copy this entire URL** (starts with `rediss://`)

### 1.4 Add to Environment Variables

**For Local Development:**
1. Open: `.env.local`
2. Add this line:
   ```env
   REDIS_URL=rediss://default:YOUR_ACTUAL_URL_HERE@us1-xxxx.upstash.io:6379
   ```

**For Vercel Production:**
1. Go to: https://vercel.com/your-username/linkedai
2. Click **"Settings"** → **"Environment Variables"**
3. Add new variable:
   - **Key**: `REDIS_URL`
   - **Value**: `rediss://default:YOUR_ACTUAL_URL_HERE...`
   - **Environment**: Check all (Production, Preview, Development)
4. Click **"Save"**
5. **Redeploy** your app for changes to take effect

---

## 📦 STEP 2: Install Dependencies

I'll install these for you via npm:

```bash
npm install bull @types/bull ioredis @types/ioredis
```

Dependencies explained:
- `bull`: Job queue library
- `@types/bull`: TypeScript types for Bull
- `ioredis`: Redis client (Bull's dependency)
- `@types/ioredis`: TypeScript types for ioredis

---

## 🏗️ STEP 3: Project Structure

I'll create these files:

```
src/
├── lib/
│   └── queue/
│       ├── config.ts              # Queue configuration
│       ├── scheduled-posts.ts     # Post scheduling queue
│       └── worker.ts              # Job processor
├── app/
│   └── api/
│       ├── queue/
│       │   ├── worker/
│       │   │   └── route.ts       # Worker endpoint (keep alive)
│       │   └── dashboard/
│       │       └── route.ts       # Queue monitoring
│       └── posts/
│           └── schedule/
│               └── route.ts       # Update to use Bull
```

---

## 🔧 STEP 4: Implementation Files

### File 1: `src/lib/queue/config.ts`
Queue configuration and connection setup.

### File 2: `src/lib/queue/scheduled-posts.ts`
Main queue for scheduling LinkedIn posts.

### File 3: `src/lib/queue/worker.ts`
Job processor that publishes posts to LinkedIn.

### File 4: `src/app/api/queue/worker/route.ts`
API endpoint to keep worker alive on Vercel.

### File 5: `src/app/api/queue/dashboard/route.ts`
Monitoring endpoint to see queue status.

### File 6: Update existing post creation endpoints
Modify to use Bull queue instead of just saving to database.

---

## 🎯 How It Works

### Old Way (Client-Side Polling):
```
User schedules post → Saves to DB → Browser polls every 60s → Publishes
❌ Only works when browser open
```

### New Way (Bull + Redis):
```
User schedules post → Adds job to Bull queue → Worker processes at exact time → Publishes
✅ Works 24/7, even when browser closed
✅ Each post scheduled at exact time
✅ Automatic retries
```

### Architecture:
```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │ Schedule Post API
         ▼
┌─────────────────┐
│   Next.js API   │
│  (schedules job)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Upstash Redis  │ ◄── Queue with delayed jobs
│   (Bull Queue)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Worker Process │ ◄── Processes jobs at scheduled time
│ (Vercel Cron or │
│  Always-Running)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  LinkedIn API   │
└─────────────────┘
```

---

## 🚀 Deployment Strategy

### For Vercel:
Since Vercel serverless functions timeout after 10 seconds, we'll use a hybrid approach:

1. **Queue Jobs**: When user schedules post, add job to Bull queue with delay
2. **Vercel Cron Worker**: Run every minute to process any due jobs
3. **Alternative**: Use external worker (Railway, Render) to process continuously

### Option A: Vercel Cron Worker (Simpler)
Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/queue/worker",
      "schedule": "* * * * *"
    }
  ]
}
```

### Option B: External Worker (More Reliable)
Deploy a small worker service on Railway/Render that runs 24/7:
- Free tier on Railway: $5 credits/month
- Processes jobs continuously
- More reliable than Vercel cron

---

## 📊 Monitoring

### View Queue Status:
Visit: `https://your-app.vercel.app/api/queue/dashboard`

Shows:
- Active jobs
- Waiting jobs
- Completed jobs
- Failed jobs
- Job details

### Bull Board (Optional - Advanced):
Install Bull Board for beautiful UI:
```bash
npm install @bull-board/api @bull-board/ui
```

---

## 🧪 Testing

### Test Locally:
1. Start Next.js: `npm run dev`
2. Schedule a post (set time to 1 minute from now)
3. Watch console logs
4. Post should publish automatically at scheduled time

### Test Production:
1. Deploy to Vercel
2. Schedule a test post
3. Check Vercel logs: Settings → Logs
4. Verify post publishes on LinkedIn

---

## 🔍 Troubleshooting

### Issue: "ECONNREFUSED" or "Redis connection failed"
**Solution:**
- Check `REDIS_URL` is correct in environment variables
- Ensure URL starts with `rediss://` (with two s's for SSL)
- Verify Upstash database is active

### Issue: Jobs not processing
**Solution:**
- Check Vercel cron is running: Vercel Dashboard → Cron Jobs
- Check worker logs: Vercel Dashboard → Functions → Logs
- Verify `REDIS_URL` environment variable is set in Vercel

### Issue: "Too many connections"
**Solution:**
- Upstash free tier allows 100 concurrent connections
- Close Redis connections properly
- Use connection pooling (already configured)

### Issue: Jobs processed multiple times
**Solution:**
- Ensure only one worker is running
- Check `jobId` is unique per post
- Use `removeOnComplete: true` option

---

## 💰 Cost Breakdown

### Upstash Redis Free Tier:
- ✅ 10,000 commands per day
- ✅ 256 MB storage
- ✅ 100 concurrent connections
- ✅ TLS/SSL included

**Estimation for your app:**
- Schedule post: 2 commands (add to queue, set delay)
- Process post: 3 commands (get job, delete job, update)
- 10,000 ÷ 5 = **~2,000 posts per day**
- **More than enough for your needs!**

### When to Upgrade:
If you exceed free tier:
- **Upstash Pay As You Go**: $0.20 per 100k commands
- Still very cheap!

---

## 🎯 Next Steps

1. ✅ Get Redis URL from Upstash (follow Step 1 above)
2. ⏳ I'll install dependencies (npm install)
3. ⏳ I'll create all implementation files
4. ⏳ I'll update existing endpoints to use Bull
5. ⏳ We'll test locally
6. ⏳ Deploy to Vercel

---

## 📝 Notes

- Bull queue persists in Redis (survives Vercel restarts)
- Jobs are processed exactly once
- Failed jobs can be retried automatically
- You can view/cancel scheduled jobs via dashboard
- Works with unlimited scheduled posts

---

## 🆘 Need Help?

If you encounter any issues during setup:
1. Check this guide first
2. Review error messages in console
3. Check Vercel logs
4. Verify environment variables are set correctly
5. Ask me for help with specific error messages

Let's start with Step 1 - go get your Upstash Redis URL!
