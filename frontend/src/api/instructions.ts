import apiClient from './client';
import type { Instruction, Decision } from '../types';

export const instructionsApi = {
  list: (projectId: string) =>
    apiClient.get<Instruction[]>(`/projects/${projectId}/instructions/`).then(r => r.data),

  create: (projectId: string, data: Partial<Instruction>) =>
    apiClient.post<Instruction>(`/projects/${projectId}/instructions/`, data).then(r => r.data),

  updateStatus: (projectId: string, instructionId: string, status: string) =>
    apiClient.patch<Instruction>(`/projects/${projectId}/instructions/${instructionId}`, { status }).then(r => r.data),
};

export const decisionsApi = {
  list: (projectId: string) =>
    apiClient.get<Decision[]>(`/projects/${projectId}/decisions/`).then(r => r.data),

  update: (projectId: string, decisionId: string, status: string) =>
    apiClient.patch<Decision>(`/projects/${projectId}/decisions/${decisionId}`, { status }).then(r => r.data),
};
