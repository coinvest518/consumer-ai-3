-- Create purchases table to track user subscriptions and payments
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  credits INTEGER NOT NULL DEFAULT 0,
  stripe_session_id TEXT UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_credits table to track user credit balances
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_credits UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY purchases_select_policy ON purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY purchases_insert_policy ON purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_credits_select_policy ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_credits_insert_policy ON user_credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_credits_update_policy ON user_credits
  FOR UPDATE USING (auth.uid() = user_id);