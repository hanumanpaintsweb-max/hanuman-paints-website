import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function test() {
  const { data, error } = await supabase
      .from("ledger")
      .select("*")
      .eq("type", "receivable")
      .order("date", { ascending: false });
  console.log('Ledger entries:', data?.length, error);
  if (data?.length) {
    console.log('First entry:', data[0]);
  }
}
test();
