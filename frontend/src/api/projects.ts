import apiClient from './client';
import type { Project, ProjectMember, Role } from '../types';

export const projectsApi = {
  list: () => apiClient.get<Project[]>('/projects/').then(r => r.data),

  get: (id: string) => apiClient.get<Project>(`/projects/${id}`).then(r => r.data),

  create: (name: string, description: string, room_password: string, role: string) =>
    apiClient.post<Project>('/projects/', { name, description, room_password, role }).then(r => r.data),

  update: (id: string, data: Partial<Project>) =>
    apiClient.put<Project>(`/projects/${id}`, data).then(r => r.data),

  delete: (id: string) => apiClient.delete(`/projects/${id}`),

  getInviteLink: (id: string) =>
    apiClient.get<{ invite_url: string; invite_token: string }>(`/projects/${id}/invite-link`).then(r => r.data),

  join: (inviteToken: string, room_password: string, role: Role) =>
    apiClient.post<Project>(`/projects/join/${inviteToken}`, { room_password, role }).then(r => r.data),

  getMembers: (id: string) =>
    apiClient.get<ProjectMember[]>(`/projects/${id}/members`).then(r => r.data),

  getByToken: (inviteToken: string) =>
    apiClient.get<{ id: string; name: string; description: string | null }>(`/projects/by-token/${inviteToken}`).then(r => r.data),
};
