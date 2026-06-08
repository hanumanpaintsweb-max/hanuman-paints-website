"use client"

import { FileText } from "lucide-react"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-muted/30 pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileText className="size-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Terms of Service</h1>
          <p className="mt-4 text-lg text-muted-foreground">Rules and guidelines for ordering from Hanuman Paints.</p>
        </div>

        <div className="prose prose-slate max-w-none rounded-3xl bg-card border border-border/60 p-8 shadow-sm">
          <h3>1. Payment Terms</h3>
          <p>Currently, we exclusively support <strong>Cash on Delivery (COD)</strong>. You only pay when the paint is delivered to your doorstep. Please ensure exact change if possible.</p>

          <h3>2. Delivery Policy</h3>
          <p>We process and deliver orders within <strong>1 to 3 business days</strong> strictly within Madhubani and its nearby localities. In case of unexpected delays due to weather or stock issues, we will notify you via WhatsApp.</p>

          <h3>3. Order Cancellation</h3>
          <p>You can cancel your order any time before it is marked as &quot;Out for Delivery&quot;. To cancel, please message us on WhatsApp with your Order ID. Repeated cancellations may result in your phone number being restricted from placing future online orders.</p>

          <h3>4. Dispute Resolution</h3>
          <p>Any disputes or concerns regarding products, pricing, or delivery should be addressed directly to our customer support. If a resolution cannot be reached mutually, disputes shall be subject to the exclusive jurisdiction of the courts in Madhubani, Bihar.</p>
        </div>
      </div>
    </div>
  )
}
