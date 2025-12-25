-- Create daily_login_bonuses table to track daily login rewards
CREATE TABLE IF NOT EXISTS daily_login_bonuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  login_date DATE NOT NULL DEFAULT CURRENT_DATE,
  credits_awarded INTEGER NOT NULL DEFAULT 0,
  streak_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_daily_login UNIQUE (user_id, login_date)
);

-- Enable RLS
ALTER TABLE daily_login_bonuses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated users
CREATE POLICY IF NOT EXISTS daily_login_bonuses_select_policy ON daily_login_bonuses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS daily_login_bonuses_insert_policy ON daily_login_bonuses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS daily_login_bonuses_update_policy ON daily_login_bonuses
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role policy (for Vercel API with service key)
CREATE POLICY IF NOT EXISTS daily_login_bonuses_service_role_policy ON daily_login_bonuses
  FOR ALL USING (true) WITH CHECK (true);

-- Grant service role full access
GRANT ALL ON daily_login_bonuses TO service_role;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_daily_login_bonuses_user_date ON daily_login_bonuses(user_id, login_date);