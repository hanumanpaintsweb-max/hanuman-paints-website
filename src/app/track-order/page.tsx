"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { PackageSearch, PackageCheck, AlertCircle, ShoppingBag, Clock, CheckCircle2, Loader2 } from "lucide-react"

import { supabase } from "@/services/supabase"
import { inr } from "@/lib/format"
import { SiteShell } from "@/components/site/site-shell"
import { Button } from "@/components/ui/button"

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: any }> = {
  "Order Received": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-500", icon: Clock },
  "Accepted": { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-500", icon: CheckCircle2 },
  "Out for Delivery": { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-500", icon: PackageSearch },
  "Delivered": { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-500", icon: PackageCheck },
  "Cancelled": { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-500", icon: AlertCircle },
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("")
  const [loading, setLoading] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)
  const [error, setError] = useState("")
  const [recentOrders, setRecentOrders] = useState<string[]>([])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("hanuman_recent_orders") || "[]")
      setRecentOrders(saved)
      if (saved.length > 0 && !orderId) {
        setOrderId(saved[0])
      }
    } catch (e) {
      console.error(e)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTrack = async (e?: React.FormEvent, idToTrack = orderId) => {
    if (e) e.preventDefault()
    if (!idToTrack.trim()) return

    setLoading(true)
    setError("")
    setOrderData(null)
    setOrderId(idToTrack)

    const { data, error: rpcError } = await supabase.rpc("get_order_by_id", {
      search_id: idToTrack.trim().toUpperCase(),
    })

    if (rpcError) {
      console.error(rpcError)
      setError("An error occurred while fetching the order. Please try again later.")
    } else if (data && data.length > 0) {
      setOrderData(data[0])

      setRecentOrders((prev) => {
        const updated = [
          idToTrack.trim().toUpperCase(),
          ...prev.filter((id) => id !== idToTrack.trim().toUpperCase()),
        ].slice(0, 10)
        localStorage.setItem("hanuman_recent_orders", JSON.stringify(updated))
        return updated
      })
    } else {
      setError("Order not found. Please check your Order ID and try again.")
    }

    setLoading(false)
  }

  const StatusIcon = orderData ? (STATUS_COLORS[orderData.status]?.icon || Clock) : Clock
  const statusColors = orderData ? STATUS_COLORS[orderData.status] : null

  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-4 pt-28 pb-32 sm:px-6 sm:pt-32">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <PackageSearch className="size-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Track Order</h1>
          <p className="mt-2 text-muted-foreground">Enter your Order ID to see live updates</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleTrack} className="mb-8 flex gap-3">
          <input
            type="text"
            placeholder="Order ID (e.g. HP1234)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
            className="flex h-12 w-full flex-1 uppercase rounded-xl border border-input bg-background px-4 py-2 text-base ring-offset-background placeholder:normal-case focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <Button type="submit" disabled={loading} size="lg" className="h-12 rounded-xl px-8">
            {loading ? <Loader2 className="size-5 animate-spin" /> : "Track"}
          </Button>
        </form>

        {/* Recent Orders Chips */}
        {!orderData && recentOrders.length > 0 && (
          <div className="mb-10">
            <p className="mb-3 text-sm font-semibold text-muted-foreground">Recent Orders</p>
            <div className="flex flex-wrap gap-2">
              {recentOrders.map((id) => (
                <button
                  key={id}
                  onClick={() => handleTrack(undefined, id)}
                  className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <ShoppingBag className="size-4" /> #{id}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <div>
              <div className="font-semibold">Oops!</div>
              <div className="mt-1 text-sm">{error}</div>
            </div>
          </div>
        )}

        {/* Order Details UI */}
        {orderData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm"
          >
            {/* Header / Status */}
            <div className="border-b border-border/60 bg-muted/30 px-6 py-6 sm:px-8">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground">ORDER ID</div>
                  <div className="text-xl font-bold text-foreground sm:text-2xl">#{orderData.order_id}</div>
                </div>
                <div className="text-right">
                  <div className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground">DATE</div>
                  <div className="text-sm font-semibold text-foreground sm:text-base">
                    {new Date(orderData.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              {statusColors && (
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${statusColors.bg} ${statusColors.text}`}
                >
                  <StatusIcon className="size-4" />
                  {orderData.status}
                </div>
              )}
            </div>

            {/* Items List */}
            {orderData.items && orderData.items.length > 0 && (
              <div className="px-6 py-6 sm:px-8">
                <h3 className="mb-4 text-sm font-bold text-foreground">Order Items</h3>
                <div className="space-y-4">
                  {orderData.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted p-1 sm:size-16">
                        <img
                          src={item.imageUrl || item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="size-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 truncate text-sm font-semibold text-foreground">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.selectedSize} × {item.quantity}
                        </div>
                      </div>
                      <div className="shrink-0 text-sm font-bold text-foreground">
                        {inr((item.discounted || item.mrp) * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="bg-foreground px-6 py-6 text-background sm:px-8">
              <div className="mb-3 flex justify-between text-sm text-background/80">
                <span>Customer</span>
                <span className="font-medium text-background">{orderData.customer_name}</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-background/20 pt-4">
                <span className="font-semibold sm:text-lg">Total (Cash on Delivery)</span>
                <span className="text-xl font-bold text-primary sm:text-2xl">
                  {inr(orderData.total_amount)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </SiteShell>
  )
}
