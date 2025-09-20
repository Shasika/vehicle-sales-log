'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Session {
  user: User;
}

interface AuthContextType {
  data: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  signIn: (credentials: { email: string; password: string }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  getSession: () => Promise<Session | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo credentials
const DEMO_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'password123'
};

const DEMO_USER: User = {
  id: 'demo-user',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'Admin'
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = () => {
      const storedSession = localStorage.getItem('auth-session');
      if (storedSession) {
        try {
          const parsedSession = JSON.parse(storedSession);
          setSession(parsedSession);
          setStatus('authenticated');
        } catch (error) {
          localStorage.removeItem('auth-session');
          setStatus('unauthenticated');
        }
      } else {
        setStatus('unauthenticated');
      }
    };

    checkSession();
  }, []);

  const signIn = async (credentials: { email: string; password: string }): Promise<{ error?: string }> => {
    setStatus('loading');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check credentials
    if (credentials.email === DEMO_CREDENTIALS.email && credentials.password === DEMO_CREDENTIALS.password) {
      const newSession: Session = { user: DEMO_USER };
      setSession(newSession);
      setStatus('authenticated');
      localStorage.setItem('auth-session', JSON.stringify(newSession));
      return {};
    } else {
      setStatus('unauthenticated');
      return { error: 'Invalid email or password' };
    }
  };

  const signOut = async (): Promise<void> => {
    setSession(null);
    setStatus('unauthenticated');
    localStorage.removeItem('auth-session');
  };

  const getSession = async (): Promise<Session | null> => {
    return session;
  };

  const value: AuthContextType = {
    data: session,
    status,
    signIn,
    signOut,
    getSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSession() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSession must be used within an AuthProvider');
  }
  return {
    data: context.data,
    status: context.status,
    signOut: context.signOut
  };
}

export function useSignIn() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSignIn must be used within an AuthProvider');
  }
  return context.signIn;
}

export function useSignOut() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSignOut must be used within an AuthProvider');
  }
  return context.signOut;
}

export function useGetSession() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useGetSession must be used within an AuthProvider');
  }
  return context.getSession;
}

// SessionProvider alias for compatibility
export const SessionProvider = AuthProvider;