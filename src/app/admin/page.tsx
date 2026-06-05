"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "motion/react"
import { Package, RefreshCw, Download, FileText, IndianRupee, Loader2, LineChart } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

import { supabase } from "@/services/supabase"
import { inr } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { sendOrderStatusWhatsApp } from "@/app/actions/whatsapp"
import { toast } from "sonner"

const STATUS_OPTIONS = ["Order Received", "Accepted", "Out for Delivery", "Delivered", "Cancelled"]

const STATUS_COLORS: Record<string, string> = {
  "Order Received": "text-amber-600 bg-amber-100",
  "Accepted": "text-blue-600 bg-blue-100",
  "Out for Delivery": "text-purple-600 bg-purple-100",
  "Delivered": "text-emerald-600 bg-emerald-100",
  "Cancelled": "text-red-600 bg-red-100",
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [revenueData, setRevenueData] = useState<any[]>([])
  const printRef = useRef<HTMLDivElement>(null)

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })
    
    if (!error && data) {
      setOrders(data)
      
      // Compute simple chart data by day
      const grouped = data.reduce((acc: any, curr: any) => {
        const date = new Date(curr.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
        if (!acc[date]) acc[date] = 0
        acc[date] += curr.total_amount
        return acc
      }, {})

      const chartData = Object.keys(grouped)
        .reverse()
        .map(date => ({ date, revenue: grouped[date] }))
        .slice(-7) // Last 7 days with data
        
      setRevenueData(chartData)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", id)
    if (!error) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
      
      const order = orders.find(o => o.id === id)
      if (order && ["Accepted", "Out for Delivery", "Delivered"].includes(newStatus)) {
        const res = await sendOrderStatusWhatsApp(order.order_id, newStatus, order.customer_phone, order.customer_name)
        if (res.success) {
          toast.success("WhatsApp Notification Sent", { description: `Customer notified about ${newStatus} status.` })
        }
      }
    } else {
      toast.error("Failed to update status")
    }
  }

  const generatePDF = async (order: any) => {
    const tempDiv = document.createElement("div")
    tempDiv.style.position = "absolute"
    tempDiv.style.left = "-9999px"
    tempDiv.style.width = "800px"
    tempDiv.style.padding = "40px"
    tempDiv.style.background = "#fff"
    tempDiv.style.fontFamily = "sans-serif"
    
    tempDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px;">
        <div>
          <h1 style="color: #F97316; margin: 0; font-size: 28px;">HANUMAN PAINTS</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Premium Paints Retailer</p>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; font-size: 24px; color: #333;">INVOICE</h2>
          <p style="margin: 5px 0 0 0; color: #666;">Order #${order.order_id}</p>
          <p style="margin: 5px 0 0 0; color: #666;">Date: ${new Date(order.created_at).toLocaleDateString()}</p>
        </div>
      </div>
      
      <div style="margin-bottom: 30px;">
        <h3 style="color: #333; margin-bottom: 10px;">Billed To:</h3>
        <p style="margin: 0; color: #555;"><strong>${order.customer_name}</strong></p>
        <p style="margin: 5px 0; color: #555;">${order.customer_address}</p>
        <p style="margin: 0; color: #555;">Pincode: ${order.customer_pincode} | Phone: ${order.customer_phone}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
            <th style="padding: 12px; text-align: left; color: #374151;">Item Description</th>
            <th style="padding: 12px; text-align: right; color: #374151;">Qty</th>
            <th style="padding: 12px; text-align: right; color: #374151;">Price</th>
            <th style="padding: 12px; text-align: right; color: #374151;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((item: any) => `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; color: #4b5563;">
                <strong>${item.name}</strong><br/>
                <span style="font-size: 12px; color: #6b7280;">Size: ${item.selectedSize}</span>
              </td>
              <td style="padding: 12px; text-align: right; color: #4b5563;">${item.quantity}</td>
              <td style="padding: 12px; text-align: right; color: #4b5563;">₹${item.discounted || item.mrp}</td>
              <td style="padding: 12px; text-align: right; color: #4b5563;">₹${(item.discounted || item.mrp) * item.quantity}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="width: 300px; margin-left: auto;">
        <div style="display: flex; justify-content: space-between; padding: 8px 0; color: #666;">
          <span>Subtotal:</span>
          <span>₹${order.subtotal}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; color: #16a34a;">
          <span>Discount:</span>
          <span>-₹${order.discount_amount}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #eee; font-weight: bold; font-size: 18px; color: #111827;">
          <span>Total:</span>
          <span>₹${order.total_amount}</span>
        </div>
      </div>
    `
    document.body.appendChild(tempDiv)
    
    try {
      const canvas = await html2canvas(tempDiv, { scale: 2 })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Invoice_${order.order_id}.pdf`)
    } catch (err) {
      console.error("Failed to generate PDF", err)
    } finally {
      document.body.removeChild(tempDiv)
    }
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
        <Button onClick={fetchOrders} variant="outline" size="sm" className="gap-2 rounded-lg">
          <RefreshCw className="size-4" /> Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <Package className="size-6 text-primary" />
          </div>
          <div className="text-sm font-semibold text-muted-foreground">Total Orders</div>
          <div className="mt-1 text-3xl font-bold tracking-tight text-foreground">{orders.length}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-emerald-500/10">
            <IndianRupee className="size-6 text-emerald-600" />
          </div>
          <div className="text-sm font-semibold text-muted-foreground">Total Revenue</div>
          <div className="mt-1 text-3xl font-bold tracking-tight text-foreground">{inr(totalRevenue)}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-blue-500/10">
            <LineChart className="size-6 text-blue-600" />
          </div>
          <div className="text-sm font-semibold text-muted-foreground">Avg. Order Value</div>
          <div className="mt-1 text-3xl font-bold tracking-tight text-foreground">
            {orders.length ? inr(Math.round(totalRevenue / orders.length)) : inr(0)}
          </div>
        </div>
      </div>

      {/* Charts */}
      {revenueData.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-foreground">Revenue Last 7 Active Days</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  formatter={(value: any) => [inr(value), "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-5">
          <h2 className="text-lg font-bold text-foreground">Recent Orders</h2>
        </div>
        
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-semibold">Order ID</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {orders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">#{order.order_id}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleString("en-IN", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{order.customer_name}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{order.customer_phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-primary">{inr(order.total_amount)}</div>
                      <div className="mt-0.5 text-xs font-medium text-muted-foreground">{order.items?.length || 0} items</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-bold outline-none ring-primary transition-colors focus-visible:ring-2 ${
                          STATUS_COLORS[order.status] || "border-border bg-background text-foreground"
                        }`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button onClick={() => generatePDF(order)} variant="outline" size="sm" className="gap-2 rounded-lg text-xs">
                        <Download className="size-3.5" /> Invoice
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
