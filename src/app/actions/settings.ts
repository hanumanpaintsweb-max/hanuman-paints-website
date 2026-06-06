"use server"

import { supabase } from "@/services/supabase"
import { revalidatePath } from "next/cache"

export async function updateSetting(key: string, value: string) {
  const { error } = await supabase
    .from("settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

  if (error) {
    throw new Error("Failed to update setting")
  }
  
  revalidatePath("/")
  return { success: true }
}
