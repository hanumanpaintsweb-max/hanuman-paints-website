"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AuthContextType {
  admin: any;
  adminLogin: (email: string, pass: string) => Promise<any>;
  setAdminContext: (user: any, remember?: boolean) => void;
  adminLogout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState(() => {
    try {
      const savedSession = typeof window !== 'undefined' ? sessionStorage.getItem('hp-admin') : null;
      const savedLocal = typeof window !== 'undefined' ? localStorage.getItem('hp-admin') : null;
      const saved = savedSession || savedLocal;
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const adminLogin = useCallback(async (email: string, password: string) => {
    // This is now handled by the server action in /admin/login/page.tsx
    // We just provide a fallback or keep this for legacy components if needed
    // But ideally components will call setAdminContext manually
    return null;
  }, []);

  const setAdminContext = useCallback((user: any, remember: boolean = false) => {
    setAdmin(user);
    if (remember) {
      localStorage.setItem('hp-admin', JSON.stringify(user));
    } else {
      sessionStorage.setItem('hp-admin', JSON.stringify(user));
    }
  }, []);

  const adminLogout = useCallback(async () => {
    try {
      const { default: supabase } = await import('../services/supabase');
      if (supabase) await supabase.auth.signOut();
    } catch {}
    setAdmin(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('hp-admin');
      localStorage.removeItem('hp-admin');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ admin, adminLogin, setAdminContext, adminLogout, isAdmin: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
