-- Fix RLS policies to allow authenticated users to read their own data
-- Handles tables that may not exist yet gracefully

-- Helper function to safely enable RLS
DO $$ 
BEGIN
  -- user_credits table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_credits') THEN
    ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS user_credits_select_policy ON user_credits;
    DROP POLICY IF EXISTS user_credits_insert_policy ON user_credits;
    DROP POLICY IF EXISTS user_credits_update_policy ON user_credits;
    
    CREATE POLICY user_credits_select_policy ON user_credits FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY user_credits_insert_policy ON user_credits FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY user_credits_update_policy ON user_credits FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  -- daily_login_bonuses table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_login_bonuses') THEN
    ALTER TABLE daily_login_bonuses ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS daily_login_bonuses_select_policy ON daily_login_bonuses;
    DROP POLICY IF EXISTS daily_login_bonuses_insert_policy ON daily_login_bonuses;
    DROP POLICY IF EXISTS daily_login_bonuses_update_policy ON daily_login_bonuses;
    
    CREATE POLICY daily_login_bonuses_select_policy ON daily_login_bonuses FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY daily_login_bonuses_insert_policy ON daily_login_bonuses FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY daily_login_bonuses_update_policy ON daily_login_bonuses FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  -- credit_builder_clicks table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_builder_clicks') THEN
    ALTER TABLE credit_builder_clicks ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS credit_builder_clicks_select_policy ON credit_builder_clicks;
    DROP POLICY IF EXISTS credit_builder_clicks_insert_policy ON credit_builder_clicks;
    
    CREATE POLICY credit_builder_clicks_select_policy ON credit_builder_clicks FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY credit_builder_clicks_insert_policy ON credit_builder_clicks FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- user_templates table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_templates') THEN
    ALTER TABLE user_templates ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS user_templates_select_policy ON user_templates;
    DROP POLICY IF EXISTS user_templates_insert_policy ON user_templates;
    DROP POLICY IF EXISTS user_templates_update_policy ON user_templates;
    DROP POLICY IF EXISTS user_templates_delete_policy ON user_templates;
    
    CREATE POLICY user_templates_select_policy ON user_templates FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY user_templates_insert_policy ON user_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY user_templates_update_policy ON user_templates FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    CREATE POLICY user_templates_delete_policy ON user_templates FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- purchases table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'purchases') THEN
    ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS purchases_select_policy ON purchases;
    DROP POLICY IF EXISTS purchases_insert_policy ON purchases;
    
    CREATE POLICY purchases_select_policy ON purchases FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY purchases_insert_policy ON purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Grant service role full access for backend operations
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_credits') THEN
    GRANT ALL ON user_credits TO service_role;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_login_bonuses') THEN
    GRANT ALL ON daily_login_bonuses TO service_role;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_builder_clicks') THEN
    GRANT ALL ON credit_builder_clicks TO service_role;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_templates') THEN
    GRANT ALL ON user_templates TO service_role;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'purchases') THEN
    GRANT ALL ON purchases TO service_role;
  END IF;
END $$;
