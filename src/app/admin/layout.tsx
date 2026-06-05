import { ReactNode } from "react"
import Link from "next/link"
import { Package, LogOut, Ticket, LineChart } from "lucide-react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/40">
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-border/60 bg-card px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <Package className="size-5 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">Hanuman Admin</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary">
            <LineChart className="size-4" /> Dashboard
          </Link>
          <Link href="/admin/coupons" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <Ticket className="size-4" /> Coupons
          </Link>
          <button className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground hover:bg-secondary/80">
            <LogOut className="size-4" /> Logout
          </button>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl p-6">
        {children}
      </main>
    </div>
  )
}
