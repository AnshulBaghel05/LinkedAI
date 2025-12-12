# Vercel Free Plan Cron Jobs Fix

**Date**: December 12, 2025
**Issue**: Vercel Free plan allows max 2 cron jobs, but we needed 3 separate tasks

---

## Problem

Initial implementation created 3 separate cron endpoints:
1. `/api/cron/reset-subscriptions` - Daily at 00:00 UTC
2. `/api/cron/payment-reminders` - Daily at 09:00 UTC
3. `/api/cron/handle-grace-periods` - Daily at 12:00 UTC

**Vercel Error**:
```
Your plan allows your team to create up to 2 Cron Jobs.
Your team currently has 0, and this project is attempting to create 3 more,
exceeding your team's limit.
```

---

## Solution

Consolidated all 3 tasks into a **single unified endpoint**:
- **File**: `src/app/api/cron/subscription-management/route.ts`
- **Schedule**: Every 6 hours (`0 */6 * * *`)
- **Tasks**: Handles all 3 operations in one execution

### Unified Cron Job Logic

The endpoint runs 3 tasks sequentially:

**Task 1 - Reset Subscriptions:**
- Finds subscriptions where `billing_anniversary_day` matches today
- Checks if `next_billing_date <= NOW`
- Resets usage counters (`posts_used`, `ai_generations_used`)
- Advances billing period by 30 days
- Logs activity

**Task 2 - Payment Reminders:**
- Finds subscriptions due in 3 days
- Sends payment reminder email via Resend
- Creates in-app notification
- Marks `payment_reminder_sent = true`
- Logs activity

**Task 3 - Grace Period Handler:**
- Finds subscriptions past billing date + 3 days
- Calls `downgrade_to_free_plan()` database function
- Updates LinkedIn account limit to 1
- Creates downgrade notification
- Logs activity

---

## Benefits

✅ **Complies with Vercel Free plan** - Uses only 1 cron job slot
✅ **More efficient** - Single execution handles all tasks
✅ **Runs frequently** - Every 6 hours ensures timely processing
✅ **All functionality preserved** - No feature loss from consolidation
✅ **Better logging** - Unified output shows all task results
✅ **Lower latency** - Tasks don't wait for separate cron triggers

---

## Schedule Comparison

### Before (3 separate crons):
- 00:00 UTC - Reset subscriptions
- 09:00 UTC - Payment reminders
- 12:00 UTC - Grace period handler
- **Total**: 3 cron jobs per day (3x daily)

### After (1 unified cron):
- 00:00 UTC - All 3 tasks
- 06:00 UTC - All 3 tasks
- 12:00 UTC - All 3 tasks
- 18:00 UTC - All 3 tasks
- **Total**: 1 cron job, runs 4x daily

**Result**: More frequent execution with fewer cron job slots used!

---

## Files Modified

1. **Created**: `src/app/api/cron/subscription-management/route.ts` (unified endpoint)
2. **Updated**: `vercel.json` - Changed from 3 crons to 1 cron
3. **Updated**: `ANNIVERSARY_BILLING_IMPLEMENTATION.md` - Documented changes

## Legacy Files (Not Used)

These files remain in the codebase for reference but are NOT called by Vercel:
- `src/app/api/cron/reset-subscriptions/route.ts`
- `src/app/api/cron/payment-reminders/route.ts`
- `src/app/api/cron/handle-grace-periods/route.ts`

You can safely delete these if desired, or keep them as reference implementations.

---

## Testing

To manually test the unified endpoint:

```bash
# Using curl with CRON_SECRET
curl -X GET https://your-domain.vercel.app/api/cron/subscription-management \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Expected response:
```json
{
  "message": "Subscription management tasks completed",
  "date": "2025-12-12T10:30:00.000Z",
  "summary": {
    "resets": { "total": 5, "successful": 5 },
    "reminders": { "total": 3, "successful": 3 },
    "downgrades": { "total": 1, "successful": 1 }
  },
  "results": {
    "resets": [...],
    "reminders": [...],
    "downgrades": [...]
  }
}
```

---

## Deployment Checklist

- [x] Create unified cron endpoint
- [x] Update vercel.json with single cron schedule
- [x] Test endpoint locally
- [x] Commit and push to GitHub
- [ ] Verify deployment on Vercel
- [ ] Check cron job appears in Vercel dashboard (Settings → Cron Jobs)
- [ ] Monitor first 24 hours for successful executions
- [ ] Verify email sending works (check Resend dashboard)
- [ ] Confirm database updates are happening

---

## Monitoring

After deployment, check:

1. **Vercel Dashboard** → Settings → Cron Jobs
   - Should show 1 cron job: `/api/cron/subscription-management`
   - Schedule: `0 */6 * * *`

2. **Vercel Logs** → Functions
   - Look for `[subscription-management]` log entries
   - Should run every 6 hours
   - Check for any error logs

3. **Database** (Supabase)
   - Verify `subscriptions` table updates
   - Check `user_activity_logs` for activity
   - Confirm `notifications` table has new entries

4. **Email** (Resend Dashboard)
   - Verify payment reminder emails are sent
   - Check delivery status

---

## Success Criteria

✅ Single cron job in Vercel dashboard
✅ Executes every 6 hours without errors
✅ All 3 tasks complete successfully
✅ Subscriptions reset on anniversary dates
✅ Payment reminders sent 3 days before billing
✅ Expired subscriptions downgraded to free plan
✅ No Vercel deployment errors

---

## Notes

- The unified approach is actually **better** than separate crons because it runs more frequently (4x daily vs 3x daily)
- All original functionality is preserved - no features were removed
- The 6-hour schedule ensures tasks are processed promptly without overwhelming the system
- If Vercel plan is upgraded later, you can split back to separate crons if desired (legacy files are preserved)
