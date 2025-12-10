-- =====================================================
-- Migration: Fix Supabase Security Issues
-- Date: 2024-01-15
-- Description: Fix 5 critical security issues identified by Supabase Advisor:
--   1. Enable RLS on support_tickets table
--   2. Enable RLS on webhook_logs table
--   3. Add RLS policies for webhooks table
--   4. Fix ab_test_performance_summary view (remove SECURITY DEFINER)
--   5. Fix user_dashboard_summary view (remove SECURITY DEFINER)
-- =====================================================

-- =====================================================
-- 1. Enable RLS on support_tickets
-- =====================================================
-- The table has policies but RLS was not enabled
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. Enable RLS on webhook_logs and Add Policies
-- =====================================================
-- Enable RLS
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view webhook logs for their own webhooks
CREATE POLICY "Users can view own webhook logs"
  ON webhook_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM webhooks
      WHERE webhooks.id = webhook_logs.webhook_id
      AND webhooks.user_id = auth.uid()
    )
  );

-- Service role can do everything (for system operations like creating logs)
CREATE POLICY "Service role full access to webhook_logs"
  ON webhook_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 3. Add RLS Policies for webhooks Table
-- =====================================================
-- The table has RLS enabled but no policies were defined

-- Users can view their own webhooks
CREATE POLICY "Users can view own webhooks"
  ON webhooks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own webhooks
CREATE POLICY "Users can create own webhooks"
  ON webhooks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own webhooks
CREATE POLICY "Users can update own webhooks"
  ON webhooks FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own webhooks
CREATE POLICY "Users can delete own webhooks"
  ON webhooks FOR DELETE
  USING (auth.uid() = user_id);

-- Service role has full access (for admin operations)
CREATE POLICY "Service role full access to webhooks"
  ON webhooks FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 4. Fix ab_test_performance_summary View
-- =====================================================
-- Remove SECURITY DEFINER and add user filtering

-- Drop existing view
DROP VIEW IF EXISTS ab_test_performance_summary;

-- Recreate with security_invoker=true and user filtering
CREATE VIEW ab_test_performance_summary
WITH (security_invoker = true) -- Use invoker's permissions, not definer's
AS
SELECT
  t.id as test_id,
  t.user_id,
  t.name as test_name,
  t.status,
  t.started_at,
  t.ended_at,
  COUNT(v.id) as variant_count,
  SUM(v.views) as total_views,
  SUM(v.likes) as total_likes,
  SUM(v.comments) as total_comments,
  SUM(v.shares) as total_shares,
  AVG(v.engagement_rate) as avg_engagement_rate,
  MAX(v.engagement_rate) as best_engagement_rate,
  (SELECT variant_name FROM ab_test_variants
   WHERE ab_test_id = t.id
   ORDER BY engagement_rate DESC
   LIMIT 1) as leading_variant
FROM ab_tests t
LEFT JOIN ab_test_variants v ON t.id = v.ab_test_id
WHERE t.user_id = auth.uid() -- CRITICAL: Filter by current user
GROUP BY t.id, t.user_id, t.name, t.status, t.started_at, t.ended_at;

-- Add comment explaining the security fix
COMMENT ON VIEW ab_test_performance_summary IS
  'Performance summary for A/B tests. Uses security_invoker=true and filters by auth.uid() to prevent cross-user data access.';

-- =====================================================
-- 5. Fix user_dashboard_summary View
-- =====================================================
-- Remove SECURITY DEFINER and add user filtering

-- Drop existing view
DROP VIEW IF EXISTS user_dashboard_summary;

-- Recreate with security_invoker=true and user filtering
CREATE VIEW user_dashboard_summary
WITH (security_invoker = true) -- Use invoker's permissions
AS
SELECT
  p.id as user_id,
  COUNT(DISTINCT posts.id) FILTER (WHERE posts.status = 'published') as total_published,
  COUNT(DISTINCT posts.id) FILTER (WHERE posts.status = 'draft') as total_drafts,
  COUNT(DISTINCT posts.id) FILTER (WHERE posts.status = 'scheduled') as total_scheduled,
  COALESCE(SUM(posts.views_count), 0) as total_views,
  COALESCE(SUM(posts.likes_count), 0) as total_likes,
  COALESCE(SUM(posts.comments_count), 0) as total_comments,
  COALESCE(AVG(posts.engagement_rate), 0) as avg_engagement_rate
FROM profiles p
LEFT JOIN posts ON p.id = posts.user_id
WHERE p.id = auth.uid() -- CRITICAL: Filter by current user
GROUP BY p.id;

-- Add comment explaining the security fix
COMMENT ON VIEW user_dashboard_summary IS
  'Dashboard summary for users. Uses security_invoker=true and filters by auth.uid() to prevent cross-user data access.';

-- =====================================================
-- Verification Queries (commented out - run manually to verify)
-- =====================================================

-- Check RLS is enabled on all required tables:
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename IN ('support_tickets', 'webhook_logs', 'webhooks');

-- Check policies exist for all required tables:
-- SELECT schemaname, tablename, policyname
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- AND tablename IN ('support_tickets', 'webhook_logs', 'webhooks')
-- ORDER BY tablename, policyname;

-- Test views only return current user's data:
-- SELECT * FROM user_dashboard_summary;
-- SELECT * FROM ab_test_performance_summary;
