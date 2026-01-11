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
  const supabase = getSupabaseClient();

  // Extract user ID from request
  const userId = req.headers['user-id'] || req.body?.userId || req.query?.userId;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    switch (method) {
      case 'GET': {
        const { startDate, endDate } = req.query;
        
        let query = supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', userId);
          
        // Add date range filters if provided
        if (startDate) {
          query = query.gte('event_date', startDate as string);
        }
        if (endDate) {
          query = query.lte('event_date', endDate as string);
        }
        
        const { data, error } = await query.order('event_date', { ascending: true });
        
        if (error) throw error;
        return res.status(200).json({ success: true, data });
      }

      case 'POST': {
        const eventData = req.body;
        const { data, error } = await supabase
          .from('calendar_events')
          .insert({
            ...eventData,
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
          return res.status(400).json({ error: 'Event ID is required for updates' });
        }

        const { data, error } = await supabase
          .from('calendar_events')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', userId) // Ensure user can only update their own events
          .select()
          .single();
        
        if (error) throw error;
        return res.status(200).json({ success: true, data });
      }

      case 'DELETE': {
        const { id } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Event ID is required for deletion' });
        }

        const { error } = await supabase
          .from('calendar_events')
          .delete()
          .eq('id', id)
          .eq('user_id', userId); // Ensure user can only delete their own events
        
        if (error) throw error;
        return res.status(200).json({ success: true });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Calendar Events API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}