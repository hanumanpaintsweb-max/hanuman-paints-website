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
      .eq('status', 'pending')
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

  const totalOutstanding = filtered.reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <div className="pt-8 px-4 md:px-container-padding pb-container-padding max-w-7xl mx-auto w-full flex-grow flex flex-col gap-element-gap">
      <div className="flex items-center justify-between">
        <h1 className="font-headline-md text-headline-md text-on-surface">Unpaid Bills</h1>
      </div>

      {/* Top Section: Total Outstanding Amount */}
      <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 p-8 flex items-center justify-between">
        <div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-2">Total Outstanding Amount</p>
          <p className="font-headline-lg text-headline-lg text-primary-container tracking-tight">{inr(totalOutstanding)}</p>
        </div>
        <div className="h-16 w-16 bg-error-container rounded-full flex items-center justify-center text-error">
          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>money_off</span>
        </div>
      </div>

      {/* Main Section: Data Table Area */}
      <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 flex-grow flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-outline-variant/30 flex flex-col md:flex-row gap-4 justify-between items-center bg-surface-bright">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
            <input 
              className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent font-body-md text-body-md text-on-surface placeholder-outline-variant transition-all" 
              placeholder="Search customer, phone or bill no..." 
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-grow">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/30">
                <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Customer</th>
                <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Phone</th>
                <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Bill/Desc</th>
                <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Due Date</th>
                <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Amount</th>
                <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">Status</th>
                <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 bg-white">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-outline">Loading unpaid bills...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-outline">No pending reminders found! 🎉</td></tr>
              ) : filtered.map(r => {
                const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() || 'NA';
                const isOverdue = r.days_overdue > 0;
                
                return (
                  <tr key={r.id} className="hover:bg-surface-container-low/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${isOverdue ? 'bg-primary-container text-white' : 'bg-tertiary-container text-white'} flex items-center justify-center font-label-md text-label-md`}>
                          {getInitials(r.customer_name)}
                        </div>
                        <span className="font-body-md text-body-md font-medium text-on-surface">{r.customer_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{r.customer_phone}</td>
                    <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{r.bill_number ? `Bill #${r.bill_number}` : r.description}</td>
                    <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{new Date(r.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="py-4 px-6 font-body-md text-body-md font-semibold text-on-surface text-right">{inr(r.amount)}</td>
                    <td className="py-4 px-6 text-center">
                      {isOverdue ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error-container text-on-error-container border border-error/20">
                          Overdue ({r.days_overdue} days)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-variant text-on-surface-variant border border-outline-variant">
                          Upcoming ({Math.abs(r.days_overdue)} days)
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => sendReminder(r)}
                        className={`${isOverdue ? 'bg-secondary-container hover:bg-secondary text-on-secondary shadow-sm' : 'bg-transparent border border-outline-variant hover:border-primary-container hover:text-primary-container text-on-surface-variant'} font-label-md text-label-md py-2 px-4 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ml-auto`}
                      >
                        <MessageCircle className="size-3.5" /> Remind
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {!loading && (
          <div className="p-4 border-t border-outline-variant/30 flex items-center justify-between bg-white">
            <span className="font-body-md text-body-md text-on-surface-variant">Showing {filtered.length} entries</span>
          </div>
        )}
      </div>
    </div>
  )
}
