"use client"

import { RefreshCcw } from "lucide-react"

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-muted/30 pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <RefreshCcw className="size-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Refund & Return Policy</h1>
          <p className="mt-4 text-lg text-muted-foreground">Clear policies for peace of mind.</p>
        </div>

        <div className="prose prose-slate max-w-none rounded-3xl bg-card border border-border/60 p-8 shadow-sm">
          <h3>1. Damaged Products</h3>
          <p>If you receive a damaged product (e.g., leaking bucket, broken seal), we offer a <strong>full refund or replacement</strong>. Please inspect your items at the time of delivery before handing over the cash. Once accepted, damage claims become difficult to process.</p>

          <h3>2. Wrong Products Delivered</h3>
          <p>If we accidentally deliver the wrong paint color, base, or finish, we will arrange a <strong>free replacement</strong>. Do not open the seal of the wrong product.</p>

          <h3>3. Process for Returns</h3>
          <p>To initiate a return or replacement, please contact us on WhatsApp immediately at <strong>+91 9999999999</strong> (replace with actual shop number). Send us your Order ID along with clear photos of the damaged/wrong item.</p>

          <h3>4. Timeline</h3>
          <p>Once your return/replacement request is approved, we will arrange for pickup and deliver the correct item within <strong>3 to 5 business days</strong>.</p>

          <h3>5. Note on Mixed Colors</h3>
          <p>Paints that are custom-tinted to specific shades cannot be returned or refunded unless there is a manufacturing defect or damage during transit.</p>
        </div>
      </div>
    </div>
  )
}
