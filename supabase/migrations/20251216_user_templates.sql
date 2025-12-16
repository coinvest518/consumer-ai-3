-- Create user_templates table to store user-saved templates
CREATE TABLE IF NOT EXISTS user_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  full_content TEXT NOT NULL,
  credit_cost INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY user_templates_select_policy ON user_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_templates_insert_policy ON user_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_templates_delete_policy ON user_templates
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY user_templates_update_policy ON user_templates
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
