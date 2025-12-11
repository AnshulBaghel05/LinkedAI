-- Migration: Fix handle_new_user() trigger to also create subscription records
-- This ensures new users get BOTH profile AND subscription records

-- Update the function to create both profile and subscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_plan TEXT := 'free';
  posts_limit_val INTEGER := 20;
  linkedin_accounts_limit_val INTEGER := 1;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    subscription_plan,
    posts_limit,
    linkedin_accounts_limit
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    user_plan,
    posts_limit_val,
    linkedin_accounts_limit_val
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert subscription record
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
  VALUES (
    NEW.id,
    user_plan,
    'active',
    'monthly',
    posts_limit_val,
    0, -- posts_used
    10, -- ai_generations_limit for free plan
    0, -- ai_generations_used
    10, -- ai_credits_limit for free plan
    0, -- ai_credits_used
    1, -- team_members_limit
    NOW(),
    NOW() + INTERVAL '30 days',
    DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger (in case it was dropped)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
