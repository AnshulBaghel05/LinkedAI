-- Migration: Change from calendar-month to anniversary-based billing
-- This ensures fair billing cycles for all users
-- Date: 2025-12-12

-- Add billing anniversary tracking columns
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS billing_anniversary_day INTEGER DEFAULT 1
  CHECK (billing_anniversary_day >= 1 AND billing_anniversary_day <= 28),
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS grace_period_end TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN subscriptions.billing_anniversary_day IS 'Day of month (1-28) when subscription renews and resets';
COMMENT ON COLUMN subscriptions.last_payment_date IS 'Date of most recent successful payment';
COMMENT ON COLUMN subscriptions.next_billing_date IS 'Date when next payment is due';
COMMENT ON COLUMN subscriptions.payment_reminder_sent IS 'Whether reminder has been sent for current billing period';
COMMENT ON COLUMN subscriptions.grace_period_end IS 'Date when grace period expires if payment not received';

-- Backfill existing users with anniversary based on their creation date
UPDATE subscriptions
SET
  billing_anniversary_day = LEAST(EXTRACT(DAY FROM created_at)::INTEGER, 28),
  last_payment_date = CASE
    WHEN plan != 'free' THEN created_at
    ELSE NULL
  END,
  next_billing_date = CASE
    WHEN plan = 'free' THEN NULL
    ELSE (
      -- Calculate next anniversary date
      CASE
        WHEN EXTRACT(DAY FROM NOW())::INTEGER < LEAST(EXTRACT(DAY FROM created_at)::INTEGER, 28)
        THEN DATE_TRUNC('month', NOW()) + (LEAST(EXTRACT(DAY FROM created_at)::INTEGER, 28) - 1) * INTERVAL '1 day'
        ELSE DATE_TRUNC('month', NOW() + INTERVAL '1 month') + (LEAST(EXTRACT(DAY FROM created_at)::INTEGER, 28) - 1) * INTERVAL '1 day'
      END
    )
  END
WHERE billing_anniversary_day IS NULL;

-- Update current_period_start and current_period_end to align with anniversary
UPDATE subscriptions
SET
  current_period_start = CASE
    WHEN plan = 'free' THEN NOW()
    WHEN last_payment_date IS NOT NULL THEN last_payment_date
    ELSE created_at
  END,
  current_period_end = CASE
    WHEN plan = 'free' THEN NULL
    WHEN next_billing_date IS NOT NULL THEN next_billing_date
    ELSE created_at + INTERVAL '30 days'
  END;

-- Create index for efficient cron queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing_date
  ON subscriptions(next_billing_date)
  WHERE next_billing_date IS NOT NULL AND status = 'active';

CREATE INDEX IF NOT EXISTS idx_subscriptions_anniversary_day
  ON subscriptions(billing_anniversary_day);

-- Function: Calculate next billing date based on anniversary
CREATE OR REPLACE FUNCTION calculate_next_billing_date(
  p_anniversary_day INTEGER,
  p_from_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  v_next_month TIMESTAMPTZ;
  v_next_billing TIMESTAMPTZ;
BEGIN
  -- Get first day of next month
  v_next_month := DATE_TRUNC('month', p_from_date) + INTERVAL '1 month';

  -- Add anniversary day (already capped at 28)
  v_next_billing := v_next_month + (p_anniversary_day - 1) * INTERVAL '1 day';

  RETURN v_next_billing;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Reset subscription on anniversary
CREATE OR REPLACE FUNCTION reset_subscription_on_anniversary(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription RECORD;
BEGIN
  -- Get current subscription
  SELECT * INTO v_subscription
  FROM subscriptions
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Don't reset free plans (they don't have billing cycles)
  IF v_subscription.plan = 'free' THEN
    RETURN FALSE;
  END IF;

  -- Reset usage counters and advance billing period
  UPDATE subscriptions
  SET
    posts_used = 0,
    ai_generations_used = 0,
    ai_credits_used = 0,
    leads_discovered_this_week = 0,
    predictions_this_week = 0,
    current_period_start = current_period_end,
    current_period_end = calculate_next_billing_date(billing_anniversary_day, current_period_end),
    next_billing_date = calculate_next_billing_date(billing_anniversary_day, current_period_end),
    payment_reminder_sent = FALSE,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Downgrade subscription to free
CREATE OR REPLACE FUNCTION downgrade_to_free_plan(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update subscription to free plan with free limits
  UPDATE subscriptions
  SET
    plan = 'free',
    status = 'cancelled',
    posts_limit = 20,
    posts_used = LEAST(posts_used, 20), -- Cap at free limit
    ai_generations_limit = 10,
    ai_generations_used = LEAST(ai_generations_used, 10),
    ai_credits_limit = 10,
    ai_credits_used = LEAST(ai_credits_used, 10),
    team_members_limit = 1,
    linkedin_accounts_limit = 1,
    next_billing_date = NULL,
    grace_period_end = NULL,
    payment_reminder_sent = FALSE,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Also update profiles table if columns exist
  UPDATE profiles
  SET
    subscription_plan = 'free',
    posts_limit = 20,
    linkedin_accounts_limit = 1,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_next_billing_date(INTEGER, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_subscription_on_anniversary(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION downgrade_to_free_plan(UUID) TO service_role;
