import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Server-side upload registration endpoint
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase not configured on server' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Expect Authorization: Bearer <access_token>
    const authHeader = (req.headers.authorization || req.headers.Authorization) as string | undefined;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token and get user
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return res.status(401).json({ error: 'Invalid auth token' });
    }

    const user = userData.user;

    const { filePath, fileName, fileSize, fileType, bucket } = req.body || {};
    if (!filePath || !fileName || !fileSize || !fileType || !bucket) {
      return res.status(400).json({ error: 'Missing required file information' });
    }

    // Insert record into storage_usage table
    const { error: insertError } = await supabase.from('storage_usage').insert([{
      user_id: user.id,
      file_path: filePath,
      file_name: fileName,
      file_size: fileSize,
      file_type: fileType,
      storage_bucket: bucket
    }]);

    if (insertError) {
      console.error('Error inserting storage_usage:', insertError);
      return res.status(500).json({ error: 'Failed to register upload' });
    }

    // Emit Socket.IO events via HTTP request to Render service
    const renderApiUrl = process.env.RENDER_API_URL || 'https://consumer-ai-render.onrender.com';
    const emitEventUrl = `${renderApiUrl}/api/emit-event`;

    try {
      // Emit upload-registered event
      await fetch(emitEventUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'upload-registered',
          userId: user.id,
          data: {
            filePath,
            fileName,
            fileSize,
            fileType,
            userId: user.id
          }
        })
      });

      // For credit reports, also emit analysis-started
      if (filePath.includes('credit-reports')) {
        await fetch(emitEventUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'analysis-started',
            userId: user.id,
            data: {
              message: 'Credit report analysis has begun',
              fileName,
              userId: user.id
            }
          })
        });
      }
    } catch (socketError) {
      console.error('Error emitting Socket.IO events:', socketError);
      // Don't fail the upload if Socket.IO emission fails
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Upload registration error:', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
