# Scheduled Posts Troubleshooting Guide

## ✅ What I Just Fixed

### 1. Time Picker - 1-Minute Intervals ✅
**File:** `src/components/scheduling/date-time-picker.tsx`
- Changed from 15-minute intervals to 1-minute intervals
- Now you can select ANY time (e.g., 12:37 PM, 3:42 AM, etc.)
- Added manual time input capability

### 2. Worker Processing Race Condition ✅
**File:** `src/lib/queue/worker.ts`
- **OLD BUG:** Jobs were promoted but not immediately processed, causing delays
- **NEW FIX:**
  - Promotes delayed jobs to waiting state
  - Fetches ALL waiting jobs (including freshly promoted)
  - Processes each job immediately
  - Explicitly marks jobs as completed
  - Proper error handling with job failure tracking

### 3. Job Completion Handling ✅
- Added `job.moveToCompleted(result, true)` to properly remove completed jobs
- Added `job.moveToFailed()` for failed jobs to trigger Bull retry mechanism
- Better logging to track job lifecycle

### 4. Removed Old Polling System ✅
- Deleted conflicting `/api/scheduled-posts/publish` endpoint
- System now uses ONLY Bull queue (no more conflicts)

---

## 🔧 Current Setup Requirements

### Step 1: Vercel Environment Variables

Make sure these are set in Vercel:

```
REDIS_URL=rediss://default:ATBkAAIncDFmYmY2NTUyMzIxNjg0OTMyOTg2MTljYzhiZWE5YzljZnAxMTIzODg@optimum-walrus-12388.upstash.io:6379

CRON_SECRET=jrdJCtkPPmtN3b4o9bCasKjS8280wS+ShtGjE+W/RJA=
```

**How to add:**
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add both variables to Production, Preview, Development
3. Save → Wait for redeploy (2-3 minutes)

### Step 2: cron-job.org Configuration

**URL (with URL encoding):**
```
https://www.linkedai.site/api/queue/worker?secret=jrdJCtkPPmtN3b4o9bCasKjS8280wS%2BShtGjE%2BW%2FRJA%3D
```

**Schedule:** Every 1 minute

**Important Notes:**
- ✅ Use `www.linkedai.site` (with www)
- ✅ Use URL-encoded secret (`%2B` for `+`, `%2F` for `/`, `%3D` for `=`)
- ✅ Method: GET
- ✅ Enabled: Yes

---

## 🧪 Testing Instructions

### Test 1: Schedule a Post

1. **Go to:** https://www.linkedai.site/drafts
2. **Click:** Schedule button on any post
3. **Set time:** 2-3 minutes from now
4. **Click:** Schedule Post
5. **Expected:** Success message, post status = "scheduled"

### Test 2: Check Queue Dashboard

1. **Visit:** https://www.linkedai.site/api/queue/dashboard
2. **Expected to see:**
   ```json
   {
     "stats": {
       "delayed": 1,    // Your scheduled post
       "active": 0,
       "waiting": 0,
       "completed": X,
       "failed": 0
     }
   }
   ```

### Test 3: Monitor cron-job.org

1. **Go to:** cron-job.org dashboard
2. **Watch:** Execution history
3. **Expected:** Every minute, status = 200 OK
4. **Response example:**
   ```json
   {
     "success": true,
     "message": "Processed 0 scheduled post(s)",
     "processed": 0,
     "promoted": 0
   }
   ```

### Test 4: Wait for Publish

1. **Wait** until scheduled time passes
2. **Next cron execution** (within 1 minute)
3. **Expected response:**
   ```json
   {
     "success": true,
     "message": "Processed 1 scheduled post(s)",
     "processed": 1,
     "promoted": 1
   }
   ```
4. **Check LinkedIn:** Post should appear!
5. **Check LinkedAI:** Post status = "published"

---

## 🔍 Debugging Steps

### If Scheduling Fails (500 Error):

**Check Vercel Logs:**
1. Vercel Dashboard → Your Project → Logs
2. Look for errors containing "REDIS_URL" or "Bull"
3. **Common Issue:** REDIS_URL not set → Add it to Vercel

**Check Browser Console:**
1. F12 → Console tab
2. Look for red errors when clicking Schedule
3. **Common Issue:** "Failed to load resource: 500" → Redis not connected

### If Cron Returns 401 Unauthorized:

**Issue:** CRON_SECRET mismatch

**Fix:**
1. Verify CRON_SECRET in Vercel matches: `jrdJCtkPPmtN3b4o9bCasKjS8280wS+ShtGjE+W/RJA=`
2. Verify cron URL uses URL-encoded version
3. Check Vercel deployment is "Ready" (not "Building")

### If Cron Returns 500 Error:

**Issue:** Bull/Redis configuration problem

