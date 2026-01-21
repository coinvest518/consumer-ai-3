import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase environment variables on server');
  return createClient(supabaseUrl, supabaseKey);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = req.url || '';
    const supabase = getSupabaseClient();

    // Save template: POST /api/templates/save
    if (url.includes('/templates/save') && req.method === 'POST') {
      const userId = req.headers['user-id'] as string;
      if (!userId) return res.status(400).json({ error: 'Missing user-id header' });

      const { templateId, name, type, fullContent, creditCost, metadata } = req.body as any;
      if (!templateId || !name || !type || !fullContent) {
        return res.status(400).json({ error: 'Missing template data' });
      }

      const { data, error } = await supabase.from('user_templates').insert([{ 
        user_id: userId,
        template_id: templateId,
        name,
        type,
        full_content: fullContent,
        credit_cost: creditCost || 0,
        metadata: metadata || {}
      }]).select().single();

      if (error) {
        console.error('Supabase insert error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ data });
    }

    // List templates: GET /api/templates/list
    if (url.includes('/templates/list') && req.method === 'GET') {
      const userId = req.headers['user-id'] as string;
      if (!userId) return res.status(400).json({ error: 'Missing user-id header' });

      const { data, error } = await supabase.from('user_templates').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase select error:', error);
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json({ data });
    }

    // Delete template: POST /api/templates/delete
    if (url.includes('/templates/delete') && req.method === 'POST') {
      const userId = req.headers['user-id'] as string;
      if (!userId) return res.status(400).json({ error: 'Missing user-id header' });

      const { templateId } = req.body as any;
      if (!templateId) return res.status(400).json({ error: 'Missing templateId' });

      const { data, error } = await supabase.from('user_templates').delete().eq('user_id', userId).eq('template_id', templateId);
      if (error) {
        console.error('Supabase delete error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ data });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err: any) {
    console.error('Server error in templates route:', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
