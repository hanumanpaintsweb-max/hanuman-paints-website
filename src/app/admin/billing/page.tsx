"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  Plus, Trash2, Printer, Download, MessageCircle, FileText, 
  CheckCircle2, User, Phone, Check, Receipt, History, 
  Search, FileSpreadsheet, Eye, ShoppingBag, MapPin, Building
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/services/supabase"
import { PRODUCTS } from "@/data/products"
import { inr } from "@/lib/format"
import { toast } from "sonner"

type BillItem = {
  id: string; productId: string; name: string; size: string;
  qty: number; mrp: number; taxRate: number;
}

const TABS = ["New Bill", "Online Orders", "Bill History"]
const PAYMENT_STATUSES = ["paid", "unpaid", "partial"]
const PAYMENT_METHODS = ["cash", "upi", "credit"]
const TIN_WOOD_CATEGORIES = ["Tinters", "Woodcare"] // 12% GST items, rest 18%

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState("New Bill")
  const printRef = useRef<HTMLDivElement>(null)

  // -- APP STATE --
  const [settings, setSettings] = useState<any>({})
  const [bills, setBills] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])

  // -- TAB 1: NEW BILL STATE --
  const [billNoStr, setBillNoStr] = useState<string>("")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [customerGstin, setCustomerGstin] = useState("")
  const [items, setItems] = useState<BillItem[]>([])
  const [paymentStatus, setPaymentStatus] = useState("paid")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [linkedOrderId, setLinkedOrderId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [savedBillData, setSavedBillData] = useState<any | null>(null)
  const [globalDiscount, setGlobalDiscount] = useState<number>(5)

  // -- TAB 3: HISTORY STATE --
  const [historySearch, setHistorySearch] = useState("")
  const [historyFilter, setHistoryFilter] = useState("All")

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    // 1. Settings
    const { data: setts } = await supabase.from('settings').select('*')
    if (setts) {
      const sObj: any = {}
      setts.forEach(s => sObj[s.key] = s.value)
      setSettings(sObj)
    }

    // 2. Bills
    const { data: bData } = await supabase.from('bills').select('*').eq('is_deleted', false).order('created_at', { ascending: false })
    if (bData) setBills(bData)
    
    await fetchAndSetNextBillNo()

    // 3. Orders (for Tab 2)
    const { data: oData } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (oData) setOrders(oData)
  }

  const fetchAndSetNextBillNo = async () => {
    const year = new Date().getFullYear()
    const { data } = await supabase.from('bills').select('bill_number').order('created_at', { ascending: false }).limit(1)
    let maxNum = 0
    if (data && data.length > 0) {
      const match = data[0].bill_number.match(/-(\d+)$/)
      if (match) maxNum = parseInt(match[1])
    }
    setBillNoStr(`HP-${year}-${(maxNum + 1).toString().padStart(3, '0')}`)
  }

  // --- Calculations ---
  const calculations = useMemo(() => {
    return items.reduce((acc, item) => {
      const gross = item.mrp * item.qty
      const discountVal = gross * (globalDiscount / 100)
      const taxable = gross - discountVal
      const gstVal = taxable * (item.taxRate / 100)
      return {
        subtotal: acc.subtotal + gross,
        discount: acc.discount + discountVal,
        taxable: acc.taxable + taxable,
        gst: acc.gst + gstVal,
        total: acc.total + taxable + gstVal,
      }
    }, { subtotal: 0, discount: 0, taxable: 0, gst: 0, total: 0 })
  }, [items, globalDiscount])

  const cgst = calculations.gst / 2
  const sgst = calculations.gst / 2
  const finalTotal = Math.round(calculations.total)

  // --- Actions ---
  const handleAddRow = () => {
    setItems([...items, {
      id: Math.random().toString(36).substr(2, 9),
      productId: "", name: "", size: "", qty: 1, mrp: 0, taxRate: 18
    }])
  }

  const handleProductSelect = (index: number, productId: string) => {
    const product = PRODUCTS.find((p) => p.id === productId)
    if (!product) return
    const newItems = [...items]
    const taxRate = TIN_WOOD_CATEGORIES.includes(product.category) ? 12 : 18
    const defaultSize = product.sizes?.[0]
    newItems[index] = { ...newItems[index], productId: product.id, name: product.name, size: defaultSize?.size || "", mrp: defaultSize?.mrp || 0, taxRate }
    setItems(newItems)
  }

  const loadOrderToBill = (order: any) => {
    setCustomerName(order.customer_name)
    setCustomerPhone(order.customer_phone)
    setCustomerAddress(order.customer_address)
    setLinkedOrderId(order.order_id)
    
    const mappedItems: BillItem[] = order.items?.map((item: any) => {
      const product = PRODUCTS.find(p => p.id === item.id)
      return {
        id: Math.random().toString(36).substr(2, 9),
        productId: item.id || "",
        name: item.name,
        size: item.size,
        qty: item.quantity || item.qty || 1,
        mrp: item.price || item.mrp || 0,
        taxRate: product && TIN_WOOD_CATEGORIES.includes(product.category) ? 12 : 18
      }
    }) || []
    setItems(mappedItems)
    setSavedBillData(null)
    setActiveTab("New Bill")
  }

  const handleSaveBill = async () => {
    if (!customerName || customerPhone.replace(/\D/g,'').length !== 10) {
      toast.error("Valid customer name and 10-digit phone required")
      return
    }
    if (items.length === 0 || items.some(i => !i.productId)) {
      toast.error("Please add valid products to the bill")
      return
    }

    setIsSaving(true)
    
    // Fetch latest number right before saving to prevent duplicates
    const year = new Date().getFullYear()
    const { data: latestData } = await supabase.from('bills').select('bill_number').order('created_at', { ascending: false }).limit(1)
    let maxNum = 0
    if (latestData && latestData.length > 0) {
      const match = latestData[0].bill_number.match(/-(\d+)$/)
      if (match) maxNum = parseInt(match[1])
    }
    const finalBillNoStr = `HP-${year}-${(maxNum + 1).toString().padStart(3, '0')}`
    setBillNoStr(finalBillNoStr)

    const billData = {
      bill_number: finalBillNoStr,
      customer_name: customerName,
      customer_phone: customerPhone.replace(/\D/g,''),
      customer_address: customerAddress || null,
      customer_gstin: customerGstin || null,
      items: items,
      subtotal: parseFloat(calculations.subtotal.toFixed(2)),
      discount_amount: parseFloat(calculations.discount.toFixed(2)),
      taxable_value: parseFloat(calculations.taxable.toFixed(2)),
      cgst_amount: parseFloat(cgst.toFixed(2)),
      sgst_amount: parseFloat(sgst.toFixed(2)),
      total_amount: parseFloat(finalTotal.toFixed(2)),
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      order_id: linkedOrderId || null
    }

    console.log('Saving bill data:', billData)

    const { data, error } = await supabase.from("bills").insert([billData]).select()
    
    console.log('Supabase response:', data, error)

    setIsSaving(false)

    if (error) {
      console.error('Supabase error:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      console.error('Error details:', error.details)

      if (error.code === '23505') toast.error("Bill number already exists!") // Unique constraint
      else toast.error("Failed to save bill")
    } else {
      toast.success("Bill saved successfully!")
      const newBill = data[0]
      setSavedBillData(newBill)
      setBills([newBill, ...bills])
    }
  }

  const handlePDF = () => {
    const printArea = document.getElementById('bill-print-area')
    if (!printArea) return
    
    const billNumber = savedBillData?.bill_number || billNoStr
    const cName = customerName ? `-${customerName.replace(/[^a-zA-Z0-9]/g, '')}` : ''
    const fileName = `${billNumber}${cName}`

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error("Please allow popups to download PDF")
      return
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${fileName}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { 
              margin: 0;
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
            }
            @media print {
              @page { size: A4 portrait; margin: 5mm; }
            }
          </style>
        </head>
        <body class="bg-white">
          <div style="width: 210mm; margin: 0 auto; padding: 20px;">
            ${printArea.innerHTML}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print()
                window.close()
              }, 800) // Wait for tailwind to apply
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const shareWhatsApp = () => {
    const text = `Namaste ${customerName}!\n\nAapka Hanuman Paints ka bill ${savedBillData?.bill_number} generate ho gaya hai.\n\nTotal Amount: ${inr(finalTotal)}\nPayment Status: ${paymentStatus.toUpperCase()}\n\nDhanyawad! 🎨`
    const url = `https://wa.me/91${customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
  }

  const resetForm = async () => {
    setCustomerName("")
    setCustomerPhone("")
    setCustomerAddress("")
    setCustomerGstin("")
    setItems([])
    setPaymentStatus("paid")
    setPaymentMethod("cash")
    setGlobalDiscount(5)
    setLinkedOrderId(null)
    setSavedBillData(null)
    await fetchAndSetNextBillNo()
  }

  const exportToExcel = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,Bill Number,Customer,Phone,Total Amount,Status,Method\n" +
      filteredBills.map(b => `${new Date(b.created_at).toLocaleDateString()},${b.bill_number},${b.customer_name},${b.customer_phone},${b.total_amount},${b.payment_status},${b.payment_method}`).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `bills_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const updateBillStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('bills').update({ payment_status: newStatus }).eq('id', id)
    if (!error) {
      setBills(bills.map(b => b.id === id ? { ...b, payment_status: newStatus } : b))
      toast.success("Payment status updated")
    }
  }

  const deleteBill = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return
    const { error } = await supabase.from('bills').update({ is_deleted: true }).eq('id', id)
    if (!error) {
      setBills(bills.filter(b => b.id !== id))
      toast.success("Bill deleted")
    }
  }

  // View Bill from History
  const viewHistoricalBill = (bill: any) => {
    setBillNoStr(bill.bill_number)
    setCustomerName(bill.customer_name)
    setCustomerPhone(bill.customer_phone)
    setCustomerAddress(bill.customer_address || "")
    setCustomerGstin(bill.customer_gstin || "")
    setItems(bill.items)
    setPaymentStatus(bill.payment_status)
    setPaymentMethod(bill.payment_method)
    // If we want to restore historical discount, we would need to save it in bill object.
    // For now, calculating backwards or setting to default 5 is fine.
    setGlobalDiscount(5)
    setLinkedOrderId(bill.order_id)
    setSavedBillData(bill)
    setActiveTab("New Bill")
  }

  // Filter Bills
  const filteredBills = useMemo(() => {
    return bills.filter(b => {
      if (historyFilter !== "All" && b.payment_status !== historyFilter.toLowerCase()) return false
      if (historySearch) {
        const s = historySearch.toLowerCase()
        return b.bill_number.toLowerCase().includes(s) || b.customer_name.toLowerCase().includes(s) || b.customer_phone.includes(s)
      }
      return true
    })
  }, [bills, historyFilter, historySearch])

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Receipt className="size-8 text-primary" /> Billing System
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Generate GST invoices and manage accounts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/60 pb-px">
        {TABS.map(t => (
          <button 
            key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "New Bill" && (
          <motion.div key="new-bill" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid gap-6 xl:grid-cols-12">
            
            {/* Left: Form */}
            <div className="xl:col-span-7 space-y-6">
              {savedBillData && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 p-4 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-2"><CheckCircle2 className="size-5" /> Bill #{savedBillData.bill_number} Saved</div>
                  <Button variant="outline" size="sm" onClick={resetForm} className="bg-white hover:bg-emerald-50 text-emerald-700">Create New</Button>
                </div>
              )}

              {/* Customer Info */}
              <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-bold flex items-center gap-2"><User className="size-5 text-primary" /> Customer Info</h2>
                  <div className="text-sm font-bold bg-muted px-3 py-1 rounded-lg">No: {billNoStr}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Customer Name *</label>
                    <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} disabled={!!savedBillData} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Phone Number *</label>
                    <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} disabled={!!savedBillData} maxLength={10} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground">Address</label>
                    <input type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} disabled={!!savedBillData} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground">GSTIN (Optional B2B)</label>
                    <input type="text" value={customerGstin} onChange={e => setCustomerGstin(e.target.value.toUpperCase())} disabled={!!savedBillData} maxLength={15} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold flex items-center gap-2"><ShoppingBag className="size-5 text-primary" /> Products</h2>
                  {!savedBillData && <Button onClick={handleAddRow} size="sm" variant="secondary" className="rounded-lg h-8 gap-1"><Plus className="size-4" /> Add Item</Button>}
                </div>

                <div className="grid grid-cols-12 gap-2 text-xs font-bold text-muted-foreground mb-2 px-2">
                  <div className="col-span-4">Product</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-1 text-center">Qty</div>
                  <div className="col-span-2 text-center">Price(₹)</div>
                  <div className="col-span-1 text-center">GST</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => {
                    const product = PRODUCTS.find(p => p.id === item.productId)
                    return (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-muted/40 p-3 rounded-xl border border-border/60 relative group">
                        {!savedBillData && (
                          <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="absolute -right-2 -top-2 bg-red-100 text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="size-3" /></button>
                        )}
                        <div className="col-span-4">
                          <select disabled={!!savedBillData} value={item.productId} onChange={(e) => handleProductSelect(index, e.target.value)} className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none">
                            <option value="">Select Product...</option>
                            {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <select disabled={!!savedBillData || !product} value={item.size} onChange={e => {
                            const newI = [...items]; newI[index].size = e.target.value;
                            newI[index].mrp = product?.sizes?.find(s => s.size === e.target.value)?.mrp || 0;
                            setItems(newI);
                          }} className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none">
                            <option value="">Size</option>
                            {product?.sizes?.map(s => <option key={s.size} value={s.size}>{s.size}</option>)}
                          </select>
                        </div>
                        <div className="col-span-1">
                          <input disabled={!!savedBillData} type="number" min="1" value={item.qty} onChange={e => {
                            const newI = [...items]; newI[index].qty = Math.max(1, parseInt(e.target.value) || 1); setItems(newI)
                          }} className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-center outline-none" />
                        </div>
                        <div className="col-span-2">
                          <input disabled={!!savedBillData} type="number" placeholder="Price" value={item.mrp || ""} onChange={e => {
                            const newI = [...items]; newI[index].mrp = parseFloat(e.target.value) || 0; setItems(newI)
                          }} className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none" />
                        </div>
                        <div className="col-span-1">
                          <select disabled={!!savedBillData} value={item.taxRate} onChange={e => {
                            const newI = [...items]; newI[index].taxRate = parseFloat(e.target.value) || 0; setItems(newI)
                          }} className="w-full rounded-lg border border-border bg-background px-1 py-1.5 text-xs outline-none">
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                            <option value="28">28%</option>
                          </select>
                        </div>
                        <div className="col-span-2 text-right font-bold text-sm text-primary">
                          {inr((item.mrp * item.qty * (1 - globalDiscount/100)) * (1 + item.taxRate/100))}
                        </div>
                      </div>
                    )
                  })}
                  {items.length === 0 && <div className="text-center py-6 text-muted-foreground border border-dashed rounded-xl text-sm">No items. Click Add Item to start.</div>}
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm grid grid-cols-2 gap-6">
                <div>
                  <h2 className="text-sm font-bold uppercase text-muted-foreground mb-3">Payment Info</h2>
                  <div className="space-y-4">
                    
                    {/* Global Discount */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Global Discount</label>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {[0, 5, 10, 15, 20].map(d => (
                          <button 
                            key={d}
                            disabled={!!savedBillData}
                            onClick={() => setGlobalDiscount(d)}
                            className={`px-2 py-1 text-xs font-bold rounded-md border transition-colors ${globalDiscount === d ? 'bg-orange-500 text-white border-orange-600' : 'bg-background text-muted-foreground hover:bg-muted'}`}
                          >
                            {d}%
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <input 
                          disabled={!!savedBillData}
                          type="number" 
                          value={globalDiscount || ""} 
                          onChange={e => setGlobalDiscount(parseFloat(e.target.value) || 0)} 
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none" 
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <select disabled={!!savedBillData} value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                        {PAYMENT_STATUSES.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                      </select>
                      <select disabled={!!savedBillData} value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                        {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{inr(calculations.subtotal)}</span></div>
                  <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{inr(calculations.discount)}</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>Taxable Value</span><span>{inr(calculations.taxable)}</span></div>
                  <div className="flex justify-between text-muted-foreground text-xs"><span>CGST 9%</span><span>+{inr(cgst)}</span></div>
                  <div className="flex justify-between text-muted-foreground text-xs border-b border-border pb-2"><span>SGST 9%</span><span>+{inr(sgst)}</span></div>
                  <div className="flex justify-between font-extrabold text-lg text-foreground pt-1"><span>Grand Total</span><span className="text-primary">{inr(finalTotal)}</span></div>
                </div>
              </div>

            </div>

            {/* Right: PDF Preview & Actions */}
            <div className="xl:col-span-5 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleSaveBill} disabled={isSaving || !!savedBillData} className="rounded-xl w-full">{isSaving ? 'Saving...' : 'Save Bill'}</Button>
                <Button onClick={handlePDF} disabled={!savedBillData} variant="secondary" className="rounded-xl w-full"><Download className="size-4 mr-2"/> PDF</Button>
                <Button onClick={() => window.print()} disabled={!savedBillData} variant="outline" className="rounded-xl w-full"><Printer className="size-4 mr-2"/> Print</Button>
                <Button onClick={shareWhatsApp} disabled={!savedBillData} className="rounded-xl w-full bg-[#25D366] hover:bg-[#128C7E] text-white"><MessageCircle className="size-4 mr-2"/> Share</Button>
              </div>

              {/* PDF Container Wrapper */}
              <div className="border border-border/60 bg-white rounded-2xl overflow-hidden shadow-inner flex justify-center p-4 no-print">
                <div id="bill-print-area" ref={printRef} className="bg-white p-8 w-[210mm] min-h-[297mm] text-black shadow-lg origin-top scale-[0.45] sm:scale-[0.5] md:scale-[0.6] xl:scale-[0.55] print:scale-100 print:shadow-none print:w-full print:p-0">
                  {/* PDF Header */}
                  <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-4">
                    <div>
                      <h1 className="text-3xl font-extrabold text-orange-600 uppercase">{settings.shop_name || "Hanuman Paints"}</h1>
                      <p className="text-sm font-bold text-gray-600 mt-1">Authorized Dulux Dealer</p>
                      <p className="text-xs text-gray-500 mt-1 max-w-xs">{settings.shop_address}</p>
                      <p className="text-xs text-gray-500 mt-1 font-semibold">GSTIN: {settings.shop_gstin}</p>
                      <p className="text-xs text-gray-500">Ph: {settings.shop_phone}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-gray-200 uppercase tracking-widest">TAX INVOICE</div>
                      <div className="mt-2 text-sm"><strong>Bill No:</strong> {savedBillData?.bill_number || billNoStr}</div>
                      <div className="text-sm"><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="border border-gray-300 rounded p-4 mb-6 bg-gray-50">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
                    <div className="flex justify-between">
                      <div>
                        <div className="font-bold text-lg">{customerName || "Cash Customer"}</div>
                        <div className="text-sm text-gray-600">{customerPhone}</div>
                        {customerAddress && <div className="text-sm text-gray-600">{customerAddress}</div>}
                      </div>
                      {customerGstin && (
                        <div className="text-right">
                          <div className="text-xs text-gray-500 font-bold uppercase">Customer GSTIN</div>
                          <div className="text-sm font-mono">{customerGstin}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items Table */}
                  <table className="w-full mb-6 border-collapse">
                    <thead>
                      <tr className="bg-gray-800 text-white text-xs uppercase">
                        <th className="py-2 px-2 text-left">S.No</th>
                        <th className="py-2 px-2 text-left">Item Description</th>
                        <th className="py-2 px-2 text-center">Qty</th>
                        <th className="py-2 px-2 text-right">MRP</th>
                        <th className="py-2 px-2 text-right">Disc%</th>
                        <th className="py-2 px-2 text-right">Taxable</th>
                        <th className="py-2 px-2 text-right">GST%</th>
                        <th className="py-2 px-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm border-b-2 border-gray-800">
                      {items.map((item, i) => {
                        const gross = item.mrp * item.qty; const disc = gross * (globalDiscount/100);
                        const taxable = gross - disc; const gst = taxable * (item.taxRate/100);
                        return (
                          <tr key={i} className="border-b border-gray-200">
                            <td className="py-3 px-2 text-gray-500">{i+1}</td>
                            <td className="py-3 px-2"><strong>{item.name}</strong><br/><span className="text-xs text-gray-500">{item.size}</span></td>
                            <td className="py-3 px-2 text-center">{item.qty}</td>
                            <td className="py-3 px-2 text-right">{item.mrp.toFixed(2)}</td>
                            <td className="py-3 px-2 text-right">{globalDiscount}%</td>
                            <td className="py-3 px-2 text-right">{taxable.toFixed(2)}</td>
                            <td className="py-3 px-2 text-right">{item.taxRate}%</td>
                            <td className="py-3 px-2 text-right font-bold">{(taxable + gst).toFixed(2)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  {/* Totals */}
                  <div className="flex justify-between items-end">
                    <div className="text-xs text-gray-500 space-y-1">
                      <p><strong>Terms & Conditions:</strong></p>
                      <p>1. Goods once sold cannot be returned or exchanged.</p>
                      <p>2. Subject to Muzaffarpur jurisdiction only.</p>
                      <p className="mt-4 italic">Payment Status: <strong className="uppercase">{paymentStatus}</strong> via {paymentMethod}</p>
                    </div>
                    <div className="w-64">
                      <div className="flex justify-between text-sm py-1 border-b border-gray-100"><span>Sub Total</span><span>{calculations.subtotal.toFixed(2)}</span></div>
                      <div className="flex justify-between text-sm py-1 border-b border-gray-100 text-green-700"><span>Discount</span><span>-{calculations.discount.toFixed(2)}</span></div>
                      <div className="flex justify-between text-sm py-1 border-b border-gray-100"><span>Taxable Value</span><span>{calculations.taxable.toFixed(2)}</span></div>
                      <div className="flex justify-between text-sm py-1 border-b border-gray-100"><span>CGST 9%</span><span>{cgst.toFixed(2)}</span></div>
                      <div className="flex justify-between text-sm py-1 border-b border-gray-800"><span>SGST 9%</span><span>{sgst.toFixed(2)}</span></div>
                      <div className="flex justify-between text-xl font-black py-2"><span>Grand Total</span><span>₹{finalTotal.toFixed(2)}</span></div>
                    </div>
                  </div>

                  <div className="mt-16 flex justify-between border-t border-gray-300 pt-4 text-sm font-bold text-gray-600">
                    <div>Customer Signature</div>
                    <div>Authorized Signatory</div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {activeTab === "Online Orders" && (
          <motion.div key="online" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid gap-4">
              {orders.map(order => {
                const isBilled = bills.some(b => b.order_id === order.order_id)
                return (
                  <div key={order.id} className="bg-card border border-border/60 p-5 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="font-bold flex items-center gap-2">#{order.order_id} {isBilled && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded uppercase">Billed</span>}</div>
                      <div className="text-sm text-muted-foreground mt-1">{order.customer_name} • {order.customer_phone}</div>
                      <div className="text-xs font-semibold text-primary mt-1">{inr(order.total_amount)}</div>
                    </div>
                    <Button onClick={() => loadOrderToBill(order)} disabled={isBilled} variant={isBilled ? "secondary" : "default"} className="rounded-xl">
                      {isBilled ? "Already Billed" : "Generate Bill"}
                    </Button>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {activeTab === "Bill History" && (
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input type="text" placeholder="Search bill no, name, phone..." value={historySearch} onChange={e => setHistorySearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm" />
              </div>
              <select value={historyFilter} onChange={e => setHistoryFilter(e.target.value)} className="px-4 py-2 bg-background border border-border rounded-xl text-sm">
                <option value="All">All Status</option>
                {PAYMENT_STATUSES.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
              </select>
              <Button onClick={exportToExcel} variant="outline" className="rounded-xl gap-2"><FileSpreadsheet className="size-4" /> Export CSV</Button>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-bold">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Bill No</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredBills.map(bill => (
                    <tr key={bill.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4">{new Date(bill.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold">{bill.bill_number}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold">{bill.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{bill.customer_phone}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-primary">{inr(bill.total_amount)}</td>
                      <td className="px-6 py-4">
                        <select value={bill.payment_status} onChange={(e) => updateBillStatus(bill.id, e.target.value)} className={`text-xs font-bold uppercase rounded px-2 py-1 outline-none ${bill.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {PAYMENT_STATUSES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="outline" onClick={() => viewHistoricalBill(bill)} className="size-8 rounded-lg"><Eye className="size-4" /></Button>
                          <Button size="icon" variant="destructive" onClick={() => deleteBill(bill.id)} className="size-8 rounded-lg"><Trash2 className="size-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredBills.length === 0 && <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No bills found</td></tr>}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
