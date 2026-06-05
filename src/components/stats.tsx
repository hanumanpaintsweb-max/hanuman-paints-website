"use client"

import { Reveal } from "@/components/anim/reveal"
import { CountUp } from "@/components/anim/count-up"

const stats = [
  { to: 25000, suffix: "+", label: "Orders delivered" },
  { to: 2000, suffix: "+", label: "Shades available" },
  { to: 15, suffix: " yrs", label: "Trusted in the city" },
  { to: 4.9, decimals: 1, suffix: "/5", label: "Average rating" },
]

export function Stats() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="grid grid-cols-2 gap-4 rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-10 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} index={i} className="text-center">
            <p className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              <CountUp to={s.to} suffix={s.suffix} decimals={s.decimals ?? 0} />
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
