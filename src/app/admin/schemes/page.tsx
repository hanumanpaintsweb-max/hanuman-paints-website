"use client"

import { useEffect, useState } from "react"
import { Target, Plus, Edit, Trash2, Loader2, Save, X, ToggleLeft, ToggleRight } from "lucide-react"
import { supabase } from "@/services/supabase"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"

type Scheme = {
  id?: string
  name: string
  month: number
  year: number
  scheme_type: string
  target_value: number
  reward_amount: number | null
  reward_percentage: number | null
  product_id: string | null
  product_name: string | null
  notes: string | null
  is_active: boolean
}

const emptyScheme: Scheme = {
  name: "",
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  scheme_type: "Volume target",
  target_value: 0,
  reward_amount: null,
  reward_percentage: null,
  product_id: "",
  product_name: "",
  notes: "",
  is_active: true
}

export default function AdminSchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState<Scheme>(emptyScheme)

  const fetchSchemes = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('schemes').select('*').order('year', { ascending: false }).order('month', { ascending: false })
    if (error) toast.error("Failed to fetch schemes")
    else setSchemes(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchSchemes()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.id) {
      const { error } = await supabase.from('schemes').update(formData).eq('id', formData.id)
      if (error) toast.error("Update failed")
      else { toast.success("Scheme updated"); setIsFormOpen(false); fetchSchemes() }
    } else {
      const { error } = await supabase.from('schemes').insert([formData])
      if (error) toast.error("Insert failed")
      else { toast.success("Scheme created"); setIsFormOpen(false); fetchSchemes() }
    }
  }

  const toggleStatus = async (scheme: Scheme) => {
    const { error } = await supabase.from('schemes').update({ is_active: !scheme.is_active }).eq('id', scheme.id)
    if (!error) fetchSchemes()
  }

  const deleteScheme = async (id: string) => {
    if (!window.confirm("Are you sure?")) return
    const { error } = await supabase.from('schemes').delete().eq('id', id)
    if (!error) fetchSchemes()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Target className="size-8 text-primary" /> Scheme Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage monthly targets and rewards</p>
        </div>
        <Button onClick={() => { setFormData(emptyScheme); setIsFormOpen(true) }} className="rounded-xl gap-2 h-11">
          <Plus className="size-4" /> Create Scheme
        </Button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{formData.id ? "Edit Scheme" : "New Scheme"}</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsFormOpen(false)}><X className="size-5" /></Button>
              </div>

              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Scheme Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. June Volume Bonanza" className="w-full p-2.5 bg-background border border-border rounded-xl" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Month</label>
                  <select value={formData.month} onChange={e => setFormData({...formData, month: parseInt(e.target.value)})} className="w-full p-2.5 bg-background border border-border rounded-xl">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('en-US', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <input type="number" required value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} className="w-full p-2.5 bg-background border border-border rounded-xl" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Scheme Type</label>
                  <select value={formData.scheme_type} onChange={e => setFormData({...formData, scheme_type: e.target.value})} className="w-full p-2.5 bg-background border border-border rounded-xl">
                    <option value="Volume target">Volume target (pcs)</option>
                    <option value="Growth target">Growth target (%)</option>
                    <option value="Value target">Value target (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Target Value</label>
                  <input type="number" required value={formData.target_value} onChange={e => setFormData({...formData, target_value: parseFloat(e.target.value)})} className="w-full p-2.5 bg-background border border-border rounded-xl" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Reward Amount (₹) [Optional]</label>
                  <input type="number" value={formData.reward_amount || ''} onChange={e => setFormData({...formData, reward_amount: parseFloat(e.target.value) || null})} className="w-full p-2.5 bg-background border border-border rounded-xl" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Reward Percentage (%) [Optional]</label>
                  <input type="number" value={formData.reward_percentage || ''} onChange={e => setFormData({...formData, reward_percentage: parseFloat(e.target.value) || null})} className="w-full p-2.5 bg-background border border-border rounded-xl" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Linked Product ID [Optional]</label>
                  <input value={formData.product_id || ''} onChange={e => setFormData({...formData, product_id: e.target.value})} className="w-full p-2.5 bg-background border border-border rounded-xl" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Linked Product Name [Optional]</label>
                  <input value={formData.product_name || ''} onChange={e => setFormData({...formData, product_name: e.target.value})} className="w-full p-2.5 bg-background border border-border rounded-xl" />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-2.5 bg-background border border-border rounded-xl" rows={3} />
                </div>

                <div className="col-span-1 md:col-span-2 pt-4 flex gap-3">
                  <Button type="submit" className="rounded-xl flex-1 gap-2"><Save className="size-4" /> Save Scheme</Button>
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="rounded-xl flex-1">Cancel</Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schemes List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>
        ) : schemes.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">No schemes found. Create one!</div>
        ) : (
          <div className="divide-y divide-border">
            {schemes.map(scheme => (
              <div key={scheme.id} className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 ${!scheme.is_active ? 'opacity-60 bg-muted/20' : ''}`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">{scheme.name}</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded font-semibold text-muted-foreground">
                      {new Date(0, scheme.month - 1).toLocaleString('en-US', { month: 'short' })} {scheme.year}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Type: <span className="font-semibold text-foreground">{scheme.scheme_type}</span> | 
                    Target: <span className="font-semibold text-foreground">{scheme.target_value}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Reward: {scheme.reward_amount ? `₹${scheme.reward_amount}` : ''} {scheme.reward_percentage ? `${scheme.reward_percentage}%` : ''}
                    {scheme.product_name && ` | Product: ${scheme.product_name}`}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleStatus(scheme)} className="p-2 hover:bg-muted rounded-lg transition-colors text-primary">
                    {scheme.is_active ? <ToggleRight className="size-6 text-green-500" /> : <ToggleLeft className="size-6 text-muted-foreground" />}
                  </button>
                  <button onClick={() => { setFormData(scheme); setIsFormOpen(true) }} className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <Edit className="size-5" />
                  </button>
                  <button onClick={() => deleteScheme(scheme.id!)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors">
                    <Trash2 className="size-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
