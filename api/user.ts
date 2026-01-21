import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

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

    // GET /api/user/credits
    if (url.includes('/user/credits') && req.method === 'GET') {
      const userId = req.headers['user-id'] as string;
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid userId' });
      }

      const { data, error } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', userId)
        .single();

      if (error) return res.status(500).json({ error: error.message });
      if (!data) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json({ credits: data.credits });
    }

    // GET /api/user/files
    if (url.includes('/user/files') && req.method === 'GET') {
      const userId = req.headers['user-id'] as string;
      if (!userId) {
        return res.status(401).json({ error: 'User ID required' });
      }

      // Development mock
      if (process.env.NODE_ENV === 'development' && userId === 'dev-user') {
        const mockFiles = [
          {
            id: 'mock-1',
            name: 'sample_credit_report.pdf',
            path: 'credit-reports/dev-user/sample_credit_report.pdf',
            size: 245760,
            type: 'application/pdf',
            bucket: 'users-file-storage',
            uploadedAt: new Date().toISOString(),
            analysisStatus: 'completed'
          }
        ];

        return res.status(200).json({ files: mockFiles, stats: { totalFiles: 1, totalSize: 245760, maxStorage: 104857600, maxFiles: 50, usagePercentage: 0 } });
      }

      const { data: files, error } = await supabase
        .from('storage_usage')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user files:', error);
        return res.status(500).json({ error: 'Failed to fetch files' });
      }

      const { data: limits } = await supabase
        .from('storage_limits')
        .select('*')
        .eq('user_id', userId)
        .single();

      const totalFiles = files?.length || 0;
      const totalSize = files?.reduce((sum: any, file: any) => sum + (file.file_size || 0), 0) || 0;
      const maxStorage = limits?.max_storage_bytes || 104857600;
      const maxFiles = limits?.max_files || 50;

      const formattedFiles = files?.map((file: any) => ({
        id: file.id,
        name: file.file_name,
        path: file.file_path,
        size: file.file_size,
        type: file.file_type,
        bucket: file.storage_bucket,
        uploadedAt: file.created_at,
        analysisStatus: file.file_path.includes('credit-reports') ? 'completed' : 'pending'
      })) || [];

      return res.status(200).json({ files: formattedFiles, stats: { totalFiles, totalSize, maxStorage, maxFiles, usagePercentage: Math.round((totalSize / maxStorage) * 100) } });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err: any) {
    console.error('Error in user API:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
