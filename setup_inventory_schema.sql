-- Inventory Management Schema Setup

-- 1. Ensure columns exist on products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS base_mrp numeric DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unit text DEFAULT 'L';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS current_stock numeric DEFAULT 0;

-- 2. Ensure current_stock doesn't accidentally drop below zero if you want strict checking
-- ALTER TABLE public.products ADD CONSTRAINT check_stock_positive CHECK (current_stock >= 0);

-- 3. Create or replace the deduct_stock RPC to interact with current_stock
CREATE OR REPLACE FUNCTION deduct_stock(
  p_product_id uuid,
  p_quantity numeric,
  p_changed_by text DEFAULT 'system'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock numeric;
BEGIN
  -- Fetch current stock
  SELECT current_stock INTO v_current_stock 
  FROM products 
  WHERE id = p_product_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Product not found');
  END IF;

  -- Update stock
  UPDATE products 
  SET current_stock = COALESCE(current_stock, 0) - p_quantity
  WHERE id = p_product_id;

  -- Optional: Insert into an audit log if needed
  -- INSERT INTO inventory_logs (product_id, quantity_change, changed_by) VALUES (p_product_id, -p_quantity, p_changed_by);

  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 4. Create an RPC for manually adjusting stock from the Stock Management page
CREATE OR REPLACE FUNCTION adjust_stock(
  p_product_id uuid,
  p_adjustment numeric, -- Can be positive or negative
  p_changed_by text DEFAULT 'admin'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products 
  SET current_stock = COALESCE(current_stock, 0) + p_adjustment
  WHERE id = p_product_id;

  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 5. Add type and category columns
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'direct';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- 6. Enable SELECT read access on products table for all users
CREATE POLICY "Allow read access" ON public.products FOR SELECT USING (true);
