-- ============================================================
-- PM System - Initial Database Schema Migration
-- ============================================================
-- This migration creates the complete database schema for the
-- Project Management System including enums, tables, triggers,
-- RLS policies, indexes, seed data, and views.
-- ============================================================

-- =========================
-- 1. ENUM TYPES
-- =========================

CREATE TYPE user_role AS ENUM ('admin', 'sales', 'operations', 'marketing');

CREATE TYPE proposal_status AS ENUM ('lead', 'negotiating', 'quoted', 'pending', 'won', 'lost');

CREATE TYPE project_status AS ENUM ('pending', 'in_progress', 'testing', 'completed', 'closed', 'delayed');

CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done', 'delayed');

CREATE TYPE project_type AS ENUM ('online_event', 'courseware', 'training', 'consulting');

CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');


-- =========================
-- 2. HELPER FUNCTIONS
-- =========================

-- Helper: get_user_role() - Returns the role of the current authenticated user
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =========================
-- 3. TABLES
-- =========================

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'operations',
  department TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  industry TEXT,
  address TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Proposals
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  status proposal_status NOT NULL DEFAULT 'lead',
  project_type project_type NOT NULL DEFAULT 'online_event',
  amount NUMERIC(12, 2),
  currency TEXT NOT NULL DEFAULT 'TWD',
  description TEXT,
  expected_close_date DATE,
  actual_close_date DATE,
  sales_person_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  status project_status NOT NULL DEFAULT 'pending',
  project_type project_type NOT NULL DEFAULT 'online_event',
  operations_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  marketing_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  budget NUMERIC(12, 2),
  description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'medium',
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date DATE,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Task Templates
CREATE TABLE task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  project_type project_type NOT NULL,
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- tasks: [{ title, description, priority, default_offset_days, sort_order }]
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================
-- 4. AUTO-INCREMENT ID TRIGGERS
-- =========================

-- Sequence for proposal numbers
CREATE SEQUENCE proposal_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_proposal_number()
RETURNS TRIGGER AS $$
DECLARE
  year_str TEXT;
  seq_num INTEGER;
BEGIN
  year_str := TO_CHAR(NOW(), 'YYYY');
  seq_num := nextval('proposal_number_seq');
  NEW.proposal_number := 'P-' || year_str || '-' || LPAD(seq_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_proposal_number
  BEFORE INSERT ON proposals
  FOR EACH ROW
  WHEN (NEW.proposal_number IS NULL OR NEW.proposal_number = '')
  EXECUTE FUNCTION generate_proposal_number();

-- Sequence for project numbers
CREATE SEQUENCE project_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_project_number()
RETURNS TRIGGER AS $$
DECLARE
  year_str TEXT;
  seq_num INTEGER;
BEGIN
  year_str := TO_CHAR(NOW(), 'YYYY');
  seq_num := nextval('project_number_seq');
  NEW.project_number := 'PRJ-' || year_str || '-' || LPAD(seq_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_project_number
  BEFORE INSERT ON projects
  FOR EACH ROW
  WHEN (NEW.project_number IS NULL OR NEW.project_number = '')
  EXECUTE FUNCTION generate_project_number();

-- Sequence for task numbers
CREATE SEQUENCE task_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_task_number()
RETURNS TRIGGER AS $$
DECLARE
  year_str TEXT;
  seq_num INTEGER;
BEGIN
  year_str := TO_CHAR(NOW(), 'YYYY');
  seq_num := nextval('task_number_seq');
  NEW.task_number := 'T-' || year_str || '-' || LPAD(seq_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_task_number
  BEFORE INSERT ON tasks
  FOR EACH ROW
  WHEN (NEW.task_number IS NULL OR NEW.task_number = '')
  EXECUTE FUNCTION generate_task_number();


-- =========================
-- 5. AUTO-UPDATE updated_at TRIGGERS
-- =========================

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_task_templates_updated_at
  BEFORE UPDATE ON task_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =========================
-- 6. ROW LEVEL SECURITY
-- =========================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;

-- ---- Profiles Policies ----

-- All authenticated users can view active profiles
CREATE POLICY profiles_select ON profiles
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Users can update their own profile
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can update any profile
CREATE POLICY profiles_update_admin ON profiles
  FOR UPDATE TO authenticated
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- Admins can insert profiles
CREATE POLICY profiles_insert_admin ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() = 'admin' OR id = auth.uid());

-- ---- Clients Policies ----

-- All authenticated users can view clients
CREATE POLICY clients_select ON clients
  FOR SELECT TO authenticated
  USING (true);

-- Sales, PM, and Admin can create clients
CREATE POLICY clients_insert ON clients
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('admin', 'sales', 'operations'));

-- Sales, Operations, and Admin can update clients
CREATE POLICY clients_update ON clients
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('admin', 'sales', 'operations'))
  WITH CHECK (get_user_role() IN ('admin', 'sales', 'operations'));

