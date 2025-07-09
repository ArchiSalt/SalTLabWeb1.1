import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to log user activity
  const logActivity = async (action: string, details: any = {}) => {
    // Run activity logging in background without blocking auth flow
    setTimeout(async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session.session?.user) {
          await supabase.from('user_activity_log').insert({
            user_id: session.session.user.id,
            action,
            details,
            ip_address: 'unknown', // Would need to get from request in real implementation
            user_agent: navigator.userAgent,
          });
        }
      } catch (error) {
        console.error('Failed to log activity:', error);
        // Don't throw error to avoid affecting UI
      }
    }, 0);
  };

  // Function to update last activity
  const updateLastActivity = async () => {
    // Run activity update in background without blocking auth flow
    setTimeout(async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session.session?.user) {
          await supabase
            .from('profiles')
            .update({ last_activity: new Date().toISOString() })
            .eq('user_id', session.session.user.id);
        }
      } catch (error) {
        console.error('Failed to update last activity:', error);
        // Don't throw error to avoid affecting UI
      }
    }, 0);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        updateLastActivity(); // Non-blocking call
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        if (event === 'SIGNED_IN') {
          logActivity('login', { login_method: 'email' }); // Non-blocking call
        }
        updateLastActivity(); // Non-blocking call
      } else if (event === 'SIGNED_OUT') {
        logActivity('logout'); // Non-blocking call
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined, // Disable email confirmation
      },
    });
    return { error };
  };

  const signOut = async () => {
    try {
      console.log('Attempting to sign out...');
      // Log activity in background (non-blocking)
      if (user) {
        logActivity('logout'); // Non-blocking call
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      
      // Always clear local state regardless of server response
      setUser(null);
      console.log('Sign out completed');
    } catch (error) {
      console.error('Sign out exception:', error);
      // Always clear local state even if there's an exception
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};