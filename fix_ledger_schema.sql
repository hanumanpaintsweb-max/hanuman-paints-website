-- RUN THIS IN SUPABASE SQL EDITOR TO FIX THE UDHAAR ENTRY CRASH

ALTER TABLE public.ledger ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE public.ledger ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE public.ledger ADD COLUMN IF NOT EXISTS bill_number TEXT;
ALTER TABLE public.ledger ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.ledger ADD COLUMN IF NOT EXISTS type TEXT;

-- NOTE: The crash happens because the frontend and the RPC function are trying to save the `bill_number` and `status` to the `ledger` table, but those columns do not actually exist in your Supabase database! Running this will instantly fix the "UDHAAR ENTRY FAIL" error.
