-- ==========================================
-- FINAL HANDOVER FIXES SQL
-- ==========================================

-- 1. FIX RLS ON PRODUCTS TABLE FOR STOCK UPDATE
-- The frontend is trying to update the current_stock in the Stock page,
-- which might be failing due to Row Level Security missing an UPDATE policy.
DROP POLICY IF EXISTS "Allow update access" ON public.products;
CREATE POLICY "Allow update access" ON public.products 
FOR UPDATE USING (true) WITH CHECK (true);

-- 2. FIX DEDUCT_STOCK RPC
-- Ensure deduct_stock RPC function exists with correct parameters and updates history.
CREATE OR REPLACE FUNCTION deduct_stock(p_product_id UUID, p_quantity INT, p_changed_by TEXT DEFAULT 'billing-auto')
RETURNS void AS $$
DECLARE
  v_old_stock INT;
  v_new_stock INT;
  v_product_name TEXT;
BEGIN
  -- Get current details
  SELECT current_stock, name INTO v_old_stock, v_product_name FROM products WHERE id = p_product_id;
  
  IF v_old_stock IS NOT NULL THEN
    v_new_stock := GREATEST(0, v_old_stock - p_quantity);
    
    -- Update product stock
    UPDATE products SET current_stock = v_new_stock, updated_at = NOW() WHERE id = p_product_id;
    
    -- Insert into stock history
    INSERT INTO stock_history (product_id, product_name, old_stock, new_stock, changed_by, created_at)
    VALUES (p_product_id, v_product_name, v_old_stock, v_new_stock, p_changed_by, NOW());
  END IF;
END;
$$ LANGUAGE plpgsql;
