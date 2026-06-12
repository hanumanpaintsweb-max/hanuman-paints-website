"use client"

import { ReactNode, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { 
  LogOut, Menu, X, LayoutDashboard, Receipt, CalendarRange, Users, BookOpen, Settings, Bell, CircleUserRound, Search, Plus, ShoppingBag, Package
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/services/supabase"

const NAV_ITEMS: { label: string; href: string; icon: any; badgeKey?: string }[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Billing", href: "/admin/billing", icon: Receipt },
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

  // Helper to determine active state
  const isActive = (href: string) => {
    if (href === "/admin/dashboard" && pathname === "/admin") return true;
    return pathname.startsWith(href);
  }

  return (
    <div className="bg-[#f8fafc] text-on-surface font-body-md min-h-screen flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* SideNavBar */}
      <aside className={`fixed left-0 top-0 h-screen w-[280px] bg-[#1e293b] shadow-sm z-50 flex flex-col transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full py-6">
          <div className="px-6 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white font-bold text-xl">H</div>
              <div>
                <h1 className="font-headline-md text-headline-md text-white truncate max-w-[150px]">{shopName}</h1>
                <p className="font-label-md text-label-md text-outline-variant">Admin Terminal</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/50 hover:text-white">
              <X className="size-5" />
            </button>
          </div>
          
          <div className="px-4 mb-6">
            <button onClick={() => { setSidebarOpen(false); router.push("/admin/billing"); }} className="w-full bg-secondary hover:bg-secondary-container text-white py-2 px-4 rounded-lg font-label-md text-label-md transition-colors flex items-center justify-center gap-2">
              <Plus className="size-5" />
              New Invoice
            </button>
          </div>
          
          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 mx-2 transition-all duration-200 border-l-4 ${
                    active 
                    ? "text-white border-secondary bg-white/5 rounded-r-lg opacity-90 scale-[0.99]" 
                    : "text-outline-variant hover:text-white hover:bg-white/5 rounded-lg border-transparent"
                  }`}
                >
                  <item.icon className="size-5" />
                  <span className="font-label-md text-label-md">{item.label}</span>
                  {item.badgeKey === "orders" && pendingOrdersCount > 0 && (
                    <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                      {pendingOrdersCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
          
          <div className="mt-auto pt-6 border-t border-white/5 mx-4 space-y-2">
            <div className="px-2 py-2 mb-2">
              <p className="text-xs font-medium text-white/80 truncate">{(admin as Record<string, any>)?.email}</p>
              <p className="text-[10px] text-white/50">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-2 py-3 text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors duration-200 rounded-lg border-l-4 border-transparent"
            >
              <LogOut className="size-5" />
              <span className="font-label-md text-label-md">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col ml-0 md:ml-[280px] w-full md:w-[calc(100%-280px)] min-h-screen relative">
        {/* TopAppBar */}
        <header className="flex justify-between items-center h-16 px-container-padding bg-white border-b border-outline-variant shadow-sm sticky top-0 z-10 w-full">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-primary p-2 hover:bg-surface-container-high rounded-full transition-all">
              <Menu className="size-5" />
            </button>
            <div className="font-headline-sm text-headline-sm font-semibold text-primary">Billing System</div>
          </div>
          
          <div className="flex-1 max-w-md mx-8 hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-outline" />
              <input className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-full text-body-md focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all outline-none" placeholder="Search..." type="text" />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all active:scale-95">
                <Bell className="size-5" />
                {totalNotifications > 0 && (
                  <span className="absolute top-1 right-1 flex size-2.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 rounded-2xl border border-outline-variant bg-white shadow-2xl overflow-hidden z-50"
                  >
                    <div className="flex items-center justify-between p-4 border-b border-outline-variant bg-surface-container">
                      <h3 className="font-bold text-on-surface">Notifications</h3>
                      {totalNotifications > 0 && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">{totalNotifications} new</span>}
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                      {totalNotifications === 0 ? (
                        <div className="p-6 text-center text-sm text-outline">All caught up! No new notifications.</div>
                      ) : (
                        <div className="divide-y divide-outline-variant">
                          {pendingOrdersCount > 0 && (
                            <div className="p-4 hover:bg-surface-container transition-colors cursor-pointer" onClick={() => { setShowNotifications(false); router.push('/admin'); }}>
                              <div className="flex gap-3">
                                <div className="flex-shrink-0 size-8 bg-blue-500/10 rounded-full flex items-center justify-center"><ShoppingBag className="size-4 text-blue-600"/></div>
                                <div>
                                  <p className="text-sm font-medium text-on-surface">New Online Orders</p>
                                  <p className="text-xs text-outline mt-0.5">You have {pendingOrdersCount} pending orders to process.</p>
                                </div>
                              </div>
                            </div>
                          )}
                          {lowStockCount > 0 && (
                            <div className="p-4 hover:bg-surface-container transition-colors cursor-pointer" onClick={() => { setShowNotifications(false); router.push('/admin/inventory'); }}>
                              <div className="flex gap-3">
                                <div className="flex-shrink-0 size-8 bg-orange-500/10 rounded-full flex items-center justify-center"><Package className="size-4 text-orange-600"/></div>
                                <div>
                                  <p className="text-sm font-medium text-on-surface">Low Stock Alert</p>
                                  <p className="text-xs text-outline mt-0.5">{lowStockCount} items are running below minimum stock level.</p>
                                </div>
                              </div>
                            </div>
                          )}
                          {unpaidBillsCount > 0 && (
                            <div className="p-4 hover:bg-surface-container transition-colors cursor-pointer" onClick={() => { setShowNotifications(false); router.push('/admin/billing'); }}>
                              <div className="flex gap-3">
                                <div className="flex-shrink-0 size-8 bg-red-500/10 rounded-full flex items-center justify-center"><Receipt className="size-4 text-red-600"/></div>
                                <div>
                                  <p className="text-sm font-medium text-on-surface">Unpaid Bills Reminder</p>
                                  <p className="text-xs text-outline mt-0.5">{unpaidBillsCount} offline bills are marked as unpaid or partial.</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {totalNotifications > 0 && (
                      <div className="p-3 border-t border-outline-variant bg-surface-container text-center">
                        <button onClick={() => { setPendingOrdersCount(0); setLowStockCount(0); setUnpaidBillsCount(0); }} className="text-xs font-semibold text-primary hover:underline">Mark all as read</button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all active:scale-95">
              <CircleUserRound className="size-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-container-padding flex flex-col gap-element-gap max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
