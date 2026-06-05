"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { SiteShell } from "@/components/site/site-shell"
import { ColourPanel } from "@/components/colours/colour-panel"
import coloursData from "@/data/dulux-colors.json"

export default function ColoursPage() {
  const [selectedColour, setSelectedColour] = useState<{ name: string; code: string; hex: string } | null>(null)

  return (
    <SiteShell>
      <div className="relative min-h-screen bg-muted/20">
        {/* Header */}
        <section className="bg-primary px-4 py-16 text-primary-foreground sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Discover Your Perfect Colour
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto mt-6 max-w-2xl text-xl text-primary-foreground/80"
            >
              Explore our curated families of rich shades. Click any swatch to see matching tintable products.
            </motion.p>
          </div>
        </section>

        {/* Colours Grid */}
        <section className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-8 xl:grid xl:grid-cols-8 xl:gap-6 xl:overflow-x-visible">
            {coloursData.map((family, fIdx) => (
              <div key={family.family} className="flex min-w-[200px] shrink-0 snap-center flex-col">
                <div className="mb-4 sticky top-20 z-10 bg-background/80 py-2 backdrop-blur-md rounded-lg text-center shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
                    {family.family}
                  </h3>
                </div>
                
                <div className="flex flex-col gap-0 rounded-2xl overflow-hidden shadow-sm border border-border">
                  {family.colors.map((color, cIdx) => (
                    <motion.button
                      key={color.code}
                      onClick={() => setSelectedColour(color)}
                      whileHover={{ scale: 1.05, zIndex: 20, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="group relative h-16 w-full cursor-pointer transition-shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:z-30"
                      style={{ backgroundColor: `#${color.hex}` }}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-black/40 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
                        <span className="text-xs font-bold text-white px-2 text-center drop-shadow-md">
                          {color.name}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Slide-in Panel */}
        <ColourPanel 
          isOpen={!!selectedColour} 
          colour={selectedColour} 
          onClose={() => setSelectedColour(null)} 
        />
      </div>
    </SiteShell>
  )
}
