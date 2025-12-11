-- Migration: Backfill missing subscriptions for existing users
-- This fixes the "Subscription not found" error that users are experiencing

-- First, create subscriptions for all users who have profiles but no subscription
INSERT INTO public.subscriptions (
  user_id,
  plan,
  status,
  billing_cycle,
  posts_limit,
  posts_used,
  ai_generations_limit,
  ai_generations_used,
  ai_credits_limit,
  ai_credits_used,
  team_members_limit,
  current_period_start,
  current_period_end,
  ai_generations_reset_at,
  created_at,
  updated_at
)
SELECT
  p.id as user_id,
  COALESCE(p.subscription_plan, 'free') as plan,
  'active' as status,
  'monthly' as billing_cycle,
  COALESCE(p.posts_limit, 20) as posts_limit,
  COALESCE(p.posts_used, 0) as posts_used,
  -- AI generation limits based on plan
  CASE
    WHEN COALESCE(p.subscription_plan, 'free') = 'free' THEN 10
    WHEN COALESCE(p.subscription_plan, 'free') = 'pro' THEN 200
    WHEN COALESCE(p.subscription_plan, 'free') = 'standard' THEN 1000
    WHEN COALESCE(p.subscription_plan, 'free') = 'enterprise' THEN -1
    ELSE 10
  END as ai_generations_limit,
  0 as ai_generations_used,
  -- AI credits (legacy, same as generations for now)
  CASE
    WHEN COALESCE(p.subscription_plan, 'free') = 'free' THEN 10
    WHEN COALESCE(p.subscription_plan, 'free') = 'pro' THEN 200
    WHEN COALESCE(p.subscription_plan, 'free') = 'standard' THEN 1000
    WHEN COALESCE(p.subscription_plan, 'free') = 'enterprise' THEN -1
    ELSE 10
  END as ai_credits_limit,
  0 as ai_credits_used,
  1 as team_members_limit, -- Default to 1 for all plans (not stored in profiles)
  NOW() as current_period_start,
  NOW() + INTERVAL '30 days' as current_period_end,
  DATE_TRUNC('month', NOW()) + INTERVAL '1 month' as ai_generations_reset_at,
  p.created_at,
  NOW() as updated_at
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscriptions s WHERE s.user_id = p.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Log the number of subscriptions created
DO $$
DECLARE
  affected_count INTEGER;
BEGIN
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RAISE NOTICE 'Created % subscription records for existing users', affected_count;
END $$;
