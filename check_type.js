const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { error } = await supabase.from('products').insert([{ categoryId: 'invalid-uuid-string' }]);
  console.log("Error:", error);
}
run();
