import { supabase } from '@/services/supabase'

export async function getSettings() {
  const { data } = await supabase
    .from('settings')
    .select('key, value')
  
  const settings: Record<string, string> = {}
  data?.forEach(row => {
    settings[row.key] = row.value
  })
  return settings
}
