-- Add email reminder preferences to calendar_events
ALTER TABLE calendar_events 
ADD COLUMN IF NOT EXISTS send_email_reminder BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;

-- Add notification tracking to disputes
ALTER TABLE disputes
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_reminder_at TIMESTAMPTZ;

-- Add notification tracking to certified_mail
ALTER TABLE certified_mail
ADD COLUMN IF NOT EXISTS delivery_notification_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deadline_reminder_sent BOOLEAN DEFAULT false;

-- Create user_preferences table for automation settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_reminders BOOLEAN DEFAULT true,
  sms_reminders BOOLEAN DEFAULT false,
  reminder_hours_before INTEGER DEFAULT 24,
  weekly_summary BOOLEAN DEFAULT true,
  auto_generate_followups BOOLEAN DEFAULT false,
  notification_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email_logs table to track all emails sent
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT,
  related_id UUID,
  related_type TEXT,
  status TEXT DEFAULT 'sent',
  credits_charged INTEGER DEFAULT 0,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Create automation_queue table for scheduled tasks
CREATE TABLE IF NOT EXISTS automation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  related_id UUID,
  related_type TEXT,
  status TEXT DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY user_preferences_select_policy ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_preferences_insert_policy ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_preferences_update_policy ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for email_logs
CREATE POLICY email_logs_select_policy ON email_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY email_logs_insert_policy ON email_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for automation_queue
CREATE POLICY automation_queue_select_policy ON automation_queue
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY automation_queue_insert_policy ON automation_queue
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY automation_queue_update_policy ON automation_queue
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_calendar_events_reminder ON calendar_events(event_date, send_email_reminder, email_sent) WHERE email_sent = false;
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id, sent_at);
CREATE INDEX idx_automation_queue_scheduled ON automation_queue(scheduled_for, status) WHERE status = 'pending';
CREATE INDEX idx_automation_queue_user_id ON automation_queue(user_id);

-- Function to auto-create deadlines when mail is delivered
CREATE OR REPLACE FUNCTION auto_create_mail_deadlines()
RETURNS TRIGGER AS $$
DECLARE
  user_prefs RECORD;
BEGIN
  -- Only trigger when status changes to 'delivered'
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    
    -- Get user preferences
    SELECT * INTO user_prefs FROM user_preferences WHERE user_id = NEW.user_id;
    
    -- Create 30-day FCRA deadline
    INSERT INTO calendar_events (
      user_id, 
      title, 
      description,
      event_date, 
      event_type, 
      related_id, 
      related_type,
      send_email_reminder
    )
    VALUES (
      NEW.user_id,
      'FCRA 30-day response deadline',
      'Credit bureau must respond within 30 days of receiving your dispute letter.',
      NEW.date_delivered + INTERVAL '30 days',
      'deadline',
      NEW.id,
      'mail',
      COALESCE(user_prefs.email_reminders, true)
    );
    
    -- Create 25-day follow-up reminder
    INSERT INTO calendar_events (
      user_id, 
      title, 
      description,
      event_date, 
      event_type, 
      related_id, 
      related_type,
      send_email_reminder
    )
    VALUES (
      NEW.user_id,
      'Follow-up reminder',
      'Consider following up if you haven''t received a response yet.',
      NEW.date_delivered + INTERVAL '25 days',
      'reminder',
      NEW.id,
      'mail',
      COALESCE(user_prefs.email_reminders, true)
    );
    
    -- Mark delivery notification as sent
    NEW.delivery_notification_sent := true;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-creating deadlines
DROP TRIGGER IF EXISTS trigger_auto_mail_deadlines ON certified_mail;
CREATE TRIGGER trigger_auto_mail_deadlines
BEFORE UPDATE ON certified_mail
FOR EACH ROW
EXECUTE FUNCTION auto_create_mail_deadlines();

-- Function to get pending reminders (for backend cron job)
CREATE OR REPLACE FUNCTION get_pending_reminders(hours_ahead INTEGER DEFAULT 24)
RETURNS TABLE (
  event_id UUID,
  user_id UUID,
  user_email TEXT,
  event_title TEXT,
  event_description TEXT,
  event_date TIMESTAMPTZ,
  event_type TEXT,
  related_id UUID,
  related_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ce.id,
    ce.user_id,
    COALESCE(up.notification_email, au.email) as user_email,
    ce.title,
    ce.description,
    ce.event_date,
    ce.event_type,
    ce.related_id,
    ce.related_type
  FROM calendar_events ce
  JOIN auth.users au ON ce.user_id = au.id
  LEFT JOIN user_preferences up ON ce.user_id = up.user_id
  WHERE 
    ce.send_email_reminder = true
    AND ce.email_sent = false
    AND ce.is_completed = false
    AND ce.event_date <= NOW() + (hours_ahead || ' hours')::INTERVAL
    AND ce.event_date > NOW()
    AND (up.email_reminders IS NULL OR up.email_reminders = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark reminder as sent
CREATE OR REPLACE FUNCTION mark_reminder_sent(event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE calendar_events 
  SET 
    email_sent = true,
    email_sent_at = NOW()
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log email sent
CREATE OR REPLACE FUNCTION log_email_sent(
  p_user_id UUID,
  p_email_type TEXT,
  p_recipient_email TEXT,
  p_subject TEXT,
  p_related_id UUID DEFAULT NULL,
  p_related_type TEXT DEFAULT NULL,
  p_credits_charged INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO email_logs (
    user_id,
    email_type,
    recipient_email,
    subject,
    related_id,
    related_type,
    credits_charged
  )
  VALUES (
    p_user_id,
    p_email_type,
    p_recipient_email,
    p_subject,
    p_related_id,
    p_related_type,
    p_credits_charged
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create default preferences for existing users
INSERT INTO user_preferences (user_id, email_reminders, weekly_summary)
SELECT id, true, true
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE user_preferences IS 'Stores per-user automation and notification preferences';
COMMENT ON TABLE email_logs IS 'Tracks all emails sent to users for auditing and debugging';
COMMENT ON TABLE automation_queue IS 'Queue for scheduled automation tasks (reminders, follow-ups, etc.)';
COMMENT ON FUNCTION get_pending_reminders IS 'Returns all calendar events that need email reminders sent';
COMMENT ON FUNCTION mark_reminder_sent IS 'Marks a calendar event reminder as sent';
COMMENT ON FUNCTION log_email_sent IS 'Logs an email sent to a user';
