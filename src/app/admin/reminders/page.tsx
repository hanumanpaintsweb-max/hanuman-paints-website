"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/services/supabase"
import { inr } from "@/lib/format"
import { Bell, MessageCircle, Phone, Search, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type Reminder = {
  id: string
  customer_name: string
  customer_phone: string
  amount: number
  description: string
  bill_number: string | null
  due_date: string
  status: string
  days_overdue: number
  is_today: boolean
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('ledger')
      .select('*')
      .eq('type', 'receivable')
      .neq('status', 'paid')
      .not('due_date', 'is', null)
      .order('due_date', { ascending: true })

    if (data) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const processed: Reminder[] = data.map(item => {
        const itemDate = new Date(item.due_date)
        itemDate.setHours(0, 0, 0, 0)
        
        const diffTime = today.getTime() - itemDate.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        return {
          id: item.id,
          customer_name: item.customer_name,
          customer_phone: item.customer_phone,
          amount: item.amount,
          description: item.description,
          bill_number: item.bill_number,
          due_date: item.due_date,
          status: item.status,
          days_overdue: diffDays,
          is_today: diffDays === 0
        }
      })
      setReminders(processed)
    }
    setLoading(false)
  }

  const sendReminder = (reminder: Reminder) => {
    const text = `Namaste ${reminder.customer_name} ji,\n\nAapka Hanuman Paints ka pending udhaar balance hai: ${inr(reminder.amount)}.\nBill Details: ${reminder.bill_number ? `Bill #${reminder.bill_number}` : reminder.description}\n\nKripaya jaldi payment clear karein. Dhanyawad! 🎨`
    const url = `https://wa.me/91${reminder.customer_phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
  }

  const filtered = reminders.filter(r => 
    r.customer_name.toLowerCase().includes(search.toLowerCase()) || 
    r.customer_phone.includes(search)
  )

  const todayReminders = filtered.filter(r => r.is_today)
  const overdueReminders = filtered.filter(r => r.days_overdue > 0)
  const upcomingReminders = filtered.filter(r => r.days_overdue < 0)

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Bell className="size-8 text-rose-500" /> Payment Reminders
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Auto-generated reminders from Udhaar Ledger</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search customer..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="size-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
          No pending reminders found! 🎉
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* TODAY'S REMINDERS */}
          {todayReminders.length > 0 && (
            <div>
              <h2 className="text-lg font-black text-rose-500 mb-4 flex items-center gap-2 uppercase tracking-wide">
                <AlertCircle className="size-5" /> Due Today
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {todayReminders.map(r => (
                  <div key={r.id} className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-rose-500" />
                    <div>
                      <p className="text-sm font-bold text-rose-600 mb-1">Aaj {r.customer_name} se {inr(r.amount)} lena tha</p>
                      <p className="text-xs text-rose-500/80 font-mono">({r.bill_number ? `Bill #${r.bill_number}` : r.description})</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                        <Phone className="size-3" /> {r.customer_phone}
                      </div>
                      <Button onClick={() => sendReminder(r)} size="sm" className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-lg gap-2 h-8">
                        <MessageCircle className="size-3.5" /> Remind
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OVERDUE REMINDERS */}
          {overdueReminders.length > 0 && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
                <h2 className="font-bold text-foreground">Overdue Payments</h2>
                <div className="text-sm font-semibold text-muted-foreground">{overdueReminders.length} pending</div>
              </div>
              <div className="divide-y divide-border">
                {overdueReminders.map(r => (
                  <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                    <div>
                      <div className="font-bold text-foreground">{r.customer_name}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">{r.customer_phone}</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{r.bill_number ? `Bill #${r.bill_number}` : r.description}</div>
                      <div className="text-xs font-bold text-rose-500 mt-0.5">Overdue by {r.days_overdue} days (Due: {new Date(r.due_date).toLocaleDateString()})</div>
                    </div>
                    <div className="font-black text-rose-600 text-right">{inr(r.amount)}</div>
                    <Button onClick={() => sendReminder(r)} size="sm" className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-lg gap-2 shrink-0">
                      <MessageCircle className="size-4" /> Remind
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UPCOMING REMINDERS */}
          {upcomingReminders.length > 0 && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm opacity-80">
              <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
                <h2 className="font-bold text-foreground">Upcoming Payments</h2>
                <div className="text-sm font-semibold text-muted-foreground">{upcomingReminders.length} upcoming</div>
              </div>
              <div className="divide-y divide-border">
                {upcomingReminders.map(r => (
                  <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-foreground">{r.customer_name}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">{r.customer_phone}</div>
                    </div>
                    <div>
                      <div className="text-sm text-foreground">{r.bill_number ? `Bill #${r.bill_number}` : r.description}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Due in {Math.abs(r.days_overdue)} days ({new Date(r.due_date).toLocaleDateString()})</div>
                    </div>
                    <div className="font-bold text-amber-600 text-right">{inr(r.amount)}</div>
                    <Button onClick={() => sendReminder(r)} size="sm" variant="outline" className="rounded-lg gap-2 shrink-0 text-[#25D366] border-[#25D366] hover:bg-[#25D366]/10">
                      <MessageCircle className="size-4" /> Advance Reminder
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
