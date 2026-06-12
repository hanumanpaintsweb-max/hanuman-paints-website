-- SQL Migration: Update bills_payment_method_check constraint

-- 1. Drop the existing constraint if it exists
ALTER TABLE public.bills DROP CONSTRAINT IF EXISTS bills_payment_method_check;

-- 2. Update existing data to match the new strict casing
UPDATE public.bills SET payment_method = 'Cash' WHERE payment_method ILIKE 'cash';
UPDATE public.bills SET payment_method = 'UPI' WHERE payment_method ILIKE 'upi';
UPDATE public.bills SET payment_method = 'Unpaid' WHERE payment_method ILIKE 'credit' OR payment_method ILIKE 'unpaid';

-- Safely catch any orphaned or invalid legacy strings (like 'CARD') and map them to 'Cash'
UPDATE public.bills SET payment_method = 'Cash' WHERE payment_method NOT IN ('Cash', 'UPI', 'Unpaid') OR payment_method IS NULL;

-- 3. Add the newly structured constraint
-- This enforces exact casing to match the frontend selection options
ALTER TABLE public.bills ADD CONSTRAINT bills_payment_method_check 
CHECK (payment_method IN ('Cash', 'UPI', 'Unpaid'));
