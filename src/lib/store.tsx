"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { products, type Product } from "@/lib/data"

export type CartItem = {
  id: string
  size: string
  qty: number
}

type StoreContext = {
  cart: CartItem[]
  wishlist: string[]
  addToCart: (id: string, size: string, qty?: number) => void
  removeFromCart: (id: string, size: string) => void
  setQty: (id: string, size: string, qty: number) => void
  clearCart: () => void
  toggleWishlist: (id: string) => void
  cartCount: number
  wishlistCount: number
  subtotal: number
}

const Ctx = createContext<StoreContext | null>(null)

function priceFor(product: Product, size: string) {
  return product.sizes.find((s) => s.label === size)?.price ?? product.price
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const c = localStorage.getItem("hp-cart")
      const w = localStorage.getItem("hp-wishlist")
      if (c) setCart(JSON.parse(c))
      if (w) setWishlist(JSON.parse(w))
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem("hp-cart", JSON.stringify(cart))
  }, [cart, hydrated])

  useEffect(() => {
    if (hydrated) localStorage.setItem("hp-wishlist", JSON.stringify(wishlist))
  }, [wishlist, hydrated])

  const value = useMemo<StoreContext>(() => {
    const addToCart = (id: string, size: string, qty = 1) =>
      setCart((prev) => {
        const found = prev.find((i) => i.id === id && i.size === size)
        if (found) return prev.map((i) => (i === found ? { ...i, qty: i.qty + qty } : i))
        return [...prev, { id, size, qty }]
      })

    const removeFromCart = (id: string, size: string) =>
      setCart((prev) => prev.filter((i) => !(i.id === id && i.size === size)))

    const setQty = (id: string, size: string, qty: number) =>
      setCart((prev) =>
        prev
          .map((i) => (i.id === id && i.size === size ? { ...i, qty: Math.max(0, qty) } : i))
          .filter((i) => i.qty > 0),
      )

    const clearCart = () => setCart([])

    const toggleWishlist = (id: string) =>
      setWishlist((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]))

    const subtotal = cart.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.id)
      if (!product) return sum
      return sum + priceFor(product, item.size) * item.qty
    }, 0)

    return {
      cart,
      wishlist,
      addToCart,
      removeFromCart,
      setQty,
      clearCart,
      toggleWishlist,
      cartCount: cart.reduce((n, i) => n + i.qty, 0),
      wishlistCount: wishlist.length,
      subtotal,
    }
  }, [cart, wishlist])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}

export { priceFor }
