"use server"

import twilio from "twilio"

export async function sendOrderStatusWhatsApp(
  orderId: string,
  status: string,
  phone: string,
  name: string
) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER

  // Silently return if Twilio is not configured
  if (!sid || !token || !fromNumber) {
    return { success: false, error: "Missing Twilio config" }
  }

  const client = twilio(sid, token)
  let messageBody = ""

  // Format Indian phone numbers for WhatsApp
  // Remove non-digits
  let cleanPhone = phone.replace(/\D/g, "")
  if (cleanPhone.length === 10) {
    cleanPhone = "91" + cleanPhone
  }
  const toWhatsApp = `whatsapp:+${cleanPhone}`

  switch (status) {
    case "Accepted":
      messageBody = `Namaste ${name}! Aapka Hanuman Paints ka order #${orderId} confirm ho gaya hai. Jald hi deliver hoga. Dhanyawad! 🎨`
      break
    case "Out for Delivery":
      messageBody = `Namaste ${name}! Aapka order #${orderId} ab delivery pe hai. Aaj deliver ho jaayega. Hanuman Paints 🚚`
      break
    case "Delivered":
      messageBody = `Namaste ${name}! Aapka order #${orderId} deliver ho gaya. Humse order karne ka shukriya! Hanuman Paints ❤️`
      break
    default:
      return { success: false, error: "Status not configured for WhatsApp notification" }
  }

  try {
    await client.messages.create({
      body: messageBody,
      from: `whatsapp:${fromNumber}`,
      to: toWhatsApp,
    })
    return { success: true }
  } catch {
    return { success: false, error: "Twilio API error" }
  }
}
