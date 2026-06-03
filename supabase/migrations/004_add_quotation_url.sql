ALTER TABLE proposals ADD COLUMN IF NOT EXISTS quotation_url TEXT;
-- 通知 Supabase 重新載入 Schema Cache
NOTIFY pgrst, 'reload schema';
