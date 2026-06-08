"use client"
import { Product } from "@/types";

import Link from "next/link"
import { motion } from "motion/react"
import { Plus } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { inr } from "@/lib/format"
import { useCart } from "@/context/CartContext"
import { useActiveOffers } from "@/hooks/useOffers"

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem } = useCart()
  
  const selectedSizeObj = product.sizes?.[0] || { size: '1 Ltr', mrp: 0, discounted: 0 }
  const mrp = selectedSizeObj.mrp || 0
  const price = selectedSizeObj.discounted || 0
  const off = mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0

  const activeOffers = useActiveOffers()
  const applicableOffer = activeOffers.find(o => {
    if (o.applicable_on === 'all') return true
    if (o.applicable_on === 'Specific product' && o.product_id === product.id) return true
    if (o.applicable_on === 'Specific category' && product.category?.toLowerCase() === o.category_id?.toLowerCase()) return true
    return false
  })

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
          {off > 0 && !applicableOffer && (
            <span className="w-fit rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground">
              {off}% OFF
            </span>
          )}
          {applicableOffer && (
            <span 
              className="w-fit rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow-sm"
              style={{ backgroundColor: applicableOffer.badge_color || '#F97316' }}
            >
              {applicableOffer.badge_text || "HOT DEAL 🔥"}
            </span>
          )}
        </div>

        <Link href={`/products/${product.id}`}>
          <Image
            src={(product.image as string) || "/placeholder.svg"}
            alt={(product.name as string) || "Product image"}
            width={400}
            height={400}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="truncate">{product.subcategory || product.finish || product.category}</span>
        </div>
        <Link href={`/products/${product.id}`}>
          <h3 className="mt-1.5 text-pretty text-sm font-semibold leading-snug text-foreground hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex items-baseline gap-1.5">
            {price === 0 ? (
              <span className="text-sm font-bold text-orange-500">Price on Request</span>
            ) : (
              <>
                <span className="text-lg font-bold text-foreground">{inr(price)}</span>
                <span className="text-xs text-muted-foreground line-through">{inr(mrp)}</span>
              </>
            )}
          </div>
          <Button
            size="icon"
            className="size-9 rounded-xl"
            disabled={price === 0}
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
