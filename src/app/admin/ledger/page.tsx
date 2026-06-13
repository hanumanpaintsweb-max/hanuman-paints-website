"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { supabase } from "@/services/supabase"
import { inr } from "@/lib/format"
import { BookOpen, Search, CheckCircle2, Clock, AlertTriangle, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type LedgerEntry = {
  id: string
  customer_name: string
  customer_phone: string
  amount: number
  description: string
  date: string
  due_date?: string
  bill_number?: string
  status: "pending" | "partial" | "paid"
  created_at: string
}

export default function UnpaidBillsPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "partial" | "paid">("all")
  
  const [partialModal, setPartialModal] = useState<{isOpen: boolean, entry: LedgerEntry | null, amount: string}>({isOpen: false, entry: null, amount: ""})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchLedger = useCallback(async () => {
    setLoading(true)
    // Fetch all udhaar/unpaid entries from ledger table
    const { data, error } = await supabase
      .from("ledger")
      .select("*")
      .eq("type", "receivable")
      .order("date", { ascending: false })
    if (data) setEntries(data)
    if (error) toast.error("Failed to fetch ledger")
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchLedger()
  }, [fetchLedger])

  const updateStatus = async (id: string, newStatus: "paid") => {
    const entry = entries.find(e => e.id === id)
    if (!entry) return
    
    // For full paid, we can just do the same logic but for full amount
    const paidAmount = entry.amount
    
    await supabase.from("ledger").update({ status: "paid", amount: 0 }).eq("id", id)
    await supabase.from("ledger").insert({
      customer_name: entry.customer_name,
      customer_phone: entry.customer_phone,
      bill_number: entry.bill_number,
      type: "received",
      amount: paidAmount,
      description: `Full payment for bill #${entry.bill_number || 'N/A'}`,
      date: new Date().toISOString(),
      status: "paid"
    })
    
    if (entry.bill_number) {
      await supabase.from("bills").update({ payment_status: "paid" }).eq("bill_number", entry.bill_number)
    }
    
    if (entry.customer_phone) {
      const { data: custData } = await supabase.from("customers").select("current_outstanding, id").eq("phone", entry.customer_phone).single()
      if (custData) {
        const newOut = Math.max(0, (custData.current_outstanding || 0) - paidAmount)
        await supabase.from("customers").update({ current_outstanding: newOut }).eq("id", custData.id)
      }
    }
    
    toast.success("✅ Marked as Paid!")
    fetchLedger()
  }

  const submitPartialPayment = async () => {
    const entry = partialModal.entry
    const paidAmount = Number(partialModal.amount)
    if (!entry || isNaN(paidAmount) || paidAmount <= 0 || paidAmount > entry.amount) return

    setIsSubmitting(true)
    const remaining = entry.amount - paidAmount

    // 1. Insert new received record
    await supabase.from("ledger").insert({
      customer_name: entry.customer_name,
      customer_phone: entry.customer_phone,
      bill_number: entry.bill_number,
      type: "received",
      amount: paidAmount,
      description: `Partial payment for bill #${entry.bill_number || 'N/A'}`,
      date: new Date().toISOString(),
      status: "paid"
    })

    // 2. Update original ledger entry to partial or paid, and adjust its amount to remaining
    if (remaining === 0) {
      await supabase.from("ledger").update({ status: "paid", amount: 0 }).eq("id", entry.id)
    } else {
      await supabase.from("ledger").update({ status: "partial", amount: remaining }).eq("id", entry.id)
    }

    // 3. Update bills table (status)
    if (entry.bill_number) {
      await supabase.from("bills").update({ payment_status: remaining === 0 ? "paid" : "partial" }).eq("bill_number", entry.bill_number)
    }

    // 4. Deduct from customer's global current_outstanding
    if (entry.customer_phone) {
      const { data: custData } = await supabase.from("customers").select("current_outstanding, id").eq("phone", entry.customer_phone).single()
      if (custData) {
        const newOutstanding = Math.max(0, (custData.current_outstanding || 0) - paidAmount)
        await supabase.from("customers").update({ current_outstanding: newOutstanding }).eq("id", custData.id)
      }
    }

    toast.success("Partial payment recorded!")
    setPartialModal({ isOpen: false, entry: null, amount: "" })
    setIsSubmitting(false)
    fetchLedger()
  }

  const filtered = entries.filter((e) => {
    if (filterStatus !== "all" && e.status !== filterStatus) return false
    if (search) {
      const s = search.toLowerCase()
      return (
        e.customer_name?.toLowerCase().includes(s) ||
        e.customer_phone?.includes(s) ||
        e.bill_number?.toLowerCase().includes(s)
      )
    }
    return true
  })

  // Summary calculations
  const totalPending = entries.filter((e) => e.status !== "paid").reduce((sum, e) => sum + Number(e.amount), 0)
  const totalPaid = entries.filter((e) => e.status === "paid").reduce((sum, e) => sum + Number(e.amount), 0)
  const overdueCount = entries.filter((e) => {
    if (e.status === "paid") return false
    if (!e.due_date) return false
    return new Date(e.due_date) < new Date()
  }).length

  return (
    <div className="pt-8 px-4 md:px-container-padding pb-container-padding max-w-7xl mx-auto w-full flex-grow flex flex-col gap-element-gap">
      <div className="flex items-center justify-between">
        <h1 className="font-headline-md text-headline-md text-on-surface">Unpaid Bills</h1>
      </div>

      {/* Top Section: Total Outstanding Amount */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-8 flex items-center justify-between">
        <div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-2">Total Outstanding Amount</p>
          <p className="font-headline-lg text-headline-lg text-primary-container tracking-tight">{inr(totalPending)}</p>
        </div>
        <div className="h-16 w-16 bg-error-container rounded-full flex items-center justify-center text-error">
          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>money_off</span>
        </div>
      </div>

      {/* Main Section: Data Table Area */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 flex-grow flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-outline-variant/30 flex flex-col md:flex-row gap-4 justify-between items-center bg-surface-bright">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline-variant" />
            <input
              className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent font-body-md text-body-md text-on-surface placeholder-outline-variant transition-all"
              placeholder="Search customer, phone or bill no..."
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex gap-2 bg-surface p-1 rounded-lg border border-outline-variant/50 overflow-x-auto max-w-full">
              {(["all", "pending", "partial", "paid"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all capitalize whitespace-nowrap ${filterStatus === s
                      ? "bg-primary-container text-on-primary"
                      : "text-on-surface-variant hover:bg-surface-variant/50"
                    }`}
                >
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-grow">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/30">
                <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Customer</th>
                <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Phone</th>
                <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Bill No</th>
                <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Amount</th>
                <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">Status</th>
                <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-outline">Loading unpaid bills...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-outline">No entries found.</td></tr>
              ) : filtered.map(e => {
                const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'NA';
                const isOverdue = e.status !== "paid" && e.due_date && new Date(e.due_date) < new Date();

                return (
                  <tr key={e.id} className="hover:bg-surface-container-low/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${isOverdue ? 'bg-primary-container text-on-primary' : 'bg-tertiary-container text-on-tertiary'} flex items-center justify-center font-label-md text-label-md`}>
                          {getInitials(e.customer_name)}
                        </div>
                        <div>
                          <span className="font-body-md text-body-md font-medium text-on-surface block">{e.customer_name}</span>
                          {e.description && <span className="text-xs text-on-surface-variant mt-0.5 italic block">{e.description}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{e.customer_phone}</td>
                    <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{e.bill_number ? `#${e.bill_number}` : '—'}</td>
                    <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="py-4 px-6 font-body-md text-body-md font-semibold text-on-surface text-right">{inr(e.amount)}</td>
                    <td className="py-4 px-6 text-center">
                      {e.status === "paid" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-tertiary-container text-on-tertiary">
                          Paid
                        </span>
                      ) : e.status === "partial" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-variant text-on-surface-variant border border-outline-variant">
                          Partial
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error-container text-on-error-container border border-error/20">
                          Overdue
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-variant text-on-surface-variant border border-outline-variant">
                          Recent
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {e.status !== "paid" ? (
                        <div className="flex justify-end gap-2">
                          {(e.status === "pending" || e.status === "partial") && (
                            <button
                              onClick={() => setPartialModal({ isOpen: true, entry: e, amount: "" })}
                              className="bg-transparent border border-outline-variant hover:border-primary-container hover:text-primary-container text-on-surface-variant font-label-md text-label-md py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
                            >
                              Part Paid
                            </button>
                          )}
                          <button
                            onClick={() => updateStatus(e.id, "paid")}
                            className="bg-secondary-container hover:bg-secondary text-on-secondary font-label-md text-label-md py-2 px-4 rounded-lg transition-colors shadow-sm whitespace-nowrap"
                          >
                            Mark as Paid
                          </button>
                        </div>
                      ) : (
                        <span className="text-on-surface-variant text-sm font-bold">✓</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {!loading && (
          <div className="p-4 border-t border-outline-variant/30 flex items-center justify-between bg-surface-container-lowest">
            <span className="font-body-md text-body-md text-on-surface-variant">Showing {filtered.length} entries</span>
          </div>
        )}
      </div>

      {/* Partial Payment Modal */}
      <AnimatePresence>
        {partialModal.isOpen && partialModal.entry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-outline-variant/30">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Partial Payment</h3>
                <button onClick={() => setPartialModal({ isOpen: false, entry: null, amount: "" })} className="text-outline hover:text-on-surface"><X className="size-5"/></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30">
                  <p className="text-sm text-on-surface-variant">Current Unpaid Amount</p>
                  <p className="font-headline-md text-headline-md text-on-surface mt-1">{inr(partialModal.entry.amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-on-surface mb-2 block">Amount Paid <span className="text-error">*</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">₹</span>
                    <input 
                      type="number" 
                      value={partialModal.amount}
                      onChange={e => setPartialModal({...partialModal, amount: e.target.value})}
                      className="w-full pl-8 pr-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-container font-body-lg text-on-surface"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                {Number(partialModal.amount) > 0 && (
                  <div className="flex justify-between items-center p-4 bg-error-container/10 rounded-xl">
                    <span className="text-sm font-medium text-on-surface-variant">Remaining Balance</span>
                    <span className="font-bold text-error">{inr(partialModal.entry.amount - Number(partialModal.amount))}</span>
                  </div>
                )}
                <Button 
                  onClick={submitPartialPayment} 
                  disabled={isSubmitting || !partialModal.amount || Number(partialModal.amount) <= 0 || Number(partialModal.amount) > partialModal.entry.amount}
                  className="w-full h-12 rounded-xl mt-4 bg-primary text-white hover:bg-primary/90"
                >
                  {isSubmitting ? <Loader2 className="size-5 animate-spin"/> : "Save Payment"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
