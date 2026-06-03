-- Phase 4: 加入 Tags 欄位
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];
