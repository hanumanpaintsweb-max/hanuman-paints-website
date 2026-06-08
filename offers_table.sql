CREATE TABLE IF NOT EXISTS 
public.offers (
  id UUID DEFAULT gen_random_uuid() 
    PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  offer_type TEXT NOT NULL,
  discount_value NUMERIC,
  applicable_on TEXT DEFAULT 'all',
  category_id TEXT,
  product_id TEXT,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  display_location TEXT DEFAULT 'all',
  badge_text TEXT,
  badge_color TEXT DEFAULT '#F97316',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.offers 
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active offers"
  ON public.offers FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage offers"
  ON public.offers FOR ALL
  USING (true)
  WITH CHECK (true);
