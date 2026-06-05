"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, Star, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PaintParticles } from "@/components/anim/paint-particles"

const swatches = ["#F97316", "#1E3A8A", "#14B8A6", "#E11D48", "#FACC15", "#0EA5E9"]
const headline = ["Premium", "paint,", "delivered", "to", "your", "doorstep."]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" as const },
  }),
}

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
      <PaintParticles />
      {/* soft brand glow */}
      <div className="pointer-events-none absolute -top-32 -left-24 size-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute top-20 right-0 size-96 rounded-full bg-secondary/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <motion.div
            custom={0}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-md"
          >
            <span className="flex size-2 rounded-full bg-primary" />
            India&apos;s trusted paint store, now online
          </motion.div>

          <h1 className="mt-5 flex flex-wrap gap-x-3 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            {headline.map((word, i) => (
              <motion.span
                key={word + i}
                initial={{ opacity: 0, y: 30, rotate: 4 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.12, ease: "easeOut" }}
                className={word === "delivered" ? "text-primary" : ""}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            custom={9}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-5 max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            As an authorized Dulux dealer, Hanuman Paints brings genuine products, expert color advice and
            same-day delivery for every home and project.
          </motion.p>

          <motion.div
            custom={10}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button asChild size="lg" className="group gap-2 rounded-xl text-base">
              <Link href="/products">
                Shop now
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl text-base">
              <Link href="/calculator">Paint calculator</Link>
            </Button>
          </motion.div>

          <motion.div
            custom={11}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm"
          >
            <div className="flex items-center gap-2 text-foreground">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-4 fill-primary text-primary" />
                ))}
              </div>
              <span className="font-medium">4.9 / 5 from 2,300+ customers</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Truck className="size-4 text-primary" />
              <span className="font-medium">Free delivery over ₹2,000</span>
            </div>
          </motion.div>
        </div>

        {/* image card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="relative overflow-hidden rounded-3xl border border-border/60 shadow-2xl shadow-secondary/10"
          >
            <img
              src="/hero-room.png"
              alt="Modern living room with a freshly painted terracotta orange accent wall"
              className="aspect-[4/5] w-full object-cover sm:aspect-square"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/30 bg-white/20 p-4 backdrop-blur-xl"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white drop-shadow">
                2,000+ shades available
              </p>
              <div className="flex gap-2">
                {swatches.map((c) => (
                  <span
                    key={c}
                    className="size-8 flex-1 rounded-lg ring-1 ring-white/40"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="absolute -left-3 top-8 hidden rounded-2xl border border-border/60 bg-card/80 px-4 py-3 shadow-xl backdrop-blur-xl sm:block"
          >
            <p className="text-2xl font-bold text-foreground">15+ yrs</p>
            <p className="text-xs text-muted-foreground">Serving the city</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
