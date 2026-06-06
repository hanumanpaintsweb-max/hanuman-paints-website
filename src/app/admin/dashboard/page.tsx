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

const PIE_COLORS = ["#F97316", "#10B981", "#3B82F6", "#EF4444", "#8B5CF6"]
const CAT_COLORS = ["#2563EB", "#DB2777", "#D97706", "#059669", "#7C3AED", "#DC2626"]

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

  // Recent Activity
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [recentBills, setRecentBills] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    
    const { data: orders } = await supabase.from("orders").select("*").order("created_at", { ascending: false })
    const { data: bills } = await supabase.from("bills").select("*").eq('is_deleted', false).order("created_at", { ascending: false })

    const allOrders: Order[] = orders || []
    const allBills: Bill[] = bills || []
    const allSales = [...allOrders, ...allBills]

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
      const amt = s.total_amount || s.total || 0
      
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
      .slice(0, 10))

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
      if (dailyRev[dateStr] !== undefined) dailyRev[dateStr] += (s.total_amount || s.total || 0)
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
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Business Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Live analytics integrating all online and offline channels</p>
      </div>

      {/* TOP STATS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's Sales" value={stats.todaySales} prev={stats.yesterdaySales} icon={IndianRupee} type="currency" />
        <StatCard title="This Week" value={stats.weekSales} prev={stats.lastWeekSales} icon={IndianRupee} type="currency" />
        <StatCard title="This Month" value={stats.monthSales} prev={stats.lastMonthSales} icon={IndianRupee} type="currency" />
        <StatCard title="Outstanding Amount" value={stats.outstandingAmount} icon={AlertCircle} type="currency" />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} type="number" />
        <StatCard title="Pending Orders" value={stats.pendingOrders} icon={Clock} type="number" />
        <StatCard title="Total Bills" value={stats.totalBills} icon={Receipt} type="number" />
      </div>

      {/* GRAPHS ROW 1 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* REVENUE TIMELINE */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Revenue Timeline (30 Days)</h2>
            <div className="flex gap-2">
              {/* Future toggle implementation placeholder */}
              <select className="bg-muted text-xs font-bold px-3 py-1.5 rounded-lg outline-none border border-border">
                <option value="daily">Daily</option>
              </select>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} dy={10} minTickGap={20} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                  formatter={(val: any) => [inr(val), "Revenue"]}
                />
                <Line type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={3} dot={false} activeDot={{ r: 8, fill: "#F97316", stroke: "#fff", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* CATEGORY SALES DONUT */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-6">Category Sales</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                  {catData.map((entry, index) => <Cell key={`cell-${index}`} fill={CAT_COLORS[index % CAT_COLORS.length]} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* GRAPHS ROW 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* TOP 10 PRODUCTS */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-6">Top 10 Products (Qty)</h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topProducts} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={140} axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600 }} />
                <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                <Bar dataKey="qty" fill="#F97316" radius={[0, 4, 4, 0]} barSize={16}>
                  {topProducts.map((entry, index) => <Cell key={`cell-${index}`} fill={`hsl(24, 93%, ${50 + (index * 3)}%)`} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ORDER STATUS PIE */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-6">Online Order Status</h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={120} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 border-b border-border/60 flex justify-between items-center bg-muted/20">
            <h2 className="text-lg font-bold flex items-center gap-2"><ShoppingBag className="size-5 text-primary" /> Recent Orders</h2>
            <Link href="/admin/billing" className="text-xs font-bold text-primary hover:underline flex items-center">View All <ChevronRight className="size-3" /></Link>
          </div>
          <div className="divide-y divide-border/60 flex-1">
            {recentOrders.map(order => (
              <div key={order.id} className="p-4 hover:bg-muted/30 transition-colors flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm">{order.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{inr(order.total_amount || order.total)}</div>
                  <div className="text-[10px] font-bold uppercase bg-muted px-2 py-0.5 rounded text-muted-foreground mt-1 inline-block">{order.status}</div>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No recent orders</div>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 border-b border-border/60 flex justify-between items-center bg-muted/20">
            <h2 className="text-lg font-bold flex items-center gap-2"><Receipt className="size-5 text-emerald-500" /> Recent Bills</h2>
            <Link href="/admin/billing" className="text-xs font-bold text-primary hover:underline flex items-center">View All <ChevronRight className="size-3" /></Link>
          </div>
          <div className="divide-y divide-border/60 flex-1">
            {recentBills.map(bill => (
              <div key={bill.id} className="p-4 hover:bg-muted/30 transition-colors flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm">{bill.customer_name || 'Walk-in Customer'} <span className="text-xs font-mono text-muted-foreground ml-1">#{bill.bill_number}</span></div>
                  <div className="text-xs text-muted-foreground">{new Date(bill.created_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600">{inr(bill.total_amount)}</div>
                  <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded mt-1 inline-block ${bill.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {bill.payment_status}
                  </div>
                </div>
              </div>
            ))}
            {recentBills.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No recent bills</div>}
          </div>
        </motion.div>
      </div>

    </div>
  )
}
