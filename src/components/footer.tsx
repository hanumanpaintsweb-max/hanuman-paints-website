"use client"

import { motion } from "motion/react"
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

const cols = [
  { title: "Products", items: ["Interior", "Exterior", "Enamels", "Primers", "Waterproofing"] },
  { title: "Company", items: ["About us", "Our store", "Careers", "Blog", "Contact"] },
  { title: "Support", items: ["Delivery info", "Returns", "Color help", "FAQs"] },
]

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      {/* CTA */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="-translate-y-12 rounded-3xl border border-primary/20 bg-primary px-6 py-10 text-center shadow-2xl sm:px-12 sm:py-12"
        >
          <h2 className="mx-auto max-w-lg text-balance text-2xl font-bold text-primary-foreground sm:text-3xl">
            Ready to transform your space?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-primary-foreground/80">
            Get genuine Dulux paint delivered today with expert advice every step of the way.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" variant="secondary" className="group w-full gap-2 rounded-xl sm:w-auto">
              Start shopping
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full rounded-xl border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
            >
              Book a consultation
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary font-mono text-lg font-bold text-primary-foreground">
                H
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-base font-bold tracking-tight">Hanuman Paints</span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-primary">
                  Authorized Dulux Dealer
                </span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-secondary-foreground/70">
              Your trusted neighbourhood paint store, now online. Genuine products, fair prices and
              same-day delivery across the city.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-secondary-foreground/80">
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-primary" /> +91 00000 00000
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-primary" /> hello@hanumanpaints.in
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" /> Main Road, Your City, India
              </li>
            </ul>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((it) => (
                  <li key={it}>
                    <a
                      href="#"
                      className="text-sm text-secondary-foreground/70 transition-colors hover:text-primary"
                    >
                      {it}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-secondary-foreground/60 sm:flex-row">
          <p>© {new Date().getFullYear()} Hanuman Paints. All rights reserved.</p>
          <p>Authorized Dulux Dealer · Not affiliated with this demo</p>
        </div>
      </div>
    </footer>
  )
}
