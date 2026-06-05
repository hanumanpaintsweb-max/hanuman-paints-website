"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/site/product-card"
import { useEffect, useState } from "react"
import { getProducts } from "@/services/productService"

export function PopularProducts() {
  const [featured, setFeatured] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      try {
        const data = await getProducts()
        if (data) {
          const popularList = data.filter((p: any) => p.popular).slice(0, 4)
          setFeatured(popularList.length ? popularList : data.slice(0, 4))
        }
      } catch (err) {}
    }
    load()
  }, [])

  return (
    <section id="products" className="bg-muted/40 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Trending now</p>
            <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Popular products
            </h2>
          </div>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/products">View all products</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
