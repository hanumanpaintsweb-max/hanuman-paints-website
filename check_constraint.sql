SELECT pg_get_constraintdef(c.oid) AS constraint_def
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE c.conname = 'bills_payment_method_check';
