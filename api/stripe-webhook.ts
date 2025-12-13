import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  try {
    const supabase = getSupabaseClient();

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, plan } = session.metadata || {};

      if (!userId || !plan) {
        console.error('Missing userId or plan in session metadata');
        return res.status(400).json({ error: 'Missing metadata' });
      }

      // Record the purchase
      const { error: purchaseError } = await supabase.from('purchases').insert({
        user_id: userId,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        credits: plan === 'starter' ? 100 : plan === 'pro' ? 300 : plan === 'power' ? 1500 : 0,
        stripe_session_id: session.id,
        status: 'completed',
        metadata: {
          payment_status: session.payment_status,
          customer_email: session.customer_details?.email,
          plan
        }
      });

      if (purchaseError) {
        console.error('Error recording purchase:', purchaseError);
        return res.status(500).json({ error: 'Failed to record purchase' });
      }

      // Update user profile to mark as pro
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_pro: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        // Don't fail the webhook for this, but log it
      }

      console.log(`Purchase recorded for user ${userId}, plan: ${plan}`);
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}