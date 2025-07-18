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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert Supabase user to our User type
const mapUser = (supabaseUser: SupabaseUser): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email ?? '',
  isPro: supabaseUser.user_metadata?.isPro ?? false,
  created_at: supabaseUser.created_at
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

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
        setUser(mapUser(currentSession.user));
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
      signInWithGoogle
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