"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Calculator, Heart, Menu, Phone, ShoppingCart, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { useCart } from "@/context/CartContext"

const links = [
  { label: "Products", href: "/products" },
  { label: "Colours", href: "/colours" },
  { label: "Calculator", href: "/calculator" },
  { label: "My Orders", href: "/account/orders" },
  { label: "Track Order", href: "/track" },
]

export function SiteNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { wishlistCount } = useStore()
  const { itemCount: cartCount } = useCart()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6"
    >
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-300 sm:px-6 ${
          scrolled
            ? "border-border/60 bg-background/70 shadow-lg shadow-black/5 backdrop-blur-xl"
            : "border-transparent bg-background/40 backdrop-blur-sm"
        }`}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary font-mono text-lg font-bold text-primary-foreground">
            H
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight text-foreground">Hanuman Paints</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-primary">
              Authorized Dulux Dealer
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => {
            const active = pathname === l.href
            return (
              <Link
                key={l.label}
                href={l.href}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary"
                  />
                )}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href="/wishlist"
            className="relative hidden size-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted sm:flex"
            aria-label="Wishlist"
          >
            <Heart className="size-5" />
            {wishlistCount > 0 && <Badge>{wishlistCount}</Badge>}
          </Link>
          <Link
            href="/calculator"
            className="hidden size-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted sm:flex lg:hidden"
            aria-label="Paint calculator"
          >
            <Calculator className="size-5" />
          </Link>
          <Link
            href="/login"
            className="hidden size-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted sm:flex"
            aria-label="Account"
          >
            <User className="size-5" />
          </Link>
          <Button asChild size="sm" className="relative gap-2 rounded-lg">
            <Link href="/cart">
              <ShoppingCart className="size-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="ml-0.5 rounded-full bg-primary-foreground px-1.5 text-xs font-bold text-primary">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex size-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto mt-2 max-w-7xl rounded-2xl border border-border/60 bg-background/90 p-2 shadow-lg backdrop-blur-xl lg:hidden"
          >
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}
            <a
              href="tel:+910000000000"
              className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-primary"
            >
              <Phone className="size-4" /> Call to order
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
      {children}
    </span>
  )
}
