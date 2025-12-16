# Dashboard Database Setup Guide

## 🗄️ Database Migration

### Step 1: Run the SQL Migration in Supabase

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of: `supabase/migrations/20250101_dashboard_tracking.sql`
6. Click **Run** to execute the migration

This will create 4 new tables:
- ✅ `disputes` - Track credit dispute letters
- ✅ `certified_mail` - Track USPS certified mail
- ✅ `complaints` - Track CFPB/FTC complaints
- ✅ `calendar_events` - Track deadlines and events

### Step 2: Verify Tables Were Created

Run this query in SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('disputes', 'certified_mail', 'complaints', 'calendar_events');
```

You should see all 4 tables listed.

### Step 3: Verify RLS Policies

Run this query:
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('disputes', 'certified_mail', 'complaints', 'calendar_events');
```

You should see policies for SELECT, INSERT, UPDATE, DELETE for each table.

## 📁 Files Created/Modified

### New Files:
1. ✅ `supabase/migrations/20250101_dashboard_tracking.sql` - Database schema
2. ✅ `src/lib/dashboard-api.ts` - API helper functions
3. ✅ `DASHBOARD_REDESIGN.md` - Documentation
4. ✅ `SETUP_DASHBOARD_DATABASE.md` - This file

### Modified Files:
1. ✅ `src/pages/EnhancedDashboard.tsx` - Complete redesign with real data
2. ✅ `src/components/ui/calendar.tsx` - Fixed calendar styling
3. ✅ `src/styles/globals.css` - Added calendar CSS
4. ✅ `src/index.css` - Added dispute status styles

## 🎨 Calendar Component

The calendar now uses proper `react-day-picker` styling with:
- ✅ Proper grid layout (7 columns for days of week)
- ✅ Aligned dates
- ✅ Navigation arrows
- ✅ Today highlighting
- ✅ Selected date styling
- ✅ Outside days (previous/next month) with opacity

## 🔧 API Functions Available

### Disputes API
```typescript
import { disputesApi } from '@/lib/dashboard-api';

// Get all disputes for user
const disputes = await disputesApi.getAll(userId);

// Create new dispute
const newDispute = await disputesApi.create({
  user_id: userId,
  title: "Dispute with Equifax",
  bureau: "Equifax",
  status: "pending",
  date_sent: new Date().toISOString()
});

// Update dispute
await disputesApi.update(disputeId, { status: "sent" });

// Delete dispute
await disputesApi.delete(disputeId);
```

### Certified Mail API
```typescript
import { certifiedMailApi } from '@/lib/dashboard-api';

// Get all mail tracking
const mail = await certifiedMailApi.getAll(userId);

// Add tracking number
const newMail = await certifiedMailApi.create({
  user_id: userId,
  tracking_number: "9400123456789",
  recipient: "Equifax",
  date_mailed: new Date().toISOString(),
  status: "mailed"
});

// Update status
await certifiedMailApi.update(mailId, { 
  status: "delivered",
  date_delivered: new Date().toISOString()
});
```

### Complaints API
```typescript
import { complaintsApi } from '@/lib/dashboard-api';

// Get all complaints
const complaints = await complaintsApi.getAll(userId);

// File new complaint
const newComplaint = await complaintsApi.create({
  user_id: userId,
  agency: "CFPB",
  complaint_number: "12345",
  date_filed: new Date().toISOString(),
  status: "filed",
  response_received: false
});
```

### Calendar Events API
```typescript
import { calendarEventsApi } from '@/lib/dashboard-api';

// Get all events
const events = await calendarEventsApi.getAll(userId);

// Get events in date range
const rangeEvents = await calendarEventsApi.getByDateRange(
  userId,
  "2025-01-01",
  "2025-01-31"
);

// Create event
const newEvent = await calendarEventsApi.create({
  user_id: userId,
  title: "FCRA 30-day deadline",
  event_date: new Date().toISOString(),
  event_type: "deadline",
  is_completed: false
});
```

## 🚀 Testing the Dashboard

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Login to your app**

3. **Navigate to Dashboard** (`/dashboard`)

4. **Test each tab:**
   - ✅ Calendar - Should show calendar with proper grid
   - ✅ Disputes - Click "New Dispute" to create
   - ✅ Mail Tracking - Add tracking numbers
   - ✅ Complaints - File complaints
   - ✅ Contacts - View bureau contact info

## 📊 Database Schema

### disputes table
```sql
- id (UUID, PK)
- user_id (UUID, FK to auth.users)
- title (TEXT)
- bureau (TEXT) - Equifax, Experian, TransUnion
- description (TEXT)
- status (TEXT) - pending, sent, resolved, escalated
- date_sent (TIMESTAMPTZ)
- date_received (TIMESTAMPTZ)
- tracking_number (TEXT)
- response_deadline (TIMESTAMPTZ)
- metadata (JSONB)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### certified_mail table
```sql
- id (UUID, PK)
- user_id (UUID, FK to auth.users)
- tracking_number (TEXT)
- recipient (TEXT)
- description (TEXT)
- date_mailed (TIMESTAMPTZ)
- date_delivered (TIMESTAMPTZ)
- status (TEXT) - mailed, in_transit, delivered, returned
- metadata (JSONB)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### complaints table
```sql
- id (UUID, PK)
- user_id (UUID, FK to auth.users)
- agency (TEXT) - CFPB, FTC, State AG
- complaint_number (TEXT)
- description (TEXT)
- date_filed (TIMESTAMPTZ)
- status (TEXT) - filed, under_review, resolved, closed
- response_received (BOOLEAN)
- response_date (TIMESTAMPTZ)
- metadata (JSONB)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### calendar_events table
```sql
- id (UUID, PK)
- user_id (UUID, FK to auth.users)
- title (TEXT)
- description (TEXT)
- event_date (TIMESTAMPTZ)
- event_type (TEXT) - deadline, mailed, delivered, reminder, response
- related_id (UUID) - Links to dispute/mail/complaint
- related_type (TEXT)
- is_completed (BOOLEAN)
- metadata (JSONB)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

## 🔒 Security (RLS Policies)

All tables have Row Level Security enabled with policies:
- ✅ Users can only SELECT their own data
- ✅ Users can only INSERT data for themselves
- ✅ Users can only UPDATE their own data
- ✅ Users can only DELETE their own data

## 🎯 Next Steps

1. **Run the migration** in Supabase SQL Editor
2. **Test the dashboard** - Create disputes, add tracking numbers
3. **Customize** - Add more fields or features as needed
4. **Add notifications** - Email/SMS for deadlines
5. **Add PDF generation** - Export dispute letters
6. **Add USPS API** - Auto-track certified mail

## 🐛 Troubleshooting

### Calendar not showing properly?
- Clear browser cache
- Check console for errors
- Verify `react-day-picker` is installed: `npm list react-day-picker`

### Data not saving?
- Check Supabase connection in browser console
- Verify RLS policies are enabled
- Check user is authenticated

### Tables not created?
- Re-run the migration SQL
- Check for SQL errors in Supabase dashboard
- Verify you have admin access to the project

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Verify environment variables are set
4. Ensure user is authenticated
