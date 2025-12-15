# Database Schema - Consumer AI Chat

## Overview
This document outlines the current Supabase database schema for the Consumer AI Chat application.

## Tables

### 1. profiles
User profile information
- `id` (uuid) - Primary key, references auth.users
- `email` (text) - User's email address
- `full_name` (text) - User's full name (optional)
- `avatar_url` (text) - Profile picture URL (optional)
- `is_pro` (boolean) - Whether user has pro subscription
- `created_at` (timestamp) - Account creation timestamp
- `updated_at` (timestamp) - Last profile update timestamp

### 2. user_credits
User credit balances for AI interactions
- `id` (uuid) - Primary key
- `user_id` (uuid) - References auth.users
- `credits` (integer) - Current credit balance
- `created_at` (timestamp) - Record creation timestamp
- `updated_at` (timestamp) - Last update timestamp

### 3. user_metrics
User usage tracking and limits
- `id` (uuid) - Primary key
- `user_id` (uuid) - References auth.users
- `chats_used` (integer) - Number of chats used today
- `daily_limit` (integer) - Daily chat limit
- `last_reset` (timestamp) - When usage was last reset
- `created_at` (timestamp) - Record creation timestamp
- `updated_at` (timestamp) - Last update timestamp

### 4. chat_history
Chat conversation history
- `id` (uuid) - Primary key
- `user_id` (uuid) - References auth.users
- `session_id` (text) - Chat session identifier
- `message` (text) - Chat message content
- `role` (text) - Message role (user/assistant)
- `metadata` (jsonb) - Additional message metadata
- `created_at` (timestamp) - Message timestamp

### 5. purchases
Payment and subscription records
- `id` (uuid) - Primary key
- `user_id` (uuid) - References auth.users
- `amount` (numeric) - Purchase amount
- `credits` (integer) - Credits purchased
- `stripe_session_id` (text) - Stripe payment session ID
- `status` (varchar) - Payment status
- `metadata` (jsonb) - Additional purchase data
- `created_at` (timestamp) - Purchase timestamp
- `updated_at` (timestamp) - Last update timestamp

### 6. storage_limits
User storage tier limits
- `id` (uuid) - Primary key
- `user_id` (uuid) - References auth.users
- `max_storage_bytes` (bigint) - Maximum storage in bytes
- `max_files` (integer) - Maximum number of files
- `is_premium` (boolean) - Whether user has premium storage
- `tier_name` (varchar) - Storage tier name
- `created_at` (timestamp) - Record creation timestamp
- `updated_at` (timestamp) - Last update timestamp

### 7. storage_usage
User file storage tracking
- `id` (uuid) - Primary key
- `user_id` (uuid) - References auth.users
- `file_path` (text) - File path in storage
- `file_name` (text) - Original file name
- `file_size` (bigint) - File size in bytes
- `file_type` (text) - MIME type
- `storage_bucket` (text) - Storage bucket name
- `created_at` (timestamp) - Upload timestamp
- `deleted_at` (timestamp) - Deletion timestamp (null if active)

### 8. storage_transactions
Storage upgrade payment records
- `id` (uuid) - Primary key
- `user_id` (uuid) - References auth.users
- `amount_cents` (integer) - Payment amount in cents
- `storage_added_bytes` (bigint) - Storage added in bytes
- `files_added` (integer) - Files added to limit
- `stripe_session_id` (text) - Stripe payment session ID
- `status` (varchar) - Transaction status
- `created_at` (timestamp) - Transaction timestamp
- `completed_at` (timestamp) - Completion timestamp

### 9. report_analyses
Credit report analysis results
- `id` (uuid) - Primary key
- `user_id` (uuid) - References auth.users
- `file_path` (text) - Path to analyzed file
- `file_name` (text) - Original file name
- `extracted_text` (text) - Extracted text from file
- `analysis` (jsonb) - Analysis results
- `violations_found` (boolean) - Whether violations were found
- `errors_found` (boolean) - Whether errors were found
- `processed_at` (timestamp) - Analysis completion timestamp
- `created_at` (timestamp) - Record creation timestamp

## Key Relationships

- All user-related tables reference `auth.users.id` via `user_id` or `id` fields
- `storage_usage` tracks actual file storage against limits in `storage_limits`
- `user_metrics` tracks daily usage against limits
- `report_analyses` links to files in `storage_usage` via `file_path`
- `purchases` and `storage_transactions` handle payment records

## Row Level Security (RLS)

All tables have RLS enabled with policies ensuring users can only access their own data:
- `auth.uid() = user_id` for user-specific tables
- `auth.uid() = id` for profiles table

## Notes

