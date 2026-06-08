"use client"

import { useEffect, useState } from "react"
import { Loader2, Package, Trash2, Plus, Edit } from "lucide-react"
import { supabase } from "@/services/supabase"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "motion/react"
import { X, Save } from "lucide-react"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Array<{
    id: string;
    name: string;
    category: string;
    size: string;
    price: number;
    mrp: number;
    image_url?: string;
    wholesale_discount: number;
    min_wholesale_qty: number;
  }>>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("All")
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [editForm, setEditForm] = useState({ wholesale_discount: 10, min_wholesale_qty: 10 })
  
  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name", { ascending: true })
      
    if (error) {
      toast.error("Failed to load products")
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const removeProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return
    
    // Hard delete or soft delete depending on requirement. Let's do a hard delete as it's cleaner for 'Remove'.
    const { error } = await supabase.from("products").delete().eq("id", id)
    if (error) {
      toast.error("Failed to remove product")
    } else {
      setProducts(prev => prev.filter(p => p.id !== id))
      toast.success(`${name} removed successfully`)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return
    const { error } = await supabase
      .from('products')
      .update({
        wholesale_discount: editForm.wholesale_discount,
        min_wholesale_qty: editForm.min_wholesale_qty
      })
      .eq('id', editingProduct.id)
      
    if (error) {
      toast.error("Failed to update product")
    } else {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...editForm } : p))
      setEditingProduct(null)
      toast.success("Product updated successfully")
    }
  }

  const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))]
  
  const filteredProducts = products.filter(p => filter === "All" || p.category === filter)

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
            <Package className="size-6 text-primary" /> Manage Products
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Add, edit or remove products from the catalog</p>
        </div>
        <Button className="rounded-xl gap-2 h-10">
          <Plus className="size-4" /> Add Product
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(c => (
          <button
            key={c as string}
            onClick={() => setFilter(c as string)}
            className={`relative rounded-xl px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filter === c ? "text-primary" : "bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            {filter === c && (
              <motion.span
                layoutId="active-product-filter"
                className="absolute inset-0 -z-10 rounded-xl bg-primary/10 border border-primary/20"
              />
            )}
            {c as string}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No products found. Add products to get started.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredProducts.map(product => (
              <div key={product.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-lg border border-border/60 bg-muted flex-shrink-0 overflow-hidden">
                    {product.image_url && <img src={product.image_url} alt={product.name} className="size-full object-cover" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{product.name}</h3>
                    <div className="text-sm text-muted-foreground mt-0.5">{product.category}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto">
                  <div className="text-xs text-right mr-4 text-muted-foreground hidden sm:block">
                    Wholesale: {product.wholesale_discount || 0}% off <br/> (Min {product.min_wholesale_qty || 10} qty)
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg gap-2 h-9" onClick={() => {
                    setEditingProduct(product);
                    setEditForm({ wholesale_discount: product.wholesale_discount || 10, min_wholesale_qty: product.min_wholesale_qty || 10 })
                  }}>
                    <Edit className="size-4" /> Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => removeProduct(product.id, product.name)}
                    className="rounded-lg gap-2 h-9"
                  >
                    <Trash2 className="size-4" /> Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-border"
            >
              <div className="p-4 border-b border-border/60 flex justify-between items-center bg-muted/30">
                <h3 className="font-bold text-lg">Edit {editingProduct.name}</h3>
                <button onClick={() => setEditingProduct(null)} className="p-1 hover:bg-muted rounded-md"><X className="size-5"/></button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1.5 block">Wholesale Discount (%)</label>
                  <input 
                    type="number" min="0" max="100" 
                    value={editForm.wholesale_discount} 
                    onChange={e => setEditForm({...editForm, wholesale_discount: parseFloat(e.target.value) || 0})}
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none bg-background" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">Extra discount applied on top of MRP for wholesale orders.</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1.5 block">Minimum Wholesale Qty</label>
                  <input 
                    type="number" min="1" 
                    value={editForm.min_wholesale_qty} 
                    onChange={e => setEditForm({...editForm, min_wholesale_qty: parseInt(e.target.value) || 1})}
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none bg-background" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">Minimum quantity required to automatically trigger wholesale pricing.</p>
                </div>
                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setEditingProduct(null)}>Cancel</Button>
                  <Button type="submit" className="flex-1 rounded-xl gap-2"><Save className="size-4"/> Save Changes</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

