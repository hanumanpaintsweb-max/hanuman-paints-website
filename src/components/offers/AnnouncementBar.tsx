"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useActiveOffers, type Offer } from "@/hooks/useOffers"

export function AnnouncementBar() {
  const pathname = usePathname()
  const [offers, setOffers] = useState<Offer[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const activeOffers = useActiveOffers()

  useEffect(() => {
    const applicable = activeOffers.filter(o => 
      o.display_location?.toLowerCase() === 'announcement bar' || 
      o.display_location?.toLowerCase() === 'all'
    )
    if (applicable.length > 0) {
      setOffers(applicable)
    }
  }, [activeOffers])

  useEffect(() => {
    if (offers.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [offers.length])

  if (pathname.startsWith('/admin')) return null
  if (offers.length === 0) return null

  const offer = offers[currentIndex]

  return (
    <div className="bg-[#F97316] text-white text-xs sm:text-sm font-medium py-2 px-4 overflow-hidden relative h-10 flex items-center justify-center z-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute flex items-center gap-2"
        >
          {offer.badge_text && (
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold tracking-wider uppercase">
              {offer.badge_text}
            </span>
          )}
          <span>{offer.title}</span>
          {offer.discount_value > 0 && (
            <span className="font-bold">
              {offer.offer_type.includes('Percentage') ? `${offer.discount_value}% OFF` : ''}
              {offer.offer_type.includes('Fixed') ? `₹${offer.discount_value} OFF` : ''}
            </span>
          )}
          <Link href="/offers" className="underline underline-offset-2 ml-2 hover:text-white/80 transition-colors">
            Shop Now
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