- All timestamps use `timestamp with time zone`
- UUID fields are auto-generated
- JSONB fields store flexible metadata
- Storage limits default to 100MB and 50 files for free tier
  - `is_premium` (BOOLEAN, default: false)
  - `tier_name` (VARCHAR(50), default: 'free')
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)

#### 5. `storage_usage`
Tracks actual file storage usage per user.
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `user_id` (UUID, references `auth.users.id`)
  - `file_path` (TEXT)
  - `file_name` (TEXT)
  - `file_size` (BIGINT)
  - `file_type` (TEXT)
  - `storage_bucket` (TEXT)
  - `created_at` (TIMESTAMPTZ)
  - `deleted_at` (TIMESTAMPTZ, nullable)
- **Constraints**: Unique `user_id + file_path`

#### 6. `storage_transactions`
Records storage plan purchases and upgrades.
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `user_id` (UUID, references `auth.users.id`)
  - `amount_cents` (INTEGER)
  - `storage_added_bytes` (BIGINT)
  - `files_added` (INTEGER)
  - `stripe_session_id` (TEXT)
  - `status` (VARCHAR(20), default: 'pending')
  - `created_at` (TIMESTAMPTZ)
  - `completed_at` (TIMESTAMPTZ, nullable)

#### 7. `purchases`
Tracks all payment transactions and subscriptions.
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `user_id` (UUID, references `auth.users.id`)
  - `amount` (DECIMAL(10,2))
  - `credits` (INTEGER, default: 0)
  - `stripe_session_id` (TEXT, unique)
  - `status` (VARCHAR(20), default: 'pending')
  - `metadata` (JSONB)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)

#### 8. `user_credits`
Tracks user credit balances for AI interactions.
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `user_id` (UUID, references `auth.users.id`, unique)
  - `credits` (INTEGER, default: 0)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)

#### 9. `credit_builder_clicks`
Tracks clicks on credit builder affiliate links.
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `user_id` (UUID, references `auth.users.id`)
  - `link_id` (TEXT)
  - `clicked_at` (TIMESTAMPTZ)
  - `ip_address` (INET)
  - `user_agent` (TEXT)
  - `referrer` (TEXT)

#### 10. `agent_activity_logs`
Logs AI agent actions and tool usage.
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `user_id` (UUID, references `auth.users.id`)
  - `session_id` (TEXT)
  - `agent_name` (TEXT)
  - `action_type` (TEXT)
  - `action_data` (JSONB)
  - `duration_ms` (INTEGER)
  - `success` (BOOLEAN, default: true)
  - `error_message` (TEXT)
  - `created_at` (TIMESTAMPTZ)

#### 11. `user_events`
General user interaction tracking.
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `user_id` (UUID, references `auth.users.id`, nullable)
  - `event_type` (TEXT)
  - `event_name` (TEXT)
  - `event_data` (JSONB)
  - `page_url` (TEXT)
  - `session_id` (TEXT)
  - `ip_address` (INET)
  - `user_agent` (TEXT)
  - `referrer` (TEXT)
  - `created_at` (TIMESTAMPTZ)

#### 12. `feature_usage`
Tracks which features users interact with.
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `user_id` (UUID, references `auth.users.id`)
  - `feature_name` (TEXT, unique with user_id)
  - `usage_count` (INTEGER, default: 1)
  - `last_used_at` (TIMESTAMPTZ)
  - `metadata` (JSONB)
  - `created_at` (TIMESTAMPTZ)

#### 13. `notification_logs`
Logs email and notification sending.
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `user_id` (UUID, references `auth.users.id`)
  - `notification_type` (TEXT)
  - `recipient` (TEXT)
  - `subject` (TEXT)
  - `message` (TEXT)
  - `status` (TEXT, default: 'sent')
  - `provider_response` (JSONB)
  - `sent_at` (TIMESTAMPTZ)
  - `delivered_at` (TIMESTAMPTZ)
  - `error_message` (TEXT)

#### 14. `dispute_tracking`
Tracks credit dispute progress.
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `user_id` (UUID, references `auth.users.id`)
  - `dispute_id` (TEXT, unique)
  - `credit_bureau` (TEXT)
  - `account_number` (TEXT)
  - `dispute_reason` (TEXT)
  - `status` (TEXT, default: 'initiated')
  - `sent_date` (DATE)
  - `response_date` (DATE)
  - `resolution` (TEXT)
  - `tracking_number` (TEXT)
  - `documents` (JSONB)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)

#### 15. `calendar_events`
Calendar reminders and events.
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `user_id` (UUID, references `auth.users.id`)
  - `event_type` (TEXT)
  - `title` (TEXT)
  - `description` (TEXT)
  - `event_date` (TIMESTAMPTZ)
  - `reminder_sent` (BOOLEAN, default: false)
  - `google_event_id` (TEXT)
  - `metadata` (JSONB)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)

