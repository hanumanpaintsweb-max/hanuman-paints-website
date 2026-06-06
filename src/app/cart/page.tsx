"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { Minus, Plus, ShoppingBasket, Trash2, ArrowRight } from "lucide-react"
import Image from "next/image"
import { useCart, type CartItem } from "@/context/CartContext"
import { inr } from "@/lib/format"
import { SiteShell } from "@/components/site/site-shell"
import { Button } from "@/components/ui/button"

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, discountAmount, total, DISCOUNT_PERCENT } = useCart()

  if (items.length === 0) {
    return (
      <SiteShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <div className="mb-6 rounded-full bg-muted p-6">
            <ShoppingBasket className="size-16 text-muted-foreground/50" />
          </div>
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">Your cart is empty</h2>
          <p className="mb-8 max-w-[300px] text-muted-foreground text-balance">
            Looks like you haven&apos;t added any premium paints yet.
          </p>
          <Button asChild size="lg" className="rounded-xl px-8">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </SiteShell>
    )
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 pt-28 pb-32 sm:px-6 sm:pt-32">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Shopping Cart
        </h1>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
          {/* Items */}
          <div className="flex-1 space-y-6">
            <AnimatePresence mode="popLayout">
              {items.map((item: CartItem) => (
                <motion.div
                  key={`${item.id}-${item.selectedSize}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
                >
                  <div className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-muted p-2 sm:size-32">
                    <Image
                      src={(item.image as string) || "/placeholder.svg"}
                      alt={item.name}
                      width={128}
                      height={128}
                      className="size-full object-contain mix-blend-multiply"
                    />
                  </div>
                  
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold leading-tight text-foreground sm:text-lg">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                          {item.category} <span className="mx-1.5 hidden sm:inline">·</span> {item.selectedSize}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Remove item"
                      >
                        <Trash2 className="size-5" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex size-8 items-center justify-center rounded-lg text-foreground hover:bg-muted"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex size-8 items-center justify-center rounded-lg text-foreground hover:bg-muted"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <span className="text-base font-bold text-foreground sm:text-lg">
                        {inr(item.mrp * item.quantity)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="sticky top-28 w-full shrink-0 rounded-3xl border border-border/60 bg-card p-6 shadow-sm lg:w-[380px]">
            <h2 className="mb-6 text-lg font-semibold text-foreground">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-foreground">
                <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                <span className="font-medium">{inr(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-600 dark:text-emerald-500">Website Discount ({DISCOUNT_PERCENT}%)</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-500">-{inr(discountAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-foreground">
                <span className="text-muted-foreground">Estimated Shipping</span>
                <span className="text-xs">Calculated at checkout</span>
              </div>
              
              <div className="my-6 h-px w-full bg-border" />
              
              <div className="flex items-end justify-between">
                <span className="text-base font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold tracking-tight text-foreground">{inr(total)}</span>
              </div>
            </div>

            <Button asChild size="lg" className="mt-8 w-full gap-2 rounded-xl text-base shadow-lg shadow-primary/25">
              <Link href="/checkout">
                Proceed to Checkout <ArrowRight className="size-4" />
              </Link>
            </Button>
            
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Taxes and shipping calculated at checkout.
            </p>
            
            <div className="mt-6 rounded-xl border border-dashed border-emerald-500/50 bg-emerald-500/10 p-3 text-center text-xs font-medium text-emerald-700 dark:text-emerald-400">
              🎉 Use coupon code <strong>SUNDAY10</strong> at checkout for extra savings!
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  )
}
