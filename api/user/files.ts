import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase not configured on server' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user ID from header
    const userId = req.headers['user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    // In development mode with dev user, return mock data
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
        },
        {
          id: 'mock-2',
          name: 'bank_statement.jpg',
          path: 'credit-reports/dev-user/bank_statement.jpg',
          size: 512000,
          type: 'image/jpeg',
          bucket: 'users-file-storage',
          uploadedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          analysisStatus: 'pending'
        }
      ];

      return res.status(200).json({
        files: mockFiles,
        stats: {
          totalFiles: 2,
          totalSize: 757760,
          maxStorage: 104857600, // 100MB
          maxFiles: 50,
          usagePercentage: 1
        }
      });
    }

    // Query storage_usage table for user's files
    const { data: files, error } = await supabase
      .from('storage_usage')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null) // Only active files
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user files:', error);
      return res.status(500).json({ error: 'Failed to fetch files' });
    }

    // Get storage limits for the user
    const { data: limits } = await supabase
      .from('storage_limits')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Calculate usage stats
    const totalFiles = files?.length || 0;
    const totalSize = files?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0;
    const maxStorage = limits?.max_storage_bytes || 104857600; // Default 100MB
    const maxFiles = limits?.max_files || 50;

    // Format files for frontend
    const formattedFiles = files?.map(file => ({
      id: file.id,
      name: file.file_name,
      path: file.file_path,
      size: file.file_size,
      type: file.file_type,
      bucket: file.storage_bucket,
      uploadedAt: file.created_at,
      // Add analysis status (this could be enhanced with actual analysis tracking)
      analysisStatus: file.file_path.includes('credit-reports') ? 'completed' : 'pending'
    })) || [];

    res.status(200).json({
      files: formattedFiles,
      stats: {
        totalFiles,
        totalSize,
        maxStorage,
        maxFiles,
        usagePercentage: Math.round((totalSize / maxStorage) * 100)
      }
    });

  } catch (error) {
    console.error('Error in user files API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}