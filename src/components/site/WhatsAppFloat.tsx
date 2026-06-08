"use client"

import { usePathname } from "next/navigation"
import { MessageCircle } from "lucide-react"

export function WhatsAppFloat() {
  const pathname = usePathname()

  if (pathname?.startsWith("/admin")) return null;

  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919204367192"
  const message = encodeURIComponent("Hello Hanuman Paints, I need consultation")
  const waLink = `https://wa.me/${phoneNumber}?text=${message}`

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[9999] flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-transform hover:scale-110 hover:bg-[#128C7E] animate-pulse group"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle className="size-7" />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-4 whitespace-nowrap rounded-lg bg-black/80 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
        Chat with us on WhatsApp
        <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-[5px] border-transparent border-l-black/80" />
      </span>
    </a>
  )
}
