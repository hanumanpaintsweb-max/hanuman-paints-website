"use client"

import { useEffect, useState } from "react"
import { Loader2, Package, Trash2, Plus, Edit } from "lucide-react"
import { supabase } from "@/services/supabase"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Array<{
    id: string;
    name: string;
    category: string;
    size: string;
    price: number;
    mrp: number;
    image_url?: string;
  }>>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("All")
  
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
                  <Button variant="outline" size="sm" className="rounded-lg gap-2 h-9">
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
    </div>
  )
}
