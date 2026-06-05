import supabase from './supabase';

// Fetch all products with optional category filter
export const getProducts = async ({ category = null, search = null, limit = 50, offset = 0 } = {}) => {
  let query = supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1);

  if (category) query = query.eq('category', category);
  if (search) query = query.ilike('name', `%${search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Fetch single product
export const getProductById = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

// Fetch all unique categories
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .order('category');
  if (error) throw error;
  const unique = [...new Set(data.map(d => d.category).filter(Boolean))];
  return unique;
};