-- Only Admin can delete clients
CREATE POLICY clients_delete ON clients
  FOR DELETE TO authenticated
  USING (get_user_role() = 'admin');

-- ---- Proposals Policies ----

-- All authenticated users can view proposals
CREATE POLICY proposals_select ON proposals
  FOR SELECT TO authenticated
  USING (true);

-- Sales and Admin can create proposals
CREATE POLICY proposals_insert ON proposals
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('admin', 'sales'));

-- Sales (own) and Admin can update proposals
CREATE POLICY proposals_update ON proposals
  FOR UPDATE TO authenticated
  USING (
    get_user_role() = 'admin'
    OR (get_user_role() = 'sales' AND sales_person_id = auth.uid())
  )
  WITH CHECK (
    get_user_role() = 'admin'
    OR (get_user_role() = 'sales' AND sales_person_id = auth.uid())
  );

-- Only Admin can delete proposals
CREATE POLICY proposals_delete ON proposals
  FOR DELETE TO authenticated
  USING (get_user_role() = 'admin');

-- ---- Projects Policies ----

-- All authenticated users can view projects
CREATE POLICY projects_select ON projects
  FOR SELECT TO authenticated
  USING (true);

-- Operations and Admin can create projects
CREATE POLICY projects_insert ON projects
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('admin', 'operations'));

-- Operations (own) and Admin can update projects
CREATE POLICY projects_update ON projects
  FOR UPDATE TO authenticated
  USING (
    get_user_role() = 'admin'
    OR (get_user_role() = 'operations' AND operations_id = auth.uid())
  )
  WITH CHECK (
    get_user_role() = 'admin'
    OR (get_user_role() = 'operations' AND operations_id = auth.uid())
  );

-- Only Admin can delete projects
CREATE POLICY projects_delete ON projects
  FOR DELETE TO authenticated
  USING (get_user_role() = 'admin');

-- ---- Tasks Policies ----

-- All authenticated users can view tasks
CREATE POLICY tasks_select ON tasks
  FOR SELECT TO authenticated
  USING (true);

-- Operations and Admin can create tasks
CREATE POLICY tasks_insert ON tasks
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('admin', 'operations'));

-- Assignee, Operations, and Admin can update tasks
CREATE POLICY tasks_update ON tasks
  FOR UPDATE TO authenticated
  USING (
    get_user_role() = 'admin'
    OR get_user_role() = 'operations'
    OR assignee_id = auth.uid()
  )
  WITH CHECK (
    get_user_role() = 'admin'
    OR get_user_role() = 'operations'
    OR assignee_id = auth.uid()
  );

-- Operations and Admin can delete tasks
CREATE POLICY tasks_delete ON tasks
  FOR DELETE TO authenticated
  USING (get_user_role() IN ('admin', 'operations'));

-- ---- Task Templates Policies ----

-- All authenticated users can view templates
CREATE POLICY task_templates_select ON task_templates
  FOR SELECT TO authenticated
  USING (true);

-- Admin and Operations can manage templates
CREATE POLICY task_templates_insert ON task_templates
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('admin', 'operations'));

CREATE POLICY task_templates_update ON task_templates
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('admin', 'operations'))
  WITH CHECK (get_user_role() IN ('admin', 'operations'));

CREATE POLICY task_templates_delete ON task_templates
  FOR DELETE TO authenticated
  USING (get_user_role() = 'admin');


-- =========================
-- 7. INDEXES
-- =========================

-- Profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- Clients
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_created_by ON clients(created_by);

