"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Gift, Phone, Loader2, ArrowRight } from "lucide-react"
import { supabase } from "@/services/supabase"
import { getSession, loginUser } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

export function SmartLoginPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [scenario, setScenario] = useState<"A" | "B" | null>(null)
  const [offers, setOffers] = useState<any[]>([])
  
  // Login form state
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't show on admin routes
    if (pathname?.startsWith("/admin")) return;

    async function init() {
      // 1. Fetch active offers
      const { data } = await supabase
        .from('offers')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(3)
      
      const activeOffers = data || []
      setOffers(activeOffers)

      // 2. Check auth
      const session = await getSession()
      const isLogged = !!session

      // 3. Check localStorage rules
      const today = new Date().toISOString().split('T')[0]
      const loginPromptShown = localStorage.getItem('hp_login_prompt_shown')
      const offersPopupShown = localStorage.getItem('hp_offers_popup_today')

      if (!isLogged && !loginPromptShown) {
        setScenario("A")
        setTimeout(() => setIsOpen(true), 3000)
      } else if (isLogged && offersPopupShown !== today && activeOffers.length > 0) {
        setScenario("B")
        setTimeout(() => setIsOpen(true), 3000)
      }
    }
    
    init()
  }, [pathname])

  // Hide on admin routes completely
  if (pathname?.startsWith("/admin")) return null;

  const closePopup = () => {
    setIsOpen(false)
    if (scenario === "A") {
      localStorage.setItem('hp_login_prompt_shown', 'true')
    } else if (scenario === "B") {
      const today = new Date().toISOString().split('T')[0]
      localStorage.setItem('hp_offers_popup_today', today)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length !== 10) {
      setError("Mobile number must be exactly 10 digits")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await loginUser(phone, name)
      if (res?.error) {
        if (res.error.includes("Name is required")) {
          setError("Looks like you are new! Please enter your name to continue.")
        } else {
          setError(res.error)
        }
        return
      }
      // Success! Close popup and record it
      localStorage.setItem('hp_login_prompt_shown', 'true')
      setIsOpen(false)
      router.refresh()
    } catch (err) {
      setError("Failed to login. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && scenario === "A" && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-primary/20 bg-card shadow-2xl shadow-primary/20"
          >
            <button onClick={closePopup} className="absolute right-4 top-4 z-10 rounded-full bg-black/10 p-2 text-foreground/60 hover:bg-black/20 hover:text-foreground">
              <X className="size-5" />
            </button>
            
            <div className="bg-primary/5 px-8 pt-10 pb-6 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Gift className="size-7" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Exclusive Offers Waiting!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Login to avail these special deals and track your orders.
              </p>
            </div>

            <div className="px-8 pb-8">
              {offers.length > 0 && (
                <div className="mb-6 space-y-3">
                  {offers.slice(0, 2).map((offer, idx) => (
                    <div key={idx} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                        {offer.offer_type.includes('Percentage') ? `${offer.discount_value}%` : `₹${offer.discount_value}`}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold leading-tight text-foreground">{offer.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{offer.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                {error && (
                  <div className="rounded-xl bg-red-500/10 p-3 text-center text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}
                
                {error.includes("new!") && (
                  <div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name (e.g. Rahul Sharma)"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                )}

                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-4 flex items-center gap-1 text-sm font-medium text-muted-foreground">
                    <Phone className="size-4" />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="00000 00000"
                    className="w-full rounded-xl border border-border bg-background py-3 pl-[4.5rem] pr-4 text-sm font-medium tracking-wide text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <Button type="submit" disabled={loading || phone.length !== 10} className="w-full rounded-xl py-6 text-base font-bold bg-primary hover:bg-primary/90">
                  {loading ? <Loader2 className="size-5 animate-spin" /> : "Get My Offers"}
                </Button>
                
                <button type="button" onClick={closePopup} className="mt-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:underline">
                  Continue as Guest
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {isOpen && scenario === "B" && offers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 50, y: 50 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 50, y: 50 }}
          className="fixed bottom-24 right-4 z-[9990] w-[320px] sm:bottom-6 sm:right-6 md:w-[380px] overflow-hidden rounded-2xl border border-border bg-card/80 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-b border-border/50 bg-primary/5 px-4 py-3">
            <h3 className="font-bold text-foreground">Today's Offers for You! 🎨</h3>
            <button onClick={closePopup} className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {offers.slice(0, 3).map((offer, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <div className="size-2 rounded-full bg-primary shrink-0" />
                  <p className="text-sm font-medium leading-tight text-foreground line-clamp-2">{offer.title}</p>
                </div>
              ))}
            </div>
            <Button asChild variant="outline" className="mt-5 w-full rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white" onClick={closePopup}>
              <Link href="/offers">
                View All Offers <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
