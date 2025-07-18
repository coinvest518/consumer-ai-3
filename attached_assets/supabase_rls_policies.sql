-- Row Level Security Policies for ConsumerAI Chat Application
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Enable RLS on chat_history table (if not already enabled)
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- 2. Policy for users to INSERT their own chat messages
CREATE POLICY "Users can insert their own chat messages" ON chat_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Policy for users to SELECT/view their own chat history
CREATE POLICY "Users can view their own chat history" ON chat_history
    FOR SELECT USING (auth.uid() = user_id);

-- 4. Policy for users to UPDATE their own chat messages (optional)
CREATE POLICY "Users can update their own chat messages" ON chat_history
    FOR UPDATE USING (auth.uid() = user_id);

-- 5. Policy for users to DELETE their own chat messages (optional)
CREATE POLICY "Users can delete their own chat messages" ON chat_history
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Ensure profiles table also has proper RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Policy for users to view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- 8. Policy for users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 9. Policy for users to update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 10. Ensure user_metrics table has proper RLS policies
ALTER TABLE user_metrics ENABLE ROW LEVEL SECURITY;

-- 11. Policy for users to view their own metrics (you mentioned you already have this)
CREATE POLICY "Users can view their own metrics" ON user_metrics
    FOR SELECT USING (auth.uid() = user_id);

-- 12. Policy for users to insert their own metrics
CREATE POLICY "Users can insert their own metrics" ON user_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 13. Policy for users to update their own metrics
CREATE POLICY "Users can update their own metrics" ON user_metrics
    FOR UPDATE USING (auth.uid() = user_id);

-- Note: Make sure your tables have the correct structure:
-- 
-- chat_history table should have:
-- - id (primary key)
-- - user_id (UUID, references auth.users.id)
-- - session_id (text)
-- - message (text)
-- - role (text: 'user' or 'assistant')
-- - created_at (timestamp)
--
-- profiles table should have:
-- - id (UUID, primary key, references auth.users.id)
-- - email (text)
-- - created_at (timestamp)
-- - updated_at (timestamp)
-- - is_pro (boolean)
-- - questions_remaining (integer)
--
-- user_metrics table should have:
-- - id (primary key)
-- - user_id (UUID, references auth.users.id)
-- - chats_used (integer)
-- - created_at (timestamp)
-- - last_updated (timestamp)
