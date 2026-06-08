"use client"

import { useEffect, useState, useCallback } from "react"
import { Gift, Plus, Edit, Trash2, Loader2, Save, X, ToggleLeft, ToggleRight, Tag, Sparkles, Search } from "lucide-react"
import { supabase } from "@/services/supabase"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"

// ========== OFFER TYPES ==========
type Offer = {
  id?: string
  title: string
  description: string
  offer_type: string
  discount_value: number
  applicable_on: string
  category_id: string
  product_id: string
  valid_from: string
  valid_until: string
  display_location: string
  badge_text: string
  badge_color: string
  is_active: boolean
  priority: number
}

const emptyOffer: Offer = {
  title: "", description: "", offer_type: "Percentage discount", discount_value: 0,
  applicable_on: "all", category_id: "", product_id: "", valid_from: "", valid_until: "",
  display_location: "All", badge_text: "", badge_color: "#F97316", is_active: true, priority: 0
}

// ========== COUPON TYPES ==========
const INITIAL_COUPON = {
  code: "", coupon_type: "percentage", discount_value: "",
  max_discount_cap: "", min_order_amount: "", usage_limit: "",
  per_customer_limit: "1", valid_from: "", valid_until: "",
  description: "", is_active: true,
}

type Coupon = {
  id: string; code: string; coupon_type: string; discount_value: number
  max_discount_cap: number | null; min_order_amount: number | null; usage_limit: number | null
  used_count: number; per_customer_limit: number | null; valid_from: string | null
  valid_until: string | null; description: string | null; is_active: boolean; created_at: string
}

