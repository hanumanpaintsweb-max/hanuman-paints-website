"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Lock, Mail, Loader2, AlertCircle } from "lucide-react"
import { authenticateAdmin } from "@/app/actions/auth"
import { motion, useAnimation } from "motion/react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null)
  const [lockCountdown, setLockCountdown] = useState<string>("")

  const { setAdminContext } = useAuth()
  const router = useRouter()
  const controls = useAnimation()

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (lockedUntil) {
      interval = setInterval(() => {
        const now = new Date()
        const diff = lockedUntil.getTime() - now.getTime()
        if (diff <= 0) {
          setLockedUntil(null)
          setError("")
          clearInterval(interval)
        } else {
          const m = Math.floor(diff / 60000)
          const s = Math.floor((diff % 60000) / 1000)
          setLockCountdown(`${m}m ${s}s`)
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [lockedUntil])

  const triggerShake = () => {
    controls.start({
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 }
    })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (lockedUntil) return

    setError("")
    setLoading(true)
    
    try {
      const res = await authenticateAdmin(email, password)
      
      if (res.success) {
        setAdminContext(res.user, rememberMe)
        window.location.href = "/admin/billing"
      } else {
        setError(res.message || "Failed to login.")
        triggerShake()
        
        if (res.locked && res.lockedUntil) {
          setLockedUntil(new Date(res.lockedUntil))
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to login. Please check credentials.")
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12 sm:px-6 lg:px-8">
      <motion.div 
        animate={controls}
        className="w-full max-w-md space-y-8 rounded-3xl border border-border/60 bg-card p-8 shadow-2xl"
      >
        <div>
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <Lock className="size-7 text-primary" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-foreground">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Secure access to Hanuman Paints dashboard
          </p>
        </div>

        {lockedUntil ? (
          <div className="rounded-2xl bg-red-500/10 p-6 text-center border border-red-500/20">
            <AlertCircle className="size-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-red-600 mb-1">Account Locked</h3>
            <p className="text-sm text-red-600/80 mb-3">Too many failed attempts.</p>
            <div className="text-3xl font-mono font-black text-red-500">{lockCountdown}</div>
            <p className="text-xs text-red-600/60 mt-3">Please wait before trying again.</p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="rounded-xl bg-destructive/10 p-4 text-sm font-medium text-destructive flex items-center gap-2">
                <AlertCircle className="size-4" /> {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className="text-sm font-medium text-foreground ml-1">Email address</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="size-5 text-muted-foreground" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-xl border border-input bg-background py-3 pl-10 pr-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-sm transition-all"
                    placeholder="admin@hanumanpaints.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="text-sm font-medium text-foreground ml-1">Password</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="size-5 text-muted-foreground" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-xl border border-input bg-background py-3 pl-10 pr-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-sm transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground cursor-pointer">
                  Remember me
                </label>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl py-6 text-sm font-bold shadow-lg shadow-primary/25"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" /> Authenticating...
                  </>
                ) : (
                  "Sign in to Dashboard"
                )}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}
