import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
// Only used by admin sync endpoint - can remove if you delete sync functionality
import { tradelineInventory } from '../src/data/tradelineInventory';

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase environment variables on server');
  return createClient(supabaseUrl, supabaseKey);
}

// Helper to generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `TL-${timestamp}-${random}`;
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

    // POST /api/user/tradelines/sign-agreement
    if (url.includes('/user/tradelines/sign-agreement') && req.method === 'POST') {
      const { userId, fullName, email, phone, signatureImage, timestamp, ipAddress } = req.body;
      if (!userId || !fullName || !email || !signatureImage) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { data, error } = await supabase
        .from('signed_agreements')
        .insert({
          user_id: userId,
          full_name: fullName,
          email,
          phone,
          signature_data: signatureImage,
          ip_address: ipAddress,
          user_agent: req.headers['user-agent'],
          is_valid: true
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to save agreement' });
      }

      return res.status(200).json({ success: true, agreementId: data.id, message: 'Agreement signed successfully' });
    }

    // POST /api/user/tradelines/create-order
    if (url.includes('/user/tradelines/create-order') && req.method === 'POST') {
      const { userId, tradelineId, quantity = 1, agreementId } = req.body;
      if (!userId || !tradelineId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Get tradeline details and check stock
      const { data: tradeline, error: tradelineError } = await supabase
        .from('tradelines')
        .select('*')
        .eq('id', tradelineId)
        .single();

      if (tradelineError || !tradeline) {
        return res.status(404).json({ error: 'Tradeline not found' });
      }

      if (tradeline.stock_count < quantity) {
        return res.status(409).json({ error: 'Insufficient stock' });
      }

      // Create order
      const orderNumber = generateOrderNumber();
      const { data: order, error: orderError } = await supabase
        .from('tradeline_orders')
        .insert({
          user_id: userId,
          tradeline_id: tradelineId,
          quantity,
          price: tradeline.price,
          status: 'pending',
          order_number: orderNumber
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        return res.status(500).json({ error: 'Failed to create order' });
      }

      // Link agreement if provided
      if (agreementId) {
        await supabase.from('signed_agreements').update({ order_id: order.id }).eq('id', agreementId);
      }

      return res.status(201).json({
        success: true,
        order: {
          id: order.id,
          orderNumber: order.order_number,
          total: order.price * quantity,
          tradeline: { bank: tradeline.bank_name, limit: tradeline.credit_limit, price: tradeline.price }
        },
        message: 'Order created successfully'
      });
    }

    // POST /api/user/tradelines/sync (ADMIN)
    if (url.includes('/user/tradelines/sync') && req.method === 'POST') {
      const synced = [];
      const errors = [];

      for (const item of tradelineInventory) {
        try {
          const { error: deleteError } = await supabase.from('tradelines').delete().eq('card_id', item.cardId);
          if (deleteError && deleteError.code !== 'PGRST116') throw deleteError;

          const { data, error } = await supabase
            .from('tradelines')
            .insert({
              card_id: item.cardId,
              bank_name: item.bank,
              credit_limit: item.creditLimit,
              account_age_years: parseInt(item.accountAge.split('y')[0]),
              account_age_months: parseInt(item.accountAge.split('y')[1].split('m')[0]),
              purchase_deadline: new Date(item.purchaseDeadline).toISOString(),
              reporting_period_start: new Date(item.reportingStart).toISOString(),
              reporting_period_end: new Date(item.reportingEnd).toISOString(),
              price: item.price,
              stock_count: item.stock,
              guarantees: {
                no_late_payments: item.guarantees?.noLatePayments || true,
                utilization_percent: item.guarantees?.utilizationPercent || 15,
                guaranteed_post_date: item.guarantees?.guaranteedPostDate || item.reportingEnd
              },
              is_active: item.active !== false
            })
            .select()
            .single();

          if (error) throw error;
          synced.push({ cardId: item.cardId, bank: item.bank, success: true });
        } catch (err) {
          errors.push({ cardId: item.cardId, error: err instanceof Error ? err.message : 'Unknown error' });
        }
      }

      return res.status(200).json({
        success: true,
        message: `Synced ${synced.length} tradelines`,
        synced,
        errors: errors.length > 0 ? errors : undefined
      });
    }

    // POST /api/user/tradelines/seed-data (ADMIN)
    if (url.includes('/user/tradelines/seed-data') && req.method === 'POST') {
      await supabase.from('tradelines').delete().gt('id', '0');

      const sampleTradelines = [
        {
          card_id: '22688',
          bank_name: 'CP1',
          credit_limit: 7000,
          account_age_years: 4,
          account_age_months: 4,
          purchase_deadline: new Date('2026-03-01').toISOString(),
          reporting_period_start: new Date('2026-03-12').toISOString(),
          reporting_period_end: new Date('2026-03-19').toISOString(),
          price: 336,
          stock_count: 3,
          guarantees: { no_late_payments: true, utilization_percent: 15, guaranteed_post_date: '2026-03-19' },
          is_active: true
        },
        {
          card_id: '14412',
          bank_name: 'Barclays',
          credit_limit: 5000,
          account_age_years: 5,
          account_age_months: 3,
          purchase_deadline: new Date('2026-02-26').toISOString(),
          reporting_period_start: new Date('2026-03-09').toISOString(),
          reporting_period_end: new Date('2026-03-16').toISOString(),
          price: 336,
          stock_count: 2,
          guarantees: { no_late_payments: true, utilization_percent: 15, guaranteed_post_date: '2026-03-16' },
          is_active: true
        },
        {
          card_id: '1139',
          bank_name: 'Discover',
          credit_limit: 10500,
          account_age_years: 2,
          account_age_months: 1,
          purchase_deadline: new Date('2026-02-22').toISOString(),
          reporting_period_start: new Date('2026-03-05').toISOString(),
          reporting_period_end: new Date('2026-03-12').toISOString(),
          price: 390,
          stock_count: 5,
          guarantees: { no_late_payments: true, utilization_percent: 15, guaranteed_post_date: '2026-03-12' },
          is_active: true
        },
        {
          card_id: '22830',
          bank_name: 'Chase',
          credit_limit: 10000,
          account_age_years: 14,
          account_age_months: 9,
          purchase_deadline: new Date('2026-03-05').toISOString(),
          reporting_period_start: new Date('2026-03-09').toISOString(),
          reporting_period_end: new Date('2026-03-16').toISOString(),
          price: 780,
          stock_count: 1,
          guarantees: { no_late_payments: true, utilization_percent: 15, guaranteed_post_date: '2026-03-16' },
          is_active: true
        }
      ];

      const { data, error } = await supabase.from('tradelines').insert(sampleTradelines).select();
      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: `Seeded ${data?.length || 0} tradelines`,
        tradelines: data
      });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err: any) {
    console.error('Error in user API:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
