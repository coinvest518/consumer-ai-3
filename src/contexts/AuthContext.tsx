import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  isPro: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  session: any;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: Error }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: Error; needsVerification?: boolean }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: Error }>;
  bypassAuth?: () => void; // DEV ONLY: Set a fake user for local testing
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Ensure a profile exists for the user, create if missing
const ensureProfileExists = async (supabaseUser: SupabaseUser) => {
  try {
    // Check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', supabaseUser.id)
      .single();

    if (!existingProfile) {
      // Profile doesn't exist, create it
      console.log('Creating profile for user:', supabaseUser.id);
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: supabaseUser.id,
          email: supabaseUser.email,
          is_pro: false, // Default to free tier
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
      } else {
        console.log('Profile created successfully for user:', supabaseUser.id);
      }
    }

    // Check if user_credits record exists
    const { data: existingCredits, error: creditsFetchError } = await supabase
      .from('user_credits')
      .select('id')
      .eq('user_id', supabaseUser.id)
      .single();

    if (!existingCredits) {
      // User credits don't exist, create them
      console.log('Creating user_credits for user:', supabaseUser.id);
      const { error: creditsInsertError } = await supabase
        .from('user_credits')
        .insert({
          user_id: supabaseUser.id,
          credits: 0, // Default to 0 credits
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (creditsInsertError) {
        console.error('Error creating user_credits:', creditsInsertError);
      } else {
        console.log('User credits created successfully for user:', supabaseUser.id);
      }
    }

    // Check if user_metrics record exists
    const { data: existingMetrics, error: metricsFetchError } = await supabase
      .from('user_metrics')
      .select('id')
      .eq('user_id', supabaseUser.id)
      .single();

    if (!existingMetrics) {
      // User metrics don't exist, create them
      console.log('Creating user_metrics for user:', supabaseUser.id);
      const { error: metricsInsertError } = await supabase
        .from('user_metrics')
        .insert({
          user_id: supabaseUser.id,
          chats_used: 0, // Default to 0 chats used
          daily_limit: 50, // Default daily limit
          last_reset: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (metricsInsertError) {
        console.error('Error creating user_metrics:', metricsInsertError);
      } else {
        console.log('User metrics created successfully for user:', supabaseUser.id);
      }
    }
  } catch (error) {
    console.error('Error in ensureProfileExists:', error);
    // Don't throw - allow auth to proceed even if profile/credits creation fails
  }
};

// Check and claim daily login bonus for authenticated users
const checkDailyLoginBonus = async (userId: string) => {
  try {
    const response = await fetch('/api/daily-login-bonus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();

    if (data.success && !data.alreadyClaimed) {
      console.log('Daily login bonus claimed:', data.creditsAwarded, 'credits, streak:', data.streakCount);
      // The notification will be handled by the socket event listener in useCredits hook
    }
  } catch (error) {
    console.error('Error checking daily login bonus:', error);
  }
};

// Convert Supabase user to our User type
const mapUser = (supabaseUser: SupabaseUser): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email ?? '',
  isPro: supabaseUser.user_metadata?.isPro ?? false,
  created_at: supabaseUser.created_at
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  // DEV ONLY: Bypass auth by setting a fake user
  const navigate = useNavigate();
  const bypassAuth = () => {
    if (import.meta.env.DEV) {
      setUser({
        id: 'dev-user',
        email: 'dev@local.test',
        isPro: true,
        created_at: new Date().toISOString(),
      });
      // Optionally, navigate to dashboard
      navigate('/dashboard');
    }
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Check active sessions and sets the user
    console.log("Checking initial session...");
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session:", currentSession);
      if (currentSession) {
        setUser(mapUser(currentSession.user));
      }
      setLoading(false);
    });

    // Handle hash fragment from OAuth redirects
    const handleHashChange = async () => {
      // Check if URL has hash parameters from auth redirect
      if (window.location.hash && window.location.hash.includes('access_token')) {
        console.log("Detected auth redirect with hash params");
        const { data, error } = await supabase.auth.getUser();
        if (data?.user && !error) {
          console.log("Successfully retrieved user from hash params");
          setUser(mapUser(data.user));
          // Remove the hash fragment from URL
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    };
    
    // Call it once on mount
    handleHashChange();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed:", event, currentSession);
      if (currentSession) {
        // Set user immediately without waiting for profile creation
        setUser(mapUser(currentSession.user));

        // Create profile/credits/metrics in background (non-blocking)
        ensureProfileExists(currentSession.user).catch(error => {
          console.error('Background profile creation failed:', error);
        });

        // Note: Daily login bonus removed from auto-trigger to prevent 403 errors
        // Users can claim it manually via the CreditsDisplay component
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getInitialSession();
  }, []);

  const signUp = async (email: string, password: string): Promise<{ success: boolean; error?: Error; needsVerification?: boolean }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;

      console.log("Sign up successful, data:", data);
      
      // Check if user needs to verify email
      if (data.user && !data.session) {
        return { success: true, needsVerification: true };
      }
      
      if (data.session) {
        setUser(mapUser(data.session.user));
        // Redirect to dashboard after successful signup
        navigate('/dashboard');
        return { success: true };
      }
      
      return { success: false, error: new Error('No session created') };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error: error as Error };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: Error }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      console.log("Sign in successful, data:", data);
      if (data.session) {
        setUser(mapUser(data.session.user));
        // Redirect to dashboard after successful login
        navigate('/dashboard');
        return { success: true };
      }
      
      return { success: false, error: new Error('No session created') };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      console.log("Sign out successful");
      navigate('/'); // Redirect to home after logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: Error }> => {
    try {
      // Get the current URL for redirect
      const redirectUrl = window.location.origin + '/dashboard';
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });
      
      if (error) throw error;
      
      console.log("Google sign in initiated with redirect to:", redirectUrl);
      return { success: true };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      return { success: false, error: error as Error };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error,
      session,
      signOut,
      signIn,
      signUp,
      signInWithGoogle,
      bypassAuth: import.meta.env.DEV ? bypassAuth : undefined,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}