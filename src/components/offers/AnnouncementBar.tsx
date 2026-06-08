"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { supabase } from "@/services/supabase"
import Link from "next/link"

type Offer = {
  id: string
  title: string
  offer_type: string
  discount_value: number
  badge_text: string
}

export function AnnouncementBar() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    async function fetchOffers() {
      const { data } = await supabase
        .from('offers')
        .select('*')
        .eq('is_active', true)
        .in('display_location', ['Announcement bar', 'All'])
        .order('priority', { ascending: false })

      if (data && data.length > 0) {
        setOffers(data)
      }
    }
    fetchOffers()
  }, [])

  useEffect(() => {
    if (offers.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [offers.length])

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
