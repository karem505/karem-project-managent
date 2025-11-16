/**
 * Core TypeScript types for the application
 */

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar?: string;
  is_active: boolean;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  website?: string;
  contact_person?: string;
  contact_position?: string;
  notes?: string;
  is_active: boolean;
  active_projects_count?: number;
  total_projects_value?: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  user: User;
  full_name: string;
  email: string;
  role: string;
  department?: string;
  hourly_rate: number;
  capacity_hours_per_week: number;
  skills: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  client?: Client;
  budget: number;
  actual_cost: number;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  baseline_start?: string;
  baseline_end?: string;
  baseline_cost?: number;
  created_by?: User;
  team_members: TeamMember[];
  cost_variance?: number;
  cost_performance_index?: number;
  progress_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project: string;
  title: string;
  description?: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  kanban_order: number;
  start_date: string;
  end_date: string;
  duration: number;
  progress: number;
  estimated_hours: number;
  actual_hours?: number;
  estimated_cost: number;
  actual_cost?: number;
  baseline_start?: string;
  baseline_end?: string;
  baseline_duration?: number;
  baseline_cost?: number;
  assigned_to_list?: TeamMember[];
  is_critical: boolean;
  slack?: number;
  early_start?: string;
  early_finish?: string;
  late_start?: string;
  late_finish?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  parent_task?: string;
  parent?: string;
  dependencies?: Array<{
    id: string;
    predecessor: string;
    successor: string;
    dependency_type: 'FS' | 'SS' | 'FF' | 'SF';
    lag: number;
  }>;
  cost_variance?: number;
  schedule_variance_days?: number;
  created_at: string;
  updated_at: string;
}

export interface TaskDependency {
  id: string;
  predecessor: string;
  predecessor_title?: string;
  successor: string;
  successor_title?: string;
  dependency_type: 'FS' | 'SS' | 'FF' | 'SF';
  lag: number;
  created_at: string;
}

export interface TaskAssignment {
  id: string;
  task: string;
  team_member: TeamMember;
  allocated_hours: number;
  allocation_percentage: number;
  assigned_date: string;
}

export interface Comment {
  id: string;
  task: string;
  author: User;
  author_name: string;
  content: string;
  mentions: string[];
  created_at: string;
  updated_at: string;
}

export interface ProjectBaseline {
  id: string;
  project: string;
  name: string;
  baseline_number: number;
  baseline_data: any;
  created_at: string;
  created_by?: string;
}

export interface ActivityLog {
  id: string;
  project: string;
  user?: string;
  user_name?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  changes: any;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

// Gantt specific types
export interface GanttTask {
  id: string;
  text: string;
  start_date: string;
  duration: number;
  progress: number;
  parent?: string;
  end_date: string;
  is_critical: boolean;
}

export interface GanttLink {
  id: string;
  source: string;
  target: string;
  type: string;
  lag: number;
}

export interface GanttData {
  data: GanttTask[];
  links: GanttLink[];
}

// Kanban specific types
export interface KanbanBoard {
  backlog: Task[];
  todo: Task[];
  in_progress: Task[];
  review: Task[];
  done: Task[];
}

// Analytics types
export interface DashboardData {
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  tasks: {
    total: number;
    completed: number;
    in_progress: number;
    overdue: number;
  };
  financial: {
    total_budget: number;
    total_actual_cost: number;
    variance: number;
  };
  team: {
    total_members: number;
  };
  recent_projects: any[];
  recent_tasks: any[];
}
