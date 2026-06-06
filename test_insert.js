const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('admin_users').insert([
    {
      email: 'admin@hanumanpaints.in',
      password_hash: '$2b$10$iBmkGX/BvyQxqCSE6jdBqeA6SmiEGJan9.zp7x8V9CINBpZQhK07G',
      failed_attempts: 0,
      locked_until: null
    }
  ]);
  console.log("Insert Data:", data);
  console.log("Insert Error:", error);
}

test();
