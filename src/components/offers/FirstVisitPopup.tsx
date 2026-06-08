"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Gift } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useActiveOffers, type Offer } from "@/hooks/useOffers"

export function FirstVisitPopup() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [offer, setOffer] = useState<Offer | null>(null)

  const activeOffers = useActiveOffers()

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("has_seen_offer_popup")
    if (hasSeenPopup) return

    const applicable = activeOffers.filter(o => 
      o.display_location?.toLowerCase() === 'popup' || 
      o.display_location?.toLowerCase() === 'all'
    )
    if (applicable.length > 0) {
      setOffer(applicable[0])
      // 5 second delay before showing
      const timer = setTimeout(() => setIsOpen(true), 5000)
      return () => clearTimeout(timer)
    }
  }, [activeOffers])

  const closePopup = () => {
    setIsOpen(false)
    localStorage.setItem("has_seen_offer_popup", "true")
  }

  if (pathname.startsWith('/admin')) return null
  if (!offer) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closePopup}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-card shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={closePopup}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/10 p-2 text-foreground/80 backdrop-blur-sm hover:bg-black/20"
            >
              <X className="size-5" />
            </button>

            {/* Content */}
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 px-8 pt-12 pb-8 text-center">
              <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-primary/20 text-primary shadow-inner">
                <Gift className="size-10" />
              </div>

              {offer.badge_text && (
                <span
                  className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-sm"
                  style={{ backgroundColor: offer.badge_color || '#F97316' }}
                >
                  {offer.badge_text}
                </span>
              )}

              <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground">{offer.title}</h2>
              <p className="mb-6 text-muted-foreground">{offer.description || "Grab this special offer before it expires!"}</p>

              {offer.discount_value > 0 && (
                <div className="mb-8 text-4xl font-extrabold text-primary">
                  {offer.offer_type.includes('Percentage') ? `${offer.discount_value}% OFF` : ''}
                  {offer.offer_type.includes('Fixed') ? `₹${offer.discount_value} OFF` : ''}
                </div>
              )}

              <div className="space-y-3">
                <Button asChild size="lg" className="w-full rounded-xl text-base font-bold shadow-lg shadow-primary/20" onClick={closePopup}>
                  <Link href="/offers">Shop Offers Now</Link>
                </Button>
                <button onClick={closePopup} className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline underline-offset-4">
                  No thanks, maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
