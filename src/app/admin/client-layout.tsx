"use client"

import { ReactNode, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { 
  LogOut, Menu, X, LayoutDashboard, ShoppingBag, Receipt, BarChart3, Package, Users, Settings, Bell, Gift, Target, BookOpen, BellRing, CalendarRange, ChevronDown, MapPin
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/services/supabase"
const NAV_ITEMS: { label: string; href: string; icon: any; badgeKey?: string }[] = [
  { label: "Billing", href: "/admin/billing", icon: Receipt },
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Day Book", href: "/admin/daybook", icon: CalendarRange },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Unpaid Bills", href: "/admin/ledger", icon: BookOpen },
  { label: "Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { admin, isAdmin, adminLogout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showBrandMenu, setShowBrandMenu] = useState(false)
  
  const [shopName, setShopName] = useState("Hanuman Paints")
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)
  
  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [unpaidBillsCount, setUnpaidBillsCount] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      if (!isAdmin && pathname !== "/admin/login") {
        router.push("/admin/login")
      } else if (isAdmin) {
        fetchSidebarData()
      }
    }
  }, [isAdmin, mounted, pathname, router])

  const fetchSidebarData = async () => {
    try {
      // Fetch Shop Name
      const { data: settingData } = await supabase.from('settings').select('value').eq('key', 'shop_name').single()
      if (settingData) setShopName(settingData.value)

      // Fetch Pending Orders
      const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'Pending')
      if (ordersCount) setPendingOrdersCount(ordersCount)

      // Fetch Low Stock (< 10)
      const { count: stockCount } = await supabase.from('stock').select('*', { count: 'exact', head: true }).lt('current_stock', 10)
      if (stockCount) setLowStockCount(stockCount)

      // Fetch Unpaid Bills
      const { count: billsCount } = await supabase.from('bills').select('*', { count: 'exact', head: true }).in('payment_status', ['unpaid', 'partial'])
      if (billsCount) setUnpaidBillsCount(billsCount)

    } catch {
    }
  }

  const handleLogout = async () => {
    await adminLogout()
    router.push("/admin/login")
  }

  if (!mounted) return null
  if (!isAdmin && pathname !== "/admin/login") return null
  if (pathname === "/admin/login") return <main>{children}</main>

  const totalNotifications = pendingOrdersCount + lowStockCount + unpaidBillsCount

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
            <div className="size-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">HP</div>
            <span className="font-bold tracking-tight text-foreground truncate max-w-[140px]">{shopName}</span>
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
                  className={`relative flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    active ? "text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3 z-10">
                    <item.icon className={`size-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badgeKey === "orders" && pendingOrdersCount > 0 && (
                    <span className="z-10 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                      {pendingOrdersCount}
                    </span>
                  )}
                  {active && (
                    <motion.div
                      layoutId="active-admin-nav"
                      className="absolute inset-0 rounded-xl bg-primary/10"
                    />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="border-t border-border/60 p-4 space-y-3">
          <div className="px-4 py-2">
            <p className="text-xs font-medium text-foreground truncate">{(admin as Record<string, any>)?.email}</p>
            <p className="text-[10px] text-muted-foreground">Administrator</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10"
          >
            <span className="flex items-center gap-3"><LogOut className="size-5" /> Logout</span>
          </button>
          <div className="text-center text-[10px] text-muted-foreground pt-2">v1.0.0</div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <header className="flex h-16 items-center justify-between border-b border-border/60 bg-card px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground">
              <Menu className="size-6" />
            </button>

            {/* Brand Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowBrandMenu(!showBrandMenu)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-muted transition-colors"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-primary text-white text-xs font-black">HP</div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-foreground leading-tight">{shopName}</p>
                  <p className="text-[10px] text-primary font-medium">Admin Panel</p>
                </div>
                <ChevronDown className={`size-4 text-muted-foreground transition-transform ${showBrandMenu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showBrandMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowBrandMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-4 bg-primary/5">
                        <p className="font-black text-base text-foreground">{shopName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="size-3" /> Authorized Dulux Dealer — Madhubani
                        </p>
                      </div>
                      <div className="border-t border-border/60" />
                      <div className="p-2">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="size-4" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Notification Center */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell className="size-5" />
              {totalNotifications > 0 && (
                <span className="absolute top-1 right-1 flex size-2.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-card" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden z-50"
                >
                  <div className="flex items-center justify-between p-4 border-b border-border/60 bg-muted/20">
                    <h3 className="font-bold text-foreground">Notifications</h3>
                    {totalNotifications > 0 && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">{totalNotifications} new</span>}
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {totalNotifications === 0 ? (
                      <div className="p-6 text-center text-sm text-muted-foreground">All caught up! No new notifications.</div>
                    ) : (
                      <div className="divide-y divide-border/60">
                        {pendingOrdersCount > 0 && (
                          <div className="p-4 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => { setShowNotifications(false); router.push('/admin'); }}>
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 size-8 bg-blue-500/10 rounded-full flex items-center justify-center"><ShoppingBag className="size-4 text-blue-600"/></div>
                              <div>
                                <p className="text-sm font-medium text-foreground">New Online Orders</p>
                                <p className="text-xs text-muted-foreground mt-0.5">You have {pendingOrdersCount} pending orders to process.</p>
                              </div>
                            </div>
                          </div>
                        )}
                        {lowStockCount > 0 && (
                          <div className="p-4 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => { setShowNotifications(false); router.push('/admin/inventory'); }}>
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 size-8 bg-orange-500/10 rounded-full flex items-center justify-center"><Package className="size-4 text-orange-600"/></div>
                              <div>
                                <p className="text-sm font-medium text-foreground">Low Stock Alert</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{lowStockCount} items are running below minimum stock level.</p>
                              </div>
                            </div>
                          </div>
                        )}
                        {unpaidBillsCount > 0 && (
                          <div className="p-4 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => { setShowNotifications(false); router.push('/admin/billing'); }}>
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 size-8 bg-red-500/10 rounded-full flex items-center justify-center"><Receipt className="size-4 text-red-600"/></div>
                              <div>
                                <p className="text-sm font-medium text-foreground">Unpaid Bills Reminder</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{unpaidBillsCount} offline bills are marked as unpaid or partial.</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {totalNotifications > 0 && (
                    <div className="p-3 border-t border-border/60 bg-muted/10 text-center">
                      <button onClick={() => { setPendingOrdersCount(0); setLowStockCount(0); setUnpaidBillsCount(0); }} className="text-xs font-semibold text-primary hover:underline">Mark all as read</button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
