-- Fix RLS policies to allow authenticated users to read their own data
-- This enables frontend to fetch credits, bonuses, and usage data

-- user_credits table - allow authenticated users to read/write their own records
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_credits_select_policy ON user_credits;
CREATE POLICY user_credits_select_policy ON user_credits
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_credits_insert_policy ON user_credits;
CREATE POLICY user_credits_insert_policy ON user_credits
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_credits_update_policy ON user_credits;
CREATE POLICY user_credits_update_policy ON user_credits
  FOR UPDATE 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- daily_login_bonuses table - allow authenticated users to read/write their own records
ALTER TABLE daily_login_bonuses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS daily_login_bonuses_select_policy ON daily_login_bonuses;
CREATE POLICY daily_login_bonuses_select_policy ON daily_login_bonuses
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS daily_login_bonuses_insert_policy ON daily_login_bonuses;
CREATE POLICY daily_login_bonuses_insert_policy ON daily_login_bonuses
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS daily_login_bonuses_update_policy ON daily_login_bonuses;
CREATE POLICY daily_login_bonuses_update_policy ON daily_login_bonuses
  FOR UPDATE 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- credit_builder_clicks table - allow authenticated users to read their own clicks
ALTER TABLE credit_builder_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS credit_builder_clicks_select_policy ON credit_builder_clicks;
CREATE POLICY credit_builder_clicks_select_policy ON credit_builder_clicks
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS credit_builder_clicks_insert_policy ON credit_builder_clicks;
CREATE POLICY credit_builder_clicks_insert_policy ON credit_builder_clicks
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- user_templates table - allow authenticated users to read/write/delete their own templates
ALTER TABLE user_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_templates_select_policy ON user_templates;
CREATE POLICY user_templates_select_policy ON user_templates
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_templates_insert_policy ON user_templates;
CREATE POLICY user_templates_insert_policy ON user_templates
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_templates_update_policy ON user_templates;
CREATE POLICY user_templates_update_policy ON user_templates
  FOR UPDATE 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_templates_delete_policy ON user_templates;
CREATE POLICY user_templates_delete_policy ON user_templates
  FOR DELETE 
  USING (auth.uid() = user_id);

-- purchases table - allow authenticated users to read their own purchases
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS purchases_select_policy ON purchases;
CREATE POLICY purchases_select_policy ON purchases
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS purchases_insert_policy ON purchases;
CREATE POLICY purchases_insert_policy ON purchases
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Service role can do everything (for backend operations)
-- This is handled by using SUPABASE_SERVICE_ROLE_KEY in backend APIs
GRANT ALL ON user_credits TO service_role;
GRANT ALL ON daily_login_bonuses TO service_role;
GRANT ALL ON credit_builder_clicks TO service_role;
GRANT ALL ON user_templates TO service_role;
GRANT ALL ON purchases TO service_role;
