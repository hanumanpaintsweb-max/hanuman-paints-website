"use client"

import { motion } from "motion/react"
import { Quote, Star } from "lucide-react"

const testimonials = [
  {
    quote:
      "Ordered interior emulsion for my whole flat and it arrived the same evening. Genuine Dulux, great price, and the color advice was spot on.",
    name: "Priya Sharma",
    role: "Homeowner, Pune",
    initials: "PS",
  },
  {
    quote:
      "As a contractor I order in bulk every week. Hanuman Paints' online ordering saves me hours and the dealer pricing is unbeatable.",
    name: "Rakesh Verma",
    role: "Painting Contractor",
    initials: "RV",
  },
  {
    quote:
      "The free color consultation helped me pick the perfect shade for our living room. Delivery was quick and the team was super helpful.",
    name: "Anjali Mehta",
    role: "Interior Designer",
    initials: "AM",
  },
  {
    quote:
      "Reliable, genuine and fast. The waterproofing range saved our terrace this monsoon. Highly recommend ordering online from them.",
    name: "Suresh Patil",
    role: "Homeowner, Nashik",
    initials: "SP",
  },
  {
    quote:
      "Best dealer prices in the city and the app makes reordering for my sites effortless. The team knows their products inside out.",
    name: "Arjun Nair",
    role: "Project Contractor",
    initials: "AN",
  },
]

function Card({ t }: { t: (typeof testimonials)[number] }) {
  return (
    <figure className="flex w-[300px] shrink-0 flex-col rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:w-[360px]">
      <Quote className="size-8 text-primary/30" />
      <div className="mt-3 flex">
        {[...Array(5)].map((_, s) => (
          <Star key={s} className="size-4 fill-primary text-primary" />
        ))}
      </div>
      <blockquote className="mt-3 flex-1 text-pretty text-sm leading-relaxed text-foreground">{t.quote}</blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-border/60 pt-4">
        <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
          {t.initials}
        </span>
        <span className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">{t.name}</span>
          <span className="text-xs text-muted-foreground">{t.role}</span>
        </span>
      </figcaption>
    </figure>
  )
}

export function Testimonials() {
  const loop = [...testimonials, ...testimonials]
  return (
    <section id="testimonials" className="overflow-hidden py-16 sm:py-24">
      <div className="mx-auto mb-12 max-w-2xl px-4 text-center sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Loved by customers</p>
        <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Trusted by thousands of homes &amp; contractors
        </h2>
      </div>

      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
        <motion.div
          className="flex gap-5"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          {loop.map((t, i) => (
            <Card key={i} t={t} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
