"use client"

import { useState } from "react"
import { SiteShell } from "@/components/site/site-shell"
import { motion } from "motion/react"
import { Phone, Search, Package, Loader2, IndianRupee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/services/supabase"
import { inr } from "@/lib/format"
import { toast } from "sonner"

export default function MyOrdersPage() {
  const [phone, setPhone] = useState("")
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    const cleanPhone = phone.replace(/\D/g, "")
    if (cleanPhone.length < 10) {
      toast.error("Invalid Phone Number", { description: "Please enter a valid 10-digit phone number." })
      return
    }

    setLoading(true)
    setSearched(true)

    // Query supabase for orders matching the phone number
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .ilike("customer_phone", `%${cleanPhone.slice(-10)}%`) // Match last 10 digits
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
      toast.error("Error fetching orders")
    } else {
      setOrders(data || [])
    }
    
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Order Received": return "text-amber-600 bg-amber-100"
      case "Accepted": return "text-blue-600 bg-blue-100"
      case "Out for Delivery": return "text-purple-600 bg-purple-100"
      case "Delivered": return "text-emerald-600 bg-emerald-100"
      case "Cancelled": return "text-red-600 bg-red-100"
      default: return "bg-muted text-muted-foreground"
    }
  }

  return (
    <SiteShell>
      <div className="min-h-[80vh] bg-muted/20 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Track Your Orders
            </h1>
            <p className="mt-4 text-muted-foreground">
              Enter your mobile number to view the status of all your recent orders.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-10 overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8"
          >
            <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Phone className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="Enter your 10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-border bg-background pl-12 pr-4 text-lg font-medium text-foreground outline-none ring-primary transition-all focus:ring-2"
                />
              </div>
              <Button type="submit" disabled={loading} className="h-14 rounded-2xl px-8 text-lg font-bold gap-2">
                {loading ? <Loader2 className="size-5 animate-spin" /> : <Search className="size-5" />}
                Find Orders
              </Button>
            </form>
          </motion.div>

          {searched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {loading ? (
                <div className="flex h-40 flex-col items-center justify-center space-y-4">
                  <Loader2 className="size-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Fetching your orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex h-60 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 text-center">
                  <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                    <Package className="size-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">No Orders Found</h3>
                  <p className="mt-2 max-w-sm text-muted-foreground">
                    We couldn't find any orders linked to this number. Please check the number and try again.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {orders.map((order, idx) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="p-6">
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Order ID</p>
                            <p className="font-mono text-lg font-bold text-foreground">#{order.order_id}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        
                        <div className="mb-6">
                          <p className="text-sm text-muted-foreground">
                            Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { 
                              day: "numeric", month: "long", year: "numeric" 
                            })}
                          </p>
                        </div>

                        <div className="space-y-3">
                          {order.items?.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="flex-1 truncate font-medium text-foreground">
                                {item.quantity}x {item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-border/60 bg-muted/20 px-6 py-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-muted-foreground">Total Paid</span>
                          <span className="text-xl font-extrabold text-primary flex items-center">
                            {inr(order.total_amount)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </SiteShell>
  )
}
