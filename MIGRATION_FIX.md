# Migration Fix - linkedin_accounts_limit Error

## ❌ Error You Encountered
```
Error: Failed to run sql query: ERROR: 42703: column "linkedin_accounts_limit" of relation "subscriptions" does not exist
```

## ✅ What Was Fixed

The `linkedin_accounts_limit` column doesn't exist in the `subscriptions` table - it only exists in the `profiles` table. This was my mistake in the original migration.

### Fixed Files:
1. ✅ `supabase/migrations/20250211_backfill_subscriptions.sql` - Removed `linkedin_accounts_limit` column
2. ✅ `supabase/migrations/20250211_fix_handle_new_user_trigger.sql` - Removed `linkedin_accounts_limit` column
3. ✅ `src/lib/usage/limits.ts` - Removed `linkedin_accounts_limit` from fallback insert

## 📋 Subscriptions Table Structure

The `subscriptions` table has these columns:
- `id` (UUID)
- `user_id` (UUID - references profiles)
- `plan` (text: 'free', 'pro', 'standard', 'enterprise')
- `status` (text: 'active', 'trialing', 'past_due', 'cancelled', 'paused')
- `billing_cycle` (text: 'monthly', 'yearly')
- `posts_limit` (integer)
- `posts_used` (integer)
- `ai_credits_limit` (integer)
- `ai_credits_used` (integer)
- `ai_generations_limit` (integer) - Added by 20250206 migration
- `ai_generations_used` (integer) - Added by 20250206 migration
- `ai_generations_reset_at` (timestamptz) - Added by 20250206 migration
- `team_members_limit` (integer)
- `current_period_start` (timestamptz)
- `current_period_end` (timestamptz)
- `trial_end` (timestamptz)
- `cancel_at` (timestamptz)
- `cancelled_at` (timestamptz)
- `razorpay_payment_id` (text)
- `razorpay_subscription_id` (text)
- `razorpay_customer_id` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Note**: `linkedin_accounts_limit` is stored in the `profiles` table, NOT in subscriptions!

## 🚀 Ready to Deploy

The migrations are now fixed and ready to run. Try running them again in Supabase Dashboard > SQL Editor:

1. `20250211_backfill_subscriptions.sql` - Creates subscription records for existing users
2. `20250211_fix_handle_new_user_trigger.sql` - Updates trigger to create subscriptions for new users
3. `20250211_fix_plan_name_consistency.sql` - Fixes plan naming inconsistency

All three migrations should now run without errors!
