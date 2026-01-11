import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Create a server-side Supabase client using server env vars
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables on server');
  }
  return createClient(supabaseUrl, supabaseKey);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;
  const { table } = req.query; // disputes, certified_mail, complaints, calendar_events
  const supabase = getSupabaseClient();

  // Extract user ID from request
  const userId = req.headers['user-id'] || req.body?.userId || req.query?.userId;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  if (!table || typeof table !== 'string') {
    return res.status(400).json({ error: 'Table parameter is required' });
  }

  // Validate table name to prevent SQL injection
  const validTables = ['disputes', 'certified_mail', 'complaints', 'calendar_events'];
  if (!validTables.includes(table)) {
    return res.status(400).json({ error: 'Invalid table name' });
  }

  try {
    switch (method) {
      case 'GET': {
        let query = supabase
          .from(table)
          .select('*')
          .eq('user_id', userId);

        // Handle table-specific ordering and filters
        switch (table) {
          case 'disputes':
            query = query.order('created_at', { ascending: false });
            break;
          case 'certified_mail':
            query = query.order('date_mailed', { ascending: false });
            // Handle date range for calendar events
            const { startDate, endDate } = req.query;
            if (startDate) query = query.gte('date_mailed', startDate as string);
            if (endDate) query = query.lte('date_mailed', endDate as string);
            break;
          case 'complaints':
            query = query.order('date_filed', { ascending: false });
            break;
          case 'calendar_events':
            query = query.order('event_date', { ascending: true });
            // Handle date range for calendar events
            const { startDate: start, endDate: end } = req.query;
            if (start) query = query.gte('event_date', start as string);
            if (end) query = query.lte('event_date', end as string);
            break;
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        return res.status(200).json({ success: true, data });
      }

      case 'POST': {
        const recordData = req.body;
        const { data, error } = await supabase
          .from(table)
          .insert({
            ...recordData,
            user_id: userId
          })
          .select()
          .single();
        
        if (error) throw error;
        return res.status(201).json({ success: true, data });
      }

      case 'PUT': {
        const { id, ...updates } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Record ID is required for updates' });
        }

        const { data, error } = await supabase
          .from(table)
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', userId) // Ensure user can only update their own records
          .select()
          .single();
        
        if (error) throw error;
        return res.status(200).json({ success: true, data });
      }

      case 'DELETE': {
        const { id } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Record ID is required for deletion' });
        }

        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', id)
          .eq('user_id', userId); // Ensure user can only delete their own records
        
        if (error) throw error;
        return res.status(200).json({ success: true });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(`Dashboard API error for ${table}:`, error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}