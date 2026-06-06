"use client"

import { motion } from "motion/react"
import { useState, useEffect } from "react"

const COLORS = ["#F97316", "#1E3A8A", "#14B8A6", "#FACC15", "#E11D48", "#0EA5E9"]

export function PaintParticles({ count = 14 }: { count?: number }) {
  const [dots, setDots] = useState<Array<{
    id: number;
    left: number;
    size: number;
    delay: number;
    duration: number;
    color: string;
    drift: number;
  }>>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setDots(
        Array.from({ length: count }).map((_, i) => ({
          id: i,
          left: Math.random() * 100,
          size: 8 + Math.random() * 26,
          delay: Math.random() * 6,
          duration: 9 + Math.random() * 10,
          color: COLORS[i % COLORS.length],
          drift: (Math.random() - 0.5) * 60,
        }))
      )
      setIsMounted(true)
    }, 0)
  }, [count])

  if (!isMounted || dots.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full opacity-20 blur-[1px]"
          style={{
            left: `${d.left}%`,
            width: d.size,
            height: d.size,
            backgroundColor: d.color,
            bottom: -40,
          }}
          animate={{ y: [0, -700], x: [0, d.drift], opacity: [0, 0.25, 0] }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
        />
      ))}
    </div>
  )
}
