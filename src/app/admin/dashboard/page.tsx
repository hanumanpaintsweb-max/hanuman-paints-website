"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { 
  IndianRupee, Package, Loader2, TrendingUp, TrendingDown, ShoppingBag, 
  Receipt, Clock, FileText, ChevronRight, AlertCircle
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts"
import { supabase } from "@/services/supabase"
import { inr } from "@/lib/format"
import { PRODUCTS } from "@/data/products"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const PIE_COLORS = ["#F97316", "#10B981", "#3B82F6", "#EF4444", "#8B5CF6"]
const CAT_COLORS = ["#2563EB", "#DB2777", "#D97706", "#059669", "#7C3AED", "#DC2626"]

type Order = {
  order_id: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: Array<{ id: string; name: string; quantity: number; price: number }>;
}

type Bill = {
  id: string;
  bill_number: string;
  customer_name: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
  items: Array<{ id: string; name: string; qty: number; mrp: number }>;
}

// Simple animated counter component
const CountUp = ({ value, prefix = "", suffix = "", isCurrency = false }: { value: number, prefix?: string, suffix?: string, isCurrency?: boolean }) => {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let start = 0
    const end = value
    if (start === end) return
    const duration = 1000
    const incrementTime = 20
    const step = Math.ceil((end - start) / (duration / incrementTime))
    
    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, incrementTime)
    
    return () => clearInterval(timer)
  }, [value])

  return <span>{prefix}{isCurrency ? inr(count).replace('₹', '') : count}{suffix}</span>
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  
  // Stats
  const [stats, setStats] = useState({
    todaySales: 0, yesterdaySales: 0,
    weekSales: 0, lastWeekSales: 0,
    monthSales: 0, lastMonthSales: 0,
    totalOrders: 0, pendingOrders: 0,
    totalBills: 0, outstandingAmount: 0
  })

  // Charts
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [revToggle, setRevToggle] = useState<"daily" | "weekly" | "monthly">("daily")
  const [statusData, setStatusData] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [catData, setCatData] = useState<any[]>([])

  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [recentBills, setRecentBills] = useState<any[]>([])
  
  // Reminders
  const [reminders, setReminders] = useState<{count: number, amount: number}>({count: 0, amount: 0})

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    
    const { data: orders } = await supabase.from("orders").select("*").order("created_at", { ascending: false })
    const { data: bills } = await supabase.from("bills").select("*").eq('is_deleted', false).order("created_at", { ascending: false })

    const allOrders: Order[] = orders || []
    const allBills: Bill[] = bills || []
    const allSales = [...allBills] // PHASE2_HIDDEN: removed ...allOrders

    setRecentOrders(allOrders.slice(0, 10))
    setRecentBills(allBills.slice(0, 5))

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 86400000)
    
    // Day of week logic (0 = Sunday, 1 = Monday)
    const dayOfWeek = now.getDay()
    const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    const thisWeekStart = new Date(now.setDate(diffToMonday))
    thisWeekStart.setHours(0,0,0,0)
    const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 86400000)
    
    const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)

    let ts=0, ys=0, ws=0, lws=0, ms=0, lms=0, pending=0, outstanding=0

    // Process Stats
    allSales.forEach(s => {
      const d = new Date(s.created_at)
      const amt = s.total_amount || 0
      
      // Daily
      if (d >= today) ts += amt
      else if (d >= yesterday && d < today) ys += amt
      
      // Weekly
      if (d >= thisWeekStart) ws += amt
      else if (d >= lastWeekStart && d < thisWeekStart) lws += amt
      
      // Monthly
      if (d >= thisMonthStart) ms += amt
      else if (d >= lastMonthStart && d < thisMonthStart) lms += amt
    })

    allOrders.forEach(o => {
      if (o.status === "Pending" || o.status === "Order Received") pending++
    })

    allBills.forEach(b => {
      if (b.payment_status === "unpaid" || b.payment_status === "partial") {
        outstanding += (b.total_amount || 0)
      }
    })

    setStats({
      todaySales: ts, yesterdaySales: ys,
      weekSales: ws, lastWeekSales: lws,
      monthSales: ms, lastMonthSales: lms,
      totalOrders: allOrders.length,
      pendingOrders: pending,
      totalBills: allBills.length,
      outstandingAmount: outstanding
    })

    // Process Reminders (Ledger)
    const { data: ledger } = await supabase
      .from('ledger')
      .select('*')
      .eq('type', 'receivable')
      .in('status', ['pending', 'partial', 'unpaid'])
    
    if (ledger) {
      const remCount = ledger.length
      const remAmount = ledger.reduce((acc, l) => acc + l.amount, 0)
      setReminders({ count: remCount, amount: remAmount })
    }

    // Process Status Pie
    const statusCount: Record<string, number> = {}
    allOrders.forEach(o => {
      statusCount[o.status] = (statusCount[o.status] || 0) + 1
    })
    setStatusData(Object.keys(statusCount).map(k => ({ name: k, value: statusCount[k] })))

    // Process Top Products & Category Donut
    const prodCount: Record<string, number> = {}
    const catCount: Record<string, number> = {}
    
    allSales.forEach(s => {
      s.items?.forEach((i: any) => {
        const pName = i.name || "Unknown"
        const qty = i.quantity || i.qty || 1
        prodCount[pName] = (prodCount[pName] || 0) + qty

        // Category mapping
        const product = PRODUCTS.find(p => p.id === i.id || p.id === i.productId)
        if (product) {
          catCount[product.category] = (catCount[product.category] || 0) + qty
        } else {
          catCount['Other'] = (catCount['Other'] || 0) + qty
        }
      })
    })

    setTopProducts(Object.keys(prodCount)
      .map(k => ({ name: k.replace("Dulux ", "").substring(0,20), qty: prodCount[k] }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5))

    setCatData(Object.keys(catCount).map(k => ({ name: k, value: catCount[k] })))

    // Process Daily Revenue (Last 30 days)
    const dailyRev: Record<string, number> = {}
    const refDate = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(refDate.getTime() - i * 86400000)
      dailyRev[d.toLocaleDateString("en-IN", { month: "short", day: "numeric" })] = 0
    }
    allSales.forEach(s => {
      const dateStr = new Date(s.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
      if (dailyRev[dateStr] !== undefined) dailyRev[dateStr] += (s.total_amount || 0)
    })
    setRevenueData(Object.keys(dailyRev).map(date => ({ date, revenue: dailyRev[date] })))

    setLoading(false)
  }

  const StatCard = ({ title, value, icon: Icon, prev, type }: any) => {
    const isCurrency = type === 'currency'
    let percent = 0
    if (prev > 0) percent = ((value - prev) / prev) * 100
    else if (value > 0 && prev === 0) percent = 100

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
        className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Icon className="size-4 text-primary" /> {title}
          </div>
        </div>
        <div className="mt-4 flex items-end gap-3">
          <div className="text-3xl font-black text-foreground">
            {isCurrency && "₹"}<CountUp value={value} isCurrency={isCurrency} />
          </div>
          {prev !== undefined && (
            <div className={`text-xs font-bold flex items-center mb-1 ${percent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {percent >= 0 ? <TrendingUp className="size-3 mr-1" /> : <TrendingDown className="size-3 mr-1" />}
              {Math.abs(percent).toFixed(1)}%
            </div>
          )}
        </div>
        {prev !== undefined && (
          <div className="text-xs text-muted-foreground mt-1">vs {type === 'currency' ? inr(prev) : prev} previous</div>
        )}
        <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
          <Icon className="size-24" />
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center flex-col gap-4">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-semibold animate-pulse">Loading Live Data...</p>
      </div>
    )
  }

  return (
    <div className="p-container-padding flex flex-col gap-element-gap max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Dashboard Overview</h2>
          <p className="font-body-md text-body-md text-outline mt-1">Monitor your business performance and recent activities.</p>
        </div>
        <div className="text-sm font-medium text-outline bg-white px-3 py-1.5 border border-outline-variant rounded-lg shadow-sm hidden sm:block">
          Last updated: {new Date().toLocaleString('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true })}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[64px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined">payments</span>
            </div>
          </div>
          <div className="relative z-10">
            <p className="font-label-md text-label-md text-outline uppercase tracking-wider mb-1">Today's Sales</p>
            <h3 className="font-headline-lg text-headline-lg text-on-surface">{inr(stats.todaySales)}</h3>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[64px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined">monitoring</span>
            </div>
          </div>
          <div className="relative z-10">
            <p className="font-label-md text-label-md text-outline uppercase tracking-wider mb-1">This Week Sales</p>
            <h3 className="font-headline-lg text-headline-lg text-on-surface">{inr(stats.weekSales)}</h3>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[64px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>insert_chart</span>
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined">insert_chart</span>
            </div>
          </div>
          <div className="relative z-10">
            <p className="font-label-md text-label-md text-outline uppercase tracking-wider mb-1">This Month Sales</p>
            <h3 className="font-headline-lg text-headline-lg text-on-surface">{inr(stats.monthSales)}</h3>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-xl border border-[#f97316]/30 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-[64px] text-[#f97316]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-[#f97316]/10 flex items-center justify-center text-[#f97316]">
              <span className="material-symbols-outlined">money_off</span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#f97316] bg-[#f97316]/10 px-2 py-1 rounded-full">
              Action Needed
            </span>
          </div>
          <div className="relative z-10">
            <p className="font-label-md text-label-md text-outline uppercase tracking-wider mb-1">Pending Unpaid Total</p>
            <h3 className="font-headline-lg text-headline-lg text-[#f97316]">{inr(stats.outstandingAmount)}</h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-outline-variant shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#f1f5f9]">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Revenue - Last 7 Days</h3>
            <button className="text-outline hover:text-primary transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
          
          <div className="flex-1 min-h-[300px] relative w-full bg-slate-50/50 rounded-lg flex items-end justify-around p-4 pt-10 border border-[#f1f5f9]">
            {(() => {
              const last7Days = revenueData.slice(-7);
              const maxRev = Math.max(...last7Days.map(d => d.revenue), 1);
              return last7Days.map((data, idx) => {
                const heightPercent = Math.max((data.revenue / maxRev) * 100, 5);
                const isToday = idx === last7Days.length - 1;
                return (
                  <div key={idx} className={`w-1/12 ${isToday ? 'bg-secondary' : 'bg-primary-container/20 hover:bg-primary-container transition-colors'} rounded-t-md relative group`} style={{ height: `${heightPercent}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                      {isToday ? 'Today: ' : ''}{inr(data.revenue)}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
          
          <div className="flex justify-around mt-4 text-xs font-semibold text-outline tracking-wider">
            {revenueData.slice(-7).map((d, idx) => (
              <div key={idx} className={`w-1/12 text-center ${idx === 6 ? "text-secondary" : ""}`}>{d.date.split(' ')[0]}</div>
            ))}
          </div>
        </div>

        {/* Secondary Chart */}
        <div className="bg-white rounded-xl border border-outline-variant shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#f1f5f9]">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Top 5 Products</h3>
            <button className="text-outline hover:text-primary transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
          <div className="flex-1 space-y-5">
            {(() => {
              const maxQty = Math.max(...topProducts.map(p => p.qty), 1);
              return topProducts.map((product, index) => {
                const opacity = 100 - (index * 20); // 100, 80, 60, 40, 20
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-on-surface">{product.name}</span>
                      <span className="font-semibold text-primary">{product.qty} units</span>
                    </div>
                    <div className="w-full bg-[#f1f5f9] rounded-full h-2">
                      <div className="bg-primary-container h-2 rounded-full" style={{ width: `${(product.qty / maxQty) * 100}%`, opacity: opacity / 100 }}></div>
                    </div>
                  </div>
                )
              });
            })()}
            {topProducts.length === 0 && <div className="text-center text-outline-variant py-8">No product data available</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
