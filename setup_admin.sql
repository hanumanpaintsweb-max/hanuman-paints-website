-- COPY PASTE THIS EXACTLY INTO SUPABASE SQL EDITOR AND CLICK RUN

-- 1. Ensure columns exist
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS failed_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- 2. IMPORTANT FIX: Enable read access for the login script
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read admin users" ON public.admin_users;
CREATE POLICY "Anyone can read admin users" 
  ON public.admin_users FOR SELECT 
  USING (true);

-- 3. Clear old broken records
DELETE FROM public.admin_users WHERE email = 'admin@hanumanpaints.in';

-- 4. Insert fresh account with hash for "rahul@123"
INSERT INTO public.admin_users (email, password_hash, failed_attempts, locked_until)
VALUES (
  'admin@hanumanpaints.in', 
  '$2b$10$iBmkGX/BvyQxqCSE6jdBqeA6SmiEGJan9.zp7x8V9CINBpZQhK07G', 
  0, 
  NULL
);
