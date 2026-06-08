import { create } from 'zustand';

interface AuthState {
  user: { id: string; name: string; email: string } | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (accessToken: string, user: AuthState['user']) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  login: (accessToken, user) => set({ accessToken, user, isAuthenticated: true }),
  logout: () => set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false }),
  setAccessToken: (token) => set({ accessToken: token }),
  setRefreshToken: (token) => set({ refreshToken: token }),
}));
