import { Suspense } from "react"
import { SiteShell } from "@/components/site/site-shell"
import { ProductsBrowser } from "@/components/site/products-browser"

export const metadata = {
  title: "Products | Hanuman Paints",
  description: "Browse all Dulux paints and products from Hanuman Paints.",
}

export default function ProductsPage() {
  return (
    <SiteShell>
      <Suspense fallback={<div className="flex h-[50vh] items-center justify-center">Loading products...</div>}>
        <ProductsBrowser />
      </Suspense>
    </SiteShell>
  )
}
