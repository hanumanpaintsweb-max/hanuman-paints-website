import { SiteShell } from "@/components/site/site-shell"
import { ProductDetail } from "@/components/site/product-detail"
import { PRODUCTS } from "@/data/products"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({
    id: p.id.toString(),
  }))
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const product = PRODUCTS.find((p) => p.id.toString() === params.id)
  if (!product) return { title: "Not Found" }
  return {
    title: `${product.name} | Hanuman Paints`,
    description: product.description,
  }
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = PRODUCTS.find((p) => p.id.toString() === params.id)
  
  if (!product) {
    notFound()
  }

  return (
    <SiteShell>
      <ProductDetail product={product} />
    </SiteShell>
  )
}
