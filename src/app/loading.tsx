import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4">
      <Loader2 className="size-10 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading Hanuman Paints...</p>
    </div>
  )
}
