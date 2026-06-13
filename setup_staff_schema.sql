-- Staff Management Schema Setup

-- 1. Create the staff table
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Add staff_name to bills table
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS staff_name VARCHAR(255);

-- 3. Set up RLS for staff table
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access for staff" ON public.staff FOR SELECT USING (true);
CREATE POLICY "Allow insert access for staff" ON public.staff FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update access for staff" ON public.staff FOR UPDATE USING (true);
CREATE POLICY "Allow delete access for staff" ON public.staff FOR DELETE USING (true);
