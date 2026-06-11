-- SUPABASE MIGRATION SCRIPT FOR BILLING PAGE FIXES
-- Run this in the Supabase SQL Editor

-- 1. Ensure the bill_type column exists in the bills table for the DPL/MRP toggle
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS bill_type TEXT DEFAULT 'mrp';

-- 2. Make sure save_bill_with_ledger maps ALL required columns properly.
-- The previous version missed taxable_value, cgst_amount, sgst_amount, payment_method, etc.
CREATE OR REPLACE FUNCTION save_bill_with_ledger(p_bill jsonb, p_ledger jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_bill_id uuid;
BEGIN
    -- 1. Insert the bill with ALL required fields
    INSERT INTO bills (
        id,
        bill_number,
        customer_name,
        customer_phone,
        customer_address,
        items,
        subtotal,
        discount_amount,
        taxable_value,
        cgst_amount,
        sgst_amount,
        total_amount,
        payment_status,
        payment_method,
        order_id,
        bill_type
    ) VALUES (
        gen_random_uuid(),
        p_bill->>'bill_number',
        p_bill->>'customer_name',
        p_bill->>'customer_phone',
        p_bill->>'customer_address',
        (p_bill->>'items')::jsonb,
        (p_bill->>'subtotal')::numeric,
        (p_bill->>'discount_amount')::numeric,
        (p_bill->>'taxable_value')::numeric,
        (p_bill->>'cgst_amount')::numeric,
        (p_bill->>'sgst_amount')::numeric,
        (p_bill->>'total_amount')::numeric,
        p_bill->>'payment_status',
        p_bill->>'payment_method',
        p_bill->>'order_id',
        COALESCE(p_bill->>'bill_type', 'mrp')
    )
    RETURNING id INTO v_bill_id;

    -- 2. Insert into ledger if p_ledger is provided
    IF p_ledger IS NOT NULL THEN
        INSERT INTO ledger (
            customer_name,
            customer_phone,
            type,
            amount,
            description,
            date,
            due_date,
            bill_number,
            status
        ) VALUES (
            p_ledger->>'customer_name',
            p_ledger->>'customer_phone',
            p_ledger->>'type',
            (p_ledger->>'amount')::numeric,
            p_ledger->>'description',
            (p_ledger->>'date')::date,
            CASE WHEN (p_ledger->>'due_date') IS NOT NULL THEN (p_ledger->>'due_date')::date ELSE NULL END,
            p_ledger->>'bill_number',
            p_ledger->>'status'
        );
    END IF;

    RETURN jsonb_build_object('success', true, 'bill_id', v_bill_id);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
