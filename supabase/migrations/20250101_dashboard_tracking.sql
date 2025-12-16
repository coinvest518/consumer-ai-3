-- Create disputes table
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  bureau TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  date_sent TIMESTAMPTZ,
  date_received TIMESTAMPTZ,
  tracking_number TEXT,
  response_deadline TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create certified_mail table
CREATE TABLE IF NOT EXISTS certified_mail (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tracking_number TEXT NOT NULL,
  recipient TEXT NOT NULL,
  description TEXT,
  date_mailed TIMESTAMPTZ NOT NULL,
  date_delivered TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'mailed',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agency TEXT NOT NULL,
  complaint_number TEXT,
  description TEXT,
  date_filed TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'filed',
  response_received BOOLEAN DEFAULT FALSE,
  response_date TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  event_type TEXT NOT NULL,
  related_id UUID,
  related_type TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE certified_mail ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for disputes
CREATE POLICY disputes_select_policy ON disputes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY disputes_insert_policy ON disputes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY disputes_update_policy ON disputes
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY disputes_delete_policy ON disputes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for certified_mail
CREATE POLICY certified_mail_select_policy ON certified_mail
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY certified_mail_insert_policy ON certified_mail
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY certified_mail_update_policy ON certified_mail
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY certified_mail_delete_policy ON certified_mail
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for complaints
CREATE POLICY complaints_select_policy ON complaints
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY complaints_insert_policy ON complaints
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY complaints_update_policy ON complaints
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY complaints_delete_policy ON complaints
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for calendar_events
CREATE POLICY calendar_events_select_policy ON calendar_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY calendar_events_insert_policy ON calendar_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY calendar_events_update_policy ON calendar_events
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY calendar_events_delete_policy ON calendar_events
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_disputes_user_id ON disputes(user_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_certified_mail_user_id ON certified_mail(user_id);
CREATE INDEX idx_certified_mail_tracking ON certified_mail(tracking_number);
CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_date ON calendar_events(event_date);
