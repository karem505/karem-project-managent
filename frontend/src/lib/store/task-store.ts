/**
 * Task Store - Manages task state and operations
 * Handles API calls for tasks, Kanban board, Gantt chart, and dependencies
 */
import { create } from 'zustand';
import { Task, TaskDependency, GanttData, KanbanBoard } from '@/types';
import {
  tasksAPI,
  dependenciesAPI,
  TaskFilters,
  CreateTaskData,
  UpdateTaskData,
  MoveKanbanData,
  CreateDependencyData,
} from '@/lib/api/tasks';

interface TaskStore {
  // State
  tasks: Task[];
  currentTask: Task | null;
  kanbanData: KanbanBoard | null;
  ganttData: GanttData | null;
  dependencies: TaskDependency[];
  isLoading: boolean;
  error: string | null;

  // Task operations
  fetchTasks: (filters?: TaskFilters) => Promise<void>;
  fetchTask: (id: string) => Promise<void>;
  createTask: (data: CreateTaskData) => Promise<Task | null>;
  updateTask: (id: string, data: UpdateTaskData) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  setCurrentTask: (task: Task | null) => void;

  // Kanban operations
  fetchKanbanData: (projectId: string) => Promise<void>;
  moveKanbanTask: (id: string, data: MoveKanbanData) => Promise<void>;

  // Gantt operations
  fetchGanttData: (projectId: string) => Promise<void>;
  calculateCriticalPath: (projectId: string) => Promise<void>;

  // Dependency operations
  fetchDependencies: (taskId?: string) => Promise<void>;
  addDependency: (data: CreateDependencyData) => Promise<TaskDependency | null>;
  removeDependency: (id: string) => Promise<boolean>;

  // Utility
  clearError: () => void;
  reset: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial state
  tasks: [],
  currentTask: null,
  kanbanData: null,
  ganttData: null,
  dependencies: [],
  isLoading: false,
  error: null,

  // Fetch all tasks with optional filters
  fetchTasks: async (filters?: TaskFilters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tasksAPI.list(filters);
      set({ tasks: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch tasks',
        isLoading: false,
      });
    }
  },

  // Fetch single task
  fetchTask: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tasksAPI.get(id);
      set({ currentTask: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch task',
        isLoading: false,
      });
    }
  },

  // Create new task
  createTask: async (data: CreateTaskData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tasksAPI.create(data);
      const newTask = response.data;

      // Add to tasks list
      set((state) => ({
        tasks: [...state.tasks, newTask],
        isLoading: false,
      }));

      return newTask;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to create task',
        isLoading: false,
      });
      return null;
    }
  },

  // Update existing task
  updateTask: async (id: string, data: UpdateTaskData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tasksAPI.update(id, data);
      const updatedTask = response.data;

      // Update in tasks list
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? updatedTask : task)),
        currentTask: state.currentTask?.id === id ? updatedTask : state.currentTask,
        isLoading: false,
      }));

      return updatedTask;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to update task',
        isLoading: false,
      });
      return null;
    }
  },

  // Delete task
  deleteTask: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await tasksAPI.delete(id);

      // Remove from tasks list
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
        currentTask: state.currentTask?.id === id ? null : state.currentTask,
        isLoading: false,
      }));

      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to delete task',
        isLoading: false,
      });
      return false;
    }
  },

  // Set current task
  setCurrentTask: (task: Task | null) => {
    set({ currentTask: task });
  },

  // Fetch Kanban board data
  fetchKanbanData: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tasksAPI.kanban(projectId);
      set({ kanbanData: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch Kanban data',
        isLoading: false,
      });
    }
  },

  // Move task in Kanban board
  moveKanbanTask: async (id: string, data: MoveKanbanData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tasksAPI.moveKanban(id, data);
      const updatedTask = response.data;

      // Update in tasks list
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? updatedTask : task)),
        isLoading: false,
      }));

      // Refresh Kanban data if available
      if (get().kanbanData && updatedTask.project) {
        await get().fetchKanbanData(updatedTask.project);
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to move task',
        isLoading: false,
      });
    }
  },

  // Fetch Gantt chart data
  fetchGanttData: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tasksAPI.gantt(projectId);
      set({ ganttData: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch Gantt data',
        isLoading: false,
      });
    }
  },

  // Calculate critical path
  calculateCriticalPath: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      await tasksAPI.calculateCriticalPath(projectId);

      // Refresh Gantt data to get updated critical path
      await get().fetchGanttData(projectId);

      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to calculate critical path',
        isLoading: false,
      });
    }
  },

  // Fetch dependencies
  fetchDependencies: async (taskId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dependenciesAPI.list(taskId);
      set({ dependencies: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch dependencies',
        isLoading: false,
      });
    }
  },

  // Add dependency
  addDependency: async (data: CreateDependencyData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dependenciesAPI.create(data);
      const newDependency = response.data;

      // Add to dependencies list
      set((state) => ({
        dependencies: [...state.dependencies, newDependency],
        isLoading: false,
      }));

      return newDependency;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to add dependency',
        isLoading: false,
      });
      return null;
    }
  },

  // Remove dependency
  removeDependency: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await dependenciesAPI.delete(id);

      // Remove from dependencies list
      set((state) => ({
        dependencies: state.dependencies.filter((dep) => dep.id !== id),
        isLoading: false,
      }));

      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to remove dependency',
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
      tasks: [],
      currentTask: null,
      kanbanData: null,
      ganttData: null,
      dependencies: [],
      isLoading: false,
      error: null,
    });
  },
}));
