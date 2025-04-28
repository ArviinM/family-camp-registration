'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { SupabaseClient, Session, User, AuthChangeEvent, AuthSession } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/client'; // Use relative path
import type { Database } from '../lib/supabase/database.types'; // Use relative path

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  supabase: SupabaseClient<Database>;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial session with explicit type for destructuring
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (!data.session) {
          setLoading(false);
      }
    });

    // Listen for auth state changes with explicit types
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: AuthSession | null) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setProfile(null); 
        setLoading(true);

        if (currentUser) {
          // Fetch profile when user logs in
          try {
            const { data, error, status } = await supabase
              .from('profiles')
              .select(`*`)
              .eq('id', currentUser.id)
              .single();

            if (error && status !== 406) {
                // 406 status code means no rows found, which is expected if profile hasn't been created yet (though trigger should handle it)
                console.error('Error fetching profile:', error);
                throw error;
            }

            if (data) {
                console.log('Profile fetched:', data);
                setProfile(data);
            } else {
                console.warn('No profile found for user:', currentUser.id);
                // Handle case where profile might be missing despite trigger?
            }
          } catch (error) {
            console.error('Error in profile fetch catch:', error);
            // Handle error appropriately, maybe sign out user?
            setProfile(null);
          } finally {
             setLoading(false);
          }
        } else {
          // User logged out
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Cleanup listener on component unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error signing out:', error);
    }
    // Auth listener will handle setting session/user/profile to null
  };

  const isAdmin = profile?.role === 'admin';

  const value = {
    supabase,
    session,
    user,
    profile,
    loading,
    isAdmin,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
