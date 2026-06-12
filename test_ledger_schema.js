const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('ledger').insert({
        customer_name: 'Test',
        customer_phone: '1234567890',
        type: 'receivable',
        amount: 100,
        description: `Bill #test`,
        bill_number: 'test'
  }).select();
  console.log('Result:', data, 'Error:', error);
}
check();
