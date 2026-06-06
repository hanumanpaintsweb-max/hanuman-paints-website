import { supabase } from './supabase'

export async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .single()

    if (error || !data) {
      return defaultValue
    }
    return data.value
  } catch (err) {
    console.error('Failed to fetch setting:', key, err)
    return defaultValue
  }
}
