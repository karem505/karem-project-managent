/**
 * Task API endpoints
 */
import apiClient from './client';
import { Task, TaskDependency, GanttData, KanbanBoard } from '@/types';

export interface TaskFilters {
  project?: string;
  status?: string;
  priority?: string;
  assigned_to?: string;
  search?: string;
}

export interface CreateTaskData {
  project: string;
  title: string;
  description?: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  start_date: string;
  end_date: string;
  duration: number;
  progress: number;
  estimated_hours: number;
  estimated_cost: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  parent_task?: string;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  actual_hours?: number;
  actual_cost?: number;
}

export interface MoveKanbanData {
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  kanban_order: number;
}

export interface CreateDependencyData {
  predecessor: string;
  successor: string;
  dependency_type: 'FS' | 'SS' | 'FF' | 'SF';
  lag: number;
}

export const tasksAPI = {
  // List tasks with optional filters
  list: (filters?: TaskFilters) => {
    return apiClient.get<Task[]>('/tasks/', { params: filters });
  },

  // Get single task by ID
  get: (id: string) => {
    return apiClient.get<Task>(`/tasks/${id}/`);
  },

  // Create new task
  create: (data: CreateTaskData) => {
    return apiClient.post<Task>('/tasks/', data);
  },

  // Update existing task
  update: (id: string, data: UpdateTaskData) => {
    return apiClient.patch<Task>(`/tasks/${id}/`, data);
  },

  // Delete task
  delete: (id: string) => {
    return apiClient.delete(`/tasks/${id}/`);
  },

  // Get Gantt chart data for a project
  gantt: (projectId: string) => {
    return apiClient.get<GanttData>('/tasks/gantt/', {
      params: { project: projectId },
    });
  },

  // Get Kanban board data for a project
  kanban: (projectId: string) => {
    return apiClient.get<KanbanBoard>('/tasks/kanban/', {
      params: { project: projectId },
    });
  },

  // Move task in Kanban board
  moveKanban: (id: string, data: MoveKanbanData) => {
    return apiClient.post<Task>(`/tasks/${id}/move-kanban/`, data);
  },

  // Calculate critical path for project
  calculateCriticalPath: (projectId: string) => {
    return apiClient.post(`/tasks/calculate-critical-path/`, {
      project: projectId,
    });
  },
};

export const dependenciesAPI = {
  // List dependencies for a task
  list: (taskId?: string) => {
    const params = taskId ? { task: taskId } : undefined;
    return apiClient.get<TaskDependency[]>('/tasks/dependencies/', { params });
  },

  // Create new dependency
  create: (data: CreateDependencyData) => {
    return apiClient.post<TaskDependency>('/tasks/dependencies/', data);
  },

  // Delete dependency
  delete: (id: string) => {
    return apiClient.delete(`/tasks/dependencies/${id}/`);
  },
};
