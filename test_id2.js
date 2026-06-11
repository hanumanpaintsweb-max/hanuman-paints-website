require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testId() {
  const p_bill = {
    bill_number: "HP-S-888",
    customer_name: "Test",
    customer_phone: "9999999999",
    items: [],
    subtotal: 100,
    discount_amount: 0,
    taxable_value: 100,
    cgst_amount: 0,
    sgst_amount: 0,
    total_amount: 100,
    payment_status: "paid"
  };
  const { data, error } = await supabase.from('bills').insert([p_bill]).select();
  console.log("Insert Data:", data);
  console.log("Insert Error:", error);
}
testId();
