# Cloudflare Worker Deployment Guide
## Fix Scheduled Posts Not Publishing

## 🔴 Problem
Your scheduled posts aren't publishing because:
1. ❌ Cloudflare Worker wasn't deployed
2. ❌ Worker was using wrong HTTP method (POST instead of GET)
3. ❌ Worker was calling wrong domain (www.linkedai.site instead of linkedai.site)

## ✅ What I Fixed
- Changed all API calls from `POST` to `GET`
- Fixed URL from `https://www.linkedai.site` to `https://linkedai.site`
- Updated all 6 cron job functions

---

## 📋 Step-by-Step Deployment

### Step 1: Install Wrangler CLI (if not already installed)

Open terminal/command prompt and run:

```bash
npm install -g wrangler
```

Or if you prefer using npx (no installation needed):
```bash
npx wrangler --version
```

---

### Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open a browser window. Click "Allow" to authorize Wrangler.

---

### Step 3: Set Your CRON_SECRET

You need to set the same `CRON_SECRET` that you have in Vercel.

```bash
cd cloudflare-workers
wrangler secret put CRON_SECRET
```

When prompted, paste your CRON_SECRET value.

**To get your CRON_SECRET from Vercel:**
1. Go to: https://vercel.com/anshul-singh-baghels-projects-2a28e766/linkedai
2. Settings → Environment Variables
3. Find `CRON_SECRET`
4. Copy the value

If you don't have a CRON_SECRET yet, generate one:
```bash
# On Mac/Linux:
openssl rand -hex 32

# On Windows (PowerShell):
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

---

### Step 4: Deploy the Worker

```bash
cd cloudflare-workers
wrangler deploy
```

You should see output like:
```
✨ Success! Uploaded worker
```

---

### Step 5: Verify Deployment

#### Test 1: Health Check
Open this URL in your browser:
```
https://linkedin-scheduler-cron.YOUR-SUBDOMAIN.workers.dev/health
```

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-11T...",
  "worker": "cron-worker",
  "jobs": [
    "publish-scheduled (15min)",
    "sync-analytics (6hr)",
    "sync-followers (daily 2am)",
    "post-insights (hourly)",
    "content-ideas (weekly sun 8am)",
    "trending-topics (12hr)"
  ]
}
```

#### Test 2: Manual Trigger (Test Publishing Now)
```bash
curl -X POST https://linkedin-scheduler-cron.YOUR-SUBDOMAIN.workers.dev/trigger/publish
```

This will immediately try to publish any scheduled posts that are due!

---

### Step 6: Check Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com
2. Click "Workers & Pages"
3. You should see: `linkedin-scheduler-cron`
4. Click on it
5. Go to "Logs" tab to see cron execution logs

---

## 🧪 Testing

### Test Your Scheduled Post

After deploying, your post scheduled for Dec 9th should publish within 15 minutes (the next cron run).

To test immediately:
1. Go to Cloudflare Dashboard → Workers
2. Click `linkedin-scheduler-cron`
3. Go to "Triggers" tab
4. Click "Send Test Event"
5. Or use the manual trigger URL above

---

## 📊 Cron Schedule

Your worker runs on this schedule:

| Job | Frequency | Description |
|-----|-----------|-------------|
| **Publish Scheduled** | Every 15 min | Publishes posts that are due |
| Sync Analytics | Every 6 hours | Syncs LinkedIn analytics |
| Follower Sync | Daily at 2 AM | Updates follower counts |
| Post Insights | Every hour | Generates AI insights |
| Content Ideas | Weekly Sun 8 AM | AI content suggestions |
| Trending Topics | Every 12 hours | Updates trending topics |

---

## 🔧 Troubleshooting

### Worker deployed but posts not publishing?

**Check 1: Is CRON_SECRET correct?**
```bash
cd cloudflare-workers
wrangler secret list
```

Should show: `CRON_SECRET: <set>`

**Check 2: Check Cloudflare Logs**
1. Dashboard → Workers → linkedin-scheduler-cron
2. Logs tab
3. Look for errors like:
   - `401 Unauthorized` = Wrong CRON_SECRET
   - `404 Not Found` = API endpoint doesn't exist
   - `500 Internal Server Error` = Bug in your API

**Check 3: Test API endpoint directly**

Get your CRON_SECRET from Vercel, then run:
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://linkedai.site/api/cron/publish-scheduled
```

Should return JSON with published posts.

**Check 4: Check your post in database**

Make sure your post has:
- `status` = `'scheduled'`
- `scheduled_for` < current time

---

## 🚀 Quick Commands

```bash
# Deploy/Update worker
cd cloudflare-workers && wrangler deploy

# View logs (live tail)
cd cloudflare-workers && wrangler tail

# Test publish immediately
curl -X POST https://linkedin-scheduler-cron.YOUR-SUBDOMAIN.workers.dev/trigger/publish

# Check health
curl https://linkedin-scheduler-cron.YOUR-SUBDOMAIN.workers.dev/health

# List secrets
cd cloudflare-workers && wrangler secret list

# Update CRON_SECRET
cd cloudflare-workers && wrangler secret put CRON_SECRET
```

---

## 📝 Environment Variables Needed

### In Vercel (Your Next.js App):
- ✅ `CRON_SECRET` - Secret to authenticate cron requests

### In Cloudflare Workers:
- ✅ `CRON_SECRET` - Must match Vercel's CRON_SECRET

**IMPORTANT**: Both must have the EXACT same value!

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Wrangler login successful
- [ ] CRON_SECRET set in Cloudflare Worker
- [ ] `wrangler deploy` completed successfully
- [ ] Health check endpoint returns 200 OK
- [ ] Manual trigger test works
- [ ] Cloudflare Dashboard shows worker as "Active"
- [ ] Logs show cron jobs executing every 15 minutes
- [ ] Old scheduled post gets published within 15 minutes

---

## 📞 Still Not Working?

If posts still aren't publishing after deployment:

1. **Check your .env.local** - Make sure `CRON_SECRET` is set
2. **Check Vercel Environment Variables** - Make sure `CRON_SECRET` is set in production
3. **Check Cloudflare Logs** - Look for error messages
4. **Test API endpoint manually** - Use curl command above
5. **Check your database** - Verify post has correct `status` and `scheduled_for`

---

## 🎉 After Deployment

Your scheduled posts will now automatically publish:
- ✅ Every 15 minutes
- ✅ Completely automated
- ✅ No manual intervention needed
- ✅ Cloudflare Workers Free Tier = 100,000 requests/day (more than enough!)

**Your post scheduled for Dec 9th will publish in the next 15 minutes!**
