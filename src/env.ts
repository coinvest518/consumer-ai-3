// Environment configuration
export const env = {
  NODE_ENV: import.meta.env.MODE || 'development',
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  SUPABASE_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '', // Alias for ANON_KEY
  ASTRA_DB_APPLICATION_TOKEN: import.meta.env.VITE_ASTRA_DB_APPLICATION_TOKEN || '',
  STRIPE_SECRET_KEY: import.meta.env.VITE_STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET || '',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  IS_VERCEL: import.meta.env.VERCEL || false
};
