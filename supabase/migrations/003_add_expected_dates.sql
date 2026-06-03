ALTER TABLE proposals ADD COLUMN IF NOT EXISTS expected_start DATE;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS expected_end DATE;
-- 通知 Supabase 重新載入 Schema Cache
NOTIFY pgrst, 'reload schema';
