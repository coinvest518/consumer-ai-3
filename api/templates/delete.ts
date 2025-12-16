import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase environment variables on server');
  return createClient(supabaseUrl, supabaseKey);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const userId = req.headers['user-id'] as string;
  if (!userId) return res.status(400).json({ error: 'Missing user-id header' });

  const { templateId } = req.body as any;
  if (!templateId) return res.status(400).json({ error: 'Missing templateId' });

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('user_templates').delete().eq('user_id', userId).eq('template_id', templateId);

    if (error) {
      console.error('Supabase delete error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ data });
  } catch (err: any) {
    console.error('Server error deleting template:', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
