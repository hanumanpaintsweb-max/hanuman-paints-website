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

  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("products")
      .select("id, name, category, unit, size, current_stock, base_mrp")
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

  const adjustStock = async (id: string, currentVal: number, adjustment: number) => {
    // If the adjust_stock RPC exists (from setup_inventory_schema.sql), we can try to use it.
    // For robustness, we'll directly update the current_stock value.
    const newStock = Math.max(0, (currentVal || 0) + adjustment)
    
    // Optimistic UI update
    setProducts(products.map(p => p.id === id ? { ...p, current_stock: newStock } : p))
    
    const { error } = await supabase
      .from('products')
      .update({ current_stock: newStock })
      .eq('id', id)

    if (error) {
      toast.error(`Failed to update stock: ${error.message}`)
      // Revert on failure
      setProducts(products.map(p => p.id === id ? { ...p, current_stock: currentVal } : p))
    }
  }

  const setExactStock = async (id: string, currentVal: number, exactValStr: string) => {
    const newStock = parseInt(exactValStr)
    if (isNaN(newStock) || newStock < 0) return

    setProducts(products.map(p => p.id === id ? { ...p, current_stock: newStock } : p))
    
    const { error } = await supabase
      .from('products')
      .update({ current_stock: newStock })
      .eq('id', id)

    if (error) {
      toast.error(`Failed to update stock: ${error.message}`)
      setProducts(products.map(p => p.id === id ? { ...p, current_stock: currentVal } : p))
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
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

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-border/60 rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
        />
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
                  const stock = product.current_stock || 0;
                  const isOutOfStock = stock <= 0;
                  const isLowStock = stock > 0 && stock <= 5;
                  
                  return (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {product.name}
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
                          {stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg shrink-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                            onClick={() => adjustStock(product.id, stock, -1)}
                            disabled={stock <= 0}
                          >
                            <Minus className="size-4" />
                          </Button>
                          
                          <input 
                            type="number" 
                            min="0"
                            value={stock}
                            onChange={(e) => setExactStock(product.id, stock, e.target.value)}
                            className="w-16 h-8 text-center border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                          />

                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg shrink-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                            onClick={() => adjustStock(product.id, stock, 1)}
                          >
                            <Plus className="size-4" />
                          </Button>
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
