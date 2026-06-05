"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { Heart, Plus, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { inr } from "@/lib/format"
import { useStore } from "@/lib/store"
import { useCart } from "@/context/CartContext"

export function ProductCard({ product, index = 0 }: { product: any; index?: number }) {
  const { toggleWishlist, wishlist } = useStore()
  const { addItem } = useCart()
  const wished = wishlist.includes(product.id.toString())
  
  const selectedSizeObj = product.sizes?.[0] || { size: '1 Ltr', mrp: 0, discounted: 0 }
  const mrp = selectedSizeObj.mrp || 0
  const price = selectedSizeObj.discounted || 0
  const off = mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      whileHover={{ y: -6 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {product.popular && (
            <span className="w-fit rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
              Popular
            </span>
          )}
          {off > 0 && (
            <span className="w-fit rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground">
              {off}% OFF
            </span>
          )}
        </div>
        <button
          onClick={() => toggleWishlist(product.id.toString())}
          aria-label="Toggle wishlist"
          className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-md transition-colors hover:bg-background"
        >
          <motion.span animate={wished ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
            <Heart className={`size-4 ${wished ? "fill-primary text-primary" : ""}`} />
          </motion.span>
        </button>
        <Link href={`/products/${product.id}`}>
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-primary text-primary" />
          <span className="font-medium text-foreground">4.8</span>
          <span>·</span>
          <span className="truncate">{product.subcategory || product.finish || product.category}</span>
        </div>
        <Link href={`/products/${product.id}`}>
          <h3 className="mt-1.5 text-pretty text-sm font-semibold leading-snug text-foreground hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-foreground">{inr(price)}</span>
            <span className="text-xs text-muted-foreground line-through">{inr(mrp)}</span>
          </div>
          <Button
            size="icon"
            className="size-9 rounded-xl"
            aria-label={`Add ${product.name} to cart`}
            onClick={() => addItem({ ...product, selectedSize: selectedSizeObj.size, mrp: mrp, id: product.id.toString() })}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
