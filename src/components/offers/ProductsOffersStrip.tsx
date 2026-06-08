"use client"

import { useActiveOffers } from "@/hooks/useOffers"
import { motion } from "motion/react"
import { Clock, Tag, Sparkles } from "lucide-react"

export function ProductsOffersStrip() {
  const activeOffers = useActiveOffers()

  if (activeOffers.length === 0) return null

  return (
    <div className="mb-10 w-full overflow-hidden">
      <div className="flex items-center gap-2 mb-4 px-1">
        <Sparkles className="size-5 text-primary animate-pulse" />
        <h3 className="text-lg font-black tracking-tight text-foreground">Exclusive Offers</h3>
      </div>
      <div className="flex gap-5 overflow-x-auto pb-6 pt-2 px-1 scrollbar-hide snap-x">
        {activeOffers.map((offer, idx) => {
          let daysLeft = null
          if (offer.valid_until) {
            const diff = new Date(offer.valid_until).getTime() - new Date().getTime()
            if (diff > 0) daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24))
          }

          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 200, damping: 20 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className="relative snap-start shrink-0 w-[260px] rounded-2xl overflow-hidden shadow-xl border border-border group cursor-pointer"
            >
              {/* Premium Background */}
              <div className="absolute inset-0 bg-slate-950" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <div 
                className="absolute -right-20 -top-20 size-40 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" 
                style={{ backgroundColor: offer.badge_color || '#F97316' }}
              />

              <div className="relative p-4 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-3">
                  <span 
                    className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5"
                    style={{ 
                      backgroundColor: offer.badge_color || '#F97316', 
                      color: '#fff',
                      boxShadow: `0 4px 14px 0 ${(offer.badge_color || '#F97316')}60`
                    }}
                  >
                    <Tag className="size-3" />
                    {offer.badge_text || "LIMITED DEAL"}
                  </span>
                  {daysLeft !== null && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-1 rounded-full animate-pulse shadow-sm">
                      <Clock className="size-3" /> Ends in {daysLeft}d
                    </span>
                  )}
                </div>

                <div className="mb-2">
                  <h4 className="font-extrabold text-white text-lg leading-tight mb-1.5 drop-shadow-md">
                    {offer.title}
                  </h4>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed opacity-90">
                    {offer.description}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-dashed border-white/20 pt-3">
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold mb-1">Your Benefit</span>
                    <div className="font-black text-transparent bg-clip-text text-2xl drop-shadow-sm" style={{ backgroundImage: `linear-gradient(to right, #fff, ${offer.badge_color || '#F97316'})`}}>
                      {offer.offer_type.includes('Percentage') ? `${offer.discount_value}% OFF` : ''}
                      {offer.offer_type.includes('Fixed') ? `₹${offer.discount_value} OFF` : ''}
                      {offer.offer_type.includes('Free delivery') ? `FREE DEL` : ''}
                      {offer.offer_type.includes('Buy X Get Y') ? `BOGO` : ''}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
