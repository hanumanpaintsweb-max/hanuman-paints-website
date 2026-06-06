"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  Plus, Trash2, Tag, X, AlertCircle, Loader2, Sparkles, TrendingUp,
  BarChart3, Clock, CheckCircle2, Copy, Search, Filter, History, Download
} from "lucide-react"
import { supabase } from "@/services/supabase"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

const INITIAL_FORM = {
  code: "",
  coupon_type: "percentage", // percentage, flat, free_delivery, first_order
  discount_value: "",
  max_discount_cap: "",
  min_order_amount: "",
  usage_limit: "",
  per_customer_limit: "1",
  valid_from: "",
  valid_until: "",
  description: "",
  is_active: true,
}

type Coupon = {
  id: string
  code: string
  coupon_type: string
  discount_value: number
  max_discount_cap: number | null
  min_order_amount: number | null
  usage_limit: number | null
  used_count: number
  per_customer_limit: number | null
  valid_from: string | null
  valid_until: string | null
  description: string | null
  is_active: boolean
  created_at: string
}

type CouponUsage = {
  id: string
  coupon_id: string
  coupon_code: string
  customer_phone: string
  customer_name: string
  order_id: string | null
  discount_amount: number
  used_at: string
}

export default function AdminCouponsPage() {
  const [activeTab, setActiveTab] = useState<"Coupons" | "Analytics" | "Usage History">("Coupons")
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [usages, setUsages] = useState<CouponUsage[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)
  const [formError, setFormError] = useState("")

  // Filters
  const [search, setSearch] = useState("")
  
  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const fetchCouponsAndUsages = useCallback(async () => {
    setLoading(true)
    const [cRes, uRes] = await Promise.all([
      supabase.from("coupons").select("*").order("created_at", { ascending: false }),
      supabase.from("coupon_usage").select("*").order("used_at", { ascending: false })
    ])
    
    if (cRes.data) setCoupons(cRes.data)
    if (uRes.data) setUsages(uRes.data)
    
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCouponsAndUsages()
  }, [fetchCouponsAndUsages])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined
    const val = type === "checkbox" ? checked : name === "code" ? value.toUpperCase() : value
    setForm((f) => ({ ...f, [name]: val }))
    setFormError("")
  }

  const generateCode = () => {
    const words = ["SAVE", "FEST", "PAINT", "DULUX", "SUPER", "DEAL", "NEW", "OFFER", "COLORS"]
    const randomWord = words[Math.floor(Math.random() * words.length)]
    const randomNum = Math.floor(10 + Math.random() * 90)
    setForm(prev => ({ ...prev, code: `${randomWord}${randomNum}` }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code.trim()) { setFormError("Coupon code is required."); return }
    if (form.coupon_type !== "free_delivery") {
      if (!form.discount_value || isNaN(Number(form.discount_value)) || Number(form.discount_value) <= 0) {
        setFormError("Enter a valid discount value.")
        return
      }
      if (form.coupon_type === "percentage" && Number(form.discount_value) > 100) {
        setFormError("Percentage cannot exceed 100.")
        return
      }
    }

    setModalLoading(true)
    const payload = {
      code: form.code.trim().toUpperCase(),
      coupon_type: form.coupon_type,
      discount_value: form.coupon_type === "free_delivery" ? 0 : Number(form.discount_value),
      max_discount_cap: form.max_discount_cap ? Number(form.max_discount_cap) : null,
      min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : 0,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      per_customer_limit: form.per_customer_limit ? Number(form.per_customer_limit) : 1,
      valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : null,
      valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
      description: form.description.trim() || null,
      is_active: form.is_active,
    }

    const { error } = await supabase.from("coupons").insert([payload])
    setModalLoading(false)

    if (error) {
      if (error.code === "23505") setFormError("A coupon with this code already exists.")
      else setFormError("Failed to create coupon: " + error.message)
      return
    }

    setShowModal(false)
    setForm(INITIAL_FORM)
    toast.success("Coupon created successfully! 🎉")
    fetchCouponsAndUsages()
  }

  const toggleActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase.from("coupons").update({ is_active: !currentState }).eq("id", id)
    if (!error) {
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentState } : c))
      toast.success(currentState ? "Coupon paused" : "Coupon activated")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon? This cannot be undone.")) return
    const { error } = await supabase.from("coupons").delete().eq("id", id)
    if (!error) {
      setCoupons(prev => prev.filter(c => c.id !== id))
      toast.success("Coupon deleted")
    }
  }

  const handleBulkDeactivate = async () => {
    if (selectedIds.size === 0) return
    const { error } = await supabase.from("coupons").update({ is_active: false }).in("id", Array.from(selectedIds))
    if (!error) {
      setCoupons(prev => prev.map(c => selectedIds.has(c.id) ? { ...c, is_active: false } : c))
      setSelectedIds(new Set())
      toast.success("Selected coupons deactivated")
    }
  }

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  // Helpers
  const formatDiscount = (c: Coupon) => {
    if (c.coupon_type === "percentage") return `${c.discount_value}% OFF`
    if (c.coupon_type === "flat") return `₹${c.discount_value} OFF`
    if (c.coupon_type === "free_delivery") return `FREE DELIVERY`
    if (c.coupon_type === "first_order") return `${c.discount_value}% OFF (First Order)`
    return `${c.discount_value} OFF`
  }

  const isExpired = (c: Coupon) => {
    if (!c.valid_until) return false
    return new Date() > new Date(c.valid_until)
  }

  const isExpiringSoon = (c: Coupon) => {
    if (!c.valid_until) return false
    const daysLeft = (new Date(c.valid_until).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
    return daysLeft > 0 && daysLeft <= 3
  }

  // Analytics Computation
  const analyticsData = useMemo(() => {
    const totalActive = coupons.filter(c => c.is_active && !isExpired(c)).length
    
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const thisMonthUsages = usages.filter(u => new Date(u.used_at) >= thisMonthStart)
    const thisMonthDiscount = thisMonthUsages.reduce((sum, u) => sum + Number(u.discount_amount || 0), 0)

    // Chart Data (Last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const recentUsages = usages.filter(u => new Date(u.used_at) >= thirtyDaysAgo)
    
    const chartMap: Record<string, number> = {}
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      chartMap[d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })] = 0
    }
    recentUsages.forEach(u => {
      const dateStr = new Date(u.used_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
      if (chartMap[dateStr] !== undefined) chartMap[dateStr] += 1
    })

    const chartData = Object.entries(chartMap).map(([date, count]) => ({ date, count }))

    // Most Used Coupon
    const couponCounts: Record<string, number> = {}
    usages.forEach(u => {
      couponCounts[u.coupon_code] = (couponCounts[u.coupon_code] || 0) + 1
    })
    let topCoupon = "None"
    let maxUses = 0
    Object.entries(couponCounts).forEach(([code, count]) => {
      if (count > maxUses) { maxUses = count; topCoupon = code }
    })

    return { totalActive, thisMonthDiscount, chartData, topCoupon, maxUses }
  }, [coupons, usages])

  const filteredCoupons = coupons.filter(c => c.code.includes(search.toUpperCase()))
  const filteredUsages = usages.filter(u => u.coupon_code.includes(search.toUpperCase()) || u.customer_phone?.includes(search))

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
            <Tag className="size-8 text-primary" /> Coupon Engine
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create offers, track usage, and boost your sales.
          </p>
        </div>
        <Button onClick={() => { setShowModal(true); setForm(INITIAL_FORM); setFormError("") }} className="gap-2 rounded-xl px-6 shadow-lg shadow-primary/20">
          <Plus className="size-5" /> Generate Coupon
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 rounded-xl bg-muted/50 p-1 w-full max-w-md">
        {(["Coupons", "Analytics", "Usage History"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : activeTab === "Analytics" ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 text-muted-foreground mb-3"><Tag className="size-5 text-blue-500" /> Active Coupons</div>
              <div className="text-3xl font-black text-foreground">{analyticsData.totalActive}</div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 text-muted-foreground mb-3"><TrendingUp className="size-5 text-green-500" /> Discount Given (Month)</div>
              <div className="text-3xl font-black text-foreground">₹{analyticsData.thisMonthDiscount.toFixed(2)}</div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 text-muted-foreground mb-3"><Sparkles className="size-5 text-orange-500" /> Most Popular</div>
              <div className="text-3xl font-black text-foreground">{analyticsData.topCoupon}</div>
              <div className="text-xs text-muted-foreground mt-1">Used {analyticsData.maxUses} times</div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 text-muted-foreground mb-3"><History className="size-5 text-purple-500" /> Total Redemptions</div>
              <div className="text-3xl font-black text-foreground">{usages.length}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><BarChart3 className="size-5 text-primary" /> Coupon Usage (Last 30 Days)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px' }} />
                  <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      ) : activeTab === "Usage History" ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search code or phone..." 
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
          
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border/60">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Coupon Code</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Order ID</th>
                  <th className="px-6 py-4 font-semibold text-right">Discount Given</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredUsages.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No usage records found.</td></tr>
                ) : (
                  filteredUsages.map(u => (
                    <tr key={u.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4">{new Date(u.used_at).toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono font-bold text-primary">{u.coupon_code}</td>
                      <td className="px-6 py-4">{u.customer_name}<br/><span className="text-xs text-muted-foreground">{u.customer_phone}</span></td>
                      <td className="px-6 py-4 text-muted-foreground">{u.order_id || "Offline Bill"}</td>
                      <td className="px-6 py-4 text-right font-bold text-green-500">₹{u.discount_amount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        /* Coupons List View (Cards) */
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search coupons..." 
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            {selectedIds.size > 0 && (
              <Button onClick={handleBulkDeactivate} variant="destructive" className="rounded-xl shadow-md">
                Deactivate Selected ({selectedIds.size})
              </Button>
            )}
          </div>

          {filteredCoupons.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center bg-card rounded-3xl border border-border/60">
              <Tag className="mb-4 size-12 text-muted-foreground/30" />
              <h3 className="text-lg font-semibold text-foreground">No coupons found</h3>
              <p className="text-muted-foreground">Create your first discount coupon above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCoupons.map((c) => {
                const expired = isExpired(c)
                const expiringSoon = isExpiringSoon(c)
                
                return (
                  <motion.div 
                    layoutId={c.id}
                    key={c.id} 
                    className={`relative rounded-3xl border ${selectedIds.has(c.id) ? 'border-primary shadow-primary/20' : 'border-border/60'} bg-card overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col`}
                  >
                    {/* Status Ribbon */}
                    {expired ? (
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl shadow-sm z-10">EXPIRED</div>
                    ) : !c.is_active ? (
                      <div className="absolute top-0 right-0 bg-gray-500 text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl shadow-sm z-10">PAUSED</div>
                    ) : expiringSoon ? (
                      <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl shadow-sm z-10 animate-pulse">EXPIRING SOON</div>
                    ) : null}

                    {/* Checkbox for Bulk */}
                    <div className="absolute top-4 left-4 z-10">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(c.id)} 
                        onChange={() => toggleSelection(c.id)}
                        className="size-5 rounded border-border/60 text-primary focus:ring-primary accent-primary cursor-pointer"
                      />
                    </div>

                    <div className="p-6 pt-10 border-b border-border/60 bg-gradient-to-b from-muted/30 to-card flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="inline-flex items-center justify-center rounded-lg border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-lg font-black tracking-widest text-primary shadow-inner">
                            {c.code}
                          </div>
                          <h3 className="text-xl font-bold text-foreground mt-3">{formatDiscount(c)}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 min-h-[40px]">{c.description || "No description provided."}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-muted-foreground">
                        {c.min_order_amount > 0 && <span className="bg-background px-2 py-1 rounded-md border border-border/60">Min: ₹{c.min_order_amount}</span>}
                        {c.max_discount_cap > 0 && <span className="bg-background px-2 py-1 rounded-md border border-border/60">Cap: ₹{c.max_discount_cap}</span>}
                        {c.coupon_type === "first_order" && <span className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded-md">First Order Only</span>}
                      </div>
                    </div>

                    <div className="p-4 bg-card grid grid-cols-2 gap-4 text-xs border-b border-border/60">
                      <div>
                        <p className="text-muted-foreground mb-1">Total Uses</p>
                        <p className="font-bold text-foreground text-sm">{c.used_count} <span className="text-muted-foreground font-normal">{c.usage_limit ? `/ ${c.usage_limit}` : ''}</span></p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Validity</p>
                        <p className={`font-bold text-sm ${expired ? 'text-red-500' : 'text-foreground'}`}>
                          {c.valid_until ? new Date(c.valid_until).toLocaleDateString('en-GB', { day:'numeric', month:'short' }) : 'Lifetime'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/20">
                      <div className="flex gap-2">
                        <button onClick={() => toggleActive(c.id, c.is_active)} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border/60 bg-background hover:bg-muted transition-colors flex items-center gap-1">
                          {c.is_active ? <span className="text-orange-500 flex items-center gap-1">Pause</span> : <span className="text-green-500 flex items-center gap-1">Activate</span>}
                        </button>
                      </div>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Advanced Creation Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] bg-card rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-border/60"
            >
              <div className="p-6 border-b border-border/60 flex justify-between items-center bg-muted/20">
                <h3 className="flex items-center gap-2 text-xl font-bold text-foreground">
                  <Sparkles className="size-5 text-primary" /> Create Magic Coupon
                </h3>
                <button onClick={() => setShowModal(false)} className="rounded-full p-2 hover:bg-muted">
                  <X className="size-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form id="coupon-form" onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-border/60 pb-2">The Offer</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">Coupon Code <span className="text-destructive">*</span></label>
                        <div className="flex gap-2">
                          <input
                            name="code" value={form.code} onChange={handleFormChange} placeholder="e.g. SAVE20"
                            className="flex-1 h-11 rounded-xl border border-input bg-background px-3 py-2 font-mono text-lg font-bold uppercase ring-offset-background placeholder:normal-case focus:ring-2 focus:ring-primary outline-none"
                          />
                          <Button type="button" onClick={generateCode} variant="outline" className="h-11 rounded-xl px-3" title="Auto Generate"><Sparkles className="size-5 text-orange-500" /></Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">Coupon Type <span className="text-destructive">*</span></label>
                        <select
                          name="coupon_type" value={form.coupon_type} onChange={handleFormChange}
                          className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        >
                          <option value="percentage">Percentage Discount (%)</option>
                          <option value="flat">Flat Amount Discount (₹)</option>
                          <option value="first_order">First Order Only (%)</option>
                          <option value="free_delivery">Free Delivery</option>
                        </select>
                      </div>
                    </div>

                    {form.coupon_type !== "free_delivery" && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Discount Value <span className="text-destructive">*</span>
                          </label>
                          <input
                            name="discount_value" type="number" value={form.discount_value} onChange={handleFormChange}
                            placeholder={form.coupon_type === "percentage" || form.coupon_type === "first_order" ? "e.g. 15 (%)" : "e.g. 200 (₹)"}
                            className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                          />
                        </div>
                        {(form.coupon_type === "percentage" || form.coupon_type === "first_order") && (
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground">Max Discount Cap (₹)</label>
                            <input
                              name="max_discount_cap" type="number" value={form.max_discount_cap} onChange={handleFormChange}
                              placeholder="e.g. 500 (Optional)"
                              className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Restrictions */}
                  <div className="space-y-4 pt-4">
                    <h4 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-border/60 pb-2">Restrictions & Limits</h4>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">Min Order Amount (₹)</label>
                        <input
                          name="min_order_amount" type="number" value={form.min_order_amount} onChange={handleFormChange} placeholder="0 = No limit"
                          className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">Total Usage Limit</label>
                        <input
                          name="usage_limit" type="number" value={form.usage_limit} onChange={handleFormChange} placeholder="Blank = Unlimited"
                          className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">Per Customer Limit</label>
                        <input
                          name="per_customer_limit" type="number" value={form.per_customer_limit} onChange={handleFormChange} placeholder="Default: 1" min="1"
                          className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">Valid From</label>
                        <input
                          name="valid_from" type="datetime-local" value={form.valid_from} onChange={handleFormChange}
                          className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">Valid Until</label>
                        <input
                          name="valid_until" type="datetime-local" value={form.valid_until} onChange={handleFormChange}
                          className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <label className="text-xs font-semibold text-muted-foreground">Admin Description / Notes</label>
                    <textarea
                      name="description" value={form.description} onChange={handleFormChange} placeholder="Internal notes about this campaign..." rows={2}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2 bg-primary/5 p-4 rounded-xl border border-primary/20">
                    <input
                      type="checkbox" name="is_active" id="is_active" checked={form.is_active} onChange={handleFormChange}
                      className="size-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                    />
                    <label htmlFor="is_active" className="text-sm font-bold text-foreground cursor-pointer">
                      Activate Coupon Immediately
                    </label>
                  </div>

                  {formError && (
                    <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm text-destructive font-semibold">
                      <AlertCircle className="size-5" /> {formError}
                    </div>
                  )}

                </form>
              </div>

              <div className="p-6 border-t border-border/60 bg-muted/20 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="rounded-xl px-6">
                  Cancel
                </Button>
                <Button type="submit" form="coupon-form" disabled={modalLoading} className="rounded-xl px-8 shadow-lg shadow-primary/25 font-bold">
                  {modalLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  {modalLoading ? "Creating..." : "Launch Coupon"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
