# External Cron Setup for Scheduled Posts

Since Vercel's Hobby (Free) plan doesn't support minute-level cron jobs, we use an external free cron service to trigger the worker.

## Why External Cron?

**Vercel Hobby Plan Limitations:**
- Only 2 cron jobs per account
- Cron jobs trigger **once a day** at an uncertain time
- Not suitable for minute-level scheduling

**Solution:** Use **cron-job.org** (100% free, runs every minute)

---

## Setup Instructions

### Step 1: Create Account on cron-job.org

1. Go to: [https://cron-job.org/en/](https://cron-job.org/en/)
2. Click **"Sign up for free"**
3. Create your account (no credit card required)
4. Verify your email

### Step 2: Create Cron Job

1. **Log in** to cron-job.org
2. Click **"Create cronjob"**
3. **Configure the job:**

   **Title:**
   ```
   LinkedAI - Scheduled Posts Worker
   ```

   **Address (URL):**
   ```
   https://linkedai.site/api/queue/worker?secret=jrdJCtkPPmtN3b4o9bCasKjS8280wS+ShtGjE+W/RJA=
   ```
   *(Replace with your actual CRON_SECRET from .env.local)*

   **Schedule:**
   - **Every:** `1` minute(s)
   - **Every day**
   - **All months**

   **Request Method:**
   - Select: `GET`

   **Enabled:**
   - ✅ Check "Enabled"

4. **Click "Create cronjob"**

### Step 3: Test the Cron Job

1. In cron-job.org dashboard, click on your job
2. Click **"Execute now"** to test
3. Check the **"Execution history"** - you should see a successful response (200 OK)

### Step 4: Verify in Your App

1. Go to: `https://linkedai.site/api/queue/dashboard`
2. You should see queue statistics
3. Try scheduling a post for 2-3 minutes from now
4. The cron job will process it automatically!

---

## How It Works

```
┌─────────────────────┐
│  cron-job.org       │
│  (Every 1 minute)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  GET /api/queue/worker?secret=xxx   │
│  (Your LinkedAI Worker Endpoint)    │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────┐
│  Bull Queue         │
│  (Upstash Redis)    │
│  - Check delayed    │
│  - Process ready    │
│  - Publish to LI    │
└─────────────────────┘
```

---

## Monitoring

### cron-job.org Dashboard
- View execution history
- See response times
- Check for failures
- Get email alerts

### Your App Dashboard
- Visit: `https://linkedai.site/api/queue/dashboard`
- See delayed/active/failed jobs
- Monitor queue health

---

## Alternative Free Services

If you prefer a different service:

### 1. EasyCron
- Free tier: 20 cron jobs, every 5 minutes minimum
- URL: [https://www.easycron.com/](https://www.easycron.com/)

### 2. Cronless
- Free tier: 10 cron jobs, every minute
- URL: [https://cronless.com/](https://cronless.com/)

### 3. UptimeRobot
- Free tier: Monitor 50 URLs, check every 5 minutes
- URL: [https://uptimerobot.com/](https://uptimerobot.com/)

**Recommended:** Stick with **cron-job.org** - it's the most reliable and truly free.

---

## Security Notes

- The `?secret=xxx` parameter authenticates the request
- Keep your CRON_SECRET private
- The worker endpoint verifies the secret before processing
- Unauthorized requests are rejected with 401 error

---

## Troubleshooting

### Cron job returns 401 Unauthorized
- Check that the secret in the URL matches your `CRON_SECRET` in Vercel
- Make sure you added `CRON_SECRET` to Vercel environment variables

### Posts not being published
1. Check cron-job.org execution history - is it running?
2. Visit `/api/queue/dashboard` - are jobs in the queue?
3. Check Vercel logs for errors
4. Verify `REDIS_URL` is set in Vercel environment variables

### Cron job shows error 500
- Check Vercel deployment logs
- Verify Redis connection is working
- Check LinkedIn access tokens are valid

---

## Cost

**100% FREE** ✅
- cron-job.org: Free forever
- Upstash Redis: 10,000 commands/day free
- Vercel Hobby: Free hosting

You can run thousands of scheduled posts per month at zero cost!
