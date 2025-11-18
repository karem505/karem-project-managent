/**
 * Project Store - Manages project state and operations
 * Handles API calls for project CRUD operations
 */
import { create } from 'zustand';
import apiClient from '@/lib/api/client';
import type { Project } from '@/types';

interface CreateProjectData {
  name: string;
  description?: string;
  client?: string;
  budget: number;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
}

interface UpdateProjectData extends Partial<CreateProjectData> {
  actual_cost?: number;
  baseline_start?: string;
  baseline_end?: string;
  baseline_cost?: number;
}

interface ProjectStore {
  // State
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;

  // Operations
  fetchProjects: (filters?: any) => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: CreateProjectData) => Promise<Project | null>;
  updateProject: (id: string, data: UpdateProjectData) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  // Initial state
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  // Fetch all projects
  fetchProjects: async (filters?: any) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.keys(filters).forEach((key) => {
          if (filters[key] !== undefined && filters[key] !== null) {
            params.append(key, filters[key]);
          }
        });
      }

      const response = await apiClient.get<Project[]>(`/projects/?${params.toString()}`);
      set({ projects: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch projects',
        isLoading: false,
      });
    }
  },

  // Fetch single project
  fetchProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Project>(`/projects/${id}/`);
      set({ currentProject: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch project',
        isLoading: false,
      });
    }
  },

  // Create new project
  createProject: async (data: CreateProjectData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<Project>('/projects/', data);
      const newProject = response.data;

      // Add to projects list
      set((state) => ({
        projects: [...state.projects, newProject],
        isLoading: false,
      }));

      return newProject;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to create project',
        isLoading: false,
      });
      return null;
    }
  },

  // Update existing project
  updateProject: async (id: string, data: UpdateProjectData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch<Project>(`/projects/${id}/`, data);
      const updatedProject = response.data;

      // Update in projects list
      set((state) => ({
        projects: state.projects.map((project) => (project.id === id ? updatedProject : project)),
        currentProject: state.currentProject?.id === id ? updatedProject : state.currentProject,
        isLoading: false,
      }));

      return updatedProject;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to update project',
        isLoading: false,
      });
      return null;
    }
  },

  // Delete project
  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/projects/${id}/`);

      // Remove from projects list
      set((state) => ({
        projects: state.projects.filter((project) => project.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        isLoading: false,
      }));

      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to delete project',
        isLoading: false,
      });
      return false;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Reset store
  reset: () => {
    set({
      projects: [],
      currentProject: null,
      isLoading: false,
      error: null,
    });
  },
}));
