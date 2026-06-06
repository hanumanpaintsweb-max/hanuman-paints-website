"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { Filter, Search, SlidersHorizontal, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/site/product-card"
import { getProducts } from "@/services/productService"
import { inr } from "@/lib/format"

const sorts = [
  { id: "popular", label: "Most popular" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
]

const SIDEBAR_CATS = [
  { id: 'interior',      name: 'Interior Paints' },
  { id: 'exterior',      name: 'Exterior Paints' },
  { id: 'waterproofing', name: 'Waterproofing' },
  { id: 'mid-tier',      name: 'Mid-Tier Budget' },
  { id: 'woodcare',      name: 'Woodcare' },
  { id: 'enamels',       name: 'Enamels & Metal' },
  { id: 'primers',       name: 'Primers' },
  { id: 'distempers-putty', name: 'Distempers & Putty' },
  { id: 'tinters-stainers', name: 'Tinters & Stainers' },
  { id: 'accessories',   name: 'Accessories' },
]

export function ProductsBrowser() {
  const params = useSearchParams()
  const initialCat = params.get("category")
  const [activeCats, setActiveCats] = useState<string[]>(initialCat ? [initialCat] : [])
  const [query, setQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [sort, setSort] = useState("popular")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getProducts()
        setProducts(data || [])
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const toggleCat = (id: string) =>
    setActiveCats((prev) => (prev.includes(id) ? [] : [id]))

  const filtered = useMemo(() => {
    let list = products.filter((p: any) => {
      if (activeCats.length && !activeCats.includes(p.categoryId)) return false

      if (query && !`${p.name} ${p.subcategory || ""} ${p.category}`.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
    list = [...list].sort((a: any, b: any) => {
      const priceA = a.sizes[0]?.discounted || 0
      const priceB = b.sizes[0]?.discounted || 0
      if (sort === "price-asc") return priceA - priceB
      if (sort === "price-desc") return priceB - priceA
      return (b.popular ? 1 : 0) - (a.popular ? 1 : 0)
    })
    return list
  }, [activeCats, query, sort, products])

  const Filters = (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Category</h3>
        <div className="flex flex-col gap-2">
          {SIDEBAR_CATS.map((c) => (
            <label key={c.id} className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={activeCats.includes(c.id)}
                onChange={() => toggleCat(c.id)}
                className="size-4 accent-[var(--color-primary)]"
              />
              <span className="text-foreground">{c.name}</span>
            </label>
          ))}
        </div>
      </div>
      {activeCats.length > 0 && (
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => {
            setActiveCats([])
          }}
        >
          Clear filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 pt-36 pb-16 sm:px-6 sm:pt-40">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">All Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} genuine Dulux products available</p>
        </div>
        <div className="flex items-center gap-2">
          {/* expanding search */}
          <div className="flex items-center">
            <AnimatePresence>
              {searchOpen && (
                <motion.input
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search paints..."
                  className="mr-1 h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
                />
              )}
            </AnimatePresence>
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted"
              aria-label="Search"
            >
              {searchOpen ? <X className="size-4" /> : <Search className="size-4" />}
            </button>
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
          >
            {sorts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <Button variant="outline" className="gap-2 rounded-xl lg:hidden" onClick={() => setFiltersOpen(true)}>
            <Filter className="size-4" /> Filters
          </Button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* desktop filters */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden w-60 shrink-0 lg:block"
        >
          <div className="sticky top-28 rounded-2xl border border-border/60 bg-card p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <SlidersHorizontal className="size-4 text-primary" /> Filters
            </div>
            {Filters}
          </div>
        </motion.aside>

        <div className="flex-1">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p>Loading products from Supabase...</p>
            </div>
          ) : (
            <>
              <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filtered.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </AnimatePresence>
              </motion.div>
              {filtered.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border py-20 text-center text-muted-foreground">
                  No products match your filters.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* mobile filter drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85%] overflow-y-auto bg-background p-5 shadow-2xl lg:hidden"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Filters</h2>
                <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                  <X className="size-5 text-foreground" />
                </button>
              </div>
              {Filters}
              <Button className="mt-6 w-full rounded-xl" onClick={() => setFiltersOpen(false)}>
                Show {filtered.length} results
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
