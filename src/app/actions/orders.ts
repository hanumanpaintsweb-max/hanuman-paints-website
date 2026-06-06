"use server"

import { supabase } from "@/services/supabase"

const NAME_PATTERN = /^[A-Za-z .'-]{2,100}$/
const PHONE_PATTERN = /^[6-9]\d{9}$/
const PINCODE_PATTERN = /^\d{6}$/

export type CheckoutItem = {
  id: string
  name: string
  selectedSize?: string
  size?: string
  mrp: number
  quantity: number
  image?: string
  category?: string
}

type CouponRecord = {
  id: string
  code: string
  coupon_type: "percentage" | "first_order" | "free_delivery" | "fixed" | string
  discount_value: number
  max_discount_cap: number | null
  min_order_amount: number | null
  usage_limit: number | null
  used_count: number | null
  per_customer_limit: number | null
  is_active: boolean
  valid_from: string | null
  valid_until: string | null
}

export type PlaceOrderInput = {
  name: string
  phone: string
  address: string
  pincode: string
  items: CheckoutItem[]
  subtotal: number
  discountAmount: number
  total: number
  couponCode?: string
}

type PlaceOrderResult =
  | { success: true; orderId: string }
  | { success: false; field?: "name" | "phone" | "address" | "pincode" | "coupon"; message: string }

function cleanName(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

function cleanPhone(value: string) {
  return value.replace(/\D/g, "")
}

function cleanAddress(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

function validateCheckoutInput(input: PlaceOrderInput) {
  const name = cleanName(input.name)
  const phone = cleanPhone(input.phone)
  const pincode = cleanPhone(input.pincode)
  const address = cleanAddress(input.address)

  if (!NAME_PATTERN.test(name)) {
    return { error: { field: "name" as const, message: "Name must be 2-100 characters and use letters, spaces, apostrophe, dot, or dash only." } }
  }

  if (!PHONE_PATTERN.test(phone)) {
    return { error: { field: "phone" as const, message: "Phone must be a 10-digit Indian mobile number starting with 6-9." } }
  }

  if (!PINCODE_PATTERN.test(pincode)) {
    return { error: { field: "pincode" as const, message: "Pincode must be exactly 6 digits." } }
  }

  if (!address || address.length > 500) {
    return { error: { field: "address" as const, message: "Address is required and must be under 500 characters." } }
  }

  const items = input.items
    .filter((item) => item.id && item.name && item.quantity > 0 && item.mrp >= 0)
    .map((item) => ({
      id: item.id,
      name: item.name.slice(0, 200),
      selectedSize: item.selectedSize || item.size || "",
      size: item.size || item.selectedSize || "",
      mrp: Number(item.mrp),
      quantity: Number(item.quantity),
      image: item.image || null,
      category: item.category || null,
    }))

  if (items.length === 0) {
    return { error: { field: undefined, message: "Cart is empty." } }
  }

  return { value: { name, phone, pincode, address, items } }
}

function calculateCouponDiscount(coupon: CouponRecord, total: number) {
  if (coupon.coupon_type === "free_delivery") return 0

  const rawDiscount =
    coupon.coupon_type === "percentage" || coupon.coupon_type === "first_order"
      ? Math.round((total * Number(coupon.discount_value || 0)) / 100)
      : Number(coupon.discount_value || 0)

  const cappedDiscount =
    coupon.max_discount_cap !== null && rawDiscount > coupon.max_discount_cap
      ? coupon.max_discount_cap
      : rawDiscount

  return Math.max(0, Math.min(cappedDiscount, total))
}

async function validateCoupon(code: string, total: number): Promise<
  | { coupon: CouponRecord; discount: number }
  | { error: string }
> {
  const cleanCode = code.trim().toUpperCase()
  if (!cleanCode) return { error: "Coupon code is invalid." }

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", cleanCode)
    .single<CouponRecord>()

  if (error || !data) return { error: "Invalid coupon code." }
  if (!data.is_active) return { error: "This coupon is no longer active." }

  const today = new Date().toISOString().split("T")[0]
  if (data.valid_from && today < data.valid_from) return { error: `This coupon is valid from ${data.valid_from}.` }
  if (data.valid_until && today > data.valid_until) return { error: "This coupon has expired." }
  if (data.min_order_amount && total < data.min_order_amount) {
    return { error: `Minimum order amount ${data.min_order_amount} required for this coupon.` }
  }
  if (data.usage_limit !== null && Number(data.used_count || 0) >= data.usage_limit) {
    return { error: "This coupon has reached its usage limit." }
  }

  return { coupon: data, discount: calculateCouponDiscount(data, total) }
}

export async function placeCheckoutOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const validation = validateCheckoutInput(input)
  if ("error" in validation && validation.error) {
    return { success: false, field: validation.error.field, message: validation.error.message }
  }

  const { name, phone, pincode, address, items } = validation.value
  const oid = `HP${Date.now().toString().slice(-6)}`
  let coupon: CouponRecord | null = null
  let couponDiscount = 0
  let couponReserved = false

  if (input.couponCode) {
    const result = await validateCoupon(input.couponCode, input.total)
    if ("error" in result) {
      return { success: false, field: "coupon", message: result.error }
    }

    coupon = result.coupon
    couponDiscount = result.discount

    const { error: usageError } = await supabase
      .from("coupon_usage")
      .insert([{
        coupon_id: coupon.id,
        coupon_code: coupon.code,
        customer_phone: phone,
        customer_name: name,
        order_id: oid,
        discount_amount: couponDiscount,
      }])

    if (usageError) {
      return {
        success: false,
        field: "coupon",
        message: usageError.code === "23505"
          ? "You have already used this coupon."
          : "Coupon validation failed. Please try again.",
      }
    }

    couponReserved = true
  }

  const { error: orderError } = await supabase.from("orders").insert([
    {
      order_id: oid,
      customer_name: name,
      customer_phone: phone,
      customer_address: address,
      customer_pincode: pincode,
      items,
      subtotal: input.subtotal,
      discount_amount: input.discountAmount + couponDiscount,
      total_amount: Math.max(0, input.total - couponDiscount),
      status: "Order Received",
      coupon_code: coupon?.code ?? null,
      coupon_discount: couponDiscount,
    },
  ])

  if (orderError) {
    if (couponReserved && coupon) {
      await supabase
        .from("coupon_usage")
        .delete()
        .eq("coupon_id", coupon.id)
        .eq("customer_phone", phone)
        .eq("order_id", oid)
    }

    return { success: false, message: "Failed to place order. Please try again." }
  }

  if (coupon) {
    await supabase
      .from("coupons")
      .update({ used_count: Number(coupon.used_count || 0) + 1 })
      .eq("id", coupon.id)
  }

  return { success: true, orderId: oid }
}
