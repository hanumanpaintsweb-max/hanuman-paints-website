"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/services/supabase"
import { motion, AnimatePresence } from "motion/react"
import { 
  Plus, Search, FileText, ArrowUpRight, ArrowDownRight, 
  Wallet, Filter, ChevronDown, CheckCircle2, CircleDashed, Clock, Trash2, Edit, X
} from "lucide-react"

import { Button } from "@/components/ui/button"

type LedgerEntry = {
  id: string
  customer_name: string
  customer_phone: string
  type: "receivable" | "payable"
  amount: number
  description: string
  date: string
  status: "pending" | "partial" | "paid"
  created_at: string
}

export default function LedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"receivable" | "payable">("receivable")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Add Entry Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    type: "receivable",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    status: "pending"
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchLedger()
  }, [])

  const fetchLedger = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("ledger")
        .select("*")
        .order("date", { ascending: false })
      
      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error("Error fetching ledger:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      const { data, error } = await supabase
        .from("ledger")
        .insert([{
          ...formData,
          amount: parseFloat(formData.amount)
        }])
        .select()
        .single()
      
      if (error) throw error
      
      setEntries([data, ...entries])
      setShowAddModal(false)
      setFormData({
        customer_name: "",
        customer_phone: "",
        type: activeTab,
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        status: "pending"
      })
    } catch (error) {
      console.error("Error adding entry:", error)
      alert("Failed to add entry")
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("ledger")
        .update({ status: newStatus })
        .eq("id", id)
      
      if (error) throw error
      setEntries(entries.map(e => e.id === id ? { ...e, status: newStatus as any } : e))
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Failed to update status")
    }
  }

  const deleteEntry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return
    try {
      const { error } = await supabase.from("ledger").delete().eq("id", id)
      if (error) throw error
      setEntries(entries.filter(e => e.id !== id))
    } catch (error) {
      console.error("Error deleting entry:", error)
    }
  }

  const totalReceivable = entries.filter(e => e.type === "receivable" && e.status !== "paid").reduce((sum, e) => sum + e.amount, 0)
  const totalPayable = entries.filter(e => e.type === "payable" && e.status !== "paid").reduce((sum, e) => sum + e.amount, 0)
  const netBalance = totalReceivable - totalPayable

  const filteredEntries = entries.filter(e => {
    if (e.type !== activeTab) return false
    if (statusFilter !== "all" && e.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return e.customer_name.toLowerCase().includes(q) || (e.customer_phone && e.customer_phone.includes(q))
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Ledger Book</h1>
          <p className="text-sm text-slate-500 mt-1">Manage receivables and payables easily.</p>
        </div>
        <Button onClick={() => { setFormData(f => ({ ...f, type: activeTab })); setShowAddModal(true); }} className="gap-2">
          <Plus className="size-4" /> Add Entry
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">Total Lena Hai</p>
              <h3 className="text-2xl font-bold text-emerald-900 mt-1">₹{totalReceivable.toLocaleString('en-IN')}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <ArrowDownRight className="size-6" />
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-rose-600">Total Dena Hai</p>
              <h3 className="text-2xl font-bold text-rose-900 mt-1">₹{totalPayable.toLocaleString('en-IN')}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <ArrowUpRight className="size-6" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Net Balance</p>
              <h3 className="text-2xl font-bold text-blue-900 mt-1">
                {netBalance >= 0 ? '+' : '-'}₹{Math.abs(netBalance).toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Wallet className="size-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden">
        <div>
          <div className="border-b border-slate-200 px-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
              <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'receivable' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setActiveTab('receivable')}
                >
                  Lena Hai (Receivable)
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'payable' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setActiveTab('payable')}
                >
                  Dena Hai (Payable)
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    placeholder="Search name or phone..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-[140px]"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Description</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-10 text-slate-500">Loading ledger...</td></tr>
                  ) : filteredEntries.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-slate-500">No entries found.</td></tr>
                  ) : (
                    filteredEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{entry.customer_name}</div>
                          {entry.customer_phone && <div className="text-xs text-slate-500 mt-0.5">{entry.customer_phone}</div>}
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate">{entry.description || "-"}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">₹{entry.amount.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4">
                          <select 
                            value={entry.status} 
                            onChange={(e) => updateStatus(entry.id, e.target.value)}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                              entry.status === 'paid' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                              entry.status === 'partial' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                              'bg-rose-100 text-rose-700 border-rose-200'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="partial">Partial</option>
                            <option value="paid">Paid</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="icon" onClick={() => deleteEntry(entry.id)} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                            <Trash2 className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Entry Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Add {formData.type === 'receivable' ? 'Lena Hai' : 'Dena Hai'} Entry
                </h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="size-5" />
                </button>
              </div>
              <form onSubmit={handleAddEntry} className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Type</label>
                  <select 
                    value={formData.type} 
                    onChange={(e: any) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="receivable">Lena Hai (Receivable)</option>
                    <option value="payable">Dena Hai (Payable)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Customer / Party Name *</label>
                  <input required value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} placeholder="Enter name" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Phone Number (Optional)</label>
                  <input value={formData.customer_phone} onChange={e => setFormData({...formData, customer_phone: e.target.value})} placeholder="10-digit number" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Amount (₹) *</label>
                  <input required type="number" min="1" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0.00" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Date *</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Description (Optional)</label>
                  <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="What is this for?" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                
                <div className="pt-4 flex items-center justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Entry"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
