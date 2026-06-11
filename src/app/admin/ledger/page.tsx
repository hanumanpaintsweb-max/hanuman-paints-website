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
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <BookOpen className="size-8 text-primary" /> Unpaid Bills
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          All credit/udhaar entries from billing — track and mark payments received.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Clock className="size-3.5" /> Total Pending / Udhaar
          </p>
          <p className="text-3xl font-black text-amber-500 mt-2">{inr(totalPending)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="size-3.5" /> Total Received
          </p>
          <p className="text-3xl font-black text-emerald-500 mt-2">{inr(totalPaid)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="size-3.5" /> Overdue Entries
          </p>
          <p className={`text-3xl font-black mt-2 ${overdueCount > 0 ? "text-red-500" : "text-foreground"}`}>{overdueCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search customer, phone, bill#..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "partial", "paid"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${
                filterStatus === s
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted-foreground/10"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Bill #</th>
                <th className="px-5 py-4 font-semibold text-right">Amount</th>
                <th className="px-5 py-4 font-semibold text-center">Due Date</th>
                <th className="px-5 py-4 font-semibold text-center">Status</th>
                <th className="px-5 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Loader2 className="size-6 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No udhaar entries found.
                  </td>
                </tr>
              ) : (
                filtered.map((e) => {
                  const isOverdue = e.status !== "paid" && e.due_date && new Date(e.due_date) < new Date()
                  return (
                    <tr key={e.id} className={`transition-colors hover:bg-muted/20 ${isOverdue ? "bg-red-500/5" : ""}`}>
                      <td className="px-5 py-4">
                        <p className="font-bold text-foreground">{e.customer_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{e.customer_phone}</p>
                        {e.description && <p className="text-xs text-muted-foreground mt-0.5 italic">{e.description}</p>}
                      </td>
                      <td className="px-5 py-4 font-mono text-sm text-muted-foreground">
                        {e.bill_number ? `#${e.bill_number}` : "—"}
                      </td>
                      <td className="px-5 py-4 text-right font-black text-amber-600">{inr(e.amount)}</td>
                      <td className="px-5 py-4 text-center">
                        {e.due_date ? (
                          <span className={`text-xs font-semibold ${isOverdue ? "text-red-500" : "text-muted-foreground"}`}>
                            {isOverdue && "⚠️ "}
                            {new Date(e.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                          e.status === "paid"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : e.status === "partial"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-red-500/10 text-red-600"
                        }`}>
                          {e.status === "paid" ? "✅ Paid" : e.status === "partial" ? "Partial" : "Udhaar"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {e.status !== "paid" && (
                          <div className="flex justify-end gap-2">
                            {e.status === "pending" && (
                              <button
                                onClick={() => updateStatus(e.id, "partial")}
                                className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 font-semibold transition-colors"
                              >
                                Part Paid
                              </button>
                            )}
                            <button
                              onClick={() => updateStatus(e.id, "paid")}
                              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 font-semibold transition-colors"
                            >
                              Mark Paid ✓
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
            Showing {filtered.length} of {entries.length} entries
          </div>
        )}
      </div>
    </div>
  )
}
