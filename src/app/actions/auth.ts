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

// Ensure bcryptjs is imported at top or required dynamically since this is a server action
const bcrypt = require("bcryptjs")

export async function authenticateAdmin(email: string, password: string) {
  try {
    const cleanEmail = email.trim();
    const { data: user, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", cleanEmail)
      .single()

    if (error || !user) {
      console.error("Supabase Auth Error for admin_users:", error)
      return { success: false, message: "Invalid email or password" }
    }

    const now = new Date()

    // Check if locked
    if (user.locked_until && new Date(user.locked_until) > now) {
      const remainingMinutes = Math.ceil((new Date(user.locked_until).getTime() - now.getTime()) / 60000)
      return { success: false, message: `Account locked. Try again in ${remainingMinutes} minutes`, locked: true, lockedUntil: user.locked_until }
    }

    if (!user.password_hash) {
      return { success: false, message: "Server misconfiguration: No password set for this admin user. Please run the SQL setup script." }
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash)

    if (!isMatch) {
      const newAttempts = (user.failed_attempts || 0) + 1
      let updates: any = { failed_attempts: newAttempts }

      if (newAttempts >= 5) {
        // Lock for 15 minutes
        const lockTime = new Date(now.getTime() + 15 * 60000)
        updates.locked_until = lockTime.toISOString()
        updates.failed_attempts = 0 // Optional: reset after lock
      }

      await supabase.from("admin_users").update(updates).eq("id", user.id)

      if (newAttempts >= 5) {
        return { success: false, message: "Too many failed attempts. Account locked for 15 minutes.", locked: true, lockedUntil: updates.locked_until }
      }

      return { success: false, message: `Invalid password. ${5 - newAttempts} attempts remaining.` }
    }

    // Success
    await supabase.from("admin_users").update({
      failed_attempts: 0,
      locked_until: null,
      last_login: now.toISOString()
    }).eq("id", user.id)

    return { success: true, user: { email: user.email, id: user.id } }
  } catch (error: any) {
    return { success: false, message: error.message || "An error occurred during login" }
  }
}
