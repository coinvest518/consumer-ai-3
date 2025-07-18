-- Create storage_limits table to define user storage tiers
CREATE TABLE IF NOT EXISTS storage_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_storage_bytes BIGINT NOT NULL DEFAULT 104857600, -- Default 100MB
  max_files INT NOT NULL DEFAULT 50,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  tier_name VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_storage_limits UNIQUE (user_id)
);

-- Create storage_usage table to track actual usage
CREATE TABLE IF NOT EXISTS storage_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL, -- Size in bytes
  file_type TEXT NOT NULL,
  storage_bucket TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- NULL if file is active
  CONSTRAINT unique_file_path UNIQUE (user_id, file_path)
);

-- Create storage_transactions table to track purchases
CREATE TABLE IF NOT EXISTS storage_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  storage_added_bytes BIGINT NOT NULL,
  files_added INTEGER NOT NULL,
  stripe_session_id TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create RLS policies for security
ALTER TABLE storage_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY storage_limits_select_policy ON storage_limits
  FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE storage_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY storage_usage_select_policy ON storage_usage
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY storage_usage_insert_policy ON storage_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE storage_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY storage_transactions_select_policy ON storage_transactions
  FOR SELECT USING (auth.uid() = user_id);