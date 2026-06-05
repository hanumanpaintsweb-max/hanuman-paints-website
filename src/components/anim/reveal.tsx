"use client"

import { motion, type Variants } from "motion/react"
import type { ReactNode } from "react"

const variants: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
}

export function Reveal({
  children,
  index = 0,
  className,
  as = "div",
}: {
  children: ReactNode
  index?: number
  className?: string
  as?: "div" | "li" | "section" | "article"
}) {
  const MotionTag = motion[as]
  return (
    <MotionTag
      custom={index}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className={className}
    >
      {children}
    </MotionTag>
  )
}
