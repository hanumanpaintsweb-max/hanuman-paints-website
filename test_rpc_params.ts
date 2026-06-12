import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function test() {
  const { data, error } = await supabase.rpc('save_bill_with_ledger', {
    p_bill: { id: crypto.randomUUID(), bill_number: '123' }
  });
  console.log('Result:', data, 'Error:', error);
}
test();
