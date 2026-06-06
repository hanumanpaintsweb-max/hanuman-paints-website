"use client"
import { Product } from "@/types";
import { useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { BadgeCheck, Check, ChevronRight, Minus, Plus, ShoppingCart, Truck } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/site/product-card"
import { inr } from "@/lib/format"
import { useCart } from "@/context/CartContext"
import { PRODUCTS } from "@/data/products"

export function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [size, setSize] = useState(product.sizes?.[0]?.size || "1 Ltr")
  const [qty, setQty] = useState(1)
  const [burst, setBurst] = useState(false)
  const [pan, setPan] = useState({ x: 50, y: 50 })

  const selectedSizeObj = product.sizes?.find((s: { size: string }) => s.size === size) || product.sizes?.[0]
  const price = selectedSizeObj?.discounted || product.price || 0
  const mrp = selectedSizeObj?.mrp || product.mrp || 0
  const off = mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0
  const related = PRODUCTS.filter((p: { categoryId: string; id: string }) => p.categoryId === product.categoryId && p.id !== product.id)
  const relatedList = related.length ? related : PRODUCTS.filter((p: { id: string }) => p.id !== product.id)

  const handleAdd = () => {
    addItem({ ...product, selectedSize: selectedSizeObj?.size || size, mrp: mrp, quantity: qty, id: product.id.toString() })
    setBurst(true)
    setTimeout(() => setBurst(false), 1200)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="size-3" />
        <Link href="/products" className="hover:text-foreground">Products</Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* image with zoom/pan */}
        <div
          className="group relative aspect-square overflow-hidden rounded-3xl border border-border/60 bg-muted"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            setPan({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
          }}
        >
          <Image
            src={(product.image as string) || "/placeholder.svg"}
            alt={(product.name as string) || "Product Image"}
            width={800}
            height={800}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-150"
            style={{ transformOrigin: `${pan.x}% ${pan.y}%` }}
          />
          {product.popular && (
            <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              Popular
            </span>
          )}
        </div>

        {/* info */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Dulux</p>
          <h1 className="mt-1 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{product.subcategory || product.category}</span>
          </div>

          <div className="mt-5 flex items-end gap-3">
            {price === 0 ? (
              <span className="text-2xl font-bold text-orange-500">Price on Request</span>
            ) : (
              <>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={price}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="text-3xl font-bold text-foreground"
                  >
                    {inr(price)}
                  </motion.span>
                </AnimatePresence>
                <span className="mb-1 text-base text-muted-foreground line-through">{inr(mrp)}</span>
                <span className="mb-1 text-sm font-semibold text-primary">
                  {off}% off
                </span>
              </>
            )}
          </div>

          <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          
          {product.features && product.features.length > 0 && (
            <ul className="mt-4 list-disc pl-5 text-sm text-muted-foreground">
              {product.features.map((f: string, i: number) => <li key={i}>{f}</li>)}
            </ul>
          )}

          {product.coverage && (
            <div className="mt-4 text-sm text-muted-foreground flex gap-2 items-center">
              <span className="font-semibold text-foreground">Coverage:</span> {product.coverage}
            </div>
          )}

          {/* size */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold text-foreground">Pack size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s: { size: string }) => (
                  <button
                    key={s.size}
                    onClick={() => setSize(s.size)}
                    className={`relative rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                      size === s.size
                        ? "border-primary text-primary"
                        : "border-border text-foreground hover:border-primary/50"
                    }`}
                  >
                    {size === s.size && (
                      <motion.span
                        layoutId="active-size"
                        className="absolute inset-0 -z-10 rounded-xl bg-primary/10"
                      />
                    )}
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* qty + add */}
          <div className="mt-8 flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-xl border border-border p-1">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex size-9 items-center justify-center rounded-lg text-foreground hover:bg-muted"
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center text-sm font-semibold text-foreground">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="flex size-9 items-center justify-center rounded-lg text-foreground hover:bg-muted"
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <div className="relative flex-1">
              <Button onClick={handleAdd} size="lg" className="w-full gap-2 rounded-xl" disabled={price === 0}>
                <ShoppingCart className="size-4" />
                Add to cart
              </Button>
              <AnimatePresence>
                {burst && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.6, y: 0 }}
                    animate={{ opacity: 1, scale: 1, y: -44 }}
                    exit={{ opacity: 0 }}
                    className="absolute left-1/2 top-0 flex -translate-x-1/2 items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground shadow-lg"
                  >
                    <Check className="size-3.5 text-primary" /> Added!
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card p-3 text-foreground">
              <BadgeCheck className="size-5 text-primary" /> 100% genuine Dulux
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card p-3 text-foreground">
              <Truck className="size-5 text-primary" /> Same-day delivery
            </div>
          </div>
        </div>
      </div>

      {/* related horizontal scroll */}
      <div className="mt-16">
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">You might also like</h2>
        <div className="-mx-4 flex gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
          {relatedList.slice(0, 6).map((p: Product, i: number) => (
            <div key={p.id} className="w-64 shrink-0">
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
