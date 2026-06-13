"use client"

import { useEffect, useState } from "react"
import { Loader2, Boxes, Plus, Minus, Search } from "lucide-react"
import { supabase } from "@/services/supabase"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"

export default function AdminStockPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [editedStock, setEditedStock] = useState<Record<string, number | "">>({})
  const [isSaving, setIsSaving] = useState(false)

  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("products")
      .select("id, name, category, unit, current_stock, base_mrp")
      .order("name", { ascending: true })
      
    if (error) {
      console.error("Supabase error fetching stock:", error)
      toast.error("Failed to load inventory: " + error.message)
    } else {
      const formattedData = (data || []).map(p => ({
        ...p,
        current_stock: p.current_stock || 0,
        base_mrp: p.base_mrp || 0
      }))
      setProducts(formattedData)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleStockChange = (id: string, valStr: string) => {
    if (valStr === "") {
      setEditedStock(prev => ({ ...prev, [id]: "" }))
      return
    }
    const val = parseInt(valStr)
    if (isNaN(val) || val < 0) return
    setEditedStock(prev => ({ ...prev, [id]: val }))
  }

  const handleSaveAll = async () => {
    const updates = Object.entries(editedStock)
    if (updates.length === 0) {
      toast.info("No changes to save")
      return
    }

    setIsSaving(true)
    let hasError = false

    // We can update one by one or send a batch. Since it's quick, Promise.all is fine
    await Promise.all(
      updates.map(async ([id, newStock]) => {
        const { error } = await supabase
          .from('products')
          .update({ current_stock: newStock === "" ? 0 : newStock })
          .eq('id', id)
        
        if (error) {
          hasError = true
          console.error(`Failed to update ${id}:`, error)
        }
      })
    )

    if (hasError) {
      toast.error("Failed to save some items. Please check the logs.")
    } else {
      toast.success("Stock updated successfully!")
      setEditedStock({})
      fetchProducts()
    }
    
    setIsSaving(false)
  }

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))]

  const filteredProducts = products.filter(p => 
    (categoryFilter === "All" || p.category === categoryFilter) &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())))
  )

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
            <Boxes className="size-6 text-primary" /> Stock Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Adjust and monitor inventory levels</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border/60 rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            />
          </div>
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-border/60 rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {categories.map((cat: any) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <Button 
          onClick={handleSaveAll} 
          disabled={isSaving || Object.keys(editedStock).length === 0}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all"
        >
          {isSaving ? (
            <><Loader2 className="size-4 animate-spin mr-2" /> Saving...</>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No products match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold border-b border-border/60">
                <tr>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Unit</th>
                  <th className="px-6 py-4 text-center">Current Stock</th>
                  <th className="px-6 py-4 text-right">Quick Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredProducts.map(product => {
                  const dbStock = product.current_stock || 0;
                  const displayStock = editedStock[product.id] !== undefined ? editedStock[product.id] : dbStock;
                  const isOutOfStock = displayStock === "" || displayStock <= 0;
                  const isLowStock = displayStock !== "" && displayStock > 0 && displayStock <= 5;
                  const isEdited = editedStock[product.id] !== undefined && editedStock[product.id] !== dbStock;
                  
                  return (
                    <tr key={product.id} className={`transition-colors ${isEdited ? 'bg-amber-50/50' : 'hover:bg-muted/30'}`}>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {product.name}
                        {isEdited && <span className="ml-2 text-[10px] font-bold text-amber-600 uppercase tracking-wider">Edited</span>}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {product.category || '-'}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {product.unit || product.size || 'L'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[3rem] px-2.5 py-1 rounded-md font-bold text-sm ${
                          isOutOfStock ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                          isLowStock ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          {dbStock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <input 
                            type="number" 
                            min="0"
                            value={displayStock}
                            onChange={(e) => handleStockChange(product.id, e.target.value)}
                            className={`w-20 h-9 text-center border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                              isEdited ? 'border-amber-400 bg-amber-50 text-amber-900 font-bold' : 'border-border'
                            }`}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
