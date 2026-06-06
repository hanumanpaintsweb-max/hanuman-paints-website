"use client"

import { useEffect, useState, useMemo } from "react"
import { 
  Calendar, RefreshCw, ShoppingBag, Loader2, MessageCircle, 
  Search, Printer, X, CheckSquare, Square, ChevronRight, 
  Clock, Truck, CheckCircle2, XCircle, AlertCircle, Package
} from "lucide-react"
import { supabase } from "@/services/supabase"
import { inr } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { sendOrderStatusWhatsApp } from "@/app/actions/whatsapp"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"

const STATUS_OPTIONS = ["Order Received", "Accepted", "Out for Delivery", "Delivered", "Cancelled"]
const TIME_FILTERS = ["All Time", "Today", "This Week", "This Month"]
const AMOUNT_FILTERS = ["All", "Under ₹1000", "₹1000 - ₹5000", "Above ₹5000"]

const getStatusColor = (status: string) => {
  switch (status) {
    case "Order Received":
    case "Pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    case "Accepted": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    case "Out for Delivery": return "bg-orange-500/10 text-orange-500 border-orange-500/20"
    case "Delivered": return "bg-green-500/10 text-green-500 border-green-500/20"
    case "Cancelled": return "bg-red-500/10 text-red-500 border-red-500/20"
    default: return "bg-muted text-muted-foreground border-border"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Order Received":
    case "Pending": return <Clock className="size-4" />
    case "Accepted": return <CheckCircle2 className="size-4" />
    case "Out for Delivery": return <Truck className="size-4" />
    case "Delivered": return <CheckCircle2 className="size-4" />
    case "Cancelled": return <XCircle className="size-4" />
    default: return <AlertCircle className="size-4" />
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters & Search
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [timeFilter, setTimeFilter] = useState("All Time")
  const [amountFilter, setAmountFilter] = useState("All")
  
  // Selections
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  
  // Modals
  const [viewOrder, setViewOrder] = useState<any | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [showCancelDialog, setShowCancelDialog] = useState(false)

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

    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission()
    }

    const channel = supabase
      .channel('orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const newOrder = payload.new
        setOrders(prev => [newOrder, ...prev])
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          new Notification('Hanuman Paints', { body: 'New order received!', icon: '/favicon.ico' })
        }
        toast.success("New Order Received!", { description: `Order #${newOrder.order_id}` })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const updateStatus = async (id: string, newStatus: string, reason?: string) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return

    const updateData: any = { status: newStatus }
    if (reason) updateData.cancel_reason = reason

    const { error } = await supabase.from("orders").update(updateData).eq("id", id)
    if (!error) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updateData } : o))
      
      const order = orders.find(o => o.id === id)
      if (order && ["Accepted", "Out for Delivery", "Delivered", "Cancelled"].includes(newStatus)) {
        await sendOrderStatusWhatsApp(order.order_id, newStatus, order.customer_phone, order.customer_name)
        toast.success("Customer notified via WhatsApp")
      }
      toast.success("Status updated successfully")
      if (viewOrder && viewOrder.id === id) {
        setViewOrder({ ...viewOrder, ...updateData })
        setShowCancelDialog(false)
        setCancelReason("")
      }
    } else {
      toast.error("Failed to update status")
    }
  }

  const bulkUpdateStatus = async (newStatus: string) => {
    if (selectedIds.size === 0) return
    if (!window.confirm(`Update ${selectedIds.size} orders to ${newStatus}?`)) return

    const ids = Array.from(selectedIds)
    const { error } = await supabase.from("orders").update({ status: newStatus }).in("id", ids)
    
    if (!error) {
      setOrders(prev => prev.map(o => ids.includes(o.id) ? { ...o, status: newStatus } : o))
      toast.success(`Successfully updated ${ids.length} orders`)
      
      // Auto trigger whatsapp for bulk if not pending
      if (["Accepted", "Out for Delivery", "Delivered"].includes(newStatus)) {
        ids.forEach(async (id) => {
          const order = orders.find(o => o.id === id)
          if (order) await sendOrderStatusWhatsApp(order.order_id, newStatus, order.customer_phone, order.customer_name)
        })
      }
      setSelectedIds(new Set())
    } else {
      toast.error("Bulk update failed")
    }
  }

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const toggleAll = () => {
    if (selectedIds.size === filteredOrders.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filteredOrders.map(o => o.id)))
  }

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Search
      const searchLower = search.toLowerCase()
      const matchesSearch = !search || 
        o.order_id.toLowerCase().includes(searchLower) || 
        o.customer_name.toLowerCase().includes(searchLower) || 
        o.customer_phone.includes(searchLower)
      
      if (!matchesSearch) return false

      // Status
      if (statusFilter !== "All" && o.status !== statusFilter) return false

      // Amount
      if (amountFilter !== "All") {
        const total = o.total_amount
        if (amountFilter === "Under ₹1000" && total >= 1000) return false
        if (amountFilter === "₹1000 - ₹5000" && (total < 1000 || total > 5000)) return false
        if (amountFilter === "Above ₹5000" && total <= 5000) return false
      }

      // Time
      if (timeFilter !== "All Time") {
        const orderDate = new Date(o.created_at)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - orderDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (timeFilter === "Today" && diffDays > 1) return false
        if (timeFilter === "This Week" && diffDays > 7) return false
        if (timeFilter === "This Month" && diffDays > 30) return false
      }

      return true
    })
  }, [orders, search, statusFilter, timeFilter, amountFilter])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <ShoppingBag className="size-8 text-primary" /> Order Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time processing of all online orders</p>
        </div>
        <Button onClick={fetchOrders} variant="outline" className="rounded-xl gap-2 h-11">
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-card p-4 rounded-2xl border border-border/60 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search ID, Name, Phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none">
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select value={timeFilter} onChange={e => setTimeFilter(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none">
          {TIME_FILTERS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select value={amountFilter} onChange={e => setAmountFilter(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none">
          {AMOUNT_FILTERS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-4 bg-primary/10 border border-primary/20 p-3 rounded-xl"
          >
            <span className="text-sm font-semibold text-primary pl-2">{selectedIds.size} orders selected</span>
            <div className="h-4 w-px bg-primary/20"></div>
            <div className="flex gap-2">
              <select 
                onChange={(e) => { if(e.target.value) bulkUpdateStatus(e.target.value); e.target.value = ""; }}
                className="text-xs font-semibold bg-background border-border rounded-lg px-2 py-1.5 outline-none cursor-pointer"
              >
                <option value="">Bulk Status Update...</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border/60">
          <ShoppingBag className="size-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {/* Header Row */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-1 flex items-center">
              <button onClick={toggleAll}>
                {selectedIds.size === filteredOrders.length ? <CheckSquare className="size-5 text-primary" /> : <Square className="size-5" />}
              </button>
            </div>
            <div className="col-span-2">Order ID</div>
            <div className="col-span-3">Customer</div>
            <div className="col-span-3">Items Summary</div>
            <div className="col-span-1 text-right">Total</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          <AnimatePresence>
            {filteredOrders.map(order => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                key={order.id}
                onClick={() => setViewOrder(order)}
                className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:px-6 md:py-5 items-center rounded-2xl border cursor-pointer transition-all hover:shadow-md ${
                  selectedIds.has(order.id) ? "border-primary bg-primary/5" : "border-border/60 bg-card hover:border-primary/50"
                }`}
              >
                <div className="col-span-1 hidden md:flex" onClick={(e) => { e.stopPropagation(); toggleSelection(order.id) }}>
                  {selectedIds.has(order.id) ? <CheckSquare className="size-5 text-primary" /> : <Square className="size-5 text-muted-foreground" />}
                </div>
                
                <div className="col-span-12 md:col-span-2 flex justify-between md:block">
                  <div className="font-bold text-foreground">#{order.order_id}</div>
                  <div className="text-xs text-muted-foreground md:mt-1">{new Date(order.created_at).toLocaleDateString()}</div>
                </div>

                <div className="col-span-12 md:col-span-3">
                  <div className="font-semibold">{order.customer_name}</div>
                  <div 
                    className="text-xs text-muted-foreground hover:text-[#25D366] transition-colors inline-flex items-center gap-1 mt-1"
                    onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/91${order.customer_phone.replace(/\D/g, '')}`, '_blank') }}
                  >
                    {order.customer_phone} <MessageCircle className="size-3" />
                  </div>
                </div>

                <div className="col-span-12 md:col-span-3 text-sm text-muted-foreground">
                  {order.items?.slice(0, 2).map((item: any, i: number) => (
                    <div key={i} className="truncate">• {item.qty || item.quantity}x {item.name}</div>
                  ))}
                  {order.items?.length > 2 && <div className="text-xs italic mt-1">+{order.items.length - 2} more items</div>}
                </div>

                <div className="col-span-6 md:col-span-1 md:text-right font-extrabold text-lg text-primary">
                  {inr(order.total_amount)}
                </div>

                <div className="col-span-6 md:col-span-2 flex justify-end">
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {viewOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
              onClick={() => setViewOrder(null)}
            />
            <motion.div 
              initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-2xl bg-background shadow-2xl z-50 flex flex-col border-l border-border"
            >
              <div className="flex items-center justify-between p-6 border-b border-border bg-card">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    Order #{viewOrder.order_id}
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getStatusColor(viewOrder.status)}`}>
                      {viewOrder.status}
                    </div>
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Placed on {new Date(viewOrder.created_at).toLocaleString()}
                  </p>
                </div>
                <button onClick={() => setViewOrder(null)} className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors">
                  <X className="size-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Customer Info */}
                <section>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Customer Details</h3>
                  <div className="bg-card border border-border rounded-2xl p-5 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-semibold">{viewOrder.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-semibold flex items-center gap-2">
                        {viewOrder.customer_phone}
                        <button 
                          onClick={() => window.open(`https://wa.me/91${viewOrder.customer_phone.replace(/\D/g, '')}`, '_blank')}
                          className="text-[#25D366] hover:bg-[#25D366]/10 p-1 rounded transition-colors"
                        >
                          <MessageCircle className="size-4" />
                        </button>
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Delivery Address</p>
                      <p className="font-medium mt-1">{viewOrder.customer_address} - {viewOrder.customer_pincode}</p>
                    </div>
                  </div>
                </section>

                {/* Items */}
                <section>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Order Items</h3>
                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="divide-y divide-border">
                      {viewOrder.items?.map((item: any, i: number) => (
                        <div key={i} className="p-4 flex gap-4 items-center">
                          <div className="h-16 w-16 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                            <Package className="size-6 text-muted-foreground/50" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold">{item.name}</h4>
                            <p className="text-xs text-muted-foreground">{item.size || "Default Size"} × Qty: {item.quantity || item.qty || 1}</p>
                          </div>
                          <div className="text-right font-bold">
                            {inr((item.price || item.mrp || 0) * (item.quantity || item.qty || 1))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-5 bg-muted/30 border-t border-border space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold">{inr(viewOrder.subtotal)}</span></div>
                      {viewOrder.discount_amount > 0 && (
                        <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{inr(viewOrder.discount_amount)}</span></div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-border border-dashed text-lg font-extrabold">
                        <span>Total Paid</span><span className="text-primary">{inr(viewOrder.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Actions */}
                <section className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Update Status</h3>
                  
                  {showCancelDialog ? (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
                      <textarea 
                        value={cancelReason}
                        onChange={e => setCancelReason(e.target.value)}
                        placeholder="Reason for cancellation..."
                        className="w-full rounded-xl border border-border bg-background p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button variant="destructive" onClick={() => updateStatus(viewOrder.id, "Cancelled", cancelReason)} className="rounded-xl flex-1">Confirm Cancel</Button>
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)} className="rounded-xl flex-1">Keep Order</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.filter(s => s !== "Cancelled").map(s => (
                        <Button 
                          key={s} 
                          variant={viewOrder.status === s ? "default" : "outline"}
                          onClick={() => updateStatus(viewOrder.id, s)}
                          className="rounded-xl"
                        >
                          {s}
                        </Button>
                      ))}
                      <Button 
                        variant="destructive" 
                        onClick={() => setShowCancelDialog(true)}
                        className="rounded-xl ml-auto"
                      >
                        Cancel Order
                      </Button>
                    </div>
                  )}
                </section>
              </div>

              <div className="p-6 border-t border-border bg-card flex gap-4">
                <Button variant="outline" onClick={() => window.print()} className="rounded-xl flex-1 gap-2 text-foreground font-semibold">
                  <Printer className="size-4" /> Print Order
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
