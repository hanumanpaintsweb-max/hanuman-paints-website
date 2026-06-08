"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { supabase } from "@/services/supabase"
import { inr } from "@/lib/format"
import { 
  Users, Search, Filter, MessageCircle, Eye, Loader2, Edit, Plus, X, Receipt, Clock, Wallet
} from "lucide-react"
import { Button } from "@/components/ui/button"

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  customer_type: "retail" | "wholesale";
  credit_limit: number;
  current_outstanding: number;
  total_orders: number;
  total_value: number;
  notes: string;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  // Filters & Sort
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all") // "all", "retail", "wholesale"
  
  // Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerHistory, setCustomerHistory] = useState<any[]>([])
  const [customerLedger, setCustomerLedger] = useState<any[]>([])

  // Edit/Add Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    customer_type: "retail",
    credit_limit: 0,
    current_outstanding: 0,
    notes: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false })
    if (data) setCustomers(data)
    setLoading(false)
  }

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingCustomer) {
        // Update
        const { error } = await supabase
          .from("customers")
          .update(formData)
          .eq("id", editingCustomer.id)
        if (error) throw error
        setCustomers(customers.map(c => c.id === editingCustomer.id ? { ...c, ...formData } as Customer : c))
      } else {
        // Create
        const { data, error } = await supabase
          .from("customers")
          .insert([formData])
          .select()
          .single()
        if (error) throw error
        if (data) setCustomers([data, ...customers])
      }
      setShowEditModal(false)
    } catch (error: any) {
      alert("Error saving customer: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openCustomerDetails = async (customer: Customer) => {
    setSelectedCustomer(customer)
    // Fetch History
    const [ordersRes, billsRes, ledgerRes] = await Promise.all([
      supabase.from('orders').select('*').eq('customer_phone', customer.phone),
      supabase.from('bills').select('*').eq('customer_phone', customer.phone).eq('is_deleted', false),
      supabase.from('ledger').select('*').eq('customer_phone', customer.phone)
    ])
    
    const history = [
      ...(ordersRes.data || []).map(o => ({...o, type: 'ORDER'})),
      ...(billsRes.data || []).map(b => ({...b, type: 'BILL'}))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    setCustomerHistory(history)
    setCustomerLedger((ledgerRes.data || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
  }

  const filteredCustomers = customers.filter(c => {
    if (typeFilter !== "all" && c.customer_type !== typeFilter) return false
    if (search) {
      const s = search.toLowerCase()
      return c.name.toLowerCase().includes(s) || c.phone.includes(s)
    }
    return true
  })

  return (
    <div className="space-y-6 pb-20 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Users className="size-8 text-primary" /> Customer Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage retail & wholesale customers, and track credit limits.</p>
        </div>
        <Button onClick={() => { 
          setEditingCustomer(null); 
          setFormData({ name: "", phone: "", email: "", customer_type: "retail", credit_limit: 0, current_outstanding: 0, notes: "" }); 
          setShowEditModal(true); 
        }} className="gap-2">
          <Plus className="size-4" /> Add Customer
        </Button>
      </div>

      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input 
            type="text" placeholder="Search by name or phone..." 
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" 
          />
        </div>
        <div className="flex gap-3">
          <select 
            value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary font-medium"
          >
            <option value="all">All Types</option>
            <option value="retail">Retail</option>
            <option value="wholesale">Wholesale</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium text-center">Type</th>
                <th className="px-6 py-4 font-medium text-right">Credit Limit</th>
                <th className="px-6 py-4 font-medium text-right">Outstanding</th>
                <th className="px-6 py-4 font-medium text-center">Orders</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500"><Loader2 className="size-6 animate-spin mx-auto" /></td></tr>
              ) : filteredCustomers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{c.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{c.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                      c.customer_type === 'wholesale' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {c.customer_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-700">{inr(c.credit_limit)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-bold ${c.current_outstanding > c.credit_limit ? 'text-rose-600' : c.current_outstanding > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {inr(c.current_outstanding)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-700">{c.total_orders}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => {
                        setEditingCustomer(c);
                        setFormData({
                          name: c.name, phone: c.phone, email: c.email || "", 
                          customer_type: c.customer_type, credit_limit: c.credit_limit, 
                          current_outstanding: c.current_outstanding, notes: c.notes || ""
                        });
                        setShowEditModal(true);
                      }} className="size-8 text-slate-500 hover:text-slate-900">
                        <Edit className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => openCustomerDetails(c)} className="size-8 text-primary hover:text-primary hover:bg-primary/10">
                        <Eye className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredCustomers.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No customers found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h2 className="text-lg font-bold text-slate-900">{editingCustomer ? "Edit Customer" : "Add Customer"}</h2>
                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600"><X className="size-5" /></button>
              </div>
              <form onSubmit={handleSaveCustomer} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Full Name *</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Phone Number *</label>
                    <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Customer Type</label>
                    <select value={formData.customer_type} onChange={(e: any) => setFormData({...formData, customer_type: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <option value="retail">Retail</option>
                      <option value="wholesale">Wholesale</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Credit Limit (₹)</label>
                    <input type="number" min="0" value={formData.credit_limit} onChange={e => setFormData({...formData, credit_limit: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Current Outstanding (₹)</label>
                    <input type="number" min="0" value={formData.current_outstanding} onChange={e => setFormData({...formData, current_outstanding: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Notes</label>
                  <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div className="pt-4 flex items-center justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setShowEditModal(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Customer"}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                <div className="flex gap-4 items-center">
                  <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-2xl">
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-slate-900">{selectedCustomer.name}</h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700">{selectedCustomer.customer_type}</span>
                    </div>
                    <div className="text-slate-500 font-mono mt-1 text-sm">{selectedCustomer.phone}</div>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setSelectedCustomer(null)} className="rounded-full"><X className="size-5" /></Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <div className="text-xs font-semibold text-slate-500">Credit Limit</div>
                    <div className="text-xl font-bold text-slate-900 mt-1">{inr(selectedCustomer.credit_limit)}</div>
                  </div>
                  <div className={`border p-4 rounded-xl ${selectedCustomer.current_outstanding > selectedCustomer.credit_limit ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
                    <div className={`text-xs font-semibold ${selectedCustomer.current_outstanding > selectedCustomer.credit_limit ? 'text-rose-600' : 'text-amber-600'}`}>Current Outstanding</div>
                    <div className={`text-xl font-bold mt-1 ${selectedCustomer.current_outstanding > selectedCustomer.credit_limit ? 'text-rose-700' : 'text-amber-700'}`}>{inr(selectedCustomer.current_outstanding)}</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <div className="text-xs font-semibold text-slate-500">Total Orders</div>
                    <div className="text-xl font-bold text-slate-900 mt-1">{selectedCustomer.total_orders}</div>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl">
                    <div className="text-xs font-semibold text-primary">Lifetime Value</div>
                    <div className="text-xl font-bold text-primary mt-1">{inr(selectedCustomer.total_value)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-900"><Receipt className="size-5 text-primary"/> Order History</h3>
                    <div className="space-y-3">
                      {customerHistory.length === 0 ? <p className="text-sm text-slate-500">No orders found.</p> : customerHistory.map((h, i) => (
                        <div key={i} className="bg-white border border-slate-100 rounded-xl p-3 flex justify-between items-center shadow-sm">
                          <div>
                            <div className="font-semibold text-sm text-slate-900">
                              {h.type === 'BILL' ? `Offline Bill #${h.bill_number}` : `Online Order #${h.order_id}`}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">{new Date(h.created_at).toLocaleDateString()}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-slate-900">{inr(h.total_amount || h.total)}</div>
                            <div className="text-[10px] font-bold uppercase text-slate-400">{h.payment_status || h.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-900"><Wallet className="size-5 text-primary"/> Ledger Entries</h3>
                    <div className="space-y-3">
                      {customerLedger.length === 0 ? <p className="text-sm text-slate-500">No ledger entries found.</p> : customerLedger.map((l, i) => (
                        <div key={i} className="bg-white border border-slate-100 rounded-xl p-3 flex justify-between items-center shadow-sm">
                          <div>
                            <div className="font-semibold text-sm text-slate-900 capitalize">{l.type} - {l.description || 'No description'}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{new Date(l.date).toLocaleDateString()}</div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${l.type === 'receivable' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {l.type === 'receivable' ? '+' : '-'}{inr(l.amount)}
                            </div>
                            <div className="text-[10px] font-bold uppercase text-slate-400">{l.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
