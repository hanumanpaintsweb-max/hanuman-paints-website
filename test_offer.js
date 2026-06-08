const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: tableCheck, error: tableError } = await supabase
    .from('offers')
    .select('id')
    .limit(1);
    
  if (tableError) {
    console.error('Table check error:', tableError.message);
  } else {
    console.log('Offers table exists.');
  }

  const { data, error } = await supabase.from('offers').insert([
    {
      title: 'Sunday Special',
      description: '10% off on all paints',
      offer_type: 'Percentage discount',
      discount_value: 10,
      is_active: true,
      display_locations: ['all'] // using array or string depending on schema. Wait, schema says display_location? let me check schema
    }
  ]).select();
  
  if (error) {
    console.error('Insert error:', error.message);
  } else {
    console.log('Inserted:', data);
  }
}
run();
