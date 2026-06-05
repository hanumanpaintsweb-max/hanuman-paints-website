"use client"

import { useEffect, useState } from "react"
import { Calendar, RefreshCw, ShoppingBag, Loader2, MessageCircle } from "lucide-react"
import { supabase } from "@/services/supabase"
import { inr } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { sendOrderStatusWhatsApp } from "@/app/actions/whatsapp"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"

const STATUS_OPTIONS = ["Order Received", "Accepted", "Out for Delivery", "Delivered", "Cancelled"]
const FILTER_OPTIONS = ["All", "Pending", "Accepted", "Delivered"]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("All")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      
    if (error) {
      toast.error("Failed to load orders")
    } else {
      setOrders(data || [])
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
          toast.success("WhatsApp Notification Sent", { description: `Customer notified about ${newStatus}.` })
        }
      }
      toast.success("Status updated")
    } else {
      toast.error("Failed to update status")
    }
  }

  const triggerManualWhatsApp = async (e: React.MouseEvent, order: any) => {
    e.stopPropagation()
    const res = await sendOrderStatusWhatsApp(order.order_id, order.status, order.customer_phone, order.customer_name)
    if (res.success) {
      toast.success("Manual WhatsApp Sent", { description: `Message delivered to ${order.customer_phone}` })
    } else {
      toast.error("Failed to send WhatsApp message")
    }
  }

  const filteredOrders = orders.filter(o => {
    if (filter === "All") return true
    if (filter === "Pending") return o.status === "Order Received" || o.status === "Pending"
    return o.status === filter
  })

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingBag className="size-6 text-primary" /> Online Orders
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track customer online orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchOrders} className="rounded-xl gap-2 h-10">
            <RefreshCw className="size-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {FILTER_OPTIONS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`relative rounded-xl px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filter === f ? "text-primary" : "bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            {filter === f && (
              <motion.span
                layoutId="active-filter"
                className="absolute inset-0 -z-10 rounded-xl bg-primary/10 border border-primary/20"
              />
            )}
            {f}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No orders found for this filter.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredOrders.map(order => (
              <div key={order.id} className="group flex flex-col">
                <div 
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                      #{order.order_id}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{order.customer_name}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Calendar className="size-3" /> {new Date(order.created_at).toLocaleDateString()}</span>
                        <span>·</span>
                        <span>{order.customer_phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:ml-auto">
                    <div className="text-right mr-4 hidden lg:block">
                      <div className="text-sm font-bold text-foreground">{inr(order.total_amount)}</div>
                      <div className="text-xs text-muted-foreground">{order.items?.length || 0} items</div>
                    </div>
                    
                    <select
                      value={order.status}
                      onClick={e => e.stopPropagation()}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className={`rounded-xl border border-border/60 px-3 py-2 text-sm font-semibold outline-none ring-primary focus:ring-2 ${
                        order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' :
                        order.status === 'Cancelled' ? 'bg-red-50 text-red-700' :
                        order.status === 'Out for Delivery' ? 'bg-blue-50 text-blue-700' :
                        'bg-orange-50 text-orange-700'
                      }`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>

                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={(e) => triggerManualWhatsApp(e, order)}
                      className="rounded-xl size-10 text-[#25D366] hover:text-[#128C7E] hover:bg-[#25D366]/10 border-border/60"
                      title="Send WhatsApp Update Manually"
                    >
                      <MessageCircle className="size-5" />
                    </Button>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === order.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-muted/20 border-t border-border/60"
                    >
                      <div className="p-5 grid gap-6 lg:grid-cols-2">
                        <div>
                          <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3">Delivery Address</h4>
                          <div className="text-sm bg-background p-4 rounded-xl border border-border/60">
                            <p className="font-medium text-foreground">{order.customer_name}</p>
                            <p className="text-muted-foreground mt-1">{order.delivery_address}</p>
                            <p className="text-muted-foreground mt-1 font-medium">{order.customer_phone}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3">Order Items</h4>
                          <div className="bg-background rounded-xl border border-border/60 divide-y divide-border/60">
                            {order.items?.map((item: any, idx: number) => (
                              <div key={idx} className="p-3 flex justify-between items-center text-sm">
                                <div>
                                  <div className="font-medium text-foreground">{item.name}</div>
                                  <div className="text-xs text-muted-foreground">{item.size || "Default Size"} x {item.quantity || 1}</div>
                                </div>
                                <div className="font-bold">{inr((item.price || item.mrp || 0) * (item.quantity || 1))}</div>
                              </div>
                            ))}
                            <div className="p-3 flex justify-between items-center bg-muted/50 rounded-b-xl">
                              <span className="font-bold">Total</span>
                              <span className="font-bold text-primary text-lg">{inr(order.total_amount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
