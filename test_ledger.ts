import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function test() {
  const { data, error } = await supabase.from('ledger').insert([
    {
        customer_name: 'Test Customer',
        customer_phone: '9999999999',
        type: 'receivable',
        amount: 500,
        description: `Bill #TEST-123`,
        date: new Date().toISOString().split('T')[0],
        status: 'pending'
    }
  ]);
  console.log('Result:', data, 'Error:', error);
}
test();
