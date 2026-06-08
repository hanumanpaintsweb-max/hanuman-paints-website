"use client"

import { motion } from "motion/react"
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

const cols = [
  { 
    title: "Products", 
    items: [
      { label: "Interior", href: "/products" }, 
      { label: "Exterior", href: "/products" }, 
      { label: "Waterproofing", href: "/products" }
    ] 
  },
  { 
    title: "Legal", 
    items: [
      { label: "Privacy Policy", href: "/privacy-policy" }, 
      { label: "Terms of Service", href: "/terms-of-service" }, 
      { label: "Refund Policy", href: "/refund-policy" }
    ] 
  },
  { 
    title: "Support", 
    items: [
      { label: "Contact on WhatsApp", href: "#" }, 
      { label: "Track Order", href: "/my-orders" }
    ] 
  },
]

import { useEffect, useState } from "react"
import { getSettings } from "@/lib/settings"
import Link from "next/link"
import Image from "next/image"

import { usePathname } from "next/navigation"

export function Footer() {
  const [whatsappNumber, setWhatsappNumber] = useState("9204367192")
  const [shopPhone, setShopPhone] = useState("+91 00000 00000")
  const [shopEmail, setShopEmail] = useState("hello@hanumanpaints.in")
  const [shopAddress, setShopAddress] = useState("Main Road, Your City, India")
  const pathname = usePathname()
  const isProductsPage = pathname?.startsWith("/products")

  useEffect(() => {
    async function loadSettings() {
      const settings = await getSettings()
      setWhatsappNumber(settings["whatsapp_number"] || "9204367192")
      setShopPhone(settings["shop_phone"] || "+91 00000 00000")
      setShopEmail(settings["shop_email"] || "hello@hanumanpaints.in")
      setShopAddress(settings["shop_address"] || "Main Road, Your City, India")
    }
    loadSettings()
  }, [])

  const waLink = `https://wa.me/91${whatsappNumber}?text=Namaste%20Hanuman%20Paints!%20Mujhe%20paint%20selection%20mein%20madad%20chahiye.`

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
            {!isProductsPage && (
              <Button asChild size="lg" variant="secondary" className="group w-full gap-2 rounded-xl sm:w-auto">
                <Link href="/products">
                  Start Shopping
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            )}
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full rounded-xl border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
            >
              <a href={waLink} target="_blank" rel="noopener noreferrer">
                Consult on WhatsApp
              </a>
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center">
              <Image src="/logo.svg" alt="Hanuman Paints" width={200} height={48} className="h-10 sm:h-12 w-auto" />
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-secondary-foreground/70">
              Your trusted neighbourhood paint store, now online. Genuine products, fair prices and
              same-day delivery across the city.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-secondary-foreground/80">
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-primary" /> {shopPhone}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-primary" /> {shopEmail}
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="size-4 text-primary mt-1" /> <span>{shopAddress}</span>
              </li>
            </ul>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((it) => (
                  <li key={it.label}>
                    <Link
                      href={it.href === "#" ? waLink : it.href}
                      className="text-sm text-secondary-foreground/70 transition-colors hover:text-primary"
                    >
                      {it.label}
                    </Link>
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
