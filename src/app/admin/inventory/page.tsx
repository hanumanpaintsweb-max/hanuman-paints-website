"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { supabase } from "@/services/supabase"
import { PRODUCTS } from "@/data/products"
import { 
  Package, Search, AlertTriangle, AlertCircle, History, Filter, Save, Loader2, ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function InventoryPage() {
  const [stockItems, setStockItems] = useState<any[]>([])
  const [stockHistory, setStockHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [activeTab, setActiveTab] = useState("Inventory") // "Inventory" | "History"

  // Inline Editing State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>("")
  const [saving, setSaving] = useState<string | null>(null) // ID of saving item

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    setLoading(true)
    const { data: stockData, error: stockError } = await supabase.from('stock').select('*')
    const { data: historyData } = await supabase.from('stock_history').select('*').order('created_at', { ascending: false }).limit(100)

    if (stockData) {
      // Merge with PRODUCTS to ensure all products are represented
      const merged = PRODUCTS.map(p => {
        const existing = stockData.find(s => s.product_id === p.id.toString() || s.product_name === p.name)
        return {
          id: existing?.id || `new-${p.id}`,
          product_id: p.id.toString(),
          product_name: p.name,
          category: p.category,
          current_stock: existing?.current_stock || 0,
          unit: existing?.unit || "units",
          updated_at: existing?.updated_at || new Date().toISOString(),
          isNew: !existing
        }
      })
      setStockItems(merged)
    }
    
    if (historyData) {
      setStockHistory(historyData)
    }
    setLoading(false)
  }

  const handleSaveStock = async (item: any, newStockRaw: string) => {
    const newStock = parseInt(newStockRaw)
    if (isNaN(newStock) || newStock === item.current_stock) {
      setEditingId(null)
      return
    }

    setSaving(item.id)
    try {
      if (item.isNew) {
        // Create new stock entry
        const { data, error } = await supabase.from('stock').insert([{
          product_id: item.product_id,
          product_name: item.product_name,
          current_stock: newStock,
          unit: item.unit
        }]).select()
        
        if (error) throw error
        if (data) {
          setStockItems(prev => prev.map(s => s.id === item.id ? { ...data[0], category: item.category, isNew: false } : s))
        }
      } else {
        // Update existing
        const { error } = await supabase.from('stock').update({
          current_stock: newStock,
          updated_at: new Date().toISOString()
        }).eq('id', item.id)
        if (error) throw error
        
        setStockItems(prev => prev.map(s => s.id === item.id ? { ...s, current_stock: newStock, updated_at: new Date().toISOString() } : s))
      }

      // Record History
      await supabase.from('stock_history').insert([{
        product_id: item.product_id,
        product_name: item.product_name,
        old_stock: item.current_stock,
        new_stock: newStock,
        changed_by: 'Admin'
      }])

      // Refetch history silently
      const { data: hData } = await supabase.from('stock_history').select('*').order('created_at', { ascending: false }).limit(50)
      if (hData) setStockHistory(hData)

      toast.success(`${item.product_name} stock updated!`)
    } catch (err: any) {
      toast.error(err.message || "Failed to update stock")
    } finally {
      setSaving(null)
      setEditingId(null)
    }
  }

  const categories = useMemo(() => ["All", ...Array.from(new Set(PRODUCTS.map(p => p.category)))], [])

  const filteredStock = useMemo(() => {
    return stockItems.filter(s => {
      if (categoryFilter !== "All" && s.category !== categoryFilter) return false
      if (lowStockOnly && s.current_stock >= 10) return false
      if (search && !s.product_name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    }).sort((a, b) => a.product_name.localeCompare(b.product_name))
  }, [stockItems, categoryFilter, lowStockOnly, search])

  const lowStockCount = stockItems.filter(s => s.current_stock > 0 && s.current_stock < 10).length
  const outOfStockCount = stockItems.filter(s => s.current_stock === 0).length

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center flex-col gap-4">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-semibold animate-pulse">Loading Inventory...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Package className="size-8 text-primary" /> Inventory Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage your warehouse stock levels</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm">
          <div className="text-sm font-semibold text-muted-foreground">Total Products</div>
          <div className="text-2xl font-black mt-1">{stockItems.length}</div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl shadow-sm">
          <div className="text-sm font-semibold text-emerald-700">Total Units in Stock</div>
          <div className="text-2xl font-black mt-1 text-emerald-800">{stockItems.reduce((a, b) => a + b.current_stock, 0)}</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl shadow-sm">
          <div className="text-sm font-semibold text-orange-700 flex items-center gap-1"><AlertTriangle className="size-4"/> Low Stock</div>
          <div className="text-2xl font-black mt-1 text-orange-800">{lowStockCount} items</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl shadow-sm">
          <div className="text-sm font-semibold text-red-700 flex items-center gap-1"><AlertCircle className="size-4"/> Out of Stock</div>
          <div className="text-2xl font-black mt-1 text-red-800">{outOfStockCount} items</div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border/60 pb-px overflow-x-auto no-scrollbar">
        {["Inventory", "History"].map(t => (
          <button 
            key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t === "History" ? <History className="size-4" /> : <Package className="size-4" />}
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        
        {/* TAB 1: INVENTORY TABLE */}
        {activeTab === "Inventory" && (
          <motion.div key="inventory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            
            {/* Filters */}
            <div className="bg-card border border-border/60 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input 
                  type="text" placeholder="Search products..." 
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary" 
                />
              </div>
              <div className="flex gap-3">
                <select 
                  value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                  className="bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button 
                  onClick={() => setLowStockOnly(!lowStockOnly)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors flex items-center gap-2 ${lowStockOnly ? 'bg-orange-100 border-orange-200 text-orange-700' : 'bg-background border-border text-muted-foreground hover:bg-muted'}`}
                >
                  <Filter className="size-4" /> Low Stock
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-bold">
                  <tr>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Current Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredStock.map(s => {
                    const isEditing = editingId === s.id
                    const isSaving = saving === s.id
                    return (
                      <tr key={s.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-6 py-4 font-semibold text-foreground">{s.product_name}</td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">{s.category}</td>
                        <td className="px-6 py-4">
                          {s.current_stock === 0 ? (
                            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">OUT OF STOCK</span>
                          ) : s.current_stock < 10 ? (
                            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded">LOW STOCK</span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">IN STOCK</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isSaving ? (
                            <div className="flex justify-end"><Loader2 className="size-5 animate-spin text-primary" /></div>
                          ) : isEditing ? (
                            <div className="flex justify-end items-center gap-2">
                              <input 
                                type="number" 
                                autoFocus
                                value={editValue} 
                                onChange={e => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveStock(s, editValue)
                                  if (e.key === 'Escape') setEditingId(null)
                                }}
                                className="w-20 rounded-md border border-primary bg-background px-2 py-1 text-sm outline-none ring-primary focus:ring-2 text-right"
                              />
                              <Button size="icon" className="size-7 rounded" onClick={() => handleSaveStock(s, editValue)}><Save className="size-3"/></Button>
                            </div>
                          ) : (
                            <div 
                              onClick={() => { setEditingId(s.id); setEditValue(s.current_stock.toString()) }}
                              className="inline-flex justify-end items-center gap-2 cursor-pointer hover:bg-muted px-3 py-1 rounded-lg border border-transparent hover:border-border transition-colors"
                              title="Click to edit"
                            >
                              <span className="font-black text-lg">{s.current_stock}</span>
                              <span className="text-xs text-muted-foreground">{s.unit}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {filteredStock.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No products found matching filters</td></tr>}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 2: HISTORY */}
        {activeTab === "History" && (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border/60 flex justify-between items-center bg-muted/20">
              <h2 className="text-lg font-bold">Recent Stock Updates</h2>
              <p className="text-xs text-muted-foreground">Last 100 changes</p>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Change</th>
                  <th className="px-6 py-4">Updated By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {stockHistory.map(h => (
                  <tr key={h.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 text-muted-foreground">{new Date(h.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold">{h.product_name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-mono font-bold text-xs">
                        <span className="text-muted-foreground">{h.old_stock}</span>
                        <ArrowRight className="size-3 text-muted-foreground" />
                        <span className={h.new_stock > h.old_stock ? 'text-emerald-600' : h.new_stock < h.old_stock ? 'text-orange-600' : 'text-foreground'}>
                          {h.new_stock}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="bg-muted px-2 py-1 rounded text-xs font-semibold">{h.changed_by}</span></td>
                  </tr>
                ))}
                {stockHistory.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No stock history recorded yet</td></tr>}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
