CREATE OR REPLACE FUNCTION
deduct_stock(
  p_product_id TEXT,
  p_quantity NUMERIC,
  p_changed_by TEXT DEFAULT 'billing-auto'
) RETURNS void AS $$
DECLARE
  v_stock RECORD;
BEGIN
  SELECT * INTO v_stock
  FROM stock
  WHERE product_id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN RETURN; END IF;

  UPDATE stock
  SET current_stock = GREATEST(
    0, current_stock - p_quantity
  ),
  updated_at = NOW()
  WHERE product_id = p_product_id;

  INSERT INTO stock_history (
    product_id, product_name,
    old_stock, new_stock, changed_by
  ) VALUES (
    p_product_id,
    v_stock.product_name,
    v_stock.current_stock,
    GREATEST(0, v_stock.current_stock
      - p_quantity),
    p_changed_by
  );
END;
$$ LANGUAGE plpgsql;
