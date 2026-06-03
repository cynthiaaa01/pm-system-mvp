-- ============================================================
-- PM System - Task Updates & Notifications Tables
-- ============================================================

-- 1. Create Enums if they don't exist
DO $$ BEGIN
    CREATE TYPE update_type AS ENUM ('progress', 'status_change', 'file_upload', 'date_change', 'comment', 'milestone');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('task_due_soon', 'task_overdue', 'task_assigned', 'project_created', 'status_change', 'weekly_summary', 'assignment_pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reference_type AS ENUM ('task', 'project', 'proposal');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- 2. Create task_updates table
CREATE TABLE IF NOT EXISTS public.task_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_role user_role, -- assuming user_role enum already exists
    content TEXT NOT NULL,
    update_type update_type,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_task_updates_task_id ON public.task_updates(task_id);
CREATE INDEX IF NOT EXISTS idx_task_updates_project_id ON public.task_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_task_updates_author_id ON public.task_updates(author_id);


-- 3. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type notification_type,
    title TEXT NOT NULL,
    message TEXT,
    reference_type reference_type,
    reference_id UUID,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    slack_sent BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);


-- 4. Set up Row Level Security (RLS)
ALTER TABLE public.task_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read updates for projects they are involved in
CREATE POLICY "Users can view task updates" 
    ON public.task_updates 
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert task updates
CREATE POLICY "Users can insert task updates" 
    ON public.task_updates 
    FOR INSERT 
    WITH CHECK (auth.uid() = author_id);

-- Allow users to view their own notifications
CREATE POLICY "Users can view own notifications" 
    ON public.notifications 
    FOR SELECT 
    USING (auth.uid() = recipient_id);

-- Allow users to update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update own notifications" 
    ON public.notifications 
    FOR UPDATE 
    USING (auth.uid() = recipient_id);

-- Allow the system/users to insert notifications
CREATE POLICY "Users can insert notifications" 
    ON public.notifications 
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');
