-- 1. Add missing columns to admin_users table
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS failed_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- 2. Set the password hash for the default admin
-- This hash corresponds to the password: Admin@123
UPDATE public.admin_users 
SET password_hash = '$2b$10$UYL.9TnGF/DqwjbAkPm0re/6E2yr5unkOddaZy.sW5GYMvD7htiDu'
WHERE email = 'admin@hanumanpaints.in';

-- If the admin somehow doesn't exist, insert it
INSERT INTO public.admin_users (email, password_hash)
SELECT 'admin@hanumanpaints.in', '$2b$10$UYL.9TnGF/DqwjbAkPm0re/6E2yr5unkOddaZy.sW5GYMvD7htiDu'
WHERE NOT EXISTS (
  SELECT 1 FROM public.admin_users WHERE email = 'admin@hanumanpaints.in'
);
