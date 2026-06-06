"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { supabase } from "@/services/supabase"
import { inr } from "@/lib/format"
import { PRODUCTS } from "@/data/products"
import { 
  FileSpreadsheet, FileText, Download, Loader2, Calendar as CalIcon, User, Package
} from "lucide-react"
import { Button } from "@/components/ui/button"

const TABS = ["Daily Sales", "Monthly GST (CA)", "Product wise", "Customer wise"]
const TIN_WOOD_CATEGORIES = ["Tinters", "Woodcare"] // 12%
// Others = 18% (Paints, Enamels)

type ReportOrder = {
  id: string;
  order_id: string;
  created_at: string;
  total_amount: number;
  total?: number;
  cgst_amount?: number;
  sgst_amount?: number;
  taxable_value?: number;
  bill_number?: string;
  customer_name?: string;
  customer_gstin?: string;
  items?: Record<string, any>[];
  discount_amount?: number;
  subtotal?: number;
  customer_phone?: string;
};

type ReportBill = ReportOrder;

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("Daily Sales")
  const [loading, setLoading] = useState(true)

  // Raw Data
  const [orders, setOrders] = useState<ReportOrder[]>([])
  const [bills, setBills] = useState<ReportBill[]>([])
  const [settings, setSettings] = useState<Record<string, string>>({})

  // Filters
  const todayStr = new Date().toISOString().split('T')[0]
  const [dailyDate, setDailyDate] = useState(todayStr)
  
  const currentMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2, '0')}`
  const [gstMonth, setGstMonth] = useState(currentMonthStr)

  const fetchData = async () => {
    setLoading(true)
    const { data: oData } = await supabase.from('orders').select('*')
    const { data: bData } = await supabase.from('bills').select('*').eq('is_deleted', false)
    const { data: sData } = await supabase.from('settings').select('*')

    if (oData) setOrders(oData as ReportOrder[])
    if (bData) setBills(bData as ReportBill[])
    if (sData) {
      const sObj: Record<string, string> = {}
      sData.forEach(s => sObj[s.key] = s.value)
      setSettings(sObj)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- Process Data ---
  const allSales = useMemo(() => {
    return [...orders, ...bills].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [orders, bills])

  // 1. Daily Sales
  const dailySalesList = useMemo(() => {
    return allSales.filter(s => new Date(s.created_at).toISOString().split('T')[0] === dailyDate)
  }, [allSales, dailyDate])

  const dailyTotals = dailySalesList.reduce((acc, curr) => {
    acc.total += (curr.total_amount || curr.total || 0)
    acc.gst += (curr.cgst_amount ? (curr.cgst_amount + (curr.sgst_amount || 0)) : 0) // rough approx for online orders if no cgst_amount
    return acc
  }, { total: 0, gst: 0 })

  // 2. Monthly GST Report
  const monthlyGSTList = useMemo(() => {
    return allSales.filter(s => {
      const d = new Date(s.created_at)
      const mStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}`
      return mStr === gstMonth
    })
  }, [allSales, gstMonth])

  const monthlyTotals = monthlyGSTList.reduce((acc, curr) => {
    acc.taxable += (curr.taxable_value || 0)
    acc.cgst += (curr.cgst_amount || 0)
    acc.sgst += (curr.sgst_amount || 0)
    acc.total += (curr.total_amount || curr.total || 0)
    return acc
  }, { taxable: 0, cgst: 0, sgst: 0, total: 0 })

  // HSN Breakdown
  const hsnSummary = useMemo(() => {
    const summary: Record<string, { desc: string, taxable: number, cgst: number, sgst: number, total: number }> = {
      [settings.hsn_paints || "32091010"]: { desc: "Paints/Emulsions (18%)", taxable: 0, cgst: 0, sgst: 0, total: 0 },
      [settings.hsn_enamels || "32081010"]: { desc: "Enamels (18%)", taxable: 0, cgst: 0, sgst: 0, total: 0 },
      [settings.hsn_tinters || "32129090"]: { desc: "Tinters/Woodcare (12%)", taxable: 0, cgst: 0, sgst: 0, total: 0 }
    }

    monthlyGSTList.forEach(sale => {
      // We only have HSN context from items
      sale.items?.forEach((item: any) => {
        const prod = PRODUCTS.find(p => p.id === item.productId || p.id === item.id)
        let hsn = settings.hsn_paints || "32091010"
        let rate = 18

        if (prod) {
          if (prod.category.includes('Enamel')) hsn = settings.hsn_enamels || "32081010"
          else if (TIN_WOOD_CATEGORIES.includes(prod.category)) { hsn = settings.hsn_tinters || "32129090"; rate = 12 }
        } else if (item.taxRate === 12) {
          hsn = settings.hsn_tinters || "32129090"; rate = 12
        }

        // Calculate item level
        const qty = item.qty || item.quantity || 1
        const price = item.mrp || item.price || 0
        const gross = qty * price
        
        // Apportion global discount if it exists
        let discountRatio = 0
        if (sale.discount_amount && sale.subtotal) {
          discountRatio = sale.discount_amount / sale.subtotal
        }
        
        const taxable = gross * (1 - discountRatio)
        const itemGst = taxable * (rate / 100)
        
        if (summary[hsn]) {
          summary[hsn].taxable += taxable
          summary[hsn].cgst += itemGst / 2
          summary[hsn].sgst += itemGst / 2
          summary[hsn].total += (taxable + itemGst)
        }
      })
    })
    return summary
  }, [monthlyGSTList, settings])

  // 3. Product wise
  const productSales = useMemo(() => {
    const map: Record<string, { qty: number, rev: number }> = {}
    allSales.forEach(s => {
      s.items?.forEach((i: any) => {
        const name = i.name || "Unknown Product"
        const qty = i.qty || i.quantity || 1
        const rev = qty * (i.mrp || i.price || 0)
        if (!map[name]) map[name] = { qty: 0, rev: 0 }
        map[name].qty += qty
        map[name].rev += rev
      })
    })
    return Object.keys(map).map(k => ({ name: k, ...map[k] })).sort((a, b) => b.rev - a.rev)
  }, [allSales])

  // 4. Customer wise
  const customerSales = useMemo(() => {
    const map: Record<string, { name: string, phone: string, count: number, spent: number }> = {}
    allSales.forEach(s => {
      const phone = s.customer_phone
      if (!phone) return
      if (!map[phone]) map[phone] = { name: s.customer_name || 'Unknown', phone, count: 0, spent: 0 }
      map[phone].count += 1
      map[phone].spent += (s.total_amount || s.total || 0)
    })
    return Object.values(map).sort((a, b) => b.spent - a.spent)
  }, [allSales])

  // --- EXPORTS ---
  const exportCSV = (filename: string, rows: any[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${filename}_${new Date().getTime()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportDaily = () => {
    const rows = [
      ["Date", "Reference", "Customer", "Amount"],
      ...dailySalesList.map(s => [
        new Date(s.created_at).toLocaleDateString(),
        s.bill_number || s.order_id,
        s.customer_name || 'Walk-in',
        s.total_amount || s.total
      ])
    ]
    exportCSV(`Daily_Sales_${dailyDate}`, rows)
  }

  const exportGSTR1 = () => {
    const rows = [
      ["Invoice Number", "Invoice Date", "Customer Name", "Customer GSTIN", "Taxable Value", "CGST", "SGST", "Total Invoice Value"],
      ...monthlyGSTList.filter(s => s.bill_number).map(s => [
        s.bill_number,
        new Date(s.created_at).toLocaleDateString(),
        s.customer_name || 'Walk-in',
        s.customer_gstin || 'URD',
        (s.taxable_value || 0).toFixed(2),
        (s.cgst_amount || 0).toFixed(2),
        (s.sgst_amount || 0).toFixed(2),
        (s.total_amount || 0).toFixed(2)
      ]),
      [],
      ["HSN SUMMARY"],
      ["HSN Code", "Description", "Taxable Value", "CGST", "SGST", "Total Value"],
      ...Object.keys(hsnSummary).map(hsn => [
        hsn,
        hsnSummary[hsn].desc,
        hsnSummary[hsn].taxable.toFixed(2),
        hsnSummary[hsn].cgst.toFixed(2),
        hsnSummary[hsn].sgst.toFixed(2),
        hsnSummary[hsn].total.toFixed(2)
      ])
    ]
    exportCSV(`GSTR1_${gstMonth}`, rows)
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center flex-col gap-4">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-semibold animate-pulse">Compiling Reports...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <FileSpreadsheet className="size-8 text-primary" /> Business Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Exportable analytics and CA-ready tax reports</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border/60 pb-px overflow-x-auto no-scrollbar">
        {TABS.map(t => (
          <button 
            key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        
        {/* TAB 1: DAILY SALES */}
        {activeTab === "Daily Sales" && (
          <motion.div key="daily" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-card border border-border/60 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <CalIcon className="size-5 text-muted-foreground" />
                <input 
                  type="date" 
                  value={dailyDate} 
                  onChange={(e) => setDailyDate(e.target.value)}
                  className="bg-background border border-border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary font-semibold"
                />
              </div>
              <Button onClick={exportDaily} className="rounded-xl gap-2"><Download className="size-4" /> Export CSV</Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/10 border border-primary/20 p-5 rounded-2xl">
                <div className="text-sm font-bold text-primary mb-1">Total Sales ({dailyDate})</div>
                <div className="text-3xl font-black text-foreground">{inr(dailyTotals.total)}</div>
              </div>
              <div className="bg-muted p-5 rounded-2xl border border-border/60">
                <div className="text-sm font-bold text-muted-foreground mb-1">Transactions</div>
                <div className="text-3xl font-black text-foreground">{dailySalesList.length}</div>
              </div>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-bold">
                  <tr><th className="px-6 py-4">Time</th><th className="px-6 py-4">Ref</th><th className="px-6 py-4">Customer</th><th className="px-6 py-4 text-right">Amount</th></tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {dailySalesList.map(s => (
                    <tr key={s.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4">{new Date(s.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                      <td className="px-6 py-4 font-mono text-xs font-bold">{s.bill_number || s.order_id}</td>
                      <td className="px-6 py-4">{s.customer_name || 'Walk-in'}</td>
                      <td className="px-6 py-4 text-right font-bold text-primary">{inr(s.total_amount || s.total || 0)}</td>
                    </tr>
                  ))}
                  {dailySalesList.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No sales on this date</td></tr>}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 2: MONTHLY GST (CA) */}
        {activeTab === "Monthly GST (CA)" && (
          <motion.div key="gst" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-card border border-border/60 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <FileText className="size-5 text-muted-foreground" />
                <input 
                  type="month" 
                  value={gstMonth} 
                  onChange={(e) => setGstMonth(e.target.value)}
                  className="bg-background border border-border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary font-semibold"
                />
              </div>
              <Button onClick={exportGSTR1} className="rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"><Download className="size-4" /> Download GSTR-1 Excel</Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border/60 p-4 rounded-xl">
                <div className="text-xs font-bold text-muted-foreground">Taxable Value</div>
                <div className="text-lg font-black">{inr(monthlyTotals.taxable)}</div>
              </div>
              <div className="bg-card border border-border/60 p-4 rounded-xl">
                <div className="text-xs font-bold text-muted-foreground">CGST</div>
                <div className="text-lg font-black text-orange-600">{inr(monthlyTotals.cgst)}</div>
              </div>
              <div className="bg-card border border-border/60 p-4 rounded-xl">
                <div className="text-xs font-bold text-muted-foreground">SGST</div>
                <div className="text-lg font-black text-orange-600">{inr(monthlyTotals.sgst)}</div>
              </div>
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl">
                <div className="text-xs font-bold text-primary">Grand Total</div>
                <div className="text-lg font-black text-primary">{inr(monthlyTotals.total)}</div>
              </div>
            </div>

            {/* HSN Summary */}
            <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-border/60 bg-muted/20 font-bold">HSN Summary (B2C & B2B)</div>
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-bold">
                  <tr><th className="px-6 py-3">HSN Code</th><th className="px-6 py-3">Description</th><th className="px-6 py-3 text-right">Taxable</th><th className="px-6 py-3 text-right">CGST</th><th className="px-6 py-3 text-right">SGST</th></tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {Object.keys(hsnSummary).map(hsn => (
                    <tr key={hsn} className="hover:bg-muted/30">
                      <td className="px-6 py-3 font-mono text-xs font-bold">{hsn}</td>
                      <td className="px-6 py-3 text-xs">{hsnSummary[hsn].desc}</td>
                      <td className="px-6 py-3 text-right font-semibold">{inr(hsnSummary[hsn].taxable)}</td>
                      <td className="px-6 py-3 text-right">{inr(hsnSummary[hsn].cgst)}</td>
                      <td className="px-6 py-3 text-right">{inr(hsnSummary[hsn].sgst)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Detailed Bills */}
            <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-border/60 bg-muted/20 font-bold">Generated Invoices</div>
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground uppercase font-bold">
                  <tr><th className="px-6 py-3">Invoice</th><th className="px-6 py-3">Customer</th><th className="px-6 py-3">GSTIN</th><th className="px-6 py-3 text-right">Total</th></tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {monthlyGSTList.filter(s => s.bill_number).map(s => (
                    <tr key={s.id} className="hover:bg-muted/30">
                      <td className="px-6 py-3 font-mono font-bold">{s.bill_number}</td>
                      <td className="px-6 py-3">{s.customer_name}</td>
                      <td className="px-6 py-3 font-mono">{s.customer_gstin || 'URD'}</td>
                      <td className="px-6 py-3 text-right font-bold text-primary">{inr(s.total_amount)}</td>
                    </tr>
                  ))}
                  {monthlyGSTList.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground text-sm">No invoices found for this month</td></tr>}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 3: PRODUCT WISE */}
        {activeTab === "Product wise" && (
          <motion.div key="prod" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border/60 flex justify-between items-center bg-muted/20">
              <h2 className="text-lg font-bold flex items-center gap-2"><Package className="size-5 text-primary" /> Product Sales (All Time)</h2>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-bold">
                <tr><th className="px-6 py-4">Product Name</th><th className="px-6 py-4 text-center">Total Qty Sold</th><th className="px-6 py-4 text-right">Total Revenue</th></tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {productSales.map((p, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-6 py-4 font-semibold">{p.name}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-muted px-2 py-1 rounded text-xs font-bold">{p.qty}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">{inr(p.rev)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* TAB 4: CUSTOMER WISE */}
        {activeTab === "Customer wise" && (
          <motion.div key="cust" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border/60 flex justify-between items-center bg-muted/20">
              <h2 className="text-lg font-bold flex items-center gap-2"><User className="size-5 text-primary" /> Top Customers (All Time)</h2>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-bold">
                <tr><th className="px-6 py-4">Customer Name</th><th className="px-6 py-4">Phone</th><th className="px-6 py-4 text-center">Total Orders</th><th className="px-6 py-4 text-right">Lifetime Value</th></tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {customerSales.map((c, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-6 py-4 font-semibold">{c.name}</td>
                    <td className="px-6 py-4 font-mono text-xs">{c.phone}</td>
                    <td className="px-6 py-4 text-center">{c.count}</td>
                    <td className="px-6 py-4 text-right font-black text-primary">{inr(c.spent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
