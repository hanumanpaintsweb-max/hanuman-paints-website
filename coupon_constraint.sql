DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'unique_coupon_customer'
  ) THEN
    ALTER TABLE coupon_usage
      ADD CONSTRAINT unique_coupon_customer
      UNIQUE (coupon_id, customer_phone);
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS
  idx_coupon_usage_coupon_id
  ON coupon_usage(coupon_id);
