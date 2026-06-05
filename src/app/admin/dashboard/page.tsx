"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { 
  IndianRupee, Package, Loader2, TrendingUp, ShoppingBag, AlertCircle 
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts"
import { supabase } from "@/services/supabase"
import { inr } from "@/lib/format"
import { toast } from "sonner"
import { PRODUCTS } from "@/data/products"
import { Button } from "@/components/ui/button"

const PIE_COLORS = ["#F97316", "#10B981", "#3B82F6", "#EF4444", "#8B5CF6"]

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    todaySales: 0,
    weekSales: 0,
    monthSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
  })
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [statusData, setStatusData] = useState<any[]>([])
  const [stockItems, setStockItems] = useState<any[]>([])

  const fetchDashboardData = async () => {
    setLoading(true)
    
    // Fetch all orders
    const { data: orders, error: ordersError } = await supabase.from("orders").select("*")
    
    // Fetch all bills (offline sales)
    const { data: bills, error: billsError } = await supabase.from("bills").select("*")

    // Fetch stock
    const { data: stockData, error: stockError } = await supabase.from("stock").select("*").order("product_name")

    if (!ordersError && !billsError) {
      const allSales = [...(orders || []), ...(bills || [])]
      
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      let todaySales = 0
      let weekSales = 0
      let monthSales = 0
      let pendingOrders = 0

      // Process for stats
      allSales.forEach((sale) => {
        const d = new Date(sale.created_at)
        const amt = sale.total_amount || sale.total || 0
        if (d >= today) todaySales += amt
        if (d >= lastWeek) weekSales += amt
        if (d >= thisMonth) monthSales += amt
      })

      // Status Pie Chart Data (only online orders usually have these statuses)
      const statusCount: Record<string, number> = {}
      orders?.forEach(o => {
        if (o.status === "Order Received" || o.status === "Pending") pendingOrders++
        statusCount[o.status] = (statusCount[o.status] || 0) + 1
      })

      const pieData = Object.keys(statusCount).map(k => ({ name: k, value: statusCount[k] }))

      // Daily Revenue Bar Chart (Last 7 days)
      const dailyRev: Record<string, number> = {}
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
        dailyRev[d.toLocaleDateString("en-IN", { month: "short", day: "numeric" })] = 0
      }

      allSales.forEach(s => {
        const dateStr = new Date(s.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
        if (dailyRev[dateStr] !== undefined) {
          dailyRev[dateStr] += (s.total_amount || s.total || 0)
        }
      })

      const barData = Object.keys(dailyRev).map(date => ({ date, revenue: dailyRev[date] }))

      // Top Products (Aggregating qty from items JSON)
      const prodCount: Record<string, number> = {}
      allSales.forEach(s => {
        s.items?.forEach((i: any) => {
          const name = i.name || "Unknown"
          prodCount[name] = (prodCount[name] || 0) + (i.quantity || i.qty || 1)
        })
      })

      const topP = Object.keys(prodCount)
        .map(k => ({ name: k.replace("Dulux ", ""), qty: prodCount[k] }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5)

      setStats({
        todaySales,
        weekSales,
        monthSales,
        totalOrders: allSales.length,
        pendingOrders
      })
      setStatusData(pieData)
      setRevenueData(barData)
      setTopProducts(topP)
    }

    // Process Stock Data
    if (!stockError && stockData) {
      if (stockData.length === 0) {
        // Seed stock table automatically if empty
        const initialStock = PRODUCTS.map(p => ({
          product_id: p.id.toString(),
          product_name: p.name,
          current_stock: 50, // default dummy stock
          unit: "units"
        }))
        const { data: newStock } = await supabase.from("stock").insert(initialStock).select()
        setStockItems(newStock || [])
      } else {
        setStockItems(stockData)
      }
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleStockUpdate = async (id: string, newStock: string) => {
    const val = parseInt(newStock) || 0
    const { error } = await supabase.from("stock").update({ current_stock: val, updated_at: new Date() }).eq("id", id)
    if (error) {
      toast.error("Failed to update stock")
    } else {
      setStockItems(prev => prev.map(s => s.id === id ? { ...s, current_stock: val } : s))
      toast.success("Stock updated")
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Business Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your online and offline sales</p>
      </div>

      {/* Top Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <IndianRupee className="size-4" /> Today's Sales
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">{inr(stats.todaySales)}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <TrendingUp className="size-4" /> This Week
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">{inr(stats.weekSales)}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <TrendingUp className="size-4" /> This Month
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">{inr(stats.monthSales)}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <ShoppingBag className="size-4" /> Total Orders
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">{stats.totalOrders}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Package className="size-4" /> Pending
          </div>
          <div className="mt-2 text-2xl font-bold text-orange-500">{stats.pendingOrders}</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Revenue (Last 7 Days)</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v/1000}k`} />
                <RechartsTooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  formatter={(val: any) => [inr(val), "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#F97316" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Online Order Status</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Products Horizontal Bar */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm lg:col-span-1">
          <h2 className="text-lg font-semibold mb-6">Top 5 Products</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topProducts} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <RechartsTooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                />
                <Bar dataKey="qty" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Tracker Table */}
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm lg:col-span-2">
          <div className="border-b border-border/60 p-6 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Inventory Stock Tracker</h2>
            <Button size="sm" variant="outline" onClick={fetchDashboardData} className="rounded-lg h-8 text-xs">
              Refresh
            </Button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-3 font-semibold">Product Name</th>
                  <th className="px-6 py-3 font-semibold">Current Stock</th>
                  <th className="px-6 py-3 font-semibold text-right">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {stockItems.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-6 py-3">
                      <div className="font-medium text-foreground flex items-center gap-2">
                        {item.current_stock < 10 && <AlertCircle className="size-4 text-red-500" />}
                        {item.product_name}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        item.current_stock < 10 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.current_stock} {item.unit}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          defaultValue={item.current_stock}
                          onBlur={(e) => {
                            if (e.target.value !== item.current_stock.toString()) {
                              handleStockUpdate(item.id, e.target.value)
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                          className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none ring-primary focus:ring-2"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
