const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  console.log("Testing Bills Insert...");
  const { data, error } = await supabase.from('bills').insert([{
    bill_number: 'HP-TEST-002',
    customer_name: 'Test',
    customer_phone: '1234567890',
    items: [],
    subtotal: 100,
    discount_amount: 0,
    taxable_value: 100,
    cgst_amount: 9,
    sgst_amount: 9,
    total_amount: 118,
    payment_status: 'paid',
    payment_method: 'cash'
  }]).select();
  
  if (error) {
    console.error("Insert Error:", error);
  } else {
    console.log("Insert Success:", data);
  }
}
test();
