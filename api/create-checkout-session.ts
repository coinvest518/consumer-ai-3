import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { supabase } from '../src/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

const PLAN_PRICE_IDS: Record<string, string> = {
  pro: 'price_1RpXqHE4H116aDHAOzDlxOai', // $49.99 - Fixed: use price ID not product ID
  power: 'price_1RpXqHE4H116aDHAOzDlxOai', // $99.99
  starter: 'price_1RHZCqE4H116aDHAxIjzdR6b', // $9.99
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

    // Check if user exists in Supabase
    const { data: user, error } = await supabase.from('users').select('id').eq('id', userId).single();
    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: 'https://consumerai.info/thank-you?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://consumerai.info/pricing',
      client_reference_id: userId,
      metadata: { userId, plan }
    });
    
    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: 'Failed to create checkout session', details: err.message });
  }
}
