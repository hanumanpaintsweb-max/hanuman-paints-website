"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Gift, Filter, Clock } from "lucide-react"
import { supabase } from "@/services/supabase"
import { SiteShell } from "@/components/site/site-shell"

type Offer = {
  id: string
  title: string
  description: string
  offer_type: string
  discount_value: number
  applicable_on: string
  category_id: string
  valid_from: string
  valid_until: string
  badge_text: string
  badge_color: string
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    async function fetchOffers() {
      setLoading(true)
      const { data } = await supabase
        .from('offers')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false })
      
      setOffers(data || [])
      setLoading(false)
    }
    fetchOffers()
  }, [])

  const filteredOffers = offers.filter(o => {
    if (filter === "all") return true
    if (o.applicable_on === "all") return true
    if (o.applicable_on === "Specific category" && o.category_id?.toLowerCase() === filter.toLowerCase()) return true
    return false
  })

  // get unique categories
  const categories = Array.from(new Set(
    offers.filter(o => o.applicable_on === "Specific category" && o.category_id)
          .map(o => o.category_id)
  ))

  return (
    <SiteShell>
      <div className="min-h-screen bg-muted/30 pt-24 pb-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Gift className="size-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Latest Offers & Deals</h1>
          <p className="mt-4 text-lg text-muted-foreground">Save big on premium paints and supplies for your next project.</p>
        </div>

        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
            <Filter className="size-4 text-muted-foreground mr-2" />
            <button 
              onClick={() => setFilter("all")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${filter === "all" ? "bg-primary text-white shadow-sm" : "bg-card border hover:bg-muted"}`}
            >
              All Deals
            </button>
            {categories.map(c => (
              <button 
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors capitalize ${filter === c ? "bg-primary text-white shadow-sm" : "bg-card border hover:bg-muted"}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-2xl bg-card border"></div>)}
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border">
            <Gift className="size-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold">No active offers right now</h3>
            <p className="text-muted-foreground mt-2">Check back later for exciting deals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredOffers.map((offer, idx) => {
                let daysLeft = null
                if (offer.valid_until) {
                  const diff = new Date(offer.valid_until).getTime() - new Date().getTime()
                  if (diff > 0) daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24))
                }

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    key={offer.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border/60 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 p-6 flex flex-col justify-end relative">
                      {offer.badge_text && (
                        <div className="absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm" style={{ backgroundColor: offer.badge_color || '#F97316' }}>
                          {offer.badge_text}
                        </div>
                      )}
                      {daysLeft !== null && (
                        <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-background/80 backdrop-blur px-2.5 py-1 text-xs font-semibold text-foreground">
                          <Clock className="size-3 text-orange-500" /> Ends in {daysLeft}d
                        </div>
                      )}
                      {offer.discount_value > 0 && (
                        <div className="text-3xl font-extrabold text-primary">
                          {offer.offer_type.includes('Percentage') ? `${offer.discount_value}% OFF` : ''}
                          {offer.offer_type.includes('Fixed') ? `₹${offer.discount_value} OFF` : ''}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-xl font-bold leading-tight mb-2">{offer.title}</h3>
                      {offer.description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{offer.description}</p>}
                      
                      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {offer.applicable_on === 'all' ? 'Sitewide' : offer.applicable_on}
                        </span>
                        
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                          Auto-applied at checkout
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
    </SiteShell>
  )
}
