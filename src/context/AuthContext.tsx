"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AuthContextType {
  admin: any;
  adminLogin: (email: string, pass: string) => Promise<any>;
  adminLogout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = sessionStorage.getItem('hp-admin');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const adminLogin = useCallback(async (email: string, password: string) => {
    // Dynamically import supabase only when needed
    const { default: supabase } = await import('../services/supabase');
    if (!supabase) throw new Error('Supabase not configured. Please add .env file.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setAdmin(data.user);
    sessionStorage.setItem('hp-admin', JSON.stringify(data.user));
    return data.user;
  }, []);

  const adminLogout = useCallback(async () => {
    try {
      const { default: supabase } = await import('../services/supabase');
      if (supabase) await supabase.auth.signOut();
    } catch {}
    setAdmin(null);
    sessionStorage.removeItem('hp-admin');
  }, []);

  return (
    <AuthContext.Provider value={{ admin, adminLogin, adminLogout, isAdmin: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
