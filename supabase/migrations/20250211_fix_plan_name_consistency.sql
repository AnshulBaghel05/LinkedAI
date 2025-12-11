-- Migration: Fix plan name inconsistency across database
-- Standardize on: 'free', 'pro', 'standard', 'enterprise'

-- Update subscriptions table CHECK constraint
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('free', 'pro', 'standard', 'enterprise'));

-- Update subscriptions table status CHECK constraint
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('active', 'trialing', 'past_due', 'cancelled', 'paused'));

-- Update profiles table CHECK constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_subscription_plan_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_plan_check
  CHECK (subscription_plan IN ('free', 'pro', 'standard', 'enterprise'));

-- Migrate any 'starter' plans to 'pro'
UPDATE subscriptions SET plan = 'pro' WHERE plan = 'starter';
UPDATE profiles SET subscription_plan = 'pro' WHERE subscription_plan = 'starter';

-- Migrate any 'custom' plans to 'enterprise'
UPDATE subscriptions SET plan = 'enterprise' WHERE plan = 'custom';
UPDATE profiles SET subscription_plan = 'enterprise' WHERE subscription_plan = 'custom';

-- Log the changes
DO $$
DECLARE
  subscription_count INTEGER;
  profile_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO subscription_count FROM subscriptions WHERE plan IN ('free', 'pro', 'standard', 'enterprise');
  SELECT COUNT(*) INTO profile_count FROM profiles WHERE subscription_plan IN ('free', 'pro', 'standard', 'enterprise');

  RAISE NOTICE 'Updated subscriptions: % records now use standard plan names', subscription_count;
  RAISE NOTICE 'Updated profiles: % records now use standard plan names', profile_count;
END $$;
