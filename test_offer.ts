import { supabase } from './src/services/supabase';

async function run() {
  const { data, error } = await supabase.from('offers').insert([
    {
      title: 'Sunday Special',
      description: '10% off on all paints',
      offer_type: 'Percentage discount',
      discount_value: 10,
      applicable_on: 'all',
      is_active: true,
      display_location: 'all' 
    }
  ]).select();
  
  if (error) console.error('Error:', error);
  else console.log('Inserted:', data);
}
run();
