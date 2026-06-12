-- SQL Migration: Update bills_payment_status_check constraint

-- 1. Drop the existing constraint if it exists
ALTER TABLE public.bills DROP CONSTRAINT IF EXISTS bills_payment_status_check;

-- 2. Update existing data to match the strict capitalization
UPDATE public.bills SET payment_status = 'Paid' WHERE payment_status ILIKE 'paid';
UPDATE public.bills SET payment_status = 'Unpaid' WHERE payment_status ILIKE 'unpaid';
UPDATE public.bills SET payment_status = 'Partial' WHERE payment_status ILIKE 'partial';

-- Safely catch any orphaned or invalid legacy strings and map them to 'Paid'
UPDATE public.bills SET payment_status = 'Paid' WHERE payment_status NOT IN ('Paid', 'Unpaid', 'Partial') OR payment_status IS NULL;

-- 3. Add the newly structured constraint
-- This enforces exact casing to match the updated frontend state
ALTER TABLE public.bills ADD CONSTRAINT bills_payment_status_check 
CHECK (payment_status IN ('Paid', 'Unpaid', 'Partial'));
