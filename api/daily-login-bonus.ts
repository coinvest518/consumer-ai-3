import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../src/lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  try {
    // Check if user already logged in today
    const { data: existingLogin, error: checkError } = await supabase
      .from('daily_login_bonuses')
      .select('streak_count')
      .eq('user_id', userId)
      .eq('login_date', today)
      .single();

    if (existingLogin) {
      return res.status(200).json({
        success: true,
        alreadyClaimed: true,
        streakCount: existingLogin.streak_count
      });
    }

    // Check if user missed any days (streak reset logic)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const { data: yesterdayLogin, error: yesterdayError } = await supabase
      .from('daily_login_bonuses')
      .select('streak_count, login_date')
      .eq('user_id', userId)
      .eq('login_date', yesterdayStr)
      .single();

    let streakCount = 1;
    let missedDays = false;

    if (yesterdayLogin) {
      // Logged in yesterday, continue streak
      streakCount = yesterdayLogin.streak_count + 1;
    } else {
      // Check if they logged in within the last 7 days to determine if streak should reset
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];

      const { data: recentLogins, error: recentError } = await supabase
        .from('daily_login_bonuses')
        .select('login_date')
        .eq('user_id', userId)
        .gte('login_date', weekAgoStr)
        .order('login_date', { ascending: false })
        .limit(1);

      if (recentLogins && recentLogins.length > 0) {
        // They logged in within the last week but not yesterday - streak resets to 1
        streakCount = 1;
        missedDays = true;
      } else {
        // First time or very long break - start fresh
        streakCount = 1;
      }
    }

    // Calculate credits: 3 base + 1 bonus per streak day (max 10 bonus)
    const baseCredits = 3;
    const streakBonus = Math.min(streakCount - 1, 10); // Max 10 bonus credits
    const totalCredits = baseCredits + streakBonus;

    // Insert daily login record
    const { error: insertError } = await supabase
      .from('daily_login_bonuses')
      .insert([{
        user_id: userId,
        login_date: today,
        credits_awarded: totalCredits,
        streak_count: streakCount
      }]);

    if (insertError) {
      return res.status(500).json({ error: 'Failed to record daily login', details: insertError.message });
    }

    // Award credits to user
    const { data: userCredit, error: selectError } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Failed to check user credits', details: selectError.message });
    }

    let updateError = null;
    if (userCredit) {
      const { error } = await supabase
        .from('user_credits')
        .update({ credits: userCredit.credits + totalCredits })
        .eq('user_id', userId);
      updateError = error;
    } else {
      const { error } = await supabase
        .from('user_credits')
        .insert([{ user_id: userId, credits: totalCredits }]);
      updateError = error;
    }

    if (updateError) {
      return res.status(500).json({ error: 'Failed to award credits', details: updateError.message });
    }

    // Emit Socket.IO events via HTTP request to Render service
    const renderApiUrl = process.env.RENDER_API_URL || 'https://consumer-ai-render.onrender.com';
    const emitEventUrl = `${renderApiUrl}/api/emit-event`;

    try {
      await fetch(emitEventUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'credits-updated',
          userId: userId,
          data: {
            creditsAwarded: totalCredits,
            source: 'daily-login',
            streakCount: streakCount,
            totalCredits: userCredit ? userCredit.credits + totalCredits : totalCredits
          }
        })
      });
    } catch (socketError) {
      console.error('Error emitting daily login event:', socketError);
    }

    return res.status(200).json({
      success: true,
      creditsAwarded: totalCredits,
      streakCount: streakCount,
      baseCredits: baseCredits,
      streakBonus: streakBonus,
      streakReset: missedDays
    });

  } catch (error) {
    console.error('Error processing daily login bonus:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}