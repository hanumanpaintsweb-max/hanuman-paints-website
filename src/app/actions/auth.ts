"use server"

import { cookies } from "next/headers"
import { supabase } from "@/services/supabase"

export async function loginUser(phone: string, name: string) {
  // Check if user exists
  let { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("phone", phone)
    .single()

  if (error || !user) {
    if (!name) {
      return { error: "Name is required for first-time login" }
    }
    // Create new user
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([{ phone, name }])
      .select()
      .single()

    if (insertError || !newUser) {
      console.error("Supabase user insert error:", insertError)
      return { error: `Failed to create user account: ${insertError?.message || "Unknown error"}` }
    }
    user = newUser
  }

  // Set secure cookie
  const cookieStore = await cookies()
  cookieStore.set("hanuman_session", JSON.stringify({ id: user.id, phone: user.phone, name: user.name }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  return { success: true, user }
}

export async function logoutUser() {
  const cookieStore = await cookies()
  cookieStore.delete("hanuman_session")
  return { success: true }
}

export async function getSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("hanuman_session")
  if (!sessionCookie) return null

  try {
    return JSON.parse(sessionCookie.value)
  } catch {
    return null
  }
}
