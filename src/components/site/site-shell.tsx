"use client"

import type { ReactNode } from "react"
import { SiteNavbar } from "@/components/site/site-navbar"
import { BottomNav } from "@/components/site/bottom-nav"
import { Footer } from "@/components/footer"
import { PageTransition } from "@/components/anim/page-transition"

export function SiteShell({
  children,
  hideFooter = false,
}: {
  children: ReactNode
  hideFooter?: boolean
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNavbar />
      <PageTransition className="flex-1 pb-20 sm:pb-0">{children}</PageTransition>
      {!hideFooter && <Footer />}
      <BottomNav />
    </div>
  )
}
