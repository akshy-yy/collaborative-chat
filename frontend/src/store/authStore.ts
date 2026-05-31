import { create } from 'zustand';
import { authApi } from '../api/auth';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, display_name: string) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  loadFromStorage: () => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      } catch { localStorage.clear(); }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.access_token, isAuthenticated: true, isLoading: false });
    } catch (e) { set({ isLoading: false }); throw e; }
  },

  register: async (email, password, display_name) => {
    set({ isLoading: true });
    try {
      const data = await authApi.register(email, password, display_name);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.access_token, isAuthenticated: true, isLoading: false });
    } catch (e) { set({ isLoading: false }); throw e; }
  },

  logout: () => {
    localStorage.clear();
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
