# Deployment Checklist - Fix Scheduled Posts

## 🚨 Current Issues:

1. ❌ **500 Error when scheduling posts** - Missing REDIS_URL in Vercel
2. ❌ **Cron job failing with 307 redirect** - Wrong URL (missing www)
3. ❌ **Posts not publishing** - Environment variables not configured

---

## ✅ Required Steps (In Order):

### Step 1: Add Environment Variables to Vercel

**CRITICAL:** You MUST add these to Vercel for the app to work!

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your LinkedAI project**
3. **Settings → Environment Variables**
4. **Add these variables:**

#### Variable 1: REDIS_URL
```
Name: REDIS_URL
Value: rediss://default:ATBkAAIncDFmYmY2NTUyMzIxNjg0OTMyOTg2MTljYzhiZWE5YzljZnAxMTIzODg@optimum-walrus-12388.upstash.io:6379
```
**Environments:**
- ✅ Production
- ✅ Preview
- ✅ Development

#### Variable 2: CRON_SECRET
```
Name: CRON_SECRET
Value: jrdJCtkPPmtN3b4o9bCasKjS8280wS+ShtGjE+W/RJA=
```
**Environments:**
- ✅ Production
- ✅ Preview
- ✅ Development

5. **Click "Save"**
6. **Wait for automatic redeployment** (2-3 minutes)

---

### Step 2: Update cron-job.org

1. **Go to cron-job.org** → Dashboard → Your "LinkedAI Worker" job
2. **Click "Edit"**
3. **Update the URL** (add www):

**OLD URL (WRONG):**
```
https://linkedai.site/api/queue/worker?secret=jrdJCtkPPmtN3b4o9bCasKjS8280wS+ShtGjE+W/RJA=
```

**NEW URL (CORRECT):**
```
https://www.linkedai.site/api/queue/worker?secret=jrdJCtkPPmtN3b4o9bCasKjS8280wS+ShtGjE+W/RJA=
```

4. **Save the cron job**

---

### Step 3: Test the Cron Job

1. **In cron-job.org**, click **"Execute now"**
2. **Check execution history** - should show:
   - ✅ Status: **Success (200)**
   - ❌ NOT: Failed (307) or Failed (401)

If still failing:
- **Wait** - Vercel might still be deploying
- **Check Vercel** - Deployments tab, make sure latest deployment is "Ready"
- **Try again** after deployment completes

---

### Step 4: Test Scheduling

1. **Go to LinkedAI app** (www.linkedai.site)
2. **Create a new post** or use existing draft
3. **Click "Schedule"**
4. **Set time** for 2-3 minutes from now
5. **Click "Schedule"** button
6. **Check for errors:**
   - ❌ If you see **500 error** in console → REDIS_URL not added to Vercel yet
   - ✅ If scheduling succeeds → Good!

---

### Step 5: Verify Publishing

1. **Wait** for scheduled time to pass
2. **cron-job.org runs every minute** and processes queue
3. **Check your LinkedIn profile** - post should appear!
4. **Check LinkedAI** - post status should change from "Scheduled" to "Published"

---

## 🔍 How to Debug:

### If scheduling gives 500 error:
- **Check Vercel logs:** Vercel Dashboard → Your Project → Logs
- **Look for:** "REDIS_URL environment variable is not set"
- **Solution:** Add REDIS_URL to Vercel (see Step 1)

### If cron job fails with 307:
- **Check URL:** Must use `www.linkedai.site` not `linkedai.site`
- **Update cron job** with correct URL (see Step 2)

### If cron job fails with 401:
- **Check CRON_SECRET** is added to Vercel
- **Check URL** includes `?secret=...` parameter
- **Verify** the secret matches exactly (no extra spaces)

### If posts don't publish:
1. **Check queue dashboard:** https://www.linkedai.site/api/queue/dashboard
   - Should show delayed jobs
2. **Check cron execution history** in cron-job.org
   - Should show successful runs every minute
3. **Check Vercel logs** for errors during publishing

---

## 📊 Expected Flow:

```
User schedules post (11:00 AM)
         ↓
Added to Bull Queue (Redis)
         ↓
Waits until 11:00 AM
         ↓
cron-job.org triggers worker (every minute)
         ↓
Worker checks queue (sees job ready)
         ↓
Worker publishes to LinkedIn
         ↓
Database updated: status = "published"
         ↓
✅ Post appears on LinkedIn!
```

---

## ✅ Success Criteria:

After completing all steps, you should see:
- ✅ No 500 errors when scheduling posts
- ✅ cron-job.org shows "Success (200)" in execution history
- ✅ Posts appear in LinkedIn at scheduled time
- ✅ Post status changes to "Published" in LinkedAI

---

## 🆘 Still Not Working?

Check:
1. **Vercel deployment status** - Is it "Ready"?
2. **Environment variables** - Are both added with correct values?
3. **cron-job.org** - Is job enabled and running?
4. **LinkedIn connection** - Is account still connected in Settings?

---

## 📞 Next Steps After This Works:

Once scheduling is working:
1. Test with multiple posts at different times
2. Monitor cron-job.org execution history
3. Check Upstash Redis dashboard for usage
4. Consider upgrading plans if you need more capacity

---

**Current Status:** ⏸️ Waiting for environment variables to be added to Vercel

**Next Action:** → Go to Vercel Dashboard and add REDIS_URL and CRON_SECRET
