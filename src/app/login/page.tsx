"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Loader2, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteShell } from "@/components/site/site-shell"
import { loginUser } from "@/app/actions/auth"

export default function LoginPage() {
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length !== 10) {
      setError("Mobile number must be exactly 10 digits")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await loginUser(phone, name)
      if (res?.error) {
        if (res.error.includes("Name is required")) {
          setError("Looks like you are new! Please enter your name to continue.")
        } else {
          setError(res.error)
        }
        return
      }
      router.push("/")
      router.refresh()
    } catch (err: unknown) {
      console.error(err)
      setError("Failed to login. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SiteShell>
      <div className="flex flex-col min-h-[70vh] items-center justify-center px-4 py-32 sm:px-6">
        {/* Animated Marquee Bar */}
        <div className="w-full max-w-md overflow-hidden bg-primary mb-6 rounded-xl shadow-lg border border-primary/20">
          <div className="py-2.5 whitespace-nowrap overflow-hidden">
            <div className="inline-block animate-marquee text-sm font-bold tracking-wide text-white">
              🎨 Login to avail exclusive offers | Free delivery on ₹5000+ | Sunday Special — 10% Off
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md overflow-hidden rounded-3xl border border-primary/20 bg-card shadow-2xl shadow-primary/10"
        >
          <div className="bg-primary px-8 py-10 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-white/20 font-mono text-2xl font-bold text-white shadow-inner backdrop-blur-md">
              H
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Welcome to Hanuman Paints</h1>
            <p className="mt-2 text-sm text-primary-foreground/80">
              Enter your mobile number to access your account and orders.
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <div className="rounded-xl bg-red-500/10 p-3 text-center text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              {error.includes("new!") && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Rahul Sharma"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Mobile Number
                </label>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-4 flex items-center gap-1 text-sm font-medium text-muted-foreground">
                    <Phone className="size-4" />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="00000 00000"
                    className="w-full rounded-xl border border-border bg-background py-3 pl-[4.5rem] pr-4 text-sm font-medium tracking-wide text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading || phone.length !== 10}
                className="mt-2 w-full rounded-xl text-base shadow-lg shadow-primary/25"
              >
                {loading ? <Loader2 className="size-5 animate-spin" /> : "Continue"}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </SiteShell>
  )
}