**Check:**
1. Vercel logs for Redis connection errors
2. Redis URL is correct (starts with `rediss://` with 2 s's)
3. Upstash Redis dashboard - is it active?

### If Posts Don't Publish:

**Step 1: Check if job was added to queue**

Visit: `https://www.linkedai.site/api/queue/dashboard`

Expected: `delayed` count should show your scheduled post

**Step 2: Check if cron is running**

cron-job.org → Execution history → Should see runs every minute

**Step 3: Check Vercel logs**

Filter for: "Worker" or "Bull" or "Processing job"

Expected logs:
```
[Worker] Checking for jobs to process...
[Worker] Job XXX is ready (scheduled for 2025-12-13T12:30:00Z)
[Worker] Promoted job XXX to waiting
[Worker] Found 1 waiting job(s) to process
[Worker] Processing waiting job XXX
[Worker] Posting to LinkedIn for post YYY
[Worker] Successfully posted to LinkedIn: urn:li:share:ZZZ
[Worker] Job XXX completed successfully
[Worker] Promoted: 1, Processed: 1 job(s)
```

**Step 4: Check for LinkedIn API errors**

If you see:
- `LinkedIn API Error: 401` → Access token expired, reconnect LinkedIn
- `LinkedIn API Error: 403` → Insufficient permissions
- `LinkedIn API Error: 429` → Rate limited, wait and retry

---

## 🚨 Common Issues & Solutions

### Issue 1: "Posts scheduled but never publish"

**Cause:** Cron job not running or failing

**Solution:**
1. Check cron-job.org execution history
2. Verify cron URL is correct (with www)
3. Enable the cron job if disabled
4. Test with "Execute now" button

### Issue 2: "Cron job returns 307 Redirect"

**Cause:** Using `linkedai.site` without www

**Solution:** Change URL to `https://www.linkedai.site/...`

### Issue 3: "Posts publish multiple times"

**Cause:** Multiple systems running (SHOULD BE FIXED NOW)

**Solution:**
- Old polling endpoint removed ✅
- Only Bull queue system is active now

### Issue 4: "LinkedIn says 'Token expired'"

**Cause:** Access token needs refresh

**Solution:**
1. Go to Settings → LinkedIn Connection
2. Disconnect LinkedIn
3. Reconnect LinkedIn
4. This will get a fresh access token

### Issue 5: "Worker says 'Processed 1' but LinkedIn has no post"

**Cause:** LinkedIn API error during publishing

**Solution:**
1. Check Vercel logs for LinkedIn API errors
2. Look for status codes (401, 403, 500)
3. Check post status in database - should be "failed"
4. Reconnect LinkedIn if auth error

---

## 📊 How to Monitor Health

### Daily Checks:

1. **cron-job.org Dashboard:**
   - All executions should be green (200 OK)
   - No red failures

2. **Queue Dashboard:**
   - `failed` count should be 0 or very low
   - `delayed` count = number of scheduled posts
   - `completed` count increasing over time

3. **Vercel Logs:**
   - No repeated errors
   - Worker logs show successful processing

### Weekly Checks:

1. **Upstash Redis Dashboard:**
   - Commands/day usage (should be under 10k for free tier)
   - Memory usage

2. **Test scheduling:**
   - Schedule a test post for 2 minutes later
   - Verify it publishes on time

---

## 🎯 Success Criteria

Your scheduled posts system is working correctly if:

✅ **Scheduling:**
- Posts can be scheduled with 1-minute precision
- No 500 errors when scheduling
- Post status changes to "scheduled"
- Job appears in queue dashboard

✅ **Processing:**
- cron-job.org shows 200 OK every minute
- Worker logs show jobs being processed
- Posts appear on LinkedIn at scheduled time
- Post status changes to "published"

✅ **Reliability:**
- No failed jobs accumulating
- No errors in Vercel logs
- Posts publish within 1 minute of scheduled time

---

## 🆘 Emergency Troubleshooting

### If Nothing Works:

1. **Check Vercel Deployment:**
   - Is latest commit deployed?
   - Status = "Ready"?

2. **Check Environment Variables:**
   - Both REDIS_URL and CRON_SECRET set?
   - Values match exactly?

3. **Check cron-job.org:**
   - Job enabled?
   - URL correct (with www and URL-encoded)?

4. **Check Upstash Redis:**
   - Database active?
   - No connection limits reached?

5. **Check LinkedIn Connection:**
   - Go to Settings
   - LinkedIn still connected?
   - Try disconnecting and reconnecting

6. **Manual Test:**
   ```bash
   curl "https://www.linkedai.site/api/queue/worker?secret=jrdJCtkPPmtN3b4o9bCasKjS8280wS%2BShtGjE%2BW%2FRJA%3D"
   ```
   Should return: `{"success":true,"message":"Processed X scheduled post(s)",...}`

---

## 📞 Next Steps

1. **Wait for Vercel to Deploy** (check Deployments tab)
2. **Update cron-job.org URL** (if not already done)
3. **Test with a new scheduled post** (2-3 minutes from now)
4. **Monitor cron execution history**
5. **Check LinkedIn for published post**

If posts still don't publish after these fixes, check Vercel logs for specific error messages and share them for further debugging.

---

**Last Updated:** After fixing worker processing race condition and removing old polling system
**Commit:** Latest changes include explicit job completion and better logging
