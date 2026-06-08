"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/services/supabase"
import { inr } from "@/lib/format"
import { Bell, MessageCircle, Phone, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

type Reminder = {
  id: string
  customer_name: string
  customer_phone: string
  amount: number
  description: string
  date: string
  status: string
  days_overdue: number
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
      .in('status', ['pending', 'partial', 'unpaid'])
      .order('date', { ascending: true })

    if (data) {
      const today = new Date()
      const processed: Reminder[] = data.map(item => {
        const itemDate = new Date(item.date)
        const diffTime = Math.abs(today.getTime() - itemDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        return {
          id: item.id,
          customer_name: item.customer_name,
          customer_phone: item.customer_phone,
          amount: item.amount,
          description: item.description,
          date: item.date,
          status: item.status,
          days_overdue: diffDays
        }
      })
      setReminders(processed)
    }
    setLoading(false)
  }

  const sendReminder = (reminder: Reminder) => {
    const text = `Namaste ${reminder.customer_name} ji,\n\nAapka Hanuman Paints ka pending balance hai: ${inr(reminder.amount)}.\nDetails: ${reminder.description}\n\nKripaya jaldi payment clear karein. Dhanyawad! 🎨`
    const url = `https://wa.me/91${reminder.customer_phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
  }

  const filtered = reminders.filter(r => 
    r.customer_name.toLowerCase().includes(search.toLowerCase()) || 
    r.customer_phone.includes(search)
  )

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Bell className="size-8 text-rose-500" /> Payment Reminders
          </h1>
          <p className="text-sm text-slate-500 mt-1">Track overdue payments and send WhatsApp reminders</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search customer..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Overdue Invoices & Ledger</h2>
          <div className="text-sm font-semibold text-slate-500">{filtered.length} pending</div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Customer Info</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Pending Amount</th>
                <th className="px-6 py-4 font-medium">Overdue By</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-500">Loading reminders...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-500">No pending reminders found! 🎉</td></tr>
              ) : filtered.map(reminder => (
                <tr key={reminder.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{reminder.customer_name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="size-3" /> {reminder.customer_phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {reminder.description}
                    <div className="text-xs text-slate-400 mt-0.5">{new Date(reminder.date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 font-black text-rose-600">{inr(reminder.amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      reminder.days_overdue > 30 ? 'bg-rose-100 text-rose-700' :
                      reminder.days_overdue > 15 ? 'bg-orange-100 text-orange-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {reminder.days_overdue} Days
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      onClick={() => sendReminder(reminder)} 
                      className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-lg gap-2"
                      size="sm"
                    >
                      <MessageCircle className="size-4" /> Remind
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
