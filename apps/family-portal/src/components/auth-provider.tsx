'use client';

import { createContext, useContext, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from '@/i18n/routing';

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
  const router = useRouter();

  // Select stable function references directly — Zustand actions never change identity
  const loginAction = useAuthStore((s) => s.login);
  const logoutAction = useAuthStore((s) => s.logout);
  const setRefreshToken = useAuthStore((s) => s.setRefreshToken);
  const accessToken = useAuthStore((s) => s.accessToken);

  const login = useCallback(
    (
      accessToken: string,
      refreshToken: string,
      user: { id: string; name: string; email: string },
    ) => {
      loginAction(accessToken, user);
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Lax`;
    },
    [loginAction],
  );

  const logout = useCallback(() => {
    logoutAction();
    document.cookie = 'refreshToken=; path=/; max-age=0';
    router.push('/login');
  }, [logoutAction, router]);

  const getToken = useCallback(() => {
    return accessToken;
  }, [accessToken]);

  // Restore session from cookie on mount
  useEffect(() => {
    const refreshToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('refreshToken='))
      ?.split('=')[1];
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
    // setRefreshToken is a Zustand action — stable reference, never changes
  }, [setRefreshToken]);

  return (
    <AuthContext.Provider value={{ login, logout, getToken }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
