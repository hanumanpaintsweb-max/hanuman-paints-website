const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data: bills } = await supabase.from('bills').select('*').limit(1);
  console.log("Bills schema sample:", bills[0] ? Object.keys(bills[0]) : "No bills");
  const { data: customers } = await supabase.from('customers').select('*').limit(1);
  console.log("Customers schema sample:", customers && customers.length ? Object.keys(customers[0]) : "No customers");
}
run();
