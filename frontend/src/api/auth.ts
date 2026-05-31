import apiClient from './client';
import type { AuthResponse, User } from '../types';

export const authApi = {
  register: (email: string, password: string, display_name: string) =>
    apiClient.post<AuthResponse>('/auth/register', { email, password, display_name }).then(r => r.data),

  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/auth/login', { email, password }).then(r => r.data),

  me: () => apiClient.get<User>('/auth/me').then(r => r.data),

  refresh: (refresh_token: string) =>
    apiClient.post<AuthResponse>('/auth/refresh', { refresh_token }).then(r => r.data),
};
