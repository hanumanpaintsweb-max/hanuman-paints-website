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

  const updateStatus = async (id: string, newStatus: "partial" | "paid") => {
    const { error } = await supabase.from("ledger").update({ status: newStatus }).eq("id", id)
    if (!error) {
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)))
      toast.success(newStatus === "paid" ? "✅ Marked as Paid!" : "Marked as Partial")
    } else {
      toast.error("Update failed")
    }
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
                          {e.status === "pending" && (
                            <button
                              onClick={() => updateStatus(e.id, "partial")}
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
    </div>
  )
}
