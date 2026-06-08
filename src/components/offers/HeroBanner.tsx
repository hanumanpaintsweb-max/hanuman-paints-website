"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { supabase } from "@/services/supabase"
import Link from "next/link"
import { ArrowRight, Clock, Gift } from "lucide-react"

type Offer = {
  id: string
  title: string
  description: string
  offer_type: string
  discount_value: number
  valid_until: string
  badge_text: string
  badge_color: string
}

export function HeroBanner() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    async function fetchOffers() {
      const { data } = await supabase
        .from('offers')
        .select('*')
        .eq('is_active', true)
        .in('display_location', ['Hero banner', 'All'])
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
    }, 5000)
    return () => clearInterval(timer)
  }, [offers.length])

  if (offers.length === 0) return null

  const offer = offers[currentIndex]

  // Calculate days left if valid_until exists
  let daysLeft = null
  if (offer.valid_until) {
    const diff = new Date(offer.valid_until).getTime() - new Date().getTime()
    if (diff > 0) {
      daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24))
    }
  }

  return (
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 mb-8 z-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/90 to-primary shadow-xl"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative flex flex-col md:flex-row items-center justify-between p-6 md:p-8 gap-6 text-white">
            <div className="flex-1 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
              <div className="hidden md:flex size-14 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Gift className="size-7" />
              </div>
              
              <div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                  {offer.badge_text && (
                    <span className="rounded bg-white px-2.5 py-0.5 text-xs font-black tracking-wider uppercase" style={{ color: offer.badge_color || '#F97316' }}>
                      {offer.badge_text}
                    </span>
                  )}
                  {daysLeft !== null && (
                    <span className="flex items-center gap-1 rounded bg-black/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm">
                      <Clock className="size-3" /> Ends in {daysLeft} days
                    </span>
                  )}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
                  {offer.title}
                  {offer.discount_value > 0 && (
                    <span className="ml-3 text-yellow-300 font-extrabold">
                      {offer.offer_type.includes('Percentage') ? `${offer.discount_value}% OFF` : ''}
                      {offer.offer_type.includes('Fixed') ? `₹${offer.discount_value} OFF` : ''}
                    </span>
                  )}
                </h3>
                {offer.description && <p className="text-white/80 font-medium">{offer.description}</p>}
              </div>
            </div>

            <Link href="/offers" className="shrink-0">
              <button className="group flex h-12 items-center gap-2 rounded-xl bg-white px-6 font-bold text-primary transition-all hover:bg-gray-50 hover:shadow-lg">
                Shop Now
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pagination indicators if multiple offers */}
      {offers.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20">
          {offers.map((_, idx) => (
            <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} />
          ))}
        </div>
      )}
    </div>
  )
}
