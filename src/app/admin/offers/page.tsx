"use client"

import { useEffect, useState } from "react"
import { Gift, Plus, Edit, Trash2, Loader2, Save, X, ToggleLeft, ToggleRight } from "lucide-react"
import { supabase } from "@/services/supabase"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"

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

const TEMPLATES = [
  { name: "Custom", data: {} },
  { name: "Sunday Special — 10% Off", data: { title: "Sunday Special", offer_type: "Percentage discount", discount_value: 10, applicable_on: "all", display_location: "Announcement bar", badge_text: "SUNDAY", badge_color: "#F97316" } },
  { name: "Weekend Bumper Sale", data: { title: "Weekend Bumper Sale", offer_type: "Percentage discount", discount_value: 15, applicable_on: "all", display_location: "Hero banner", badge_text: "BUMPER", badge_color: "#E11D48" } },
  { name: "Festive Offer — Diwali Special", data: { title: "Diwali Special", offer_type: "Percentage discount", discount_value: 20, applicable_on: "all", display_location: "All", badge_text: "FESTIVE", badge_color: "#FACC15" } },
  { name: "Monsoon Protection Deal", data: { title: "Monsoon Protection Deal", offer_type: "Fixed discount", discount_value: 500, applicable_on: "Specific category", category_id: "waterproofing", display_location: "All", badge_text: "MONSOON", badge_color: "#0EA5E9" } },
  { name: "Contractor Special Price", data: { title: "Contractor Special", offer_type: "Percentage discount", discount_value: 12, applicable_on: "all", display_location: "Popup", badge_text: "PRO", badge_color: "#1E3A8A" } },
  { name: "Bulk Purchase Benefit", data: { title: "Bulk Purchase Benefit", offer_type: "Fixed discount", discount_value: 1000, applicable_on: "all", display_location: "All", badge_text: "BULK", badge_color: "#14B8A6" } },
  { name: "New Arrival Special", data: { title: "New Arrival Special", offer_type: "Percentage discount", discount_value: 5, applicable_on: "Specific category", display_location: "All", badge_text: "NEW", badge_color: "#8B5CF6" } },
  { name: "Clearance Sale", data: { title: "Clearance Sale", offer_type: "Percentage discount", discount_value: 30, applicable_on: "Specific product", display_location: "All", badge_text: "CLEARANCE", badge_color: "#DC2626" } },
  { name: "Festival of Colors", data: { title: "Holi Special", offer_type: "Percentage discount", discount_value: 18, applicable_on: "all", display_location: "All", badge_text: "HOLI", badge_color: "#D946EF" } },
  { name: "New Year New Home", data: { title: "New Year Special", offer_type: "Percentage discount", discount_value: 15, applicable_on: "all", display_location: "All", badge_text: "NEW YEAR", badge_color: "#F97316" } },
]

