-- Run this in Supabase SQL Editor to enable real-time tracking for Orders and Bills
-- This ensures the admin panel auto-refreshes when a new order or bill is created.

-- Step 1: Ensure the supabase_realtime publication exists (it usually does by default)
-- CREATE PUBLICATION supabase_realtime; 

-- Step 2: Add the orders table to the publication
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Step 3: Add the bills table to the publication
ALTER PUBLICATION supabase_realtime ADD TABLE bills;

-- Optional: If you ever want to add more tables in the future, just use the same syntax:
-- ALTER PUBLICATION supabase_realtime ADD TABLE your_table_name;
