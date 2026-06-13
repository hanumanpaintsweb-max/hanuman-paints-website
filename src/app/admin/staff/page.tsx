"use client"

import { useEffect, useState } from "react"
import { Loader2, Users, Trash2, Plus, Edit, X, Save } from "lucide-react"
import { supabase } from "@/services/supabase"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "motion/react"
import { inr } from "@/lib/format"

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Sales Tracking Modal states
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [staffSales, setStaffSales] = useState<any[]>([])
  const [salesLoading, setSalesLoading] = useState(false)
  
  // Form state
  const [form, setForm] = useState({
    name: "",
    phone: "",
    is_active: true
  })

  const fetchStaff = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .order("name", { ascending: true })
      
    if (error) {
      toast.error("Failed to load staff list")
    } else {
      setStaffList(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const removeStaff = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to completely remove ${name}?`)) return
    
    const pass = window.prompt("Enter admin password to delete this staff member:")
    if (pass !== "1234") {
      toast.error("Incorrect password")
      return
    }
    
    const { error } = await supabase.from("staff").delete().eq("id", id)
    if (error) {
      toast.error("Failed to remove staff")
    } else {
      setStaffList(prev => prev.filter(p => p.id !== id))
      toast.success(`${name} removed successfully`)
    }
  }

  const openAddModal = () => {
    setEditingId(null)
    setForm({ name: "", phone: "", is_active: true })
    setIsModalOpen(true)
  }

  const openEditModal = (staff: any) => {
    setEditingId(staff.id)
    setForm({
      name: staff.name || "",
      phone: staff.phone || "",
      is_active: staff.is_active !== false
    })
    setIsModalOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.name) {
      toast.error("Staff name is required")
      return
    }

    const payload = {
      name: form.name,
      phone: form.phone,
      is_active: form.is_active
    }

    if (editingId) {
      const { data, error } = await supabase
        .from('staff')
        .update(payload)
        .eq('id', editingId)
        .select()
        
      if (error) {
        toast.error(`Failed to update staff: ${error.message}`)
      } else if (data) {
        setStaffList(staffList.map(p => p.id === editingId ? data[0] : p))
        toast.success("Staff updated successfully")
        setIsModalOpen(false)
      }
    } else {
      const { data, error } = await supabase
        .from('staff')
        .insert([payload])
        .select()
        
      if (error) {
        toast.error(`Failed to add staff: ${error.message}`)
      } else if (data) {
        setStaffList([...staffList, data[0]].sort((a, b) => a.name.localeCompare(b.name)))
        toast.success("Staff added successfully")
        setIsModalOpen(false)
      }
    }
  }

  const openSalesModal = async (staff: any) => {
    setSelectedStaff(staff)
    setIsSalesModalOpen(true)
    setSalesLoading(true)
    setStaffSales([])
    
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('staff_name', staff.name)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      
    if (error) {
      toast.error("Failed to fetch staff sales")
    } else {
      setStaffSales(data || [])
    }
    setSalesLoading(false)
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="size-6 text-primary" /> Staff Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage sales representatives and staff members</p>
        </div>
        <Button onClick={openAddModal} className="w-full sm:w-auto bg-primary hover:bg-primary/90 rounded-xl flex items-center gap-2">
          <Plus className="size-4" /> Add Staff
        </Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        {staffList.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No staff members found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold border-b border-border/60">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {staffList.map(staff => (
                  <tr key={staff.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {staff.name}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {staff.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${staff.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                        {staff.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-primary hover:text-primary-focus hover:bg-primary/10 rounded-lg font-medium text-xs border border-primary/20"
                          onClick={() => openSalesModal(staff)}
                        >
                          View Sales
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                          onClick={() => openEditModal(staff)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          onClick={() => removeStaff(staff.id, staff.name)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between bg-muted/30">
                <h3 className="font-semibold text-foreground">
                  {editingId ? "Edit Staff" : "Add New Staff"}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                >
                  <X className="size-4" />
                </button>
              </div>
              
              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Staff Name *</label>
                  <input 
                    type="text" 
                    required
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-shadow"
                    placeholder="E.g. John Doe"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                  <input 
                    type="text" 
                    value={form.phone} 
                    onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-shadow"
                    placeholder="E.g. 9876543210"
                  />
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <input 
                    type="checkbox" 
                    id="is_active"
                    checked={form.is_active} 
                    onChange={e => setForm({...form, is_active: e.target.checked})}
                    className="rounded border-outline-variant text-primary focus:ring-primary"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-foreground cursor-pointer">
                    Active Staff Member
                  </label>
                </div>
                
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/60 mt-6">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl">
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-xl flex items-center gap-2 bg-primary hover:bg-primary/90">
                    <Save className="size-4" /> Save
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSalesModalOpen && selectedStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSalesModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-card rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between bg-muted/30">
                <div>
                  <h3 className="font-semibold text-foreground text-lg">
                    Sales History: {selectedStaff.name}
                  </h3>
                  {!salesLoading && (
                    <p className="text-sm font-medium text-primary mt-1">
                      Total Bills Cut: {staffSales.length}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => setIsSalesModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                >
                  <X className="size-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto bg-surface flex-1">
                {salesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-primary" />
                  </div>
                ) : staffSales.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/60">
                    No sales recorded for this staff member yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-border/60">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold border-b border-border/60">
                        <tr>
                          <th className="px-4 py-3">Bill No</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3 text-right">Total Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {staffSales.map(bill => (
                          <tr key={bill.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{bill.bill_number}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {new Date(bill.created_at).toLocaleDateString("en-IN", {
                                day: "numeric", month: "short", year: "numeric",
                                hour: "2-digit", minute: "2-digit"
                              })}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{bill.customer_name || "Cash Customer"}</td>
                            <td className="px-4 py-3 text-right font-bold text-foreground">{inr(bill.total_amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
