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
  { label: "Products", href: "/admin/products", icon: ShoppingBag },
  { label: "Stock", href: "/admin/stock", icon: Package },
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
      <aside className={`fixed left-0 top-0 h-screen w-[280px] bg-slate-800 shadow-sm z-50 flex flex-col transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full py-6">
          <div className="px-6 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white font-bold text-xl">H</div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight leading-tight">{shopName}</h1>
                <p className="text-[10px] text-blue-200 font-medium tracking-wide mt-0.5">Authorized Dulux Blue Store</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/50 hover:text-white">
              <X className="size-5" />
            </button>
          </div>
          
          <div className="px-4 mb-6">
            <button onClick={() => { setSidebarOpen(false); router.push("/admin/billing"); }} className="w-full bg-white hover:bg-slate-50 text-green-700 py-2.5 px-4 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm border border-transparent">
              <Plus className="size-5 text-green-600" />
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
                    ? "text-white border-orange-500 bg-white/10 rounded-r-lg font-semibold shadow-sm" 
                    : "text-white/80 hover:text-white hover:bg-white/5 rounded-lg border-transparent font-medium"
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
            {/* Search removed per CTO directive */}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Notifications and Profile icons removed per CTO directive */}
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