-- Proposals
CREATE INDEX idx_proposals_client_id ON proposals(client_id);
CREATE INDEX idx_proposals_sales_person_id ON proposals(sales_person_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_project_type ON proposals(project_type);
CREATE INDEX idx_proposals_expected_close_date ON proposals(expected_close_date);

-- Projects
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_proposal_id ON projects(proposal_id);
CREATE INDEX idx_projects_operations_id ON projects(operations_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_project_type ON projects(project_type);
CREATE INDEX idx_projects_end_date ON projects(end_date);

-- Tasks
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_sort_order ON tasks(project_id, sort_order);

-- Task Templates
CREATE INDEX idx_task_templates_project_type ON task_templates(project_type);


-- =========================
-- 8. SQL VIEWS
-- =========================

-- Sales Dashboard: proposal stats grouped by sales person
CREATE OR REPLACE VIEW v_sales_dashboard AS
SELECT
  p.sales_person_id,
  pr.full_name AS sales_person_name,
  COUNT(*) AS total_proposals,
  COUNT(*) FILTER (WHERE p.status = 'won') AS won_count,
  COUNT(*) FILTER (WHERE p.status = 'lost') AS lost_count,
  COUNT(*) FILTER (WHERE p.status IN ('lead', 'negotiating', 'quoted', 'pending')) AS active_count,
  COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'won'), 0) AS won_amount,
  COALESCE(SUM(p.amount) FILTER (WHERE p.status IN ('lead', 'negotiating', 'quoted', 'pending')), 0) AS pipeline_amount,
  CASE
    WHEN COUNT(*) FILTER (WHERE p.status IN ('won', 'lost')) > 0
    THEN ROUND(
      COUNT(*) FILTER (WHERE p.status = 'won')::NUMERIC /
      COUNT(*) FILTER (WHERE p.status IN ('won', 'lost'))::NUMERIC * 100, 1
    )
    ELSE 0
  END AS win_rate
FROM proposals p
JOIN profiles pr ON p.sales_person_id = pr.id
GROUP BY p.sales_person_id, pr.full_name;

-- Delayed Projects: projects past end_date that are not completed/closed
CREATE OR REPLACE VIEW v_delayed_projects AS
SELECT
  p.id,
  p.project_number,
  p.name,
  p.status,
  p.end_date,
  p.operations_id,
  pr.full_name AS operations_name,
  c.name AS client_name,
  (CURRENT_DATE - p.end_date) AS days_overdue,
  (
    SELECT COUNT(*) FROM tasks t
    WHERE t.project_id = p.id AND t.status != 'done'
  ) AS remaining_tasks
FROM projects p
JOIN profiles pr ON p.operations_id = pr.id
JOIN clients c ON p.client_id = c.id
WHERE p.end_date < CURRENT_DATE
  AND p.status NOT IN ('completed', 'closed')
ORDER BY p.end_date ASC;

-- Upcoming Tasks: tasks due within the next 3 days
CREATE OR REPLACE VIEW v_upcoming_tasks AS
SELECT
  t.id,
  t.task_number,
  t.title,
  t.status,
  t.priority,
  t.due_date,
  t.assignee_id,
  pr.full_name AS assignee_name,
  t.project_id,
  p.project_number,
  p.name AS project_name,
  (t.due_date - CURRENT_DATE) AS days_until_due
FROM tasks t
JOIN projects p ON t.project_id = p.id
LEFT JOIN profiles pr ON t.assignee_id = pr.id
WHERE t.due_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '3 days')
  AND t.status NOT IN ('done')
ORDER BY t.due_date ASC, t.priority DESC;


-- =========================
-- 9. SEED DATA
-- =========================

-- Task template for 線上活動 (Online Event)
INSERT INTO task_templates (name, project_type, tasks) VALUES (
  '線上活動標準流程',
  'online_event',
  '[
    {
      "title": "建立活動頁",
      "description": "建立活動登錄頁面，包含活動資訊、報名表單、講師介紹等",
      "priority": "high",
      "default_offset_days": 0,
      "sort_order": 1
    },
    {
      "title": "上架教材",
      "description": "上傳並設定課程教材、講義、補充資料等",
      "priority": "high",
      "default_offset_days": 3,
      "sort_order": 2
    },
    {
      "title": "測試",
      "description": "執行完整測試流程，包含功能測試、跨瀏覽器測試、行動裝置測試",
      "priority": "high",
      "default_offset_days": 5,
      "sort_order": 3
    },
    {
      "title": "寄送通知",
      "description": "寄送活動通知信件給所有報名者，包含活動連結、注意事項等",
      "priority": "medium",
      "default_offset_days": 7,
      "sort_order": 4
    },
    {
      "title": "QA確認",
      "description": "最終品質確認，確保所有功能正常運作、內容正確無誤",
      "priority": "urgent",
      "default_offset_days": 8,
      "sort_order": 5
    },
    {
      "title": "結案",
      "description": "活動結束後整理結案報告，包含出席率、滿意度調查、改善建議等",
      "priority": "medium",
      "default_offset_days": 14,
      "sort_order": 6
    }
  ]'::jsonb
);
