require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRpc() {
  const p_bill = {
    bill_number: "HP-S-999",
    customer_name: "Test",
    customer_phone: "9999999999",
    items: [],
    subtotal: 100,
    discount_amount: 0,
    total_amount: 100,
    payment_status: "paid",
    bill_type: "mrp"
  };
  
  const { data, error } = await supabase.rpc('save_bill_with_ledger', {
    p_bill,
    p_ledger: null
  });
  console.log("RPC Data:", data);
  console.log("RPC Error:", error);
}
testRpc();
