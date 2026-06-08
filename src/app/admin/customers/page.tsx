"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { supabase } from "@/services/supabase"
import { inr } from "@/lib/format"
import { Users, Search, Eye, Loader2, X, Receipt, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"

type CustomerRow = {
  phone: string
  name: string
  total_orders: number
  total_value: number
  last_order_date: string | null
  source: "online" | "offline" | "both"
}

type HistoryItem = {
  id: string
  label: string
  amount: number
  date: string
  status: string
  type: "online" | "offline"
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    // Fetch from both tables in parallel
    const [ordersRes, billsRes] = await Promise.all([
      supabase.from("orders").select("customer_name, customer_phone, total_amount, created_at"),
      supabase.from("bills").select("customer_name, customer_phone, total_amount, created_at").eq("is_deleted", false),
    ])

    const map: Record<string, CustomerRow> = {}

    // Merge online orders
    for (const o of ordersRes.data || []) {
      const phone = o.customer_phone?.replace(/\D/g, "")
      if (!phone) continue
      if (!map[phone]) {
        map[phone] = { phone, name: o.customer_name, total_orders: 0, total_value: 0, last_order_date: null, source: "online" }
      }
      map[phone].total_orders += 1
      map[phone].total_value += Number(o.total_amount || 0)
      if (!map[phone].last_order_date || o.created_at > map[phone].last_order_date!) {
        map[phone].last_order_date = o.created_at
        map[phone].name = o.customer_name // prefer latest name
      }
      map[phone].source = map[phone].source === "offline" ? "both" : "online"
    }

    // Merge offline bills
    for (const b of billsRes.data || []) {
      const phone = b.customer_phone?.replace(/\D/g, "")
      if (!phone) continue
      if (!map[phone]) {
        map[phone] = { phone, name: b.customer_name, total_orders: 0, total_value: 0, last_order_date: null, source: "offline" }
      }
      map[phone].total_orders += 1
      map[phone].total_value += Number(b.total_amount || 0)
      if (!map[phone].last_order_date || b.created_at > map[phone].last_order_date!) {
        map[phone].last_order_date = b.created_at
        map[phone].name = b.customer_name
      }
      if (map[phone].source === "online") map[phone].source = "both"
      else map[phone].source = "offline"
    }

    const sorted = Object.values(map).sort((a, b) => (b.last_order_date || "") > (a.last_order_date || "") ? 1 : -1)
    setCustomers(sorted)
    setLoading(false)
  }

  const openHistory = async (customer: CustomerRow) => {
    setSelectedCustomer(customer)
    setHistoryLoading(true)
    const [ordersRes, billsRes] = await Promise.all([
      supabase.from("orders").select("order_id, total_amount, status, created_at").eq("customer_phone", customer.phone),
      supabase.from("bills").select("bill_number, total_amount, payment_status, created_at").eq("customer_phone", customer.phone).eq("is_deleted", false),
    ])

    const items: HistoryItem[] = [
      ...(ordersRes.data || []).map((o) => ({
        id: o.order_id,
        label: `Online Order #${o.order_id}`,
        amount: Number(o.total_amount || 0),
        date: o.created_at,
        status: o.status,
        type: "online" as const,
      })),
      ...(billsRes.data || []).map((b) => ({
        id: b.bill_number,
        label: `Offline Bill #${b.bill_number}`,
        amount: Number(b.total_amount || 0),
        date: b.created_at,
        status: b.payment_status,
        type: "offline" as const,
      })),
    ].sort((a, b) => (b.date > a.date ? 1 : -1))

    setHistory(items)
    setHistoryLoading(false)
  }

  const filtered = customers.filter((c) => {
    if (!search) return true
    const s = search.toLowerCase()
    return c.name?.toLowerCase().includes(s) || c.phone?.includes(s)
  })

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Users className="size-8 text-primary" /> Customer Directory
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          All customers who have placed online orders or offline bills — merged by phone number.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold text-center">Source</th>
                <th className="px-6 py-4 font-semibold text-center">Total Orders</th>
                <th className="px-6 py-4 font-semibold text-right">Total Value</th>
                <th className="px-6 py-4 font-semibold text-center">Last Order</th>
                <th className="px-6 py-4 font-semibold text-right">History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="size-6 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.phone} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">{c.name || "—"}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">+91 {c.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                        c.source === "both" ? "bg-purple-500/10 text-purple-600" :
                        c.source === "online" ? "bg-blue-500/10 text-blue-600" :
                        "bg-amber-500/10 text-amber-600"
                      }`}>
                        {c.source === "both" ? "Online + Bill" : c.source === "online" ? "Online" : "Offline Bill"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-foreground">{c.total_orders}</td>
                    <td className="px-6 py-4 text-right font-bold text-primary">{inr(c.total_value)}</td>
                    <td className="px-6 py-4 text-center text-muted-foreground text-xs">
                      {c.last_order_date ? new Date(c.last_order_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button size="sm" variant="outline" onClick={() => openHistory(c)} className="rounded-xl gap-1.5 text-xs h-8">
                        <Eye className="size-3.5" /> Orders
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="border-t border-border px-6 py-3 text-xs text-muted-foreground">
            Showing {filtered.length} of {customers.length} customers
          </div>
        )}
      </div>

      {/* Order History Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[85vh] bg-card rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedCustomer.name}</h2>
                  <p className="text-sm text-muted-foreground font-mono">+91 {selectedCustomer.phone}</p>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="rounded-full p-2 hover:bg-muted transition-colors">
                  <X className="size-5" />
                </button>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                <div className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-black text-foreground mt-1">{selectedCustomer.total_orders}</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-black text-primary mt-1">{inr(selectedCustomer.total_value)}</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Last Order</p>
                  <p className="text-sm font-bold text-foreground mt-1">
                    {selectedCustomer.last_order_date ? new Date(selectedCustomer.last_order_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                  </p>
                </div>
              </div>

              {/* History List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {historyLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-primary" /></div>
                ) : history.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No order history found.</p>
                ) : (
                  history.map((h) => (
                    <div key={h.id} className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex size-8 items-center justify-center rounded-full ${h.type === "online" ? "bg-blue-500/10 text-blue-600" : "bg-amber-500/10 text-amber-600"}`}>
                          {h.type === "online" ? <ShoppingBag className="size-4" /> : <Receipt className="size-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{h.label}</p>
                          <p className="text-xs text-muted-foreground">{new Date(h.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">{inr(h.amount)}</p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">{h.status}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
