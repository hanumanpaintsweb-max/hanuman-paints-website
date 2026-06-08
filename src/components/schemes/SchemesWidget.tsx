"use client"

import { useEffect, useState } from "react"
import { Target, AlertCircle, CheckCircle2 } from "lucide-react"
import { supabase } from "@/services/supabase"
import { inr } from "@/lib/format"
import { motion } from "motion/react"

type Scheme = {
  id: string
  name: string
  scheme_type: string
  target_value: number
  reward_amount: number | null
  reward_percentage: number | null
}

export function SchemesWidget() {
  const [schemes, setSchemes] = useState<Scheme[]>([])
  const [progressData, setProgressData] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAndCalculate() {
      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()

      // Fetch active schemes for this month
      const { data: activeSchemes } = await supabase
        .from('schemes')
        .select('*')
        .eq('is_active', true)
        .eq('month', currentMonth)
        .eq('year', currentYear)

      if (!activeSchemes || activeSchemes.length === 0) {
        setLoading(false)
        return
      }

      setSchemes(activeSchemes)

      // Calculate progress
      // We need this month's sales
      const thisMonthStart = new Date(currentYear, currentMonth - 1, 1).toISOString()
      
      const { data: orders } = await supabase.from('orders').select('total_amount, items').gte('created_at', thisMonthStart)
      const { data: bills } = await supabase.from('bills').select('total_amount, items').gte('created_at', thisMonthStart).eq('is_deleted', false)
      
      let totalValue = 0
      let totalVolume = 0

      const allSales = [...(orders || []), ...(bills || [])]
      allSales.forEach(s => {
        totalValue += (s.total_amount || 0)
        s.items?.forEach((i: any) => {
          totalVolume += (i.quantity || i.qty || 1)
        })
      })

      const progressMap: Record<string, number> = {}
      activeSchemes.forEach(scheme => {
        if (scheme.scheme_type === 'Value target') {
          progressMap[scheme.id] = totalValue
        } else if (scheme.scheme_type === 'Volume target') {
          // Simplified volume target (all products)
          progressMap[scheme.id] = totalVolume
        } else {
          // Growth target fallback
          progressMap[scheme.id] = totalValue
        }
      })

      setProgressData(progressMap)
      setLoading(false)
    }

    fetchAndCalculate()
  }, [])

  if (loading) return null
  if (schemes.length === 0) return null

  let totalPotentialReward = 0

  return (
    <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
        <Target className="size-32" />
      </div>
      
      <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-primary">
        <Target className="size-6" /> This Month Schemes
      </h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 z-10 relative">
        {schemes.map((scheme, idx) => {
          const current = progressData[scheme.id] || 0
          const target = scheme.target_value
          const progressPercent = Math.min((current / target) * 100, 100)
          
          let statusColor = "bg-red-500"
          let textColor = "text-red-500"
          let Icon = AlertCircle

          if (progressPercent >= 100) {
            statusColor = "bg-green-500"
            textColor = "text-green-500"
            Icon = CheckCircle2
          } else if (progressPercent >= 75) {
            statusColor = "bg-orange-500"
            textColor = "text-orange-500"
          }

          if (scheme.reward_amount) totalPotentialReward += scheme.reward_amount

          const isValue = scheme.scheme_type === 'Value target'
          
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={scheme.id} 
              className="bg-card rounded-xl p-5 border shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-base">{scheme.name}</h3>
                <Icon className={`size-5 ${textColor}`} />
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm font-semibold mb-1.5">
                  <span>{isValue ? inr(current) : current}</span>
                  <span className="text-muted-foreground">{isValue ? inr(target) : target} {isValue ? '' : 'pcs'}</span>
                </div>
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={`h-full rounded-full ${statusColor}`} 
                  />
                </div>
              </div>

              {progressPercent < 100 ? (
                <p className="text-xs font-bold text-muted-foreground mt-3">
                  Sirf <span className={textColor}>{isValue ? inr(target - current) : Math.round(target - current)}</span> aur bechne hain 
                  {scheme.reward_amount ? ` ₹${scheme.reward_amount} bonus ke liye!` : ' target ke liye!'}
                </p>
              ) : (
                <p className="text-xs font-bold text-green-600 mt-3">
                  Target Achieved! ✅ {scheme.reward_amount ? `₹${scheme.reward_amount} bonus secured.` : ''}
                </p>
              )}
            </motion.div>
          )
        })}
      </div>

      {totalPotentialReward > 0 && (
        <div className="mt-6 font-bold text-primary flex items-center gap-2 bg-white/50 w-fit px-4 py-2 rounded-lg">
          Total Potential Bonus: {inr(totalPotentialReward)}
        </div>
      )}
    </div>
  )
}
