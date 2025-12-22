import { createClient } from '@supabase/supabase-js';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Update the auth state change handler
supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
  console.log('Supabase auth event:', event);
  console.log('Session:', session);
});

console.log('Supabase client initialized with URL:', supabaseUrl);

export type Profile = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  is_pro: boolean;
  created_at: string;
  updated_at: string;
};