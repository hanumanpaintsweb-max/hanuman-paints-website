import supabase from './supabase';

// Place a new order
export const placeOrder = async (orderData) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Get all orders (admin)
export const getAllOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getOrdersByPhone = async (phone) => {
  const rawPhone = phone.replace(/\D/g, '').slice(-10);
  const phoneVariants = [
    rawPhone,
    `+91${rawPhone}`,
    `91${rawPhone}`,
  ];
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .in('customer_phone', phoneVariants)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Subscribe to new orders (realtime)
export const subscribeToOrders = (callback) => {
  return supabase
    .channel('orders-channel')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, callback)
    .subscribe();
};
