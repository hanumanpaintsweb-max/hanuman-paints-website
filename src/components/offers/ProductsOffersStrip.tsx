"use client"

import { useActiveOffers } from "@/hooks/useOffers"
import { motion } from "motion/react"
import { Clock } from "lucide-react"

export function ProductsOffersStrip() {
  const activeOffers = useActiveOffers()

  if (activeOffers.length === 0) return null

  return (
    <div className="mb-8 w-full overflow-hidden">
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {activeOffers.map((offer, idx) => {
          let daysLeft = null
          if (offer.valid_until) {
            const diff = new Date(offer.valid_until).getTime() - new Date().getTime()
            if (diff > 0) daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24))
          }

          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="snap-start shrink-0 w-72 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary" style={{ color: offer.badge_color || '#F97316' }}>
                    {offer.badge_text || "SPECIAL OFFER"}
                  </span>
                  {daysLeft !== null && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-white/50 px-1.5 py-0.5 rounded">
                      <Clock className="size-3 text-orange-500" /> Ends in {daysLeft}d
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-foreground text-sm leading-tight mb-1">{offer.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{offer.description}</p>
              </div>
              <div className="mt-3 font-extrabold text-primary text-lg">
                {offer.offer_type.includes('Percentage') ? `${offer.discount_value}% OFF` : ''}
                {offer.offer_type.includes('Fixed') ? `₹${offer.discount_value} OFF` : ''}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
