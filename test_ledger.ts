import { supabase } from './src/services/supabase';

async function test() {
  const { data, error } = await supabase.from('ledger').insert([
    {
        customer_name: 'Test Customer',
        customer_phone: '9999999999',
        type: 'receivable',
        amount: 500,
        description: `Bill #TEST-123`,
        bill_number: 'TEST-123'
    }
  ]);
  console.log('Result:', data, 'Error:', error);
}
test();
