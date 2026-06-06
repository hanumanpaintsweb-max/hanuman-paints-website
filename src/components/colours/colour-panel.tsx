"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, ShoppingCart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getProducts } from "@/services/productService"
import { inr } from "@/lib/format"
import { useCart } from "@/context/CartContext"
import { toast } from "sonner"

interface ColourPanelProps {
  isOpen: boolean
  colour: { name: string; code: string; hex: string } | null
  onClose: () => void
}

const TINTABLE_PRODUCTS = [
  "Dulux Velvet Touch Diamond Glo",
  "Dulux Promise Sheen Interior",
  "Dulux Promise Sheen Exterior",
  "Dulux Promise Interior",
  "Dulux Promise Exterior",
  "Dulux Promise SmartChoice Interior",
  "Dulux Promise SmartChoice Exterior",
  "Dulux Weathershield Powerflexx 15yr",
  "Dulux Weathershield Protect Dustproof Hi-Sheen",
  "Dulux Floor Plus"
]

interface TintableProduct {
  id: string;
  name: string;
  image: string;
  sizes?: Array<{ size: string; discounted: number }>;
  [key: string]: unknown;
}

export function ColourPanel({ isOpen, colour, onClose }: ColourPanelProps) {
  const [products, setProducts] = useState<TintableProduct[]>([])
  const [loading, setLoading] = useState(false)
  const { addToCart } = useCart()

  useEffect(() => {
    if (isOpen) {
      async function load() {
        setLoading(true)
        try {
          const data = await getProducts()
          if (data) {
            const tintable = data.filter((p: { name: string }) => TINTABLE_PRODUCTS.includes(p.name))
            setProducts(tintable)
          }
        } catch {
          setProducts([])
        } finally {
          setLoading(false)
        }
      }
      load()
    }
  }, [isOpen])

  const handleAdd = (product: TintableProduct, sizeIndex: number = 0) => {
    if (!product.sizes || product.sizes.length === 0) return
    const size = product.sizes[sizeIndex]
    addToCart({
      id: product.id,
      name: product.name,
      price: size.discounted,
      image: product.image,
      size: size.size,
      color: colour?.name, // Attach selected colour
    })
    toast.success("Added to cart", {
      description: `${product.name} in ${colour?.name}`,
    })
  }

  return (
    <AnimatePresence>
      {isOpen && colour && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border bg-card shadow-2xl sm:max-w-md"
          >
            <div className="flex items-center justify-between border-b border-border p-6">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Colour Details</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="size-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-8 overflow-hidden rounded-2xl border border-border shadow-sm">
                <div className="h-48 w-full" style={{ backgroundColor: `#${colour.hex}` }} />
                <div className="bg-card p-4">
                  <h3 className="text-2xl font-bold text-foreground">{colour.name}</h3>
                  <p className="mt-1 font-mono text-sm font-medium text-muted-foreground">
                    {colour.code} • {colour.hex}
                  </p>
                </div>
              </div>

              <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-primary">
                Products in this shade
              </h4>

              {loading ? (
                <div className="flex py-10 items-center justify-center">
                  <Loader2 className="size-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((p) => (
                    <div key={p.id} className="flex flex-col gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-muted/50">
                      <div>
                        <h5 className="font-semibold text-foreground">{p.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          From {inr(p.sizes?.[0]?.discounted || 0)}
                        </p>
                      </div>
                      <Button onClick={() => handleAdd(p)} size="sm" className="w-full gap-2 rounded-lg">
                        <ShoppingCart className="size-4" /> Add to Cart
                      </Button>
                    </div>
                  ))}
                  {products.length === 0 && !loading && (
                    <p className="text-sm text-muted-foreground">No tintable products available.</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
