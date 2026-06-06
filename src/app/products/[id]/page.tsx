import { SiteShell } from "@/components/site/site-shell"
import { ProductDetail } from "@/components/site/product-detail"
import { getProducts, getProductById } from "@/services/productService"
import { notFound } from "next/navigation"

export async function generateStaticParams() {
  try {
    const products = await getProducts()
    return products.map((p: { id: string | number }) => ({
      id: p.id.toString(),
    }))
  } catch (e) {
    return []
  }
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const product = await getProductById(params.id)
    if (!product) return { title: "Not Found" }
    return {
      title: `${product.name} | Hanuman Paints`,
      description: product.description,
    }
  } catch (e) {
    return { title: "Not Found" }
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  let product = null
  try {
    product = await getProductById(params.id)
  } catch (e) {
    // ignore
  }
  
  if (!product) {
    notFound()
  }

  return (
    <SiteShell>
      <ProductDetail product={product} />
    </SiteShell>
  )
}
