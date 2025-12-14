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
    console.error('Webhook signature verification failed:', err.message?.replace(/[\r\n\t]/g, '_'));
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

      // For subscriptions, we get subscription details
      const subscriptionId = session.subscription as string;
      let subscriptionData = null;

      if (subscriptionId) {
        // Fetch subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        subscriptionData = {
          subscription_id: subscription.id,
          status: subscription.status,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
        };
      }

      // Record the purchase/subscription
      const creditsToAdd = plan === 'starter' ? 100 : plan === 'pro' ? 300 : plan === 'power' ? 1500 : 0;
      
      const { error: purchaseError } = await supabase.from('purchases').insert({
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
          mode: session.mode, // 'subscription' or 'payment'
        }
      });

      if (purchaseError) {
        console.error('Error recording purchase:', purchaseError?.message?.replace(/[\r\n\t]/g, '_') || 'Unknown error');
        return res.status(500).json({ error: 'Failed to record purchase' });
      }

      // Update or insert user credits
      const { data: currentCredits } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', userId)
        .single();

      const newCredits = (currentCredits?.credits || 0) + creditsToAdd;

      const { error: creditsError } = await supabase
        .from('user_credits')
        .upsert({
          user_id: userId,
          credits: newCredits,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (creditsError) {
        console.error('Error updating credits:', creditsError?.message?.replace(/[\r\n\t]/g, '_') || 'Unknown error');
        // Don't fail for this, but log it
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
        console.error('Error updating profile:', {
          code: profileError?.code,
          message: profileError?.message?.replace(/[\r\n\t]/g, '_')
        });
        // Don't fail the webhook for this, but log it
      }

      console.log('Purchase/subscription recorded', {
        userId: userId?.replace(/[\r\n\t]/g, '_'),
        plan: plan?.replace(/[\r\n\t]/g, '_'),
        mode: session.mode
      });
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Webhook processing error:', err?.message?.replace(/[\r\n\t]/g, '_') || 'Unknown error');
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}