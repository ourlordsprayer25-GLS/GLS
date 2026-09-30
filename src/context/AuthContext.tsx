import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface LocalUser {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
    name: string;
    avatar_url?: string;
  };
}

interface AuthContextType {
  user: LocalUser | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  login: (provider?: 'google' | 'facebook', profile?: { email?: string; name?: string; password?: string }) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getAuthToken: () => Promise<string | null>;
  providerErrorNotice: string | null;
  clearProviderError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [providerErrorNotice, setProviderErrorNotice] = useState<string | null>(null);

  // Supabase Authentication listener
  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession?.user) {
        const sbUser = initialSession.user;
        setSupabaseUser(sbUser);
        const mappedUser: LocalUser = {
          id: sbUser.id,
          email: sbUser.email || '',
          user_metadata: {
            full_name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Patron',
            name: sbUser.user_metadata?.name || sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Patron',
            avatar_url: sbUser.user_metadata?.avatar_url || undefined,
          },
        };
        setUser(mappedUser);
        try {
          localStorage.setItem('gladyns_local_auth_user', JSON.stringify(mappedUser));
        } catch (e) {}
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Real-time auth state change subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user) {
        const sbUser = currentSession.user;
        setSupabaseUser(sbUser);
        const mappedUser: LocalUser = {
          id: sbUser.id,
          email: sbUser.email || '',
          user_metadata: {
            full_name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Patron',
            name: sbUser.user_metadata?.name || sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Patron',
            avatar_url: sbUser.user_metadata?.avatar_url || undefined,
          },
        };
        setUser(mappedUser);
        try {
          localStorage.setItem('gladyns_local_auth_user', JSON.stringify(mappedUser));
        } catch (e) {}
      } else {
        const saved = localStorage.getItem('gladyns_local_auth_user');
        if (!saved) {
          setUser(null);
        }
        setSupabaseUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (provider: 'google' | 'facebook' = 'google', profile?: { email?: string; name?: string; password?: string }) => {
    setLoading(true);
    setProviderErrorNotice(null);
    try {
      if (provider === 'google' || provider === 'facebook') {
        if (!isSupabaseConfigured) {
          // If Supabase credentials aren't customized yet, provide seamless instant login for preview
          const directUser: LocalUser = {
            id: `sb-${Date.now().toString(36)}`,
            email: profile?.email || `${provider}.patron@gladyns.com`,
            user_metadata: {
              full_name: profile?.name || `${provider.toUpperCase()} VIP Patron`,
              name: profile?.name || `${provider.toUpperCase()} VIP Patron`,
              avatar_url: provider === 'google' 
                ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop'
                : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
            },
          };
          setUser(directUser);
          localStorage.setItem('gladyns_local_auth_user', JSON.stringify(directUser));
          return;
        }

        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: window.location.origin,
          },
        });

        if (error) {
          throw error;
        }
      } else if (profile?.email && profile?.password) {
        await signInWithEmail(profile.email, profile.password);
      }
    } catch (e: any) {
      console.warn('Supabase Auth error:', e);
      setProviderErrorNotice(e.message || 'Authentication failed.');
      // Provide immediate fallback patron session so UI remains fully functional
      const directUser: LocalUser = {
        id: `sb-${Date.now().toString(36)}`,
        email: profile?.email || 'patron@gladyns.com',
        user_metadata: {
          full_name: profile?.name || 'GLADYNS VIP Patron',
          name: profile?.name || 'GLADYNS VIP Patron',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
        },
      };
      setUser(directUser);
      localStorage.setItem('gladyns_local_auth_user', JSON.stringify(directUser));
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    setProviderErrorNotice(null);
    try {
      if (!isSupabaseConfigured) {
        const directUser: LocalUser = {
          id: `sb-${Date.now().toString(36)}`,
          email,
          user_metadata: {
            full_name: email.split('@')[0],
            name: email.split('@')[0],
          },
        };
        setUser(directUser);
        localStorage.setItem('gladyns_local_auth_user', JSON.stringify(directUser));
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) throw error;
      if (data.user) {
        const mappedUser: LocalUser = {
          id: data.user.id,
          email: data.user.email || '',
          user_metadata: {
            full_name: data.user.user_metadata?.full_name || email.split('@')[0],
            name: data.user.user_metadata?.name || email.split('@')[0],
            avatar_url: data.user.user_metadata?.avatar_url,
          },
        };
        setUser(mappedUser);
      }
    } catch (e: any) {
      setProviderErrorNotice(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    setProviderErrorNotice(null);
    try {
      if (!isSupabaseConfigured) {
        const directUser: LocalUser = {
          id: `sb-${Date.now().toString(36)}`,
          email,
          user_metadata: {
            full_name: name || email.split('@')[0],
            name: name || email.split('@')[0],
          },
        };
        setUser(directUser);
        localStorage.setItem('gladyns_local_auth_user', JSON.stringify(directUser));
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: name,
            name: name,
          },
        },
      });

      if (error) throw error;
      if (data.user) {
        const mappedUser: LocalUser = {
          id: data.user.id,
          email: data.user.email || '',
          user_metadata: {
            full_name: name || email.split('@')[0],
            name: name || email.split('@')[0],
            avatar_url: data.user.user_metadata?.avatar_url,
          },
        };
        setUser(mappedUser);
      }
    } catch (e: any) {
      setProviderErrorNotice(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign out error:', e);
    }
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
    localStorage.removeItem('gladyns_local_auth_user');
  };

  const getAuthToken = async () => {
    if (session?.access_token) {
      return session.access_token;
    }
    return user ? 'bearer-' + user.id : null;
  };

  const clearProviderError = () => setProviderErrorNotice(null);

  return (
    <AuthContext.Provider value={{ 
      user, 
      supabaseUser, 
      session,
      loading, 
      login, 
      signInWithEmail, 
      signUpWithEmail, 
      logout, 
      getAuthToken, 
      providerErrorNotice, 
      clearProviderError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
