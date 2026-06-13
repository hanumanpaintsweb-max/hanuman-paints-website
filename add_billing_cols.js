const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { error } = await supabase.rpc('exec_sql', { query: `
    ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0;
    ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS outstanding_balance NUMERIC DEFAULT 0;
  `});
  console.log("RPC exec_sql result:", error);
}
run();
