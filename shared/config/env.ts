export const env = {
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || '',
  SUPABASE_KEY: process.env.VITE_SUPABASE_ANON_KEY || '', // Alias for ANON_KEY
  ASTRA_DB_APPLICATION_TOKEN: process.env.VITE_ASTRA_DB_APPLICATION_TOKEN || '',
  API_BASE_URL: process.env.VITE_API_BASE_URL || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  IS_VERCEL: process.env.VERCEL || false
};
