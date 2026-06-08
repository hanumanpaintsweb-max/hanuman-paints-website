"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Menu, ShoppingCart, User, X, LogOut, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"
import { getSession, logoutUser } from "@/app/actions/auth"

const links = [
  { label: "Products", href: "/products" },
  { label: "Colours", href: "/colours" },
  { label: "Offers", href: "/offers" },
  { label: "My Orders", href: "/my-orders" },
]

export function SiteNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [session, setSession] = useState<any | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { itemCount: cartCount } = useCart()
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => { setTimeout(() => setOpen(false), 0) }, [pathname])

  useEffect(() => {
    async function fetchSession() {
      const s = await getSession()
      setSession(s)
    }
    fetchSession()
  }, [pathname])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logoutUser()
    setSession(null)
    setProfileOpen(false)
    router.push("/")
    router.refresh()
  }

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
          <Image src="/logo-icon.svg" alt="Hanuman Paints Icon" width={40} height={40} className="size-10" />
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
          <div className="relative hidden sm:block" ref={profileRef}>
            {session ? (
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex size-9 items-center justify-center rounded-lg text-primary bg-primary/10 transition-colors hover:bg-primary/20"
                aria-label="Profile"
              >
                <User className="size-5" />
              </button>
            ) : (
              <Link
                href="/login"
                className="flex size-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
                aria-label="Login"
              >
                <User className="size-5" />
              </Link>
            )}

            <AnimatePresence>
              {profileOpen && session && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-xl"
                >
                  <div className="px-3 py-2 text-sm">
                    <p className="font-bold text-foreground">{session.name}</p>
                    <p className="text-xs text-muted-foreground">+91 {session.phone}</p>
                  </div>
                  <div className="my-1 h-px bg-border" />
                  <Link
                    href="/my-orders"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <Package className="size-4" /> My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    <LogOut className="size-4" /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
            {session ? (
              <div className="px-4 py-3">
                <p className="font-bold text-foreground">{session.name}</p>
                <p className="text-sm text-muted-foreground">+91 {session.phone}</p>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-muted"
              >
                <User className="size-4" /> Login / Signup
              </Link>
            )}
            <div className="my-1 h-px bg-border lg:hidden" />
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}
            {session && (
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
              >
                <LogOut className="size-4" /> Logout
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

