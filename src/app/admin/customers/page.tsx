"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { supabase } from "@/services/supabase"
import { inr } from "@/lib/format"
import { Users, Search, Eye, Loader2, X, Receipt, ShoppingBag, Printer, Edit } from "lucide-react"
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
  const router = useRouter() // Need to import useRouter if not imported

  const handleBillingAction = (action: "view" | "print" | "edit", billNo: string) => {
    localStorage.setItem("billing_intent_action", action)
    localStorage.setItem("billing_intent_bill", billNo)
    window.location.href = "/admin/billing" // Using window.location to force full unmount/mount for fresh state, or router.push
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    // Fetch from both tables in parallel
    const [ordersRes, billsRes] = await Promise.all([
      // PHASE2_HIDDEN: supabase.from("orders").select("customer_name, customer_phone, total_amount, created_at"),
      { data: [] as any[] },
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
      // PHASE2_HIDDEN: supabase.from("orders").select("order_id, total_amount, status, created_at").eq("customer_phone", customer.phone),
      { data: [] as any[] },
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

  const newThisMonth = customers.filter(c => {
    if (!c.last_order_date) return false;
    const d = new Date(c.last_order_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const loyalCustomer = customers.length > 0 ? customers.reduce((prev, current) => (prev.total_value > current.total_value) ? prev : current, customers[0]) : null;

  return (
    <div className="mt-4 p-container-padding flex-1 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-stack-margin">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1">Customers</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage your customer database and view purchase history.</p>
        </div>
      </div>

      {/* Bento Grid Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-element-gap mb-stack-margin">
        {/* Stat Card 1 */}
        <div className="bg-white rounded-xl shadow-sm border border-outline-variant p-6 flex items-center gap-4">
          <div className="h-12 w-12 shrink-0 rounded-full bg-primary-fixed/30 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
          </div>
          <div className="min-w-0">
            <p className="font-label-md text-label-md text-outline mb-1 truncate">Total Customers</p>
            <p className="font-headline-md text-headline-md text-on-surface">{customers.length}</p>
          </div>
        </div>



        {/* Stat Card 3 */}
        <div className="bg-white rounded-xl shadow-sm border border-outline-variant p-6 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[16px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <p className="font-label-md text-label-md text-outline">Most Loyal Customer</p>
          </div>
          <p className="font-headline-sm text-headline-sm text-on-surface truncate">{loyalCustomer?.name || 'N/A'}</p>
          <p className="font-body-md text-body-md text-primary font-medium mt-1">{loyalCustomer ? inr(loyalCustomer.total_value) : ''}</p>
        </div>
      </div>

      {/* Search and Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-outline-variant overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-white">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline pointer-events-none">search</span>
            <input 
              className="block w-full pl-10 pr-3 py-2 border border-outline-variant rounded-lg leading-5 bg-white placeholder-outline-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm font-body-md" 
              placeholder="Search by name or phone number..." 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-outline-variant/30">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-6 py-4 text-left font-label-md text-label-md text-outline uppercase tracking-wider" scope="col">Customer Name</th>
                <th className="px-6 py-4 text-left font-label-md text-label-md text-outline uppercase tracking-wider" scope="col">Phone Number</th>
                <th className="px-6 py-4 text-left font-label-md text-label-md text-outline uppercase tracking-wider" scope="col">Total Bills</th>
                <th className="px-6 py-4 text-left font-label-md text-label-md text-outline uppercase tracking-wider" scope="col">Total Purchase Value</th>
                <th className="px-6 py-4 text-left font-label-md text-label-md text-outline uppercase tracking-wider" scope="col">Last Bill Date</th>
                <th className="px-6 py-4 text-right font-label-md text-label-md text-outline uppercase tracking-wider" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-outline-variant/30">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-outline">Loading customers...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-outline">No customers found.</td>
                </tr>
              ) : filtered.map(c => (
                <tr key={c.phone} className="hover:bg-surface-container-low/50 transition-colors group cursor-pointer" onClick={() => openHistory(c)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-headline-sm text-body-md text-on-surface font-medium">{c.name || "—"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-body-md text-body-md text-on-surface-variant">+91 {c.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-body-md text-body-md text-on-surface">{c.total_orders}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-body-md text-body-md text-on-surface font-medium">{inr(c.total_value)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-body-md text-body-md text-on-surface-variant">
                      {c.last_order_date ? new Date(c.last_order_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-label-md">
                    <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button className="text-primary hover:text-primary-container font-medium" onClick={(e) => { e.stopPropagation(); openHistory(c); }}>View History</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {!loading && (
          <div className="bg-white px-6 py-4 border-t border-outline-variant/30 flex items-center justify-between sm:px-6">
            <p className="font-body-md text-body-md text-outline">
              Showing <span className="font-medium text-on-surface">{filtered.length}</span> of <span className="font-medium text-on-surface">{customers.length}</span> results
            </p>
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
              className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface">
                <div>
                  <h2 className="text-xl font-bold text-on-surface">{selectedCustomer.name}</h2>
                  <p className="text-sm text-outline font-mono">+91 {selectedCustomer.phone}</p>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="rounded-full p-2 hover:bg-surface-variant transition-colors">
                  <X className="size-5" />
                </button>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 divide-x divide-outline-variant border-b border-outline-variant">
                <div className="p-4 text-center">
                  <p className="text-xs text-outline">Total Orders</p>
                  <p className="text-2xl font-black text-on-surface mt-1">{selectedCustomer.total_orders}</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-xs text-outline">Total Value</p>
                  <p className="text-2xl font-black text-primary mt-1">{inr(selectedCustomer.total_value)}</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-xs text-outline">Last Order</p>
                  <p className="text-sm font-bold text-on-surface mt-1">
                    {selectedCustomer.last_order_date ? new Date(selectedCustomer.last_order_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                  </p>
                </div>
              </div>

              {/* History List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {historyLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-primary" /></div>
                ) : history.length === 0 ? (
                  <p className="text-center text-outline py-8">No order history found.</p>
                ) : (
                  history.map((h) => {
                  const isCancelled = h.status?.toLowerCase() === 'cancelled';
                  return (
                    <div key={h.id} className={`flex items-center justify-between rounded-xl border border-outline-variant p-3 ${isCancelled ? 'opacity-50 bg-rose-50/50' : 'bg-surface'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`flex size-8 items-center justify-center rounded-full ${h.type === "online" ? "bg-blue-500/10 text-blue-600" : "bg-amber-500/10 text-amber-600"}`}>
                          {h.type === "online" ? <ShoppingBag className="size-4" /> : <Receipt className="size-4" />}
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${isCancelled ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>{h.label}</p>
                          <p className="text-xs text-outline">{new Date(h.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                        </div>
                      </div>
                      <div className="text-right mr-4">
                        <p className={`font-bold ${isCancelled ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>{inr(h.amount)}</p>
                        <p className={`text-[10px] uppercase font-bold ${isCancelled ? 'text-rose-600' : 'text-outline'}`}>{h.status}</p>
                      </div>
                      <div className="flex items-center gap-1 border-l border-outline-variant pl-4">
                        <button onClick={() => handleBillingAction('view', h.id)} className="p-2 text-outline hover:text-primary transition-colors bg-surface-variant/50 hover:bg-primary/10 rounded-lg" title="View Bill">
                          <Eye className="size-4" />
                        </button>
                        <button onClick={() => handleBillingAction('print', h.id)} className="p-2 text-outline hover:text-primary transition-colors bg-surface-variant/50 hover:bg-primary/10 rounded-lg" title="Print Bill">
                          <Printer className="size-4" />
                        </button>
                        {h.type === "offline" && !isCancelled && (
                          <button onClick={() => handleBillingAction('edit', h.id)} className="p-2 text-outline hover:text-primary transition-colors bg-surface-variant/50 hover:bg-primary/10 rounded-lg" title="Edit Bill">
                            <Edit className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
