import { supabase } from './src/services/supabase';

async function run() {
  const { data, error } = await supabase.from('offers').insert([
    {
      title: 'Test Offer',
      description: '10% off',
      offer_type: 'percentage',
      discount_value: 10,
      is_active: true,
      display_location: 'all' 
    }
  ]).select();
  
  if (error) console.error('Error:', error);
  else console.log('Inserted:', data);
}
run();
