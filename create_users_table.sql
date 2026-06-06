CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() 
     PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE 
     DEFAULT NOW()
);

ALTER TABLE public.users 
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own data"
  ON public.users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read own data"
  ON public.users FOR SELECT
  USING (true);
