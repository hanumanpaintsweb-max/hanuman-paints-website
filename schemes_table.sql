CREATE TABLE IF NOT EXISTS 
public.schemes (
  id UUID DEFAULT gen_random_uuid() 
    PRIMARY KEY,
  name TEXT NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  scheme_type TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  reward_amount NUMERIC,
  reward_percentage NUMERIC,
  product_id TEXT,
  product_name TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS
public.scheme_progress (
  id UUID DEFAULT gen_random_uuid()
    PRIMARY KEY,
  scheme_id UUID REFERENCES 
    public.schemes(id),
  current_value NUMERIC DEFAULT 0,
  last_calculated TIMESTAMPTZ,
  is_achieved BOOLEAN DEFAULT false,
  achieved_at TIMESTAMPTZ
);

ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage schemes"
  ON public.schemes FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admins can manage scheme_progress"
  ON public.scheme_progress FOR ALL USING (true) WITH CHECK (true);
