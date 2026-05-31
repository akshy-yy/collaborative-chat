import apiClient from './client';
import type { Room, RoomMember } from '../types';

export const roomsApi = {
  list: (projectId: string) =>
    apiClient.get<Room[]>(`/projects/${projectId}/rooms/`).then(r => r.data),

  get: (projectId: string, roomId: string) =>
    apiClient.get<Room>(`/projects/${projectId}/rooms/${roomId}`).then(r => r.data),

  create: (projectId: string, name: string, description?: string) =>
    apiClient.post<Room>(`/projects/${projectId}/rooms/`, { name, description }).then(r => r.data),

  delete: (projectId: string, roomId: string) =>
    apiClient.delete(`/projects/${projectId}/rooms/${roomId}`),

  getMembers: (projectId: string, roomId: string) =>
    apiClient.get<RoomMember[]>(`/projects/${projectId}/rooms/${roomId}/members`).then(r => r.data),

  join: (projectId: string, roomId: string) =>
    apiClient.post(`/projects/${projectId}/rooms/${roomId}/join`).then(r => r.data),
};
