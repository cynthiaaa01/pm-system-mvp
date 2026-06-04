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

export type ProjectTag = '線上任務' | '線上電競賽' | '實體電競賽' | '攤位活動';

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
  expected_start: string | null;
  expected_end: string | null;
  expected_close_date: string | null;
  actual_close_date: string | null;
  sales_person_id: string;
  notes: string | null;
  quotation_url: string | null;
  parsed_items: any | null;
  tags: string[];
  client_tag: string | null;
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
  event_online_date: string | null;
  event_end_date: string | null;
  material_confirm_date: string | null;
  physical_event_date: string | null;
  system_online_date: string | null;
  monthly_settle_date: string | null;
  tags: string[];
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
  source_item: string | null;
  task_category: string | null;
  reference_point: string | null;
  start_date: string | null;
  duration_days: number | null;
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

export interface QuotationItemTemplate {
  id: string;
  item_name: string;
  task_category: string;
  task_name: string;
  reference_point: string;
  offset_days: number;
  duration_days: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type UpdateType = 'progress' | 'status_change' | 'file_upload' | 'date_change' | 'comment' | 'milestone';

export interface TaskUpdate {
  id: string;
  task_id: string;
  project_id: string;
  author_id: string | null;
  author_role: UserRole | null;
  content: string;
  update_type: UpdateType | null;
  metadata: any | null;
  created_at: string;
}

export type NotificationType = 'task_due_soon' | 'task_overdue' | 'task_assigned' | 'project_created' | 'status_change' | 'weekly_summary' | 'assignment_pending';
export type ReferenceType = 'task' | 'project' | 'proposal';

export interface Notification {
  id: string;
  recipient_id: string;
  type: NotificationType | null;
  title: string;
  message: string | null;
  reference_type: ReferenceType | null;
  reference_id: string | null;
  is_read: boolean;
  read_at: string | null;
  slack_sent: boolean;
  created_at: string;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  year: number;
}

export interface NotificationPreference {
  id: string;
  profile_id: string;
  email_notifications: boolean;
  slack_notifications: boolean;
  app_notifications: boolean;
  days_in_advance: number;
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
  quotation_url?: string | null;
  parsed_items?: any | null;
  tags?: string[];
  client_tag?: string | null;
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
  event_online_date?: string | null;
  event_end_date?: string | null;
  material_confirm_date?: string | null;
  physical_event_date?: string | null;
  system_online_date?: string | null;
  monthly_settle_date?: string | null;
  tags?: string[];
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
  source_item?: string | null;
  task_category?: string | null;
  reference_point?: string | null;
  start_date?: string | null;
  duration_days?: number | null;
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
export type TaskUpdatePayload = Partial<Omit<Task, 'id' | 'task_number' | 'created_at' | 'updated_at'>>;
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
        Insert: Omit<Proposal, 'id' | 'created_at' | 'updated_at'> & { id?: string, tags?: string[], client_tag?: string | null };
        Update: Partial<Omit<Proposal, 'id' | 'created_at' | 'updated_at'>> & { tags?: string[], client_tag?: string | null };
      };
      projects: {
        Row: Project;
        Insert: ProjectInsert;
        Update: ProjectUpdate;
      };
      tasks: {
        Row: Task;
        Insert: TaskInsert;
        Update: TaskUpdatePayload;
      };
      task_templates: {
        Row: TaskTemplate;
        Insert: TaskTemplateInsert;
        Update: TaskTemplateUpdate;
      };
      quotation_item_templates: {
        Row: QuotationItemTemplate;
        Insert: Omit<QuotationItemTemplate, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<QuotationItemTemplate, 'id' | 'created_at' | 'updated_at'>>;
      };
      task_updates: {
        Row: TaskUpdate;
        Insert: Omit<TaskUpdate, 'id' | 'created_at'> & { id?: string, created_at?: string };
        Update: Partial<Omit<TaskUpdate, 'id' | 'created_at'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'> & { id?: string, created_at?: string };
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>;
      };
      holidays: {
        Row: Holiday;
        Insert: Omit<Holiday, 'id'> & { id?: string };
        Update: Partial<Omit<Holiday, 'id'>>;
      };
      notification_preferences: {
        Row: NotificationPreference;
        Insert: Omit<NotificationPreference, 'id' | 'created_at' | 'updated_at'> & { id?: string, created_at?: string, updated_at?: string };
        Update: Partial<Omit<NotificationPreference, 'id' | 'created_at' | 'updated_at'>>;
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
