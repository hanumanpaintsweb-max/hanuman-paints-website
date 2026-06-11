require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBills() {
  const { data, error } = await supabase.from('bills').select('*').limit(1);
  if (error) {
    console.error('Error fetching bills:', error);
  } else {
    if (data.length > 0) {
      console.log('Columns in bills table:', Object.keys(data[0]));
    } else {
      console.log('No bills found to inspect columns.');
    }
  }
}
checkBills();
