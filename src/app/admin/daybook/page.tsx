"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/services/supabase"
import { inr } from "@/lib/format"
import { 
  CalendarRange, ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Download, Printer, FileSpreadsheet, Activity, Wallet, CreditCard, ArrowUpRight, ArrowDownRight
} from "lucide-react"

import { Button } from "@/components/ui/button"

type DaybookEntry = {
  id: string
  time: string
  type: "Online Order" | "Offline Bill" | "Ledger Received" | "Ledger Paid"
  name: string
  amount: number
  status: string
  method: string
  raw_date: Date
}

export default function DayBookPage() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [entries, setEntries] = useState<DaybookEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDaybook()
  }, [selectedDate])

  const fetchDaybook = async () => {
    setLoading(true)
    try {
      const startOfDay = new Date(selectedDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(selectedDate)
      endOfDay.setHours(23, 59, 59, 999)

      const startISO = startOfDay.toISOString()
      const endISO = endOfDay.toISOString()

      // 1. Fetch Orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startISO)
        .lte('created_at', endISO)

      // 2. Fetch Bills
      const { data: bills } = await supabase
        .from('bills')
        .select('*')
        .gte('created_at', startISO)
        .lte('created_at', endISO)
        .eq('is_deleted', false)

      // 3. Fetch Ledger (using date string directly since it's YYYY-MM-DD)
      const { data: ledger } = await supabase
        .from('ledger')
        .select('*')
        .eq('date', selectedDate)

      const compiled: DaybookEntry[] = []

      // Process Orders
      orders?.forEach(o => {
        compiled.push({
          id: `order-${o.id}`,
          time: new Date(o.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          type: "Online Order",
          name: o.customer_name || 'Unknown',
          amount: o.total_amount,
          status: o.status || 'Received',
          method: 'Online',
          raw_date: new Date(o.created_at)
        })
      })

      // Process Bills
      bills?.forEach(b => {
        compiled.push({
          id: `bill-${b.id}`,
          time: new Date(b.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          type: "Offline Bill",
          name: b.customer_name || 'Unknown',
          amount: b.total_amount,
          status: b.payment_status || 'paid',
          method: b.payment_method || 'cash',
          raw_date: new Date(b.created_at)
        })
      })

      // Process Ledger
      ledger?.forEach(l => {
        compiled.push({
          id: `ledger-${l.id}`,
          time: "Manual Entry",
          type: l.type === 'receivable' ? "Ledger Received" : "Ledger Paid",
          name: l.customer_name || 'Unknown',
          amount: l.amount,
          status: l.status || 'paid',
          method: 'manual',
          raw_date: new Date(l.created_at || l.date)
        })
      })

      // Sort by time
      compiled.sort((a, b) => b.raw_date.getTime() - a.raw_date.getTime())
      
      setEntries(compiled)
    } catch (error) {
      console.error("Error fetching daybook:", error)
    } finally {
      setLoading(false)
    }
  }

  const changeDate = (days: number) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + days)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Time,Type,Customer,Amount,Status,Method\n" +
      entries.map(e => `${e.time},${e.type},${e.name},${e.amount},${e.status},${e.method}`).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `daybook_${selectedDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    window.print()
  }

  // Analytics
  const totalSales = entries.filter(e => e.type.includes('Order') || e.type.includes('Bill')).reduce((a, b) => a + b.amount, 0)
  const totalReceived = entries.filter(e => (e.type.includes('Order') || e.type.includes('Bill')) && e.status === 'paid').reduce((a, b) => a + b.amount, 0)
    + entries.filter(e => e.type === 'Ledger Received' && e.status === 'paid').reduce((a, b) => a + b.amount, 0)
  const totalCredit = entries.filter(e => (e.type.includes('Order') || e.type.includes('Bill')) && (e.status === 'unpaid' || e.status === 'partial')).reduce((a, b) => a + b.amount, 0)
  const totalPaidOut = entries.filter(e => e.type === 'Ledger Paid' && e.status === 'paid').reduce((a, b) => a + b.amount, 0)

  return (
    <div className="p-container-padding bg-background w-full h-full">
      <div className="max-w-7xl mx-auto space-y-element-gap pb-20">
        {/* Page Header: Date & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => changeDate(-1)} className="p-2 rounded-lg border border-outline-variant hover:bg-surface-variant/50 transition-colors text-on-surface">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <div className="flex flex-col relative">
              <span className="font-headline-md text-headline-md text-on-surface">
                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1 cursor-pointer hover:text-primary">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span> 
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent outline-none border-none cursor-pointer absolute opacity-0 w-full h-full left-0 top-0"
                />
                Select Date
              </span>
            </div>
            <button onClick={() => changeDate(1)} disabled={selectedDate === new Date().toISOString().split('T')[0]} className="p-2 rounded-lg border border-outline-variant hover:bg-surface-variant/50 transition-colors text-on-surface disabled:opacity-50">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button onClick={handleExportCSV} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-outline-variant text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-variant/50 transition-colors bg-white">
              <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
            </button>
            <button onClick={handlePrint} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg font-label-md text-label-md hover:bg-secondary/90 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[18px]">print</span> Print Daily Report
            </button>
          </div>
        </div>

        {/* Summary Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between group hover:border-primary/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Sales</h3>
              <div className="p-2 bg-primary-fixed/30 rounded-lg text-primary">
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
              </div>
            </div>
            <div className="font-headline-lg text-headline-lg text-on-surface">{inr(totalSales)}</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between group hover:border-emerald-500/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Received</h3>
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
              </div>
            </div>
            <div className="font-headline-lg text-headline-lg text-emerald-700">{inr(totalReceived)}</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between group hover:border-amber-500/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Credit Given</h3>
              <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>credit_card</span>
              </div>
            </div>
            <div className="font-headline-lg text-headline-lg text-amber-700">{inr(totalCredit)}</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between group hover:border-rose-500/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Paid Out</h3>
              <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>north_east</span>
              </div>
            </div>
            <div className="font-headline-lg text-headline-lg text-rose-700">{inr(totalPaidOut)}</div>
          </div>
        </div>

        {/* Transaction Table Section */}
        <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Day's Transactions</h3>
            <div className="text-sm font-semibold text-outline">{entries.length} entries</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-bright border-b border-outline-variant/30">
                  <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Time</th>
                  <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Type</th>
                  <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Customer / Party</th>
                  <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Status</th>
                  <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Method</th>
                  <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 font-body-md text-body-md text-on-surface">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-outline">Loading transactions...</td></tr>
                ) : entries.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-outline">No transactions recorded on this date.</td></tr>
                ) : entries.map(entry => (
                  <tr key={entry.id} className="hover:bg-surface-variant/5 transition-colors group">
                    <td className="p-4 text-on-surface-variant">{entry.time}</td>
                    <td className="p-4 font-medium text-primary">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        entry.type.includes('Order') ? 'bg-blue-100 text-blue-700' :
                        entry.type.includes('Bill') ? 'bg-purple-100 text-purple-700' :
                        entry.type === 'Ledger Received' ? 'bg-[#d1fae5] text-[#065f46]' : 'bg-[#fee2e2] text-[#991b1b]'
                      }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="p-4 font-bold">{entry.name}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        entry.status === 'paid' ? 'bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]' :
                        entry.status === 'partial' ? 'bg-[#ffedd5] text-[#9a3412] border-[#fed7aa]' :
                        entry.status === 'unpaid' ? 'bg-[#fee2e2] text-[#991b1b] border-[#fecaca]' : 'bg-surface-variant text-on-surface-variant border-outline-variant'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold text-outline uppercase tracking-wider border border-outline-variant/50 px-2 py-1 rounded-md bg-surface-bright">
                        {entry.method}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-on-surface">{inr(entry.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
