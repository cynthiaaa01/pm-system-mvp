// ============================================================
// PM System - Database Types
// ============================================================
// TypeScript types that mirror the Supabase database schema.
// These types are used throughout the application for type safety.
// ============================================================

// =========================
// Enums
// =========================

export type UserRole = 'admin' | 'sales' | 'operations' | 'marketing';

export type ProposalStatus = 'lead' | 'negotiating' | 'quoted' | 'pending' | 'won' | 'lost';

export type ProjectStatus = 'pending' | 'in_progress' | 'testing' | 'completed' | 'closed' | 'delayed';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'delayed';

export type ProjectType = 'online_event' | 'courseware' | 'training' | 'consulting';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// =========================
// Table Row Types
// =========================

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  department: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  industry: string | null;
  address: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  proposal_number: string;
  title: string;
  client_id: string;
  status: ProposalStatus;
  project_type: ProjectType;
  amount: number | null;
  currency: string;
  description: string | null;
  expected_close_date: string | null;
  actual_close_date: string | null;
  sales_person_id: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  project_number: string;
  name: string;
  proposal_id: string | null;
  client_id: string;
  status: ProjectStatus;
  project_type: ProjectType;
  operations_id: string;
  marketing_id: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  task_number: string;
  title: string;
  project_id: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  due_date: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TaskTemplateItem {
  title: string;
  description: string;
  priority: TaskPriority;
  default_offset_days: number;
  sort_order: number;
}

export interface TaskTemplate {
  id: string;
  name: string;
  project_type: ProjectType;
  tasks: TaskTemplateItem[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// =========================
// Insert Types
// (Optional fields for auto-generated columns)
// =========================

export interface ProfileInsert {
  id: string; // Must match auth.users id
  email: string;
  full_name: string;
  avatar_url?: string | null;
  role?: UserRole;
  department?: string | null;
  phone?: string | null;
  is_active?: boolean;
}

export interface ClientInsert {
  name: string;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  industry?: string | null;
  address?: string | null;
  notes?: string | null;
  created_by?: string | null;
}

export interface ProposalInsert {
  title: string;
  client_id: string;
  sales_person_id: string;
  proposal_number?: string; // Auto-generated if omitted
  status?: ProposalStatus;
  project_type?: ProjectType;
  amount?: number | null;
  currency?: string;
  description?: string | null;
  expected_close_date?: string | null;
  actual_close_date?: string | null;
  notes?: string | null;
}

export interface ProjectInsert {
  name: string;
  client_id: string;
  operations_id: string;
  marketing_id?: string | null;
  project_number?: string; // Auto-generated if omitted
  proposal_id?: string | null;
  status?: ProjectStatus;
  project_type?: ProjectType;
  start_date?: string | null;
  end_date?: string | null;
  budget?: number | null;
  description?: string | null;
  notes?: string | null;
}

export interface TaskInsert {
  title: string;
  project_id: string;
  task_number?: string; // Auto-generated if omitted
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string | null;
  due_date?: string | null;
  description?: string | null;
  sort_order?: number;
}

export interface TaskTemplateInsert {
  name: string;
  project_type: ProjectType;
  tasks: TaskTemplateItem[];
  created_by?: string | null;
}

// =========================
// Update Types (all fields optional)
// =========================

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
export type ClientUpdate = Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>;
export type ProposalUpdate = Partial<Omit<Proposal, 'id' | 'proposal_number' | 'created_at' | 'updated_at'>>;
export type ProjectUpdate = Partial<Omit<Project, 'id' | 'project_number' | 'created_at' | 'updated_at'>>;
export type TaskUpdate = Partial<Omit<Task, 'id' | 'task_number' | 'created_at' | 'updated_at'>>;
export type TaskTemplateUpdate = Partial<Omit<TaskTemplate, 'id' | 'created_at' | 'updated_at'>>;

// =========================
// Join Types (common queries)
// =========================

export interface ProposalWithClient extends Proposal {
  client: Client;
  sales_person: Profile;
}

export interface ProjectWithDetails extends Project {
  client: Client;
  operations: Profile;
  marketing: Profile | null;
  proposal: Proposal | null;
  tasks: Task[];
}

export interface ProjectWithClient extends Project {
  client: Client;
  operations: Profile;
  marketing: Profile | null;
}

export interface TaskWithProject extends Task {
  project: Project;
  assignee: Profile | null;
}

export interface TaskWithAssignee extends Task {
  assignee: Profile | null;
}

// =========================
// Dashboard View Types
// =========================

export interface SalesDashboard {
  sales_person_id: string;
  sales_person_name: string;
  total_proposals: number;
  won_count: number;
  lost_count: number;
  active_count: number;
  won_amount: number;
  pipeline_amount: number;
  win_rate: number;
}

export interface DelayedProject {
  id: string;
  project_number: string;
  name: string;
  status: ProjectStatus;
  end_date: string;
  operations_id: string;
  operations_name: string;
  client_name: string;
  days_overdue: number;
  remaining_tasks: number;
}

export interface UpcomingTask {
  id: string;
  task_number: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
  assignee_id: string | null;
  assignee_name: string | null;
  project_id: string;
  project_number: string;
  project_name: string;
  days_until_due: number;
}

// =========================
// Supabase Database Type Map
// =========================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      clients: {
        Row: Client;
        Insert: ClientInsert;
        Update: ClientUpdate;
      };
      proposals: {
        Row: Proposal;
        Insert: ProposalInsert;
        Update: ProposalUpdate;
      };
      projects: {
        Row: Project;
        Insert: ProjectInsert;
        Update: ProjectUpdate;
      };
      tasks: {
        Row: Task;
        Insert: TaskInsert;
        Update: TaskUpdate;
      };
      task_templates: {
        Row: TaskTemplate;
        Insert: TaskTemplateInsert;
        Update: TaskTemplateUpdate;
      };
    };
    Views: {
      v_sales_dashboard: {
        Row: SalesDashboard;
      };
      v_delayed_projects: {
        Row: DelayedProject;
      };
      v_upcoming_tasks: {
        Row: UpcomingTask;
      };
    };
    Enums: {
      user_role: UserRole;
      proposal_status: ProposalStatus;
      project_status: ProjectStatus;
      task_status: TaskStatus;
      project_type: ProjectType;
      task_priority: TaskPriority;
    };
  };
}
