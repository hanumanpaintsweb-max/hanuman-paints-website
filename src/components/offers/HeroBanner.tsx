"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { ArrowRight, Clock, Gift } from "lucide-react"
import { useActiveOffers, type Offer } from "@/hooks/useOffers"

export function HeroBanner() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const activeOffers = useActiveOffers()

  useEffect(() => {
    const applicable = activeOffers.filter(o => 
      o.display_location?.toLowerCase() === 'hero banner' || 
      o.display_location?.toLowerCase() === 'all'
    )
    if (applicable.length > 0) {
      // Sort by priority if needed (useOffers already sorts if backend did, but let's assume it's sorted)
      setOffers(applicable)
    }
  }, [activeOffers])

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
    <div className="relative mx-auto max-w-4xl px-4 mb-4 z-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-full bg-slate-950 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] group"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-primary/10 to-orange-500/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
          
          <div className="relative flex items-center justify-between py-2 px-2.5 md:py-2 md:px-3 gap-3 md:gap-4 text-white">
            <div className="flex items-center gap-3 overflow-hidden">
              <div 
                className="flex shrink-0 items-center justify-center rounded-full bg-white/10 size-9 md:size-10 shadow-inner"
                style={{ color: offer.badge_color || '#F97316' }}
              >
                <Gift className="size-4 md:size-5" />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 truncate">
                <div className="flex items-center gap-2 shrink-0">
                  {offer.badge_text && (
                    <span 
                      className="rounded-full px-2.5 py-0.5 text-[9px] md:text-[10px] font-black tracking-widest uppercase border"
                      style={{ 
                        color: offer.badge_color || '#F97316', 
                        borderColor: offer.badge_color ? `${offer.badge_color}50` : '#F9731650',
                        backgroundColor: offer.badge_color ? `${offer.badge_color}10` : '#F9731610'
                      }}
                    >
                      {offer.badge_text}
                    </span>
                  )}
                  {daysLeft !== null && (
                    <span className="flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 text-[9px] md:text-[10px] font-bold">
                      <Clock className="size-3" /> Ends in {daysLeft}d
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1.5 md:gap-2 truncate">
                  <h3 className="text-sm md:text-base font-bold truncate tracking-tight">
                    {offer.title}
                  </h3>
                  {offer.discount_value > 0 && (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-yellow-500 font-black text-sm md:text-base shrink-0">
                      {offer.offer_type.includes('Percentage') ? `${offer.discount_value}% OFF` : ''}
                      {offer.offer_type.includes('Fixed') ? `₹${offer.discount_value} OFF` : ''}
                      {offer.offer_type.includes('Free delivery') ? `FREE DEL` : ''}
                      {offer.offer_type.includes('Buy X Get Y') ? `BOGO` : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Link href="/products" className="shrink-0 ml-auto">
              <button className="flex h-9 md:h-10 items-center gap-1.5 md:gap-2 rounded-full bg-white px-4 md:px-6 text-xs md:text-sm font-black text-slate-900 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <span className="hidden sm:inline">Grab Deal</span>
                <span className="sm:hidden">Grab</span>
                <ArrowRight className="size-3 md:size-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pagination indicators if multiple offers */}
      {offers.length > 1 && (
        <div className="absolute -bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20">
          {offers.map((_, idx) => (
            <div key={idx} className={`h-1 rounded-full transition-all ${idx === currentIndex ? 'w-4 bg-primary' : 'w-1.5 bg-primary/20'}`} />
          ))}
        </div>
      )}
    </div>
  )
}
