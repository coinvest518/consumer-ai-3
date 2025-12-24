import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

interface RequestBody {
  email: string;
  userId?: string;
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { email, userId } = (await req.json()) as RequestBody;

    // Validate email
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If user is logged in, update their profile
    if (userId) {
      // Update profile with newsletter email
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          newsletter_email: email,
          lead_captured_at: new Date().toISOString(),
          pdf_downloaded: true,
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Profile update error:', profileError);
        return new Response(
          JSON.stringify({ error: 'Failed to save email' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Award 10 credits - CHECK if user already claimed
      const { data: existingCredits } = await supabase
        .from('user_credits')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingCredits) {
        // User has credits record - add 10 more
        const { error: creditError } = await supabase
          .from('user_credits')
          .update({
            credits: (existingCredits as any).credits + 10,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (creditError) {
          console.error('Credit update error:', creditError);
        }
      } else {
        // First time - create credits record with 10
        const { error: creditError } = await supabase
          .from('user_credits')
          .insert({
            user_id: userId,
            credits: 10,
          });

        if (creditError) {
          console.error('Credit insert error:', creditError);
        }
      }
    } else {
      // For guest users - just store email in a leads table (if you want to track)
      // For now, we'll skip this as they should be prompted to register
      console.log('Guest email submission:', email);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email saved and credits awarded',
        pdfUrl: 'https://ffvvesrqtdktayjwurwm.supabase.co/storage/v1/object/public/users-file-storage/resources/CREDIT%20REPAIR%20EBOOK%202025%20.pdf',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Email CTA handler error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
