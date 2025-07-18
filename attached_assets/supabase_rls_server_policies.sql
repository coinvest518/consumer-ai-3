-- Alternative RLS Policies for Server-Side Operations
-- Run these SQL commands in your Supabase SQL Editor

-- Option 1: Create policies that allow server-side operations with service role
-- These policies allow the service role to bypass RLS for chat operations

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own chat messages" ON chat_history;
DROP POLICY IF EXISTS "Users can view their own chat history" ON chat_history;
DROP POLICY IF EXISTS "Users can update their own chat messages" ON chat_history;
DROP POLICY IF EXISTS "Users can delete their own chat messages" ON chat_history;

-- Create new policies that work with server-side operations
-- Policy 1: Allow service role to insert any chat message
CREATE POLICY "Service role can insert chat messages" ON chat_history
    FOR INSERT 
    WITH CHECK (
        auth.role() = 'service_role' OR 
        auth.uid() = user_id
    );

-- Policy 2: Allow service role to select any chat history, users can only see their own
CREATE POLICY "Service role can view all chat history, users can view their own" ON chat_history
    FOR SELECT 
    USING (
        auth.role() = 'service_role' OR 
        auth.uid() = user_id
    );

-- Policy 3: Allow service role to update any chat message, users can update their own
CREATE POLICY "Service role can update chat messages" ON chat_history
    FOR UPDATE 
    USING (
        auth.role() = 'service_role' OR 
        auth.uid() = user_id
    );

-- Policy 4: Allow service role to delete any chat message, users can delete their own
CREATE POLICY "Service role can delete chat messages" ON chat_history
    FOR DELETE 
    USING (
        auth.role() = 'service_role' OR 
        auth.uid() = user_id
    );

-- Alternative Option 2: Disable RLS for chat_history (less secure but simpler for development)
-- Uncomment the line below if you want to completely disable RLS for development
-- ALTER TABLE chat_history DISABLE ROW LEVEL SECURITY;

-- Make sure you have the service role key in your environment variables
-- Add SUPABASE_SERVICE_ROLE_KEY to your .env file
-- You can find this in your Supabase Dashboard > Settings > API