export default function AdminOffersPage() {
  // Offers state
  const [offers, setOffers] = useState<Offer[]>([])
  const [offersLoading, setOffersLoading] = useState(true)
  const [offerFormOpen, setOfferFormOpen] = useState(false)
  const [offerForm, setOfferForm] = useState<Offer>(emptyOffer)

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [couponsLoading, setCouponsLoading] = useState(true)
  const [couponFormOpen, setCouponFormOpen] = useState(false)
  const [couponForm, setCouponForm] = useState(INITIAL_COUPON)
  const [couponFormError, setCouponFormError] = useState("")
  const [couponModalLoading, setCouponModalLoading] = useState(false)
  const [couponSearch, setCouponSearch] = useState("")

  const fetchOffers = async () => {
    setOffersLoading(true)
    const { data } = await supabase.from('offers').select('*').order('priority', { ascending: false }).order('created_at', { ascending: false })
    setOffers(data || [])
    setOffersLoading(false)
  }

  const fetchCoupons = useCallback(async () => {
    setCouponsLoading(true)
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false })
    setCoupons(data || [])
    setCouponsLoading(false)
  }, [])

  useEffect(() => {
    fetchOffers()
    fetchCoupons()
  }, [fetchCoupons])

  // ===== OFFER HANDLERS =====
  const handleOfferSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...offerForm }
    if (!payload.valid_from) payload.valid_from = new Date().toISOString()
    if (!payload.valid_until) delete (payload as any).valid_until
    if (payload.id) {
      const { error } = await supabase.from('offers').update(payload).eq('id', payload.id)
      if (error) toast.error("Update failed")
      else { toast.success("Offer updated"); setOfferFormOpen(false); fetchOffers() }
    } else {
      const { error } = await supabase.from('offers').insert([payload])
      if (error) toast.error("Insert failed")
      else { toast.success("Offer created"); setOfferFormOpen(false); fetchOffers() }
    }
  }

  const toggleOfferStatus = async (offer: Offer) => {
    const { error } = await supabase.from('offers').update({ is_active: !offer.is_active }).eq('id', offer.id)
    if (!error) fetchOffers()
  }

  const deleteOffer = async (id: string) => {
    if (!window.confirm("Delete this offer?")) return
    await supabase.from('offers').delete().eq('id', id)
    fetchOffers()
  }

  // ===== COUPON HANDLERS =====
  const handleCouponFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined
    const val = type === "checkbox" ? checked : name === "code" ? value.toUpperCase() : value
    setCouponForm((f) => ({ ...f, [name]: val }))
    setCouponFormError("")
  }

  const generateCode = () => {
    const words = ["SAVE", "PAINT", "DULUX", "SUPER", "DEAL", "OFFER", "COLORS"]
    const randomWord = words[Math.floor(Math.random() * words.length)]
    const randomNum = Math.floor(10 + Math.random() * 90)
    setCouponForm(prev => ({ ...prev, code: `${randomWord}${randomNum}` }))
  }

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponForm.code.trim()) { setCouponFormError("Coupon code is required."); return }
    if (couponForm.coupon_type !== "free_delivery") {
      if (!couponForm.discount_value || isNaN(Number(couponForm.discount_value)) || Number(couponForm.discount_value) <= 0) {
        setCouponFormError("Enter a valid discount value."); return
      }
    }
    setCouponModalLoading(true)
    const payload = {
      code: couponForm.code.trim().toUpperCase(),
      coupon_type: couponForm.coupon_type,
      discount_value: couponForm.coupon_type === "free_delivery" ? 0 : Number(couponForm.discount_value),
      max_discount_cap: couponForm.max_discount_cap ? Number(couponForm.max_discount_cap) : null,
      min_order_amount: couponForm.min_order_amount ? Number(couponForm.min_order_amount) : 0,
      usage_limit: couponForm.usage_limit ? Number(couponForm.usage_limit) : null,
      per_customer_limit: couponForm.per_customer_limit ? Number(couponForm.per_customer_limit) : 1,
      valid_from: couponForm.valid_from ? new Date(couponForm.valid_from).toISOString() : null,
      valid_until: couponForm.valid_until ? new Date(couponForm.valid_until).toISOString() : null,
      description: couponForm.description.trim() || null,
      is_active: couponForm.is_active,
    }
    const { error } = await supabase.from("coupons").insert([payload])
    setCouponModalLoading(false)
    if (error) {
      if (error.code === "23505") setCouponFormError("A coupon with this code already exists.")
      else setCouponFormError("Failed: " + error.message)
      return
    }
    setCouponFormOpen(false)
    setCouponForm(INITIAL_COUPON)
    toast.success("Coupon created! 🎉")
    fetchCoupons()
  }

  const toggleCouponActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("coupons").update({ is_active: !current }).eq("id", id)
    if (!error) { setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c)); toast.success(current ? "Coupon paused" : "Coupon activated") }
  }

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return
    const { error } = await supabase.from("coupons").delete().eq("id", id)
    if (!error) { setCoupons(prev => prev.filter(c => c.id !== id)); toast.success("Coupon deleted") }
  }

  const isExpired = (c: Coupon) => c.valid_until ? new Date() > new Date(c.valid_until) : false

  const filteredCoupons = coupons.filter(c => c.code.includes(couponSearch.toUpperCase()) || (c.description || "").toLowerCase().includes(couponSearch.toLowerCase()))

  return (
    <div className="space-y-10 pb-20">

      {/* ========== SECTION 1: OFFERS ========== */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <Gift className="size-8 text-primary" /> Active Offers
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Create and manage store promotions shown to customers</p>
          </div>
          <Button onClick={() => { setOfferForm(emptyOffer); setOfferFormOpen(true) }} className="rounded-xl gap-2 h-11">
            <Plus className="size-4" /> Create Offer
          </Button>
        </div>

        <AnimatePresence>
          {offerFormOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">{offerForm.id ? "Edit Offer" : "New Offer"}</h2>
                  <Button variant="ghost" size="icon" onClick={() => setOfferFormOpen(false)}><X className="size-5" /></Button>
                </div>
                <form onSubmit={handleOfferSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Offer Title</label>
                    <input required value={offerForm.title} onChange={e => setOfferForm({...offerForm, title: e.target.value})} className="w-full p-2.5 bg-background border border-border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Offer Type</label>
                    <select value={offerForm.offer_type} onChange={e => setOfferForm({...offerForm, offer_type: e.target.value})} className="w-full p-2.5 bg-background border border-border rounded-xl">
                      <option value="Percentage discount">Percentage discount</option>
                      <option value="Fixed discount">Fixed discount</option>
                      <option value="Free delivery">Free delivery</option>
                      <option value="Buy X Get Y">Buy X Get Y</option>
                      <option value="Custom text">Custom text</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Discount Value (%, ₹)</label>
                    <input type="number" value={offerForm.discount_value} onChange={e => setOfferForm({...offerForm, discount_value: parseFloat(e.target.value)})} className="w-full p-2.5 bg-background border border-border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Applicable On</label>
                    <select value={offerForm.applicable_on} onChange={e => setOfferForm({...offerForm, applicable_on: e.target.value})} className="w-full p-2.5 bg-background border border-border rounded-xl">
                      <option value="all">All products</option>
                      <option value="Specific category">Specific category</option>
                      <option value="Specific product">Specific product</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Display Location</label>
                    <select value={offerForm.display_location} onChange={e => setOfferForm({...offerForm, display_location: e.target.value})} className="w-full p-2.5 bg-background border border-border rounded-xl">
                      <option value="All">All</option>
                      <option value="Announcement bar">Announcement bar</option>
                      <option value="Hero banner">Hero banner</option>
                      <option value="Popup">Popup</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Valid From</label>
                    <input type="datetime-local" value={offerForm.valid_from ? new Date(offerForm.valid_from).toISOString().slice(0, 16) : ""} onChange={e => setOfferForm({...offerForm, valid_from: new Date(e.target.value).toISOString()})} className="w-full p-2.5 bg-background border border-border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Valid Until</label>
                    <input type="datetime-local" value={offerForm.valid_until ? new Date(offerForm.valid_until).toISOString().slice(0, 16) : ""} onChange={e => setOfferForm({...offerForm, valid_until: new Date(e.target.value).toISOString()})} className="w-full p-2.5 bg-background border border-border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Badge Text</label>
                    <input value={offerForm.badge_text} onChange={e => setOfferForm({...offerForm, badge_text: e.target.value})} className="w-full p-2.5 bg-background border border-border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Badge Color</label>
                    <div className="flex gap-2">
                      <input type="color" value={offerForm.badge_color} onChange={e => setOfferForm({...offerForm, badge_color: e.target.value})} className="h-10 w-10 p-0 border-0 rounded" />
                      <input value={offerForm.badge_color} onChange={e => setOfferForm({...offerForm, badge_color: e.target.value})} className="flex-1 p-2.5 bg-background border border-border rounded-xl uppercase" />
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-2 pt-4 flex gap-3">
                    <Button type="submit" className="rounded-xl flex-1 gap-2"><Save className="size-4" /> Save Offer</Button>
                    <Button type="button" variant="outline" onClick={() => setOfferFormOpen(false)} className="rounded-xl flex-1">Cancel</Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {offersLoading ? (
            <div className="p-10 flex justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>
          ) : offers.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">No offers found. Create one!</div>
          ) : (
            <div className="divide-y divide-border">
              {offers.map(offer => (
                <div key={offer.id} className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 ${!offer.is_active ? 'opacity-60 bg-muted/20' : ''}`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-lg">{offer.title}</span>
                      {offer.badge_text && (
                        <span className="text-xs text-white px-2 py-0.5 rounded font-bold" style={{ backgroundColor: offer.badge_color }}>
                          {offer.badge_text}
                        </span>
                      )}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${offer.is_active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                        {offer.is_active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {offer.offer_type} • {offer.discount_value > 0 ? offer.discount_value : ''} {offer.offer_type.includes('Percentage') ? '%' : offer.offer_type.includes('Fixed') ? '₹' : ''} | Location: {offer.display_location}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Valid: {new Date(offer.valid_from).toLocaleDateString()} — {offer.valid_until ? new Date(offer.valid_until).toLocaleDateString() : 'Forever'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleOfferStatus(offer)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                      {offer.is_active ? <ToggleRight className="size-6 text-green-500" /> : <ToggleLeft className="size-6 text-muted-foreground" />}
                    </button>
                    <button onClick={() => { setOfferForm(offer); setOfferFormOpen(true) }} className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Edit className="size-5" />
                    </button>
                    <button onClick={() => deleteOffer(offer.id!)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors">
                      <Trash2 className="size-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========== DIVIDER ========== */}
      <div className="relative flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-3 py-1 bg-muted rounded-full">Coupon Codes</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* ========== SECTION 2: COUPONS ========== */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <Tag className="size-6 text-primary" /> Coupon Codes
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Manage discount codes for customer checkout</p>
          </div>
          <Button onClick={() => { setCouponForm(INITIAL_COUPON); setCouponFormError(""); setCouponFormOpen(true) }} className="rounded-xl gap-2 h-11">
            <Plus className="size-4" /> Create Coupon
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input type="text" placeholder="Search coupons..." value={couponSearch} onChange={e => setCouponSearch(e.target.value)}
            className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
        </div>

        {/* Coupon Form */}
        <AnimatePresence>
          {couponFormOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Sparkles className="size-5 text-primary" /> New Coupon Code</h3>
                  <Button variant="ghost" size="icon" onClick={() => setCouponFormOpen(false)}><X className="size-5" /></Button>
                </div>
                <form onSubmit={handleCouponSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Coupon Code *</label>
                    <div className="flex gap-2">
                      <input name="code" value={couponForm.code} onChange={handleCouponFormChange} placeholder="e.g. SAVE20"
                        className="flex-1 h-11 rounded-xl border border-input bg-background px-3 font-mono text-lg font-bold uppercase outline-none focus:ring-2 focus:ring-primary" />
                      <Button type="button" onClick={generateCode} variant="outline" className="h-11 rounded-xl px-3" title="Auto-generate"><Sparkles className="size-5 text-orange-500" /></Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Coupon Type *</label>
                    <select name="coupon_type" value={couponForm.coupon_type} onChange={handleCouponFormChange}
                      className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none">
                      <option value="percentage">Percentage Discount (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                      <option value="first_order">First Order Only (%)</option>
                      <option value="free_delivery">Free Delivery</option>
                    </select>
                  </div>
                  {couponForm.coupon_type !== "free_delivery" && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Discount Value *</label>
                        <input name="discount_value" type="number" value={couponForm.discount_value} onChange={handleCouponFormChange}
                          placeholder={couponForm.coupon_type === "flat" ? "e.g. 200" : "e.g. 15"}
                          className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Max Discount Cap (₹)</label>
                        <input name="max_discount_cap" type="number" value={couponForm.max_discount_cap} onChange={handleCouponFormChange}
                          placeholder="Optional"
                          className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Min Order Amount (₹)</label>
                    <input name="min_order_amount" type="number" value={couponForm.min_order_amount} onChange={handleCouponFormChange}
                      placeholder="0 = no minimum"
                      className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Total Usage Limit</label>
                    <input name="usage_limit" type="number" value={couponForm.usage_limit} onChange={handleCouponFormChange}
                      placeholder="Blank = unlimited"
                      className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Valid From</label>
                    <input name="valid_from" type="datetime-local" value={couponForm.valid_from} onChange={handleCouponFormChange}
                      className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Valid Until</label>
                    <input name="valid_until" type="datetime-local" value={couponForm.valid_until} onChange={handleCouponFormChange}
                      className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Description / Notes</label>
                    <input name="description" value={couponForm.description} onChange={handleCouponFormChange} placeholder="Optional notes"
                      className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div className="col-span-1 md:col-span-2 flex items-center gap-3 bg-primary/5 p-3 rounded-xl border border-primary/20">
                    <input type="checkbox" name="is_active" id="is_active" checked={couponForm.is_active} onChange={handleCouponFormChange}
                      className="size-5 rounded accent-primary cursor-pointer" />
                    <label htmlFor="is_active" className="text-sm font-bold cursor-pointer">Activate immediately</label>
                  </div>
                  {couponFormError && (
                    <div className="col-span-1 md:col-span-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive font-semibold">{couponFormError}</div>
                  )}
                  <div className="col-span-1 md:col-span-2 flex gap-3">
                    <Button type="submit" disabled={couponModalLoading} className="rounded-xl flex-1 gap-2">
                      {couponModalLoading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save Coupon
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setCouponFormOpen(false)} className="rounded-xl flex-1">Cancel</Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Coupons List */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {couponsLoading ? (
            <div className="p-10 flex justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>
          ) : filteredCoupons.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">No coupons found. Create one!</div>
          ) : (
            <div className="divide-y divide-border">
              {filteredCoupons.map(c => {
                const expired = isExpired(c)
                return (
                  <div key={c.id} className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 ${!c.is_active || expired ? 'opacity-60 bg-muted/20' : ''}`}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-black text-primary text-base bg-primary/10 px-3 py-0.5 rounded-lg">{c.code}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${expired ? 'bg-red-500/10 text-red-600' : c.is_active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                          {expired ? 'Expired' : c.is_active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {c.coupon_type === 'percentage' || c.coupon_type === 'first_order' ? `${c.discount_value}% OFF` : c.coupon_type === 'flat' ? `₹${c.discount_value} OFF` : 'FREE DELIVERY'}
                        {c.min_order_amount ? ` • Min: ₹${c.min_order_amount}` : ''}
                        {c.max_discount_cap ? ` • Cap: ₹${c.max_discount_cap}` : ''}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Used: {c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ' times'} •
                        Valid until: {c.valid_until ? new Date(c.valid_until).toLocaleDateString() : 'Forever'}
                        {c.description ? ` • ${c.description}` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleCouponActive(c.id, c.is_active)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                        {c.is_active ? <ToggleRight className="size-6 text-green-500" /> : <ToggleLeft className="size-6 text-muted-foreground" />}
                      </button>
                      <button onClick={() => deleteCoupon(c.id)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors">
                        <Trash2 className="size-5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
