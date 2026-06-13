"use client"

import { useEffect, useState } from "react"
import { Loader2, Package, Trash2, Plus, Edit, X, Save } from "lucide-react"
import { supabase } from "@/services/supabase"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "motion/react"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("All")
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form state
  const [form, setForm] = useState({
    name: "",
    category: "General",
    base_mrp: 0,
    unit: "L",
    price: 0, // Fallback for backward compatibility
    mrp: 0 // Fallback for backward compatibility
  })

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
  }, [])

  const removeProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to completely remove ${name}?`)) return
    
    const pass = window.prompt("Enter admin password to delete this product:")
    if (pass !== "1234") {
      toast.error("Incorrect password")
      return
    }
    
    const { error } = await supabase.from("products").delete().eq("id", id)
    if (error) {
      toast.error("Failed to remove product")
    } else {
      setProducts(prev => prev.filter(p => p.id !== id))
      toast.success(`${name} removed successfully`)
    }
  }

  const openAddModal = () => {
    setEditingId(null)
    setForm({ name: "", category: "General", base_mrp: 0, unit: "L", price: 0, mrp: 0 })
    setIsModalOpen(true)
  }

  const openEditModal = (product: any) => {
    setEditingId(product.id)
    setForm({
      name: product.name || "",
      category: product.category || "General",
      base_mrp: product.base_mrp || product.mrp || 0,
      unit: product.unit || product.size || "L",
      price: product.price || 0,
      mrp: product.mrp || 0
    })
    setIsModalOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.name) {
      toast.error("Product name is required")
      return
    }

    const payload = {
      name: form.name,
      category: form.category,
      base_mrp: form.base_mrp,
      mrp: form.base_mrp, // Sync with old column just in case
      unit: form.unit,
      size: form.unit, // Sync with old column just in case
      price: form.base_mrp // Sync price to mrp default
    }

    if (editingId) {
      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingId)
        .select()
        
      if (error) {
        toast.error(`Failed to update product: ${error.message}`)
      } else if (data) {
        setProducts(products.map(p => p.id === editingId ? data[0] : p))
        toast.success("Product updated successfully")
        setIsModalOpen(false)
      }
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert([{ ...payload, current_stock: 0 }]) // Ensure new products start at 0 stock
        .select()
        
      if (error) {
        toast.error(`Failed to add product: ${error.message}`)
      } else if (data) {
        setProducts([...products, data[0]].sort((a, b) => a.name.localeCompare(b.name)))
        toast.success("Product added successfully")
        setIsModalOpen(false)
      }
    }
  }

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))]
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
          <p className="text-sm text-muted-foreground mt-1">Full CRUD Management for Product Catalog</p>
        </div>
        <Button onClick={openAddModal} className="rounded-xl gap-2 h-10">
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
            No products found. Click "Add Product" to create one.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredProducts.map(product => (
              <div key={product.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-lg border border-border/60 bg-muted flex-shrink-0 flex items-center justify-center text-primary/50">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="size-full object-cover rounded-lg" />
                    ) : (
                      <Package className="size-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{product.name}</h3>
                    <div className="text-sm text-muted-foreground mt-0.5 flex gap-2 items-center">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">{product.category}</span>
                      <span>MRP: ₹{product.base_mrp || product.mrp || 0}</span>
                      <span>Unit: {product.unit || product.size || "L"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto">
                  <Button variant="outline" size="sm" className="rounded-lg gap-2 h-9" onClick={() => openEditModal(product)}>
                    <Edit className="size-4" /> Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => removeProduct(product.id, product.name)}
                    className="rounded-lg gap-2 h-9"
                  >
                    <Trash2 className="size-4" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-border"
            >
              <div className="p-4 border-b border-border/60 flex justify-between items-center bg-muted/30">
                <h3 className="font-bold text-lg">{editingId ? "Edit Product" : "Create New Product"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-muted rounded-md"><X className="size-5"/></button>
              </div>
              <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1.5 block">Product Name *</label>
                  <input 
                    type="text" 
                    required
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none bg-background" 
                    placeholder="e.g. Dulux Velvet Touch"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground mb-1.5 block">Category</label>
                    <input 
                      type="text" 
                      value={form.category} 
                      onChange={e => setForm({...form, category: e.target.value})}
                      className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none bg-background" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground mb-1.5 block">Unit (L/ML/Kg)</label>
                    <input 
                      type="text" 
                      value={form.unit} 
                      onChange={e => setForm({...form, unit: e.target.value})}
                      className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none bg-background" 
                      placeholder="e.g. L"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1.5 block">Base MRP (₹)</label>
                  <input 
                    type="number" min="0" step="0.01"
                    value={form.base_mrp} 
                    onChange={e => setForm({...form, base_mrp: parseFloat(e.target.value) || 0})}
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none bg-background" 
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1 rounded-xl gap-2"><Save className="size-4"/> {editingId ? "Update" : "Save"} Product</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
