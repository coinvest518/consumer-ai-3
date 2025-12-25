-- Fix daily_login_bonuses permissions for service role
-- Run this in Supabase SQL Editor

-- Add service role policy (only if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'daily_login_bonuses' 
    AND policyname = 'daily_login_bonuses_service_role_policy'
  ) THEN
    CREATE POLICY daily_login_bonuses_service_role_policy ON daily_login_bonuses
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Grant service role full access
GRANT ALL ON daily_login_bonuses TO service_role;
