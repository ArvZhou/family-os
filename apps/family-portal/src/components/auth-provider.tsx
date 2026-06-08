'use client';

import { createContext, useContext, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  login: (
    accessToken: string,
    refreshToken: string,
    user: { id: string; name: string; email: string },
  ) => void;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const store = useAuthStore();
  const router = useRouter();

  const login = useCallback(
    (
      accessToken: string,
      refreshToken: string,
      user: { id: string; name: string; email: string },
    ) => {
      store.login(accessToken, user);
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Lax`;
    },
    [store],
  );

  const logout = useCallback(() => {
    store.logout();
    document.cookie = 'refreshToken=; path=/; max-age=0';
    router.push('/login');
  }, [store, router]);

  const getToken = useCallback(() => {
    return store.accessToken;
  }, [store.accessToken]);

  // Restore session from cookie on mount
  useEffect(() => {
    const refreshToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('refreshToken='))
      ?.split('=')[1];
    if (refreshToken) {
      store.setRefreshToken(refreshToken);
    }
  }, [store]);

  return (
    <AuthContext.Provider value={{ login, logout, getToken }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
