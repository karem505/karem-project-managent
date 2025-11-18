/**
 * API Endpoints - Aggregates all API functions
 * Centralized location for all API calls
 */
import apiClient from './client';
import type { DashboardData } from '@/types';

/**
 * Analytics API
 */
export const analyticsAPI = {
  getDashboard: () => apiClient.get<DashboardData>('/analytics/dashboard/'),

  getProjectAnalytics: (projectId: string) =>
    apiClient.get(`/analytics/projects/${projectId}/`),

  getTeamAnalytics: () =>
    apiClient.get('/analytics/team/'),

  getResourceUtilization: () =>
    apiClient.get('/analytics/resources/'),
};

/**
 * Projects API
 */
export const projectsAPI = {
  list: (params?: any) => apiClient.get('/projects/', { params }),
  get: (id: string) => apiClient.get(`/projects/${id}/`),
  create: (data: any) => apiClient.post('/projects/', data),
  update: (id: string, data: any) => apiClient.patch(`/projects/${id}/`, data),
  delete: (id: string) => apiClient.delete(`/projects/${id}/`),
};

/**
 * Clients API
 */
export const clientsAPI = {
  list: (params?: any) => apiClient.get('/clients/', { params }),
  get: (id: string) => apiClient.get(`/clients/${id}/`),
  create: (data: any) => apiClient.post('/clients/', data),
  update: (id: string, data: any) => apiClient.patch(`/clients/${id}/`, data),
  delete: (id: string) => apiClient.delete(`/clients/${id}/`),
};

/**
 * Team Members API
 */
export const teamAPI = {
  list: (params?: any) => apiClient.get('/team-members/', { params }),
  get: (id: string) => apiClient.get(`/team-members/${id}/`),
  create: (data: any) => apiClient.post('/team-members/', data),
  update: (id: string, data: any) => apiClient.patch(`/team-members/${id}/`, data),
  delete: (id: string) => apiClient.delete(`/team-members/${id}/`),
};

/**
 * Auth API
 */
export const authAPI = {
  login: (data: any) => apiClient.post('/auth/login/', data),
  register: (data: any) => apiClient.post('/auth/register/', data),
  logout: () => apiClient.post('/auth/logout/'),
  refresh: (refresh: string) => apiClient.post('/auth/refresh/', { refresh }),
  me: () => apiClient.get('/auth/me/'),
};

/**
 * Task Dependencies API
 */
export const dependenciesAPI = {
  list: (taskId?: string) => {
    const params = taskId ? { task: taskId } : {};
    return apiClient.get('/task-dependencies/', { params });
  },
  get: (id: string) => apiClient.get(`/task-dependencies/${id}/`),
  create: (data: any) => apiClient.post('/task-dependencies/', data),
  update: (id: string, data: any) => apiClient.patch(`/task-dependencies/${id}/`, data),
  delete: (id: string) => apiClient.delete(`/task-dependencies/${id}/`),
};
