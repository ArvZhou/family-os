import { create } from 'zustand';

interface AuthState {
  user: { id: string; name: string; email: string } | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (accessToken: string, user: AuthState['user']) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  login: (accessToken, user) => set({ accessToken, user, isAuthenticated: true }),
  logout: () => set({ accessToken: null, user: null, isAuthenticated: false }),
}));