#### 16. `page_views`
Website analytics and page tracking.
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `user_id` (UUID, references `auth.users.id`, nullable)
  - `session_id` (TEXT)
  - `page_path` (TEXT)
  - `page_title` (TEXT)
  - `referrer` (TEXT)
  - `user_agent` (TEXT)
  - `ip_address` (INET)
  - `country` (TEXT)
  - `city` (TEXT)
  - `device_type` (TEXT)
  - `browser` (TEXT)
  - `duration_seconds` (INTEGER)
  - `viewed_at` (TIMESTAMPTZ)

#### 17. `voice_chat_logs`
Voice chat interaction logs.
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `user_id` (UUID, references `auth.users.id`, nullable)
  - `session_id` (TEXT)
  - `provider` (TEXT)
  - `agent_id` (TEXT)
  - `duration_seconds` (INTEGER)
  - `transcript` (TEXT)
  - `sentiment` (TEXT)
  - `user_satisfaction` (INTEGER)
  - `created_at` (TIMESTAMPTZ)

## Security Policies (RLS)

All tables have Row Level Security enabled with the following policies:

### Service Role Access
- **Service role** can perform all operations (INSERT, SELECT, UPDATE, DELETE) on all tables
- This allows the backend API to manage data server-side

### User Access
- Users can only access their own data (`auth.uid() = user_id` or `auth.uid() = id`)
- Specific policies for each operation type

## Relationships

```
auth.users (Supabase Auth)
├── profiles (1:1)
├── chat_history (1:many)
├── user_metrics (1:1)
├── storage_limits (1:1)
├── storage_usage (1:many)
├── storage_transactions (1:many)
├── purchases (1:many)
├── user_credits (1:1)
├── credit_builder_clicks (1:many)
├── agent_activity_logs (1:many)
├── user_events (1:many)
├── feature_usage (1:many)
├── notification_logs (1:many)
├── dispute_tracking (1:many)
├── calendar_events (1:many)
├── page_views (1:many)
└── voice_chat_logs (1:many)
```

## Indexes

- `chat_history`: `user_id`, `session_id`, `created_at`
- `storage_usage`: `user_id`, `created_at`
- `storage_transactions`: `user_id`, `status`
- `purchases`: `user_id`, `status`, `created_at`
- `user_credits`: `user_id`
- `credit_builder_clicks`: `user_id`, `clicked_at`
- `agent_activity_logs`: `user_id`, `created_at`
- `user_events`: `user_id`, `event_type`, `created_at`
- `feature_usage`: `user_id`
- `notification_logs`: `user_id`, `sent_at`
- `dispute_tracking`: `user_id`, `status`
- `calendar_events`: `user_id`, `event_date`
- `page_views`: `user_id`, `viewed_at`
- `voice_chat_logs`: `user_id`, `created_at`

## Triggers

- `updated_at` columns are automatically updated via triggers on:
  - `profiles`
  - `storage_limits`
  - `purchases`
  - `user_metrics`

## Setup Instructions

1. **Run the SQL Schema**:
   ```sql
   -- Execute the full_database_schema.sql file in Supabase SQL Editor
   ```

2. **Verify Tables**:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

3. **Check Policies**:
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
   FROM pg_policies WHERE schemaname = 'public';
   ```

## Migration Notes

- This schema includes all tables from the existing migrations
- RLS policies are configured for both user and service role access
- Indexes are optimized for common query patterns
- Default values ensure backward compatibility

## Troubleshooting

### Common Issues

1. **RLS Blocking Queries**: Ensure you're using the correct auth context or service role key
2. **Missing Extensions**: Make sure `uuid-ossp` and `pgcrypto` extensions are enabled
3. **Foreign Key Errors**: Ensure `auth.users` table exists (created by Supabase Auth)

### Testing Queries

```sql
-- Test user data access
SELECT * FROM profiles WHERE id = auth.uid();

-- Test chat history
SELECT * FROM chat_history WHERE user_id = auth.uid() LIMIT 10;

-- Test storage usage
SELECT * FROM storage_usage WHERE user_id = auth.uid();
```

## TODO List

### ✅ Completed
- [x] Create comprehensive database schema with all tables
- [x] Add tracking tables for user analytics (credit_builder_clicks, agent_activity_logs, user_events, etc.)
- [x] Implement Row Level Security policies for all tables
- [x] Add database indexes for performance optimization
- [x] Document all tables and relationships in DATABASE_SCHEMA.md
- [x] Validate schema builds successfully

### 🔄 Next Steps
- [ ] Deploy schema to Supabase (run full_database_schema.sql in SQL Editor)
- [ ] Implement backend document analysis tools for AI agents to read uploaded files
- [ ] Test file upload flow and AI document access
- [ ] Verify all tracking tables are populated correctly