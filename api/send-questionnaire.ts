import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase env vars');
  return createClient(supabaseUrl, supabaseKey);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const payload = req.body || {};
    const {
      name,
      email,
      phone,
      creditScore,
      goals,
      timeline,
      experience,
      budget,
      additionalInfo,
      userId,
    } = payload;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    const FROM_EMAIL = process.env.FROM_EMAIL || process.env.SUPPORT_EMAIL || 'no-reply@consumerai.info';
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL || 'hello@consumerai.info';

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      console.error('SMTP not configured');
      return res.status(500).json({ error: 'Email server not configured on server' });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const subject = `New Credit Questionnaire from ${name}`;
    const html = `
      <h2>New Credit Building Questionnaire</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || '—'}</p>
      <p><strong>Credit Score:</strong> ${creditScore || '—'}</p>
      <p><strong>Goals:</strong> ${goals || '—'}</p>
      <p><strong>Timeline:</strong> ${timeline || '—'}</p>
      <p><strong>Experience:</strong> ${experience || '—'}</p>
      <p><strong>Budget:</strong> ${budget || '—'}</p>
      <p><strong>Additional Info:</strong> ${additionalInfo || '—'}</p>
      <p><small>Submitted at: ${new Date().toISOString()}</small></p>
    `;

    // send email to admin, BCC user
    const mailOptions = {
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      bcc: email,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    // Log email in Supabase email_logs table
    try {
      const supabase = getSupabaseClient();
      await supabase.from('email_logs').insert([{ 
        email_type: 'questionnaire',
        recipient_email: ADMIN_EMAIL,
        payload: JSON.stringify({ name, email, phone, creditScore, goals, timeline, experience, budget, additionalInfo, userId, mailInfo: info }),
      }]);
    } catch (logErr) {
      console.error('Failed to log email:', logErr);
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('send-questionnaire error:', err);
    return res.status(500).json({ error: err?.message || 'Internal server error' });
  }
}
