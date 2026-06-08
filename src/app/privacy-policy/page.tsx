"use client"

import { Shield } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-muted/30 pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Shield className="size-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-lg text-muted-foreground">Last updated: June 2026</p>
        </div>

        <div className="prose prose-slate max-w-none rounded-3xl bg-card border border-border/60 p-8 shadow-sm">
          <h3>1. Information We Collect</h3>
          <p>We only collect information necessary to process and deliver your orders. This includes:</p>
          <ul>
            <li><strong>Name:</strong> To address you correctly.</li>
            <li><strong>Phone Number:</strong> For order updates via WhatsApp and delivery coordination.</li>
            <li><strong>Address & Pincode:</strong> To deliver products to your location in Madhubani.</li>
            <li><strong>Order History:</strong> To provide you with past order details and better service.</li>
          </ul>

          <h3>2. How We Use Your Information</h3>
          <p>Your information is strictly used for order processing, delivery, and customer support. We may occasionally send you WhatsApp messages regarding your order status or special store offers.</p>

          <h3>3. Zero Third-Party Sharing</h3>
          <p>We respect your privacy. <strong>We do not sell, rent, or share your personal data with any third-party marketing agencies or companies.</strong> Your data stays securely with Hanuman Paints.</p>

          <h3>4. Data Deletion</h3>
          <p>If you wish to delete your account or any data associated with your orders, please contact us on WhatsApp at <strong>+91 9999999999</strong> (replace with actual shop number) with your request, and we will remove your information from our database.</p>
        </div>
      </div>
    </div>
  )
}
