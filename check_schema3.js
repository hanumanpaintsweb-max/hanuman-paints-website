const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data: ledger } = await supabase.from('ledger').select('*').limit(1);
  console.log("Ledger schema sample:", ledger[0] ? Object.keys(ledger[0]) : "No ledger");
}
run();
