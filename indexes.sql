CREATE INDEX IF NOT EXISTS
  idx_orders_phone
  ON orders(customer_phone);

CREATE INDEX IF NOT EXISTS
  idx_orders_status
  ON orders(status);

CREATE INDEX IF NOT EXISTS
  idx_bills_number
  ON bills(bill_number);

CREATE INDEX IF NOT EXISTS
  idx_coupon_usage_phone
  ON coupon_usage(customer_phone);
