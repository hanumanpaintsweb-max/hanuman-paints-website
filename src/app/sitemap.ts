import { MetadataRoute } from 'next'
import { supabase } from '@/services/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.hanumanpaints.in'
  
  // Fetch active products
  // Supabase instance handles placeholder logic internally to prevent build crashes
  // Fetch active products
  const { data: products } = await supabase
    .from('products')
    .select('id, updated_at')
    .eq('is_active', true)
    
  const productEntries: MetadataRoute.Sitemap = (products || []).map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/colours`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...productEntries,
  ]
}
