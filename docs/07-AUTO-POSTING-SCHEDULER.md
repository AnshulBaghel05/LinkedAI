# Auto-Posting Scheduler Guide

## ✅ Current Implementation: Client-Side Polling

**Date Updated**: December 11, 2025
**Status**: ACTIVE

The scheduler automatically publishes posts at their scheduled time using **client-side browser polling**!

---

## 🎯 How It Works

```
User opens dashboard → Polling starts automatically
    ↓
Every 60 seconds: Check for scheduled posts
    ↓
If post scheduled_for <= NOW → Publish to LinkedIn
    ↓
Show success notification
    ↓
Update post status to 'published'
    ↓
Continue polling in background
```

---

## ✨ Key Features

### ✅ Instant Publishing
- Posts publish within **60 seconds** of scheduled time
- No external cron services needed
- No delays or waiting

### ✅ Zero Cost
- Runs entirely in browser
- No server resources used
- Works on Vercel Free plan
- No external services required

### ✅ Automatic & Simple
- No configuration needed
- Starts when user opens dashboard
- Works on any dashboard page
- Just schedule posts and forget!

---

## 📋 Setup (Already Done!)

### 1. API Endpoint
**Location**: `src/app/api/scheduled-posts/publish/route.ts`

This endpoint:
- ✅ Uses user's session (authenticated)
- ✅ Fetches user's scheduled posts where `scheduled_for <= NOW`
- ✅ Publishes to LinkedIn via LinkedIn API
- ✅ Updates post status to 'published'
- ✅ Logs activity with source: 'client_polling'

### 2. Polling Hook
**Location**: `src/hooks/useScheduledPostsPolling.ts`

This hook:
- ✅ Runs background check every 60 seconds
- ✅ Prevents concurrent requests
- ✅ Tracks last check time
- ✅ Shows success notifications
- ✅ Auto-refreshes page on publish

### 3. Dashboard Integration
**Location**: `src/app/(dashboard)/layout.tsx`

The polling:
- ✅ Automatically enabled on all dashboard pages
- ✅ Starts when user opens dashboard
- ✅ Runs in background while user works
- ✅ No user action required

---

## 🚀 Usage

### Schedule a Post

1. Go to: [Scheduled Posts](https://linkedai.site/scheduled)
2. Click "Schedule New Post"
3. Write your content
4. Select date and time
5. Click "Schedule Post"

### Automatic Publishing

**While Dashboard is Open**:
- ✅ Polling runs every 60 seconds
- ✅ Posts publish automatically at scheduled time
- ✅ You'll see notification: "🎉 Published X post(s) to LinkedIn!"
- ✅ Post status updates to "Published"

**When Dashboard is Closed**:
- ⏸️ Polling stops (no active browser tab)
- ⏸️ Posts wait until you open dashboard again
- ⏸️ When you return, all pending posts publish immediately

---

## 🧪 Testing

### Test Scheduled Post

1. **Schedule Test Post**:
   - Go to: [Scheduled Posts](https://linkedai.site/scheduled)
   - Schedule post for **2 minutes from now**
   - Keep dashboard open

2. **Wait & Watch**:
   - Stay on any dashboard page
   - Within 2-3 minutes, you'll see notification
   - Post will appear on LinkedIn
   - Status updates to "Published"

3. **Verify on LinkedIn**:
   - Check your LinkedIn profile
   - Post should be live!

---

## 💡 Best Practices

### 1. Keep Dashboard Open
- For best experience, keep a dashboard tab open in background
- Polling runs automatically while tab is open
- Close tab when not scheduling posts

### 2. Schedule in Advance
- Schedule posts hours or days in advance
- Open dashboard a few minutes before scheduled time
- Posts will publish automatically

### 3. Multiple Posts
- Schedule multiple posts at different times
- All will publish automatically
- Each gets its own success notification

---

## 🔍 How It Compares

| Method | Cost | Delay | Setup | Requires Tab Open |
|--------|------|-------|-------|-------------------|
| **Client Polling** | $0 | ~60 sec | 0 min | Yes |
| Cloudflare Workers | $0 | ~15 min | 30 min | No |
| External Cron | $0 | ~5-15 min | 5 min | No |
| Vercel Cron | $0 | Daily only | 5 min | No |

**Winner**: Client-side polling for instant publishing! ✅

---

## 🐛 Troubleshooting

### Issue 1: Posts Not Publishing

**Check**:
1. ✅ Dashboard tab is open (any dashboard page)
2. ✅ You're logged in
3. ✅ Post scheduled time has passed
4. ✅ LinkedIn account is connected

**Debug**:
- Open browser console (F12)
- Look for error messages
- Check Network tab for failed requests

---

### Issue 2: No Notification Shown

**Possible Causes**:
- Browser tab was in background
- Browser has notifications disabled
- Toast notification was dismissed

**Fix**:
- Check the Scheduled Posts page to verify status
- Refresh the page
- Look for post on LinkedIn profile

---

### Issue 3: LinkedIn Token Expired

**Error**: "No LinkedIn access token" or API 401 error

**Fix**:
1. Go to: [Settings → LinkedIn Accounts](https://linkedai.site/settings)
2. Click "Reconnect Account"
3. Complete LinkedIn authorization
4. Try scheduling post again

---

## 🔒 Security

### Authentication
- Uses user's session from browser
- Each user can only publish their own posts
- No shared secrets or API keys in browser

### Privacy
- All data in your Supabase database
- Posts via official LinkedIn API
- No third-party services involved

### Rate Limiting
- Polls every 60 seconds (not aggressive)
- Only when user is active
- No risk of rate limit issues

---

## 📊 Monitoring

### Check Polling Status

The polling hook returns useful info:

```typescript
const { isPolling, lastChecked, checkNow } = useScheduledPostsPolling()

// isPolling: true when checking for posts
// lastChecked: Date of last check
// checkNow: Function to force immediate check
```

### Activity Logs

All published posts are logged in `user_activity_logs`:

```sql
SELECT * FROM user_activity_logs
WHERE activity_type = 'post_published'
AND activity_data->>'source' = 'client_polling'
ORDER BY created_at DESC;
```

---

## 🎯 Summary

**What You Get**:
- ✅ Automatic scheduled post publishing
- ✅ ~60 second maximum delay
- ✅ Zero cost forever
- ✅ No configuration needed
- ✅ Works on Vercel Free
- ✅ Already active on your dashboard!

**What You Need**:
- Keep a dashboard tab open (any page)
- Stay logged in
- Connected LinkedIn account

**Setup Time**: 0 minutes (already implemented!)
**Cost**: $0 forever

---

## 📚 Additional Resources

- [Client-Side Polling Details](../CLIENT_SIDE_POLLING.md) - Full technical documentation
- [LinkedIn OAuth Setup](./03-LINKEDIN-OAUTH-SETUP.md) - Connect LinkedIn accounts
- [Scheduled Posts Page](https://linkedai.site/scheduled) - Schedule new posts

---

**Status**: ✅ Live and working!

The auto-posting scheduler is **already active** on your dashboard. Just schedule posts and they'll publish automatically! 🎉
