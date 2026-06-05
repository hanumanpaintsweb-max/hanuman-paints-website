"use client"

import { motion } from "motion/react"
import { BadgeCheck, Palette, Truck, Wallet } from "lucide-react"

const features = [
  {
    icon: BadgeCheck,
    title: "100% genuine Dulux",
    desc: "Authorized dealer guarantee on every can. No fakes, ever.",
  },
  {
    icon: Truck,
    title: "Same-day delivery",
    desc: "Order before 2 PM and get your paint delivered the same day.",
  },
  {
    icon: Wallet,
    title: "Best dealer prices",
    desc: "Direct dealer pricing with exclusive online-only discounts.",
  },
  {
    icon: Palette,
    title: "Free color consultation",
    desc: "Talk to our experts and visualize shades before you buy.",
  },
]

export function WhyOrderOnline() {
  return (
    <section id="why" className="relative overflow-hidden py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-secondary px-6 py-12 sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Why order online</p>
            <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight text-secondary-foreground sm:text-4xl">
              The easiest way to buy paint in the city
            </h2>
          </div>

          <div className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-colors hover:bg-white/10"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-secondary-foreground">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-secondary-foreground/70">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
