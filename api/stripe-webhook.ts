import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

// Create a server-side Supabase client using server env vars
function getSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
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
  const endpointSecret = process.env.VITE_STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !endpointSecret) {
    console.error('Missing stripe signature or webhook secret');
    return res.status(400).json({ error: 'Invalid webhook' });
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
        return res.status(200).json({ received: true });
      }

      const subscriptionId = session.subscription as string;
      let subscriptionData = null;

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        subscriptionData = {
          subscription_id: subscription.id,
          status: subscription.status,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
        };
      }

      const creditsToAdd = plan === 'starter' ? 100 : plan === 'pro' ? 300 : plan === 'power' ? 1500 : 0;
      
      await supabase.from('purchases').insert({
        user_id: userId,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        credits: creditsToAdd,
        stripe_session_id: session.id,
        status: 'completed',
        metadata: {
          payment_status: session.payment_status,
          customer_email: session.customer_details?.email,
          plan,
          subscription: subscriptionData,
          mode: session.mode,
        }
      });

      const { data: currentCredits } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', userId)
        .single();

      const newCredits = (currentCredits?.credits || 0) + creditsToAdd;

      await supabase
        .from('user_credits')
        .upsert({
          user_id: userId,
          credits: newCredits,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      await supabase
        .from('profiles')
        .update({
          is_pro: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      console.log('Purchase recorded:', { userId, plan, mode: session.mode });
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Webhook processing error:', err?.message);
    return res.status(200).json({ received: true });
  }
}