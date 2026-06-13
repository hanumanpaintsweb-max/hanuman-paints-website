import { NextResponse } from 'next/server';
import { supabase } from '@/services/supabase';
import productsMaster from '@/data/products-master.json';

export async function GET() {
  try {
    console.log('Wiping existing products...');
    
    // Attempt to delete all rows (make sure RLS allows this, or use service key)
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // hack to delete all

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json({ success: false, error: 'Failed to wipe table', details: deleteError }, { status: 500 });
    }

    console.log('Mapping payload for 359 products...');
    const payload = productsMaster.map((p: any) => ({
      name: p.name,
      unit: p.size,
      type: p.type || 'direct',
      category: p.category || 'General',
      base_mrp: 0,
      current_stock: 0,
      size: p.size, // Fallback for old codebase usage
      mrp: 0 // Fallback for old codebase usage
    }));

    console.log('Inserting payload...');
    const { error: insertError } = await supabase
      .from('products')
      .insert(payload);

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ success: false, error: 'Failed to insert products', details: insertError }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: payload.length });
  } catch (error: any) {
    console.error('Exception during seeding:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
