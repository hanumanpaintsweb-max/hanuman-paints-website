"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { Home, ShoppingCart, Store, User } from "lucide-react"
import { useCart } from "@/context/CartContext"

const items = [
  { label: "Home", href: "/", icon: Home },
  { label: "Shop", href: "/products", icon: Store },
  { label: "Cart", href: "/cart", icon: ShoppingCart },
  { label: "Orders", href: "/my-orders", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()
  const { itemCount: cartCount } = useCart()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/80 backdrop-blur-xl sm:hidden">
      <ul className="mx-auto flex max-w-md items-center justify-around px-2 py-1.5">
        {items.map((it) => {
          const active = pathname === it.href
          const badge = it.href === "/cart" ? cartCount : 0
          return (
            <li key={it.label}>
              <Link
                href={it.href}
                className="relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium"
              >
                <span className="relative">
                  <it.icon
                    className={`size-5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
                  />
                  {badge > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                      {badge}
                    </span>
                  )}
                </span>
                <span className={active ? "text-foreground" : "text-muted-foreground"}>{it.label}</span>
                {active && (
                  <motion.span
                    layoutId="bottom-nav-dot"
                    className="absolute -top-0.5 size-1 rounded-full bg-primary"
                  />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
