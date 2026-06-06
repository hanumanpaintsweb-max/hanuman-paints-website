CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  coupon_code TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  order_id TEXT NOT NULL,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for anonymous users" ON coupon_usage
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for public users" ON coupon_usage
  FOR SELECT USING (true);
