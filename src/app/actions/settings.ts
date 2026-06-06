'use server'

import { revalidatePath } from 'next/cache'

export async function revalidateSettings() {
  revalidatePath('/')
  revalidatePath('/products')
  revalidatePath('/admin/billing')
}
