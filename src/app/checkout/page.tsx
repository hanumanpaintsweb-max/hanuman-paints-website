"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { CheckCircle, Truck, ShoppingBag, Tag, X, Loader2 } from "lucide-react"
import confetti from "canvas-confetti"

import { useCart } from "@/context/CartContext"
import { inr } from "@/lib/format"
import { supabase } from "@/services/supabase"
import { SiteShell } from "@/components/site/site-shell"
import { Button } from "@/components/ui/button"

const INITIAL = { name: "", phone: "", address: "", pincode: "" }

export default function CheckoutPage() {
  const { items, subtotal, discountAmount, total, clearCart, DISCOUNT_PERCENT } = useCart()
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [ordered, setOrdered] = useState(false)
  const [orderId, setOrderId] = useState("")

  // Coupon State
  const [couponCode, setCouponCode] = useState("")
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponData, setCouponData] = useState<any>(null)
  const [couponError, setCouponError] = useState("")
  const [animating, setAnimating] = useState(false)

  // Trigger confetti and scroll to top when ordered becomes true
  useEffect(() => {
    if (ordered) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now()
        if (timeLeft <= 0) return clearInterval(interval)

        const particleCount = 50 * (timeLeft / duration)
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random() - 0.2, y: Math.random() - 0.2 } }))
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random() + 0.2, y: Math.random() - 0.2 } }))
      }, 250)
      return () => clearInterval(interval)
    }
  }, [ordered])

  const couponDiscountAmount = (() => {
    if (!couponApplied || !couponData) return 0
    let discount = 0
    if (couponData.coupon_type === "percentage" || couponData.coupon_type === "first_order") {
      discount = Math.round((total * couponData.discount_value) / 100)
    } else if (couponData.coupon_type === "free_delivery") {
      return 0 // Free delivery handled separately if there was a delivery charge
    } else {
      discount = couponData.discount_value
    }
    if (couponData.max_discount_cap && discount > couponData.max_discount_cap) {
      discount = couponData.max_discount_cap
    }
    return Math.min(discount, total)
  })()

  const finalTotal = Math.max(0, total - couponDiscountAmount)

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = couponCode.trim().toUpperCase()
    if (!code) return

    setCouponLoading(true)
    setCouponError("")

    const { data, error } = await supabase.from("coupons").select("*").eq("code", code).single()
    setCouponLoading(false)

    if (error || !data) {
      setCouponError("Invalid coupon code. Please check and try again.")
      return
    }

    if (!data.is_active) {
      setCouponError("This coupon is no longer active.")
      return
    }

    const today = new Date().toISOString().split("T")[0]
    if (data.valid_from && today < data.valid_from) {
      setCouponError(`This coupon is valid from ${data.valid_from}.`)
      return
    }
    if (data.valid_until && today > data.valid_until) {
      setCouponError("This coupon has expired.")
      return
    }

    if (data.min_order_amount && total < data.min_order_amount) {
      setCouponError(`Minimum order amount ${inr(data.min_order_amount)} required for this coupon.`)
      return
    }

    if (data.usage_limit !== null && data.used_count >= data.usage_limit) {
      setCouponError("This coupon has reached its usage limit.")
      return
    }

    setCouponData(data)
    setCouponApplied(true)
    setCouponError("")
    setAnimating(true)
    setTimeout(() => setAnimating(false), 600)
  }

  const handleRemoveCoupon = () => {
    setCouponApplied(false)
    setCouponData(null)
    setCouponCode("")
    setCouponError("")
  }

  const validate = () => {
    const e: Record<string, string> = {}
    
    const sanitizedName = form.name.replace(/[^a-zA-Z\s]/g, '').trim();
    if (!sanitizedName || sanitizedName.length < 2) e.name = "Valid name required (letters only)"
    
    const sanitizedPhone = form.phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(sanitizedPhone)) e.phone = "Valid 10-digit number required"
    
    if (!form.address.trim()) e.address = "Address required"
    
    const sanitizedPincode = form.pincode.replace(/\D/g, '');
    if (!/^\d{6}$/.test(sanitizedPincode)) e.pincode = "Valid 6-digit pincode required"
    
    return e
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let value = e.target.value;
    
    if (e.target.name === 'phone' || e.target.name === 'pincode') {
      value = value.replace(/\D/g, '');
    } else if (e.target.name === 'name') {
      value = value.replace(/[^a-zA-Z\s]/g, '');
    }

    setForm((f) => ({ ...f, [e.target.name]: value }))
    setErrors((err) => ({ ...err, [e.target.name]: "" }))
  }

  const handleConfirm = async () => {
    const e = validate()
    if (Object.keys(e).length) {
      setErrors(e)
      return
    }

    setLoading(true)
    const oid = "HP" + Date.now().toString().slice(-6)

    const sanitizedName = form.name.replace(/[^a-zA-Z\s]/g, '').trim();
    const sanitizedPhone = form.phone.replace(/\D/g, '');
    const sanitizedPincode = form.pincode.replace(/\D/g, '');
    const sanitizedAddress = form.address.trim();

    // Validate per_customer_limit before placing order
    if (couponApplied && couponData && couponData.per_customer_limit) {
      const { count, error: countErr } = await supabase
        .from("coupon_usage")
        .select("*", { count: "exact", head: true })
        .eq("coupon_id", couponData.id)
        .eq("customer_phone", sanitizedPhone)
      
      if (countErr) {
        alert("Coupon validation failed. Please try again.")
        setLoading(false)
        return
      }
      
      if (count !== null && count >= couponData.per_customer_limit) {
        alert(`You have already used this coupon the maximum allowed times (${couponData.per_customer_limit}).`)
        setLoading(false)
        return
      }
    }

    const { error } = await supabase.from("orders").insert([
      {
        order_id: oid,
        customer_name: sanitizedName,
        customer_phone: sanitizedPhone,
        customer_address: sanitizedAddress,
        customer_pincode: sanitizedPincode,
        items: items,
        subtotal: subtotal,
        discount_amount: discountAmount + couponDiscountAmount,
        total_amount: finalTotal,
        status: "Order Received",
        coupon_code: couponApplied ? couponData.code : null,
        coupon_discount: couponDiscountAmount,
      },
    ])

    if (error) {
      alert("Failed to place order. Please try again.")
      setLoading(false)
      return
    }

    if (couponApplied && couponData) {
      await supabase
        .from("coupons")
        .update({ used_count: (couponData.used_count || 0) + 1 })
        .eq("id", couponData.id)
        
      await supabase
        .from("coupon_usage")
        .insert([{
          coupon_id: couponData.id,
          coupon_code: couponData.code,
          customer_phone: sanitizedPhone,
          customer_name: sanitizedName,
          order_id: oid,
          discount_amount: couponDiscountAmount
        }])
    }

    setOrderId(oid)
    try {
      const recentOrders = JSON.parse(localStorage.getItem("hanuman_recent_orders") || "[]")
      if (!recentOrders.includes(oid)) {
        recentOrders.unshift(oid)
        localStorage.setItem("hanuman_recent_orders", JSON.stringify(recentOrders.slice(0, 10)))
      }
    } catch {
    }

    clearCart()
    setOrdered(true)
    setLoading(false)
  }

  if (ordered) {
    return (
      <SiteShell>
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 pt-20 pb-16 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="mb-6 flex size-24 items-center justify-center rounded-full bg-emerald-100 shadow-[0_10px_25px_-5px_rgba(22,163,74,0.4)]"
          >
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16A34A"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                d="M20 6L9 17l-5-5"
              />
            </motion.svg>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-2 text-3xl font-extrabold tracking-tight text-foreground"
          >
            Order Placed! 🎉
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-2 text-muted-foreground"
          >
            Order ID: <strong className="text-primary">#{orderId}</strong>
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-8 max-w-sm text-sm leading-relaxed text-muted-foreground"
          >
            Aapka order receive ho gaya! Hum jald hi confirm karenge. Payment delivery par hogi. 🙏
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex w-full max-w-xs flex-col gap-3"
          >
            <Button asChild size="lg" className="rounded-xl">
              <Link href="/track-order">Track Order</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl">
              <Link href="/">Go Home</Link>
            </Button>
          </motion.div>
        </div>
      </SiteShell>
    )
  }

  if ((items as any[]).length === 0) {
    return (
      <SiteShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <div className="mb-6 rounded-full bg-muted p-6">
            <ShoppingBag className="size-16 text-muted-foreground/50" />
          </div>
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">Your cart is empty</h2>
          <p className="mb-8 max-w-[300px] text-muted-foreground text-balance">
            Cannot checkout with an empty cart.
          </p>
          <Button asChild size="lg" className="rounded-xl px-8">
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </SiteShell>
    )
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 pt-28 pb-32 sm:px-6 sm:pt-32">
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>›</span>
          <Link href="/cart" className="hover:text-foreground">Cart</Link>
          <span>›</span>
          <span className="font-semibold text-foreground">Checkout</span>
        </div>
        
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Place Your Order
        </h1>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
          {/* Left side (Form & Payment) */}
          <div className="flex-1 space-y-6">
            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-foreground">
                <Truck className="size-5 text-primary" /> Delivery Details
              </h2>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Full Name <span className="text-destructive">*</span></label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Raju Sharma"
                    className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone <span className="text-destructive">*</span></label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    maxLength={10}
                    inputMode="numeric"
                    className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <label className="text-sm font-medium text-foreground">Full Address <span className="text-destructive">*</span></label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="123, Main Road, Near Hanuman Mandir, City, State"
                  className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
              </div>

              <div className="mt-6 max-w-[200px] space-y-2">
                <label className="text-sm font-medium text-foreground">Pincode <span className="text-destructive">*</span></label>
                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="110001"
                  maxLength={6}
                  inputMode="numeric"
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.pincode && <p className="text-xs text-destructive">{errors.pincode}</p>}
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
              <h2 className="mb-4 text-xl font-bold text-foreground">Payment Method</h2>
              <div className="flex items-center justify-between rounded-2xl border-2 border-primary bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-5 items-center justify-center rounded-full border-2 border-primary bg-primary">
                    <div className="size-2 rounded-full bg-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Cash on Delivery</div>
                    <div className="text-sm text-muted-foreground">Pay when your order arrives</div>
                  </div>
                </div>
                <span className="rounded-lg bg-primary px-2.5 py-1 text-xs font-bold tracking-wider text-primary-foreground">
                  COD
                </span>
              </div>
            </div>

            <div className="hidden lg:block">
              <Button
                onClick={handleConfirm}
                disabled={loading}
                size="lg"
                className="w-full gap-2 rounded-xl text-lg shadow-lg shadow-primary/25"
              >
                {loading && <Loader2 className="size-5 animate-spin" />}
                {loading ? "Placing Order..." : `Confirm Order · ${inr(finalTotal)}`}
              </Button>
            </div>
          </div>

          {/* Right side (Order Summary) */}
          <div className="sticky top-28 w-full shrink-0 lg:w-[420px]">
            <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 bg-muted/50 px-6 py-5">
                <h3 className="font-semibold text-foreground">
                  Order Summary <span className="text-muted-foreground">({(items as any[]).length})</span>
                </h3>
                <span className="text-xl font-bold text-primary">{inr(finalTotal)}</span>
              </div>

              <div className="max-h-[360px] overflow-y-auto px-6 py-4">
                {(items as any[]).map((item: any) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="mb-4 flex items-center gap-4 last:mb-0">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted p-1">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="size-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-foreground">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.selectedSize} × {item.quantity}
                      </div>
                    </div>
                    <div className="shrink-0 text-sm font-bold text-foreground">
                      {inr(item.mrp * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="border-t border-border/60 bg-muted/30 px-6 py-5">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Tag className="size-4 text-primary" /> Have a Coupon Code?
                </h4>
                
                <AnimatePresence mode="popLayout">
                  {!couponApplied ? (
                    <motion.form
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleApplyCoupon}
                      className="space-y-2"
                    >
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase())
                            setCouponError("")
                          }}
                          placeholder="Enter code e.g. SUNDAY10"
                          className="flex h-10 w-full flex-1 uppercase rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:normal-case focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                        <Button type="submit" disabled={couponLoading || !couponCode.trim()} className="h-10 rounded-xl px-5">
                          {couponLoading ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
                        </Button>
                      </div>
                      {couponError && <p className="text-xs text-destructive">{couponError}</p>}
                    </motion.form>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 ${
                        animating ? "scale-[1.02] transition-transform" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="size-5 text-emerald-600 dark:text-emerald-500" />
                        <div>
                          <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                            {couponData?.code} Applied!
                          </div>
                          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-500/80">
                            You save {inr(couponDiscountAmount)}
                            {couponData?.coupon_type === "percentage" || couponData?.coupon_type === "first_order" ? ` (${couponData.discount_value}% off)` : ""}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-500"
                        aria-label="Remove coupon"
                      >
                        <X className="size-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Price breakdown */}
              <div className="border-t border-border/60 px-6 py-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">MRP Total</span>
                  <span className="font-semibold text-foreground">{inr(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600 dark:text-emerald-500">Website Discount ({DISCOUNT_PERCENT}%)</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-500">−{inr(discountAmount)}</span>
                </div>
                {couponApplied && couponData && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 dark:text-emerald-500">Coupon ({couponData.code})</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-500">−{inr(couponDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-500">FREE</span>
                </div>
                
                <div className="my-4 h-px w-full bg-border" />
                
                <div className="flex items-end justify-between">
                  <span className="text-base font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold tracking-tight text-primary">{inr(finalTotal)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 lg:hidden">
              <Button
                onClick={handleConfirm}
                disabled={loading}
                size="lg"
                className="w-full gap-2 rounded-xl text-lg shadow-lg shadow-primary/25"
              >
                {loading && <Loader2 className="size-5 animate-spin" />}
                {loading ? "Wait..." : `Confirm Order · ${inr(finalTotal)}`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  )
}
