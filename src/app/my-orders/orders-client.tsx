"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { Package, ChevronDown, ChevronUp, Clock, MapPin, Truck, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { inr } from "@/lib/format"

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case "order received": return "text-amber-600 bg-amber-100"
    case "accepted": return "text-blue-600 bg-blue-100"
    case "out for delivery": return "text-purple-600 bg-purple-100"
    case "delivered": return "text-emerald-600 bg-emerald-100"
    case "cancelled": return "text-red-600 bg-red-100"
    default: return "bg-muted text-muted-foreground"
  }
}

export interface OrderItem {
  quantity: number;
  product_name?: string;
  name?: string;
  size: string;
  price: number;
}

export interface Order {
  id: string;
  status: string;
  created_at: string;
  total_amount: number;
  order_items?: OrderItem[];
  items?: OrderItem[];
  customer_name: string;
  delivery_address: string;
}

export function OrdersClient({ orders }: { orders: Order[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (orders.length === 0) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 px-4 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
          <Package className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Abhi tak koi order nahi</h3>
        <p className="mt-2 text-muted-foreground">Looks like you haven&apos;t placed any orders yet.</p>
        <Button asChild className="mt-6 rounded-xl" size="lg">
          <Link href="/products">Shop Now</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">My Orders</h1>
      <div className="grid gap-6">
        {orders.map((order, idx) => {
          const isExpanded = expandedId === order.id
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm"
            >
              <div className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-mono text-lg font-bold text-foreground">#{order.id.slice(0, 8)}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(order.status)}`}>
                        {order.status || 'Pending'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <p className="text-xl font-bold text-primary">{inr(order.total_amount)}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      className="gap-2 rounded-xl"
                    >
                      View Details
                      {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </Button>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 border-t border-border/60 pt-6">
                        <div className="grid gap-8 sm:grid-cols-2">
                          <div>
                            <h4 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
                              <Package className="size-4" /> Items
                            </h4>
                            <div className="space-y-3">
                              {(order.order_items || order.items || []).map((item: OrderItem, i: number) => (
                                <div key={i} className="flex justify-between text-sm">
                                  <span className="text-foreground">
                                    <span className="font-semibold text-muted-foreground">{item.quantity}x</span>{" "}
                                    {item.product_name || item.name} ({item.size})
                                  </span>
                                  <span className="font-medium">{inr(item.price * item.quantity)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 flex justify-between border-t border-border/60 pt-3 text-sm font-bold">
                              <span>Total Breakdown</span>
                              <span className="text-primary">{inr(order.total_amount)}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-6">
                            <div>
                              <h4 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
                                <MapPin className="size-4" /> Delivery Address
                              </h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {order.customer_name}{"\n"}
                                {order.delivery_address}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
                                <Clock className="size-4" /> Timeline
                              </h4>
                              <div className="space-y-3 relative before:absolute before:inset-y-2 before:left-2 before:w-0.5 before:bg-border">
                                <div className="relative flex items-center gap-3">
                                  <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground z-10 ring-4 ring-card">
                                    <CheckCircle2 className="size-3" />
                                  </div>
                                  <span className="text-sm font-medium">Order Placed</span>
                                </div>
                                <div className={`relative flex items-center gap-3 ${order.status !== 'Pending' ? 'opacity-100' : 'opacity-40'}`}>
                                  <div className={`flex size-4 shrink-0 items-center justify-center rounded-full z-10 ring-4 ring-card ${order.status !== 'Pending' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <CheckCircle2 className="size-3" />
                                  </div>
                                  <span className="text-sm font-medium">Processing</span>
                                </div>
                                <div className={`relative flex items-center gap-3 ${order.status === 'Out for Delivery' || order.status === 'Delivered' ? 'opacity-100' : 'opacity-40'}`}>
                                  <div className={`flex size-4 shrink-0 items-center justify-center rounded-full z-10 ring-4 ring-card ${order.status === 'Out for Delivery' || order.status === 'Delivered' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <Truck className="size-3" />
                                  </div>
                                  <span className="text-sm font-medium">Out for Delivery</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
