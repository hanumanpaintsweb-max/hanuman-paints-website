"use client"

import { ReactNode, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { 
  Package, LogOut, Ticket, LineChart, FileText, 
  Settings, ShoppingBag, Menu, X 
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"

const NAV_ITEMS = [
  { label: "Orders", href: "/admin", icon: ShoppingBag },
  { label: "Billing", href: "/admin/billing", icon: FileText },
  { label: "Dashboard", href: "/admin/dashboard", icon: LineChart },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket },
  { label: "Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin, adminLogout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAdmin && pathname !== "/admin/login") {
      router.push("/admin/login")
    }
  }, [isAdmin, mounted, router, pathname])

  if (!mounted) return null
  
  if (!isAdmin && pathname !== "/admin/login") return null

  // If we are on the login page, don't show the sidebar
  if (pathname === "/admin/login") {
    return <main>{children}</main>
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/60 bg-card transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/60 px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <Package className="size-4 text-primary" />
            </div>
            <span className="font-bold tracking-tight text-foreground">Hanuman Admin</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          <nav className="flex flex-col gap-1 px-4">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    active ? "text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="active-admin-nav"
                      className="absolute inset-0 rounded-xl bg-primary/10"
                    />
                  )}
                  <item.icon className={`size-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="border-t border-border/60 p-4">
          <button 
            onClick={() => { adminLogout(); router.push("/admin/login"); }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="size-5" /> Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center border-b border-border/60 bg-card px-6 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground hover:text-foreground">
            <Menu className="size-6" />
          </button>
          <div className="ml-4 font-bold text-foreground">Admin Dashboard</div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
