-- 006_activity_and_notifications.sql

-- 1. task_updates: 任務動態紀錄
CREATE TABLE task_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_role user_role,
  content TEXT NOT NULL,
  update_type TEXT CHECK (update_type IN (
    'progress', 'status_change', 'file_upload',
    'date_change', 'comment', 'milestone'
  )),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. notifications: 通知紀錄
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN (
    'task_due_soon', 'task_overdue', 'task_assigned',
    'project_created', 'status_change', 'weekly_summary',
    'assignment_pending'
  )),
  title TEXT NOT NULL,
  message TEXT,
  reference_type TEXT CHECK (reference_type IN ('task', 'project', 'proposal')),
  reference_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  slack_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. holidays: 台灣國定假日
CREATE TABLE holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  year INT NOT NULL
);

-- 4. notification_preferences: 個人通知偏好
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT FALSE,
  slack_notifications BOOLEAN DEFAULT TRUE,
  app_notifications BOOLEAN DEFAULT TRUE,
  days_in_advance INT DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_task_updates_project_id ON task_updates(project_id);
CREATE INDEX idx_task_updates_author_id ON task_updates(author_id);
CREATE INDEX idx_task_updates_created_at ON task_updates(created_at);

CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- RLS (Row Level Security) Policies
ALTER TABLE task_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- task_updates: 全員可讀
CREATE POLICY "Anyone can view task updates" ON task_updates
  FOR SELECT USING (auth.role() = 'authenticated');

-- task_updates: 僅能插入自己的更新
CREATE POLICY "Users can insert their own task updates" ON task_updates
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- notifications: 僅能查看和更新自己的通知
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = recipient_id);

-- holidays: 全員可讀，僅 admin 或特定角色可寫 (暫定 authenticated 可以 select)
CREATE POLICY "Anyone can view holidays" ON holidays
  FOR SELECT USING (auth.role() = 'authenticated');

-- notification_preferences: 僅能查看和更新自己的偏好
CREATE POLICY "Users can view their own preferences" ON notification_preferences
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can update their own preferences" ON notification_preferences
  FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "Users can insert their own preferences" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Trigger for notification_preferences updated_at
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_notification_preferences_updated_at();
