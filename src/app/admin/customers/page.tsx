"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { supabase } from "@/services/supabase"
import { inr } from "@/lib/format"
import { 
  Users, Search, Filter, MessageCircle, Eye, Loader2, ArrowUpDown, Receipt, Clock, MapPin, X, Package
} from "lucide-react"
import { Button } from "@/components/ui/button"

type CustomerAgg = {
  id: string; // phone number usually
  name: string;
  phone: string;
  address: string;
  totalSpent: number;
  totalOrders: number;
  firstOrder: Date;
  lastOrder: Date;
  isActive: boolean; // ordered in last 30 days
  history: any[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerAgg[]>([])
  const [loading, setLoading] = useState(true)

  // Filters & Sort
  const [search, setSearch] = useState("")
  const [filterActive, setFilterActive] = useState("All") // "All", "Active", "Inactive"
  const [sortParam, setSortParam] = useState("totalSpent") // "totalSpent", "lastOrder", "totalOrders"
  
  // Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerAgg | null>(null)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    const { data: oData } = await supabase.from('orders').select('*')
    const { data: bData } = await supabase.from('bills').select('*').eq('is_deleted', false)

    const allSales = [...(oData || []), ...(bData || [])]
    
    const customerMap: Record<string, CustomerAgg> = {}
    const thirtyDaysAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000)

    allSales.forEach(sale => {
      // Normalize phone number
      const phone = sale.customer_phone ? sale.customer_phone.replace(/\D/g, '') : ''
      if (!phone || phone.length < 10) return

      const saleDate = new Date(sale.created_at)
      const amt = sale.total_amount || sale.total || 0

      if (!customerMap[phone]) {
        customerMap[phone] = {
          id: phone,
          name: sale.customer_name || 'Unknown',
          phone: phone,
          address: sale.customer_address || '',
          totalSpent: 0,
          totalOrders: 0,
          firstOrder: saleDate,
          lastOrder: saleDate,
          isActive: false,
          history: []
        }
      }

      const c = customerMap[phone]
      c.totalSpent += amt
      c.totalOrders += 1
      if (saleDate < c.firstOrder) c.firstOrder = saleDate
      if (saleDate > c.lastOrder) {
        c.lastOrder = saleDate
        // Only update name/address if we have a newer, valid one
        if (sale.customer_name) c.name = sale.customer_name
        if (sale.customer_address) c.address = sale.customer_address
      }
      
      c.history.push({
        ...sale,
        type: sale.bill_number ? 'BILL' : 'ORDER'
      })
    })

    const compiled = Object.values(customerMap).map(c => {
      c.isActive = c.lastOrder >= thirtyDaysAgo
      c.history.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      return c
    })

    setCustomers(compiled)
    setLoading(false)
  }

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      if (filterActive === "Active" && !c.isActive) return false
      if (filterActive === "Inactive" && c.isActive) return false
      if (search) {
        const s = search.toLowerCase()
        return c.name.toLowerCase().includes(s) || c.phone.includes(s)
      }
      return true
    }).sort((a, b) => {
      if (sortParam === "totalSpent") return b.totalSpent - a.totalSpent
      if (sortParam === "lastOrder") return b.lastOrder.getTime() - a.lastOrder.getTime()
      if (sortParam === "totalOrders") return b.totalOrders - a.totalOrders
      return 0
    })
  }, [customers, search, filterActive, sortParam])

  const openWhatsApp = (phone: string, name: string) => {
    const text = `Namaste ${name}! Hanuman Paints se...`
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(text)}`, "_blank")
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center flex-col gap-4">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-semibold animate-pulse">Loading Customer Database...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Users className="size-8 text-primary" /> Customer Database
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Unified CRM tracking both online orders and offline bills</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm">
          <div className="text-sm font-semibold text-muted-foreground">Total Customers</div>
          <div className="text-2xl font-black mt-1">{customers.length}</div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl shadow-sm">
          <div className="text-sm font-semibold text-emerald-700">Active (30 Days)</div>
          <div className="text-2xl font-black mt-1 text-emerald-800">{customers.filter(c => c.isActive).length}</div>
        </div>
        <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm">
          <div className="text-sm font-semibold text-muted-foreground">Average LTV</div>
          <div className="text-2xl font-black mt-1">
            {customers.length ? inr(customers.reduce((a,b)=>a+b.totalSpent,0) / customers.length) : '₹0'}
          </div>
        </div>
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl shadow-sm">
          <div className="text-sm font-semibold text-primary">Repeat Rate</div>
          <div className="text-2xl font-black mt-1 text-primary">
            {customers.length ? Math.round((customers.filter(c => c.totalOrders > 1).length / customers.length) * 100) : 0}%
          </div>
        </div>
      </div>

      <div className="bg-card border border-border/60 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input 
            type="text" placeholder="Search by name or 10-digit phone..." 
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary" 
          />
        </div>
        <div className="flex gap-3">
          <select 
            value={filterActive} onChange={e => setFilterActive(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary font-semibold"
          >
            <option value="All">All Status</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select 
            value={sortParam} onChange={e => setSortParam(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary font-semibold"
          >
            <option value="totalSpent">Sort by Value</option>
            <option value="lastOrder">Sort by Recency</option>
            <option value="totalOrders">Sort by Orders</option>
          </select>
        </div>
      </div>

      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-bold">
            <tr>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Orders</th>
              <th className="px-6 py-4">Last Order</th>
              <th className="px-6 py-4 text-right">Lifetime Value</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredCustomers.map(c => (
              <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-foreground">{c.name}</div>
                  <div className="text-xs font-mono text-muted-foreground">{c.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                    {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center font-bold text-muted-foreground">{c.totalOrders}</td>
                <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">{c.lastOrder.toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right font-black text-primary">{inr(c.totalSpent)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="outline" onClick={() => openWhatsApp(c.phone, c.name)} className="size-8 rounded-lg text-[#25D366] border-[#25D366]/20 hover:bg-[#25D366]/10">
                      <MessageCircle className="size-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => setSelectedCustomer(c)} className="size-8 rounded-lg">
                      <Eye className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No customers found matching your filters</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Customer Detail Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-card rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-border/60"
            >
              {/* Header */}
              <div className="p-6 border-b border-border/60 flex justify-between items-start bg-muted/20">
                <div className="flex gap-4 items-center">
                  <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-2xl">
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedCustomer.name}</h2>
                    <div className="text-muted-foreground font-mono mt-1">{selectedCustomer.phone}</div>
                    {selectedCustomer.address && (
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="size-3"/> {selectedCustomer.address}</div>
                    )}
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setSelectedCustomer(null)} className="rounded-full"><X className="size-5" /></Button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl text-center">
                    <div className="text-xs font-bold text-primary mb-1">Lifetime Value</div>
                    <div className="text-3xl font-black text-primary">{inr(selectedCustomer.totalSpent)}</div>
                  </div>
                  <div className="bg-muted border border-border/60 p-4 rounded-2xl text-center">
                    <div className="text-xs font-bold text-muted-foreground mb-1">Total Orders</div>
                    <div className="text-3xl font-black text-foreground">{selectedCustomer.totalOrders}</div>
                  </div>
                  <div className="bg-muted border border-border/60 p-4 rounded-2xl text-center">
                    <div className="text-xs font-bold text-muted-foreground mb-1">First Ordered</div>
                    <div className="text-xl font-bold text-foreground mt-2">{selectedCustomer.firstOrder.toLocaleDateString()}</div>
                  </div>
                </div>

                {/* History Timeline */}
                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Clock className="size-5 text-primary"/> Purchase History</h3>
                  <div className="space-y-4">
                    {selectedCustomer.history.map((h, i) => (
                      <div key={i} className="bg-background border border-border/60 rounded-2xl p-4 flex justify-between items-center hover:border-primary/40 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${h.type === 'BILL' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                            {h.type === 'BILL' ? <Receipt className="size-5"/> : <Package className="size-5"/>}
                          </div>
                          <div>
                            <div className="font-bold text-sm">
                              {h.type === 'BILL' ? `Offline Bill #${h.bill_number}` : `Online Order #${h.order_id}`}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(h.created_at).toLocaleString()} • {h.items?.length || 0} items
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-lg">{inr(h.total_amount || h.total)}</div>
                          <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded mt-1 inline-block ${
                            h.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                            h.status === 'Delivered' ? 'bg-blue-100 text-blue-700' : 'bg-muted text-muted-foreground'
                          }`}>
                            {h.payment_status || h.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border/60 bg-muted/20 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedCustomer(null)} className="rounded-xl">Close</Button>
                <Button onClick={() => openWhatsApp(selectedCustomer.phone, selectedCustomer.name)} className="rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white gap-2">
                  <MessageCircle className="size-4"/> Message on WhatsApp
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