const emptyOffer: Offer = {
  title: "", description: "", offer_type: "Percentage discount", discount_value: 0,
  applicable_on: "all", category_id: "", product_id: "", valid_from: "", valid_until: "",
  display_location: "All", badge_text: "", badge_color: "#F97316", is_active: true, priority: 0
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState<Offer>(emptyOffer)

  const fetchOffers = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('offers').select('*').order('priority', { ascending: false }).order('created_at', { ascending: false })
    if (error) toast.error("Failed to fetch offers")
    else setOffers(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchOffers()
  }, [])

  const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const t = TEMPLATES.find(t => t.name === e.target.value)
    if (t && t.name !== "Custom") {
      setFormData({ ...formData, ...t.data })
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Adjust dates for timezone if needed, or just save as strings
    const payload = { ...formData }
    if (!payload.valid_from) payload.valid_from = new Date().toISOString()
    if (!payload.valid_until) delete (payload as any).valid_until
    
    if (payload.id) {
      const { error } = await supabase.from('offers').update(payload).eq('id', payload.id)
      if (error) toast.error("Update failed")
      else { toast.success("Offer updated"); setIsFormOpen(false); fetchOffers() }
    } else {
      const { error } = await supabase.from('offers').insert([payload])
      if (error) toast.error("Insert failed")
      else { toast.success("Offer created"); setIsFormOpen(false); fetchOffers() }
    }
  }

  const toggleStatus = async (offer: Offer) => {
    const { error } = await supabase.from('offers').update({ is_active: !offer.is_active }).eq('id', offer.id)
    if (!error) fetchOffers()
  }

  const deleteOffer = async (id: string) => {
    if (!window.confirm("Are you sure?")) return
    const { error } = await supabase.from('offers').delete().eq('id', id)
    if (!error) fetchOffers()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Gift className="size-8 text-primary" /> Offer Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage store promotions</p>
        </div>
        <Button onClick={() => { setFormData(emptyOffer); setIsFormOpen(true) }} className="rounded-xl gap-2 h-11">
          <Plus className="size-4" /> Create Offer
        </Button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{formData.id ? "Edit Offer" : "New Offer"}</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsFormOpen(false)}><X className="size-5" /></Button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Use Template</label>
                <select onChange={handleTemplateSelect} className="w-full p-2.5 bg-background border border-border rounded-xl">
                  {TEMPLATES.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
              </div>

              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Offer Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2.5 bg-background border border-border rounded-xl" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Offer Type</label>
                  <select value={formData.offer_type} onChange={e => setFormData({...formData, offer_type: e.target.value})} className="w-full p-2.5 bg-background border border-border rounded-xl">
                    <option value="Percentage discount">Percentage discount</option>
                    <option value="Fixed discount">Fixed discount</option>
                    <option value="Free delivery">Free delivery</option>
                    <option value="Buy X Get Y">Buy X Get Y</option>
                    <option value="Custom text">Custom text</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Discount Value (%, ₹)</label>
                  <input type="number" value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: parseFloat(e.target.value)})} className="w-full p-2.5 bg-background border border-border rounded-xl" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Applicable On</label>
                  <select value={formData.applicable_on} onChange={e => setFormData({...formData, applicable_on: e.target.value})} className="w-full p-2.5 bg-background border border-border rounded-xl">
                    <option value="all">All products</option>
                    <option value="Specific category">Specific category</option>
                    <option value="Specific product">Specific product</option>
                  </select>
                </div>

                {formData.applicable_on === "Specific category" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Category ID/Name</label>
                    <input value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full p-2.5 bg-background border border-border rounded-xl" />
                  </div>
                )}

                {formData.applicable_on === "Specific product" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Product ID</label>
                    <input value={formData.product_id} onChange={e => setFormData({...formData, product_id: e.target.value})} className="w-full p-2.5 bg-background border border-border rounded-xl" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Valid From</label>
                  <input type="datetime-local" value={formData.valid_from ? new Date(formData.valid_from).toISOString().slice(0, 16) : ""} onChange={e => setFormData({...formData, valid_from: new Date(e.target.value).toISOString()})} className="w-full p-2.5 bg-background border border-border rounded-xl" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Valid Until</label>
                  <input type="datetime-local" value={formData.valid_until ? new Date(formData.valid_until).toISOString().slice(0, 16) : ""} onChange={e => setFormData({...formData, valid_until: new Date(e.target.value).toISOString()})} className="w-full p-2.5 bg-background border border-border rounded-xl" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Display Location</label>
                  <select value={formData.display_location} onChange={e => setFormData({...formData, display_location: e.target.value})} className="w-full p-2.5 bg-background border border-border rounded-xl">
                    <option value="All">All</option>
                    <option value="Announcement bar">Announcement bar</option>
                    <option value="Hero banner">Hero banner</option>
                    <option value="Popup">Popup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Priority (Higher shows first)</label>
                  <input type="number" value={formData.priority} onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})} className="w-full p-2.5 bg-background border border-border rounded-xl" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Badge Text</label>
                  <input value={formData.badge_text} onChange={e => setFormData({...formData, badge_text: e.target.value})} className="w-full p-2.5 bg-background border border-border rounded-xl" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Badge Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={formData.badge_color} onChange={e => setFormData({...formData, badge_color: e.target.value})} className="h-10 w-10 p-0 border-0 rounded" />
                    <input value={formData.badge_color} onChange={e => setFormData({...formData, badge_color: e.target.value})} className="flex-1 p-2.5 bg-background border border-border rounded-xl uppercase" />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 pt-4 flex gap-3">
                  <Button type="submit" className="rounded-xl flex-1 gap-2"><Save className="size-4" /> Save Offer</Button>
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="rounded-xl flex-1">Cancel</Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offers List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
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
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {offer.offer_type} • {offer.discount_value > 0 ? offer.discount_value : ''} {offer.offer_type.includes('Percentage') ? '%' : (offer.offer_type.includes('Fixed') ? '₹' : '')}
                    {" | "} Applies to: {offer.applicable_on} {" | "} Location: {offer.display_location}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Valid: {new Date(offer.valid_from).toLocaleDateString()} - {offer.valid_until ? new Date(offer.valid_until).toLocaleDateString() : 'Forever'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleStatus(offer)} className="p-2 hover:bg-muted rounded-lg transition-colors text-primary">
                    {offer.is_active ? <ToggleRight className="size-6 text-green-500" /> : <ToggleLeft className="size-6 text-muted-foreground" />}
                  </button>
                  <button onClick={() => { setFormData(offer); setIsFormOpen(true) }} className="p-2 hover:bg-muted rounded-lg transition-colors">
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
  )
}
