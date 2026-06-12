import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function test() {
  const billData = {
    id: crypto.randomUUID(),
    bill_number: 'TEST-12345',
    customer_name: 'Test Customer',
    customer_phone: '9999999999',
    customer_address: 'Test Addr',
    items: [],
    subtotal: 100,
    discount_amount: 0,
    taxable_value: 100,
    cgst_amount: 0,
    sgst_amount: 0,
    total_amount: 100,
    payment_status: 'Unpaid',
    payment_method: 'Unpaid',
    order_id: null,
    bill_type: 'mrp'
  };

  const ledgerData = {
    id: crypto.randomUUID(),
    customer_name: 'Test Customer',
    customer_phone: '9999999999',
    type: 'receivable',
    amount: 100,
    description: 'Bill #TEST-12345',
    date: new Date().toISOString().split('T')[0],
    due_date: null,
    status: 'pending',
    bill_number: 'TEST-12345'
  };

  const { data, error } = await supabase.rpc('save_bill_with_ledger', {
    p_bill: billData,
    p_ledger: ledgerData
  });
  
  console.log('RPC Result:', data, 'Error:', error);
}
test();
