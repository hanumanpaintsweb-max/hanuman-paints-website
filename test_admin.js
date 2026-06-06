const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('admin_users').select('*');
  console.log("Data:", data);
  console.log("Error:", error);
}

test();
