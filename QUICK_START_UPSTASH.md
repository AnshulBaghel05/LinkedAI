# Quick Start: Get Your Upstash Redis URL

**Time Required**: 5 minutes
**Cost**: $0 (Free Forever)

---

## Step 1: Sign Up (1 minute)

1. Go to: **https://upstash.com**
2. Click **"Start Free"** or **"Sign Up"** button
3. Choose sign-up method:
   - **GitHub** (Recommended - fastest, 1 click)
   - Google
   - Email

---

## Step 2: Create Database (2 minutes)

After signing in, you'll see the Upstash console:

1. Click the big green **"Create Database"** button

2. Fill in the form:

   **Name**: Enter `linkedai-scheduler` (or any name you like)

   **Type**: Select **"Regional"** ⬅️ IMPORTANT (This is the free tier)

   **Region**: Choose the region closest to your Vercel deployment:
   - If you're in USA or deploying to Vercel US: **US East (Virginia)**
   - If you're in Europe: **EU West (Ireland)**
   - If you're in Asia: **AP Southeast (Singapore)**

   **TLS (SSL)**: Keep this **enabled** ✅ (default)

   **Eviction**: Keep default **"No eviction"**

3. Click **"Create"** button at the bottom

---

## Step 3: Get Your Redis URL (1 minute)

After creating the database, you'll be redirected to the database details page.

### Find the Connection String:

1. Look for the **"Connect"** or **"REST API"** section
2. You'll see several connection options
3. Find the one labeled **"REDIS_URL"** or **"Connection String"**
4. It will look like this:

```
rediss://default:AcU5AAIjcDE3ZTkyNDEyODY0YzFjNGJkMThhOWUwNjcxNWE0YmI1@us1-merry-firefly-12345.upstash.io:6379
```

**IMPORTANT**: Make sure it starts with `rediss://` (with TWO s's for SSL)

5. Click the **copy icon** next to it to copy the entire URL

---

## Step 4: Add to Your Project (1 minute)

### For Local Development:

1. Open your project folder: `c:\Users\patel\LinkedAI`
2. Find the file: `.env.local`
3. Add this line at the end (paste your actual URL):

```env
REDIS_URL=rediss://default:YOUR_ACTUAL_PASSWORD_HERE@us1-xxxxx.upstash.io:6379
```

4. Save the file

### For Vercel Production:

1. Go to: **https://vercel.com/dashboard**
2. Select your **LinkedAI** project
3. Click **"Settings"** tab
4. Click **"Environment Variables"** in the left sidebar
5. Click **"Add New"** button
6. Fill in:
   - **Key**: `REDIS_URL`
   - **Value**: (paste your Redis URL here)
   - **Environment**: Check all boxes:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
7. Click **"Save"**
8. **IMPORTANT**: Go to **"Deployments"** tab and click **"Redeploy"** on the latest deployment
   - This is required for the environment variable to take effect!

---

## Step 5: Verify It Works (Optional)

### Test Locally:

```bash
# Start your dev server
npm run dev

# You should NOT see any Redis connection errors in the console
# If everything is working, you'll see:
# [Redis] Connected to Upstash Redis
```

### Test the Queue Dashboard:

1. Go to: **http://localhost:3000/api/queue/dashboard**
2. You should see JSON output like:

```json
{
  "stats": {
    "waiting": 0,
    "active": 0,
    "completed": 0,
    "failed": 0,
    "delayed": 0,
    "total": 0
  },
  "timestamp": "2025-12-12T10:30:00.000Z"
}
```

If you see this, **it's working!** ✅

---

## ❓ Troubleshooting

### Error: "REDIS_URL is not set"
- **Fix**: Make sure you added `REDIS_URL` to `.env.local`
- Restart your dev server (`npm run dev`)

### Error: "ECONNREFUSED" or "Connection failed"
- **Fix**: Check that your Redis URL is correct
- Make sure it starts with `rediss://` (with 2 s's)
- Copy the URL again from Upstash to avoid typos

### Error: "Connection timeout"
- **Fix**: Check your region selection
- Try choosing a different region in Upstash

### Error: "Authentication failed"
- **Fix**: The password in the URL might be wrong
- Go back to Upstash and copy the URL again

---

## 🎯 What Happens Next?

After adding the Redis URL:

1. ✅ Your local development will use the queue system
2. ✅ You can test scheduling posts
3. ✅ Posts will be added to the Bull queue
4. ✅ The worker will process them at the scheduled time

### On Production (After Vercel Redeploy):

1. ✅ Vercel cron will trigger the worker every minute
2. ✅ The worker will check Redis for scheduled posts
3. ✅ Posts will publish automatically at their scheduled time
4. ✅ No need to keep browser open!

---

## 📊 Monitor Your Usage (Optional)

To check your Redis usage:

1. Go to Upstash Dashboard
2. Select your `linkedai-scheduler` database
3. You'll see:
   - **Daily Commands**: How many Redis commands executed today
   - **Storage Used**: How much data is stored
   - **Connection Count**: Current active connections

**Free Tier Limits:**
- 10,000 commands per day
- 256 MB storage
- 100 concurrent connections

**Your Expected Usage:**
- ~5 commands per post scheduled
- ~2,000 posts per day capacity
- **You won't exceed the free tier!**

---

## ✅ Checklist

- [ ] Signed up for Upstash (https://upstash.com)
- [ ] Created Redis database (Regional type)
- [ ] Copied Redis URL (starts with `rediss://`)
- [ ] Added to `.env.local` file
- [ ] Added to Vercel environment variables
- [ ] Redeployed on Vercel
- [ ] Tested locally (`npm run dev`)
- [ ] Verified queue dashboard works

---

## 🚀 Ready to Test!

Once all checkboxes above are ✅, you can:

1. Go to your app dashboard
2. Schedule a test post (set time to 2 minutes from now)
3. Close your browser completely
4. Wait 2 minutes
5. Open LinkedIn - your post should be there! 🎉

---

## 📞 Need Help?

If you're stuck on any step:
- Double-check you copied the entire Redis URL (it's very long!)
- Make sure `.env.local` file is in the root of your project
- Restart your dev server after adding the Redis URL
- Check the [BULL_UPSTASH_SETUP_GUIDE.md](BULL_UPSTASH_SETUP_GUIDE.md) for more details

---

**Congratulations!** Once you complete these steps, your scheduled posts will work 24/7! 🎊
