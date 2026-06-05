"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag, X, AlertCircle, Loader2 } from "lucide-react"

import { supabase } from "@/services/supabase"
import { Button } from "@/components/ui/button"

const INITIAL_FORM = {
  code: "",
  discount_type: "percentage",
  discount_value: "",
  description: "",
  is_active: true,
  valid_from: "",
  valid_until: "",
  min_order_amount: "",
  usage_limit: "",
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)
  const [formError, setFormError] = useState("")

  const fetchCoupons = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false })
    if (!error) setCoupons(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCoupons()
  }, [fetchCoupons])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined
    const val = type === "checkbox" ? checked : name === "code" ? value.toUpperCase() : value
    setForm((f) => ({ ...f, [name]: val }))
    setFormError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code.trim()) {
      setFormError("Coupon code is required.")
      return
    }
    if (!form.discount_value || isNaN(Number(form.discount_value)) || Number(form.discount_value) <= 0) {
      setFormError("Enter a valid discount value.")
      return
    }
    if (form.discount_type === "percentage" && Number(form.discount_value) > 100) {
      setFormError("Percentage cannot exceed 100.")
      return
    }

    setModalLoading(true)
    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      description: form.description.trim() || null,
      is_active: form.is_active,
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
      min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : 0,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
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
    fetchCoupons()
  }

  const toggleActive = async (coupon: any) => {
    const { error } = await supabase.from("coupons").update({ is_active: !coupon.is_active }).eq("id", coupon.id)
    if (!error) {
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? { ...c, is_active: !c.is_active } : c)))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return
    const { error } = await supabase.from("coupons").delete().eq("id", id)
    if (!error) {
      setCoupons((prev) => prev.filter((c) => c.id !== id))
    }
  }

  const formatDiscount = (c: any) =>
    c.discount_type === "percentage" ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`

  const isExpired = (c: any) => {
    if (!c.valid_until) return false
    return new Date().toISOString().split("T")[0] > c.valid_until
  }

  const getStatusBadge = (c: any) => {
    if (!c.is_active) return { label: "Inactive", bg: "bg-muted/50", text: "text-muted-foreground" }
    if (isExpired(c)) return { label: "Expired", bg: "bg-destructive/10", text: "text-destructive" }
    return { label: "Active", bg: "bg-emerald-500/10", text: "text-emerald-600" }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Tag className="size-6 text-primary" /> Coupon Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {coupons.filter((c) => c.is_active && !isExpired(c)).length} active coupon(s) · {coupons.length} total
          </p>
        </div>
        <Button onClick={() => { setShowModal(true); setForm(INITIAL_FORM); setFormError("") }} size="lg" className="gap-2 rounded-xl">
          <Plus className="size-5" /> Add New Coupon
        </Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <Tag className="mb-4 size-12 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold text-foreground">No coupons found</h3>
            <p className="text-muted-foreground">Create your first discount coupon above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-semibold">Code</th>
                  <th className="px-6 py-4 font-semibold">Discount</th>
                  <th className="px-6 py-4 font-semibold">Description</th>
                  <th className="px-6 py-4 font-semibold">Valid Until</th>
                  <th className="px-6 py-4 font-semibold">Min Order</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Used</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {coupons.map((c) => {
                  const badge = getStatusBadge(c)
                  return (
                    <tr key={c.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 font-mono font-bold tracking-wider text-primary">
                          {c.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground">{formatDiscount(c)}</div>
                        <div className="text-xs text-muted-foreground">{c.discount_type}</div>
                      </td>
                      <td className="px-6 py-4 max-w-[200px] truncate text-muted-foreground">
                        {c.description || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={isExpired(c) ? "font-semibold text-destructive" : "text-foreground"}>
                          {c.valid_until || <span className="text-muted-foreground">No expiry</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {c.min_order_amount > 0 ? `₹${c.min_order_amount}` : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground">{c.used_count}</div>
                        {c.usage_limit && <div className="text-xs text-muted-foreground">/ {c.usage_limit} limit</div>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleActive(c)}
                            title={c.is_active ? "Deactivate" : "Activate"}
                            className={`p-2 transition-colors ${c.is_active ? "text-emerald-600" : "text-muted-foreground"}`}
                          >
                            {c.is_active ? <ToggleRight className="size-6" /> : <ToggleLeft className="size-6" />}
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            title="Delete"
                            className="p-2 text-destructive transition-colors hover:bg-destructive/10 rounded-lg"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Coupon Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-xl sm:p-8"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-xl font-bold text-foreground">
                  <Tag className="size-5 text-primary" /> Add New Coupon
                </h3>
                <button onClick={() => setShowModal(false)} className="rounded-full p-2 hover:bg-muted">
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Coupon Code <span className="text-destructive">*</span></label>
                    <input
                      name="code"
                      value={form.code}
                      onChange={handleFormChange}
                      placeholder="e.g. SUNDAY10"
                      autoFocus
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 font-mono text-sm uppercase ring-offset-background placeholder:normal-case focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Discount Type <span className="text-destructive">*</span></label>
                    <select
                      name="discount_type"
                      value={form.discount_type}
                      onChange={handleFormChange}
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat (₹)</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Discount Value <span className="text-destructive">*</span>
                    </label>
                    <input
                      name="discount_value"
                      type="number"
                      value={form.discount_value}
                      onChange={handleFormChange}
                      placeholder={form.discount_type === "percentage" ? "10" : "500"}
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Min Order Amount (₹)</label>
                    <input
                      name="min_order_amount"
                      type="number"
                      value={form.min_order_amount}
                      onChange={handleFormChange}
                      placeholder="0 = No minimum"
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <input
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="e.g. Sunday Special Offer"
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Valid From</label>
                    <input
                      name="valid_from"
                      type="date"
                      value={form.valid_from}
                      onChange={handleFormChange}
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Valid Until</label>
                    <input
                      name="valid_until"
                      type="date"
                      value={form.valid_until}
                      onChange={handleFormChange}
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Usage Limit</label>
                    <input
                      name="usage_limit"
                      type="number"
                      value={form.usage_limit}
                      onChange={handleFormChange}
                      placeholder="Blank = unlimited"
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="flex h-10 items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_active"
                      id="is_active"
                      checked={form.is_active}
                      onChange={handleFormChange}
                      className="size-4 accent-primary"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-foreground cursor-pointer">
                      Active immediately
                    </label>
                  </div>
                </div>

                {formError && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="size-4" />
                    {formError}
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border/60">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="rounded-xl">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={modalLoading} className="rounded-xl px-6 shadow-lg shadow-primary/25">
                    {modalLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {modalLoading ? "Creating..." : "Create Coupon"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
