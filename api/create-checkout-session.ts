import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
// Create a server-side Supabase client using server env vars
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnon = process.env.SUPABASE_ANON_KEY;
  const supabaseKey = supabaseServiceKey || supabaseAnon;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables on server');
  }
  const keyType = supabaseServiceKey ? 'service_role' : (supabaseAnon ? 'anon' : 'none');
  console.log('getSupabaseClient: using key type', keyType, 'for url', supabaseUrl);
  return createClient(supabaseUrl, supabaseKey);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

const PLAN_PRICE_IDS: Record<string, string> = {
  starter: 'price_1RHZCqE4H116aDHAxIjzdR6b', // $9.99 - 100 credits
  pro: 'price_1RmN5HE4H116aDHAvguWb41W', // $50.00 - 300 credits
  power: 'price_1RpXqHE4H116aDHAOzDlxOai', // $99.99 - 1500 credits
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan, userId } = req.body;
    if (!plan || !userId) {
      return res.status(400).json({ error: 'Missing plan or userId' });
    }
    
    const priceId = PLAN_PRICE_IDS[plan];
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Check environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not configured');
      return res.status(500).json({ error: 'Payment system not configured' });
    }

    // Check if user exists in Supabase (server-side client)
    const supabase = getSupabaseClient();
    const { data: user, error } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
    if (error) {
      console.error('Supabase query error:', error);
      const details = process.env.NODE_ENV === 'production' ? undefined : (error.message || error);
      return res.status(500).json({ error: 'Database query failed', details });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const origin = req.headers.origin || 'https://consumerai.info';

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      ui_mode: 'embedded',
      redirect_on_completion: 'never',
      client_reference_id: userId,
      metadata: { userId, plan },
    });
    
    return res.status(200).json({ clientSecret: session.client_secret });
  } catch (err: any) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: 'Failed to create checkout session', details: err.message });
  }
}
