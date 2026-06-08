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
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <CalendarRange className="size-8 text-primary" /> Day Book
          </h1>
          <p className="text-sm text-slate-500 mt-1">Daily financial summary and transactions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2 bg-white"><FileSpreadsheet className="size-4" /> CSV</Button>
          <Button variant="outline" onClick={handlePrint} className="gap-2 bg-white"><Printer className="size-4" /> Print</Button>
        </div>
      </div>

      {/* Date Navigator */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
        <Button variant="ghost" onClick={() => changeDate(-1)} className="gap-2">
          <ChevronLeft className="size-4" /> Prev Day
        </Button>
        <div className="flex items-center gap-3">
          <CalendarIcon className="size-5 text-primary" />
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-lg font-bold bg-transparent outline-none border-none cursor-pointer"
          />
        </div>
        <Button variant="ghost" onClick={() => changeDate(1)} disabled={selectedDate === new Date().toISOString().split('T')[0]} className="gap-2">
          Next Day <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Activity className="size-4" /> <span className="text-sm font-semibold">Total Sales</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{inr(totalSales)}</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <Wallet className="size-4" /> <span className="text-sm font-semibold">Received (Cash/Bank)</span>
          </div>
          <div className="text-2xl font-black text-emerald-700">{inr(totalReceived)}</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <CreditCard className="size-4" /> <span className="text-sm font-semibold">Credit/Udhar Given</span>
          </div>
          <div className="text-2xl font-black text-amber-700">{inr(totalCredit)}</div>
        </div>
        <div className="bg-rose-50 border border-rose-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 text-rose-600 mb-2">
            <ArrowUpRight className="size-4" /> <span className="text-sm font-semibold">Paid Out</span>
          </div>
          <div className="text-2xl font-black text-rose-700">{inr(totalPaidOut)}</div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between print:hidden">
          <h2 className="font-bold text-slate-900">All Transactions</h2>
          <div className="text-sm font-semibold text-slate-500">{entries.length} entries</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Time</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Customer/Party</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-500">Loading transactions...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-500">No transactions recorded on this date.</td></tr>
              ) : entries.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-500 font-medium">{entry.time}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      entry.type.includes('Order') ? 'bg-blue-100 text-blue-700' :
                      entry.type.includes('Bill') ? 'bg-purple-100 text-purple-700' :
                      entry.type === 'Ledger Received' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{entry.name}</td>
                  <td className="px-6 py-4 text-right font-black text-slate-900">{inr(entry.amount)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-bold capitalize ${
                      entry.status === 'paid' ? 'text-emerald-600' :
                      entry.status === 'partial' ? 'text-amber-600' :
                      entry.status === 'unpaid' ? 'text-rose-600' : 'text-slate-600'
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider border border-slate-200 px-2 py-1 rounded-md bg-slate-50">
                      {entry.method}
                    </span>
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
