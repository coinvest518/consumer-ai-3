import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../src/lib/supabase';

// POST /api/credit-builder
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, builderId, points } = req.body;
  if (!userId || !builderId || !points) {
    return res.status(400).json({ error: 'Missing userId, builderId, or points' });
  }

  // Log the click in Supabase (table: credit_builder_clicks)
  const { error: insertError } = await supabase
    .from('credit_builder_clicks')
    .insert([{ user_id: userId, link_id: builderId, clicked_at: new Date().toISOString() }]);

  if (insertError) {
    return res.status(500).json({ error: 'Failed to log click', details: insertError.message });
  }


  // Award credits (table: user_credits)
  // Try to increment credits if user row exists, otherwise insert
  const { data: userCredit, error: selectError } = await supabase
    .from('user_credits')
    .select('credits')
    .eq('user_id', userId)
    .single();

  if (selectError && selectError.code !== 'PGRST116') { // PGRST116: No rows found
    return res.status(500).json({ error: 'Failed to check user credits', details: selectError.message });
  }

  let updateError = null;
  if (userCredit) {
    // Row exists, increment credits by the points value
    const { error } = await supabase
      .from('user_credits')
      .update({ credits: userCredit.credits + points })
      .eq('user_id', userId);
    updateError = error;
  } else {
    // Row does not exist, insert new with points value
    const { error } = await supabase
      .from('user_credits')
      .insert([{ user_id: userId, credits: points }]);
    updateError = error;
  }

  if (updateError) {
    return res.status(500).json({ error: 'Failed to award credits', details: updateError.message });
  }

  // Emit Socket.IO events via HTTP request to Render service
  const renderApiUrl = process.env.RENDER_API_URL || 'https://consumer-ai-render.onrender.com';
  const emitEventUrl = `${renderApiUrl}/api/emit-event`;

  try {
    // Emit credits-updated event
    await fetch(emitEventUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'credits-updated',
        userId: userId,
        data: {
          creditsAwarded: points,
          source: 'credit-builder',
          totalCredits: userCredit ? userCredit.credits + points : points
        }
      })
    });
  } catch (socketError) {
    console.error('Error emitting credits-updated event:', socketError);
    // Don't fail the credit award if socket emission fails
  }

  return res.status(200).json({ success: true });
}
