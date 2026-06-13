const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data: p } = await supabase.from('products').select('*').limit(1);
  console.log("Product schema sample:", p);
  const { data: c } = await supabase.from('categories').select('*').limit(1);
  console.log("Category schema sample:", c);
}
run();
