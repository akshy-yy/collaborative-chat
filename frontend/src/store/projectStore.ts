import { create } from 'zustand';
import { projectsApi } from '../api/projects';
import type { Project, Role } from '../types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (name: string, description: string, room_password: string, role: string) => Promise<Project>;
  joinProject: (inviteToken: string, room_password: string, role: Role) => Promise<Project>;
  setCurrentProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const projects = await projectsApi.list();
      set({ projects, isLoading: false });
    } catch { set({ isLoading: false }); }
  },

  fetchProject: async (id) => {
    set({ isLoading: true });
    try {
      const project = await projectsApi.get(id);
      set({ currentProject: project, isLoading: false });
    } catch { set({ isLoading: false }); }
  },

  createProject: async (name, description, room_password, role) => {
    const project = await projectsApi.create(name, description, room_password, role);
    set(state => ({ projects: [project, ...state.projects] }));
    return project;
  },

  joinProject: async (inviteToken, room_password, role) => {
    const project = await projectsApi.join(inviteToken, room_password, role);
    set(state => ({ projects: [project, ...state.projects] }));
    return project;
  },

  setCurrentProject: (project) => set({ currentProject: project }),
}));
