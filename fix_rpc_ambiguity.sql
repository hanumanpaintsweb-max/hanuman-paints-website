-- First, drop ALL overloaded variations of the deduct_stock function to fix PGRST203 ambiguity error.
DROP FUNCTION IF EXISTS deduct_stock(uuid, numeric);
DROP FUNCTION IF EXISTS deduct_stock(text, numeric, text);
DROP FUNCTION IF EXISTS deduct_stock(uuid, integer, text);
DROP FUNCTION IF EXISTS deduct_stock(uuid, numeric, text);
DROP FUNCTION IF EXISTS deduct_stock(uuid, integer);
DROP FUNCTION IF EXISTS deduct_stock(text, integer);

-- Now, recreate exactly ONE version of the function that matches the frontend payload.
-- We use TEXT for p_product_id to prevent "operator does not exist: text = uuid" errors.
CREATE OR REPLACE FUNCTION deduct_stock(p_product_id TEXT, p_quantity INT)
RETURNS void AS $$
DECLARE
  v_old_stock INT;
  v_new_stock INT;
  v_product_name TEXT;
BEGIN
  -- Get current details by forcing both sides to text to bypass type mismatch
  SELECT current_stock, name INTO v_old_stock, v_product_name 
  FROM products 
  WHERE id::TEXT = p_product_id::TEXT;
  
  IF v_old_stock IS NOT NULL THEN
    v_new_stock := GREATEST(0, v_old_stock - p_quantity);
    
    -- Update product stock (NO updated_at column to avoid 42703 error)
    UPDATE products 
    SET current_stock = v_new_stock 
    WHERE id::TEXT = p_product_id::TEXT;
    
    -- Insert into stock history
    INSERT INTO stock_history (product_id, product_name, old_stock, new_stock, changed_by, created_at) 
    VALUES (p_product_id, v_product_name, v_old_stock, v_new_stock, 'billing-auto', NOW());
  END IF;
END;
$$ LANGUAGE plpgsql;
