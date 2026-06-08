import { Suspense } from "react"
import { SiteShell } from "@/components/site/site-shell"
import { ProductsBrowser } from "@/components/site/products-browser"
import { ProductsOffersStrip } from "@/components/offers/ProductsOffersStrip"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Buy Dulux Paints Online - Hanuman Paints Madhubani",
  description: "Browse our extensive collection of Dulux interior, exterior, enamel, and primer paints. Get 5% off on all online orders in Madhubani.",
}

export default function ProductsPage() {
  return (
    <SiteShell>
      <div className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <ProductsOffersStrip />
      </div>
      <Suspense fallback={<div className="flex h-[50vh] items-center justify-center">Loading products...</div>}>
        <ProductsBrowser />
      </Suspense>
    </SiteShell>
  )
}
