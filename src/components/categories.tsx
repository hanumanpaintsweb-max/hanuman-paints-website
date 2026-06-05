"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { Brush, Building2, Droplets, Layers, PaintBucket, Wrench, type LucideIcon } from "lucide-react"
import { categories } from "@/lib/data"

const icons: Record<string, LucideIcon> = {
  PaintBucket,
  Building2,
  Brush,
  Layers,
  Droplets,
  Wrench,
}

export function Categories() {
  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Shop by category</p>
          <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything for a flawless finish
          </h2>
        </div>
        <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
          From walls to woodwork, find genuine Dulux products for every surface and every budget.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {categories.map((c, i) => {
          const Icon = icons[c.icon]
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ y: -6 }}
            >
              <Link
                href={`/products?category=${c.id}`}
                className="group relative block overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-shadow hover:shadow-xl sm:p-6"
              >
                <div className="absolute -right-6 -top-6 size-20 rounded-full bg-primary/10 transition-transform duration-300 group-hover:scale-150" />
                <span className="relative flex size-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-6" />
                </span>
                <h3 className="relative mt-4 text-base font-semibold text-foreground sm:text-lg">{c.name}</h3>
                <p className="relative mt-1 text-xs text-muted-foreground sm:text-sm">{c.count}+ products</p>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
