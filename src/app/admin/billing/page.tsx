"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  Plus, Trash2, Printer, Download, MessageCircle, FileText, 
  CheckCircle2, User, Receipt, 
  Search, FileSpreadsheet, Eye, ShoppingBag, X, Edit,
  Bell, Phone, MapPin, ScanBarcode, Minus, Building, CircleUserRound
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/services/supabase"
import { PRODUCTS } from "@/data/products"
import { inr } from "@/lib/format"
import { toast } from "sonner"
import { getSettings } from "@/lib/settings"

type BillItem = {
  id: string
  productId: string
  name: string
  size: string
  qty: number
  mrp: number
  taxRate: number
  colorCode?: string
  colorantCost?: number
}

type Settings = Record<string, string>

type Bill = {
  id: string
  bill_number: string
  customer_name: string
  customer_phone: string
  customer_address?: string

  items: BillItem[]
  subtotal: number
  discount_amount: number
  taxable_value: number
  cgst_amount: number
  sgst_amount: number
  total_amount: number
  payment_status: string
  payment_method: string
  order_id?: string
  created_at: string
  is_deleted: boolean
  bill_type?: string
}

type Order = {
  order_id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  items: Array<{ id: string; name: string; size: string; quantity: number; price: number; mrp: number }>
  total_amount: number
}

const TABS = ["New Bill", "Bill History"] // PHASE2_HIDDEN: "Online Orders"
const PAYMENT_STATUSES = ["paid", "unpaid"]
const PAYMENT_METHODS = ["cash", "upi", "credit"]
const TIN_WOOD_CATEGORIES = ["Tinters", "Woodcare"] // 12% GST items, rest 18%

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState("New Bill")
  const printRef = useRef<HTMLDivElement>(null)

  // -- APP STATE --
  const [settings, setSettings] = useState<Settings>({})
  const [bills, setBills] = useState<Bill[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  // -- TAB 1: NEW BILL STATE --
  const [billNoStr, setBillNoStr] = useState<string>("")
  const [editBillId, setEditBillId] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")

  const [items, setItems] = useState<BillItem[]>([])
  const [paymentStatus, setPaymentStatus] = useState("paid")
  const [dueDate, setDueDate] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [linkedOrderId, setLinkedOrderId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [savedBillData, setSavedBillData] = useState<Bill | null>(null)
  const [globalDiscount, setGlobalDiscount] = useState<number>(5)
  const [customerRecord, setCustomerRecord] = useState<any>(null)
  const [billMode, setBillMode] = useState<"MRP" | "DPL">("MRP")
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // -- TAB 3: HISTORY STATE --
  const [historySearch, setHistorySearch] = useState("")
  const [historyFilter, setHistoryFilter] = useState("All")
  const [selectedHistoryBill, setSelectedHistoryBill] = useState<Bill | null>(null)

  const fetchAndSetNextBillNo = async () => {
    const { data } = await supabase.from('bills').select('bill_number').order('created_at', { ascending: false }).limit(1)
    let maxNum = 0
    if (data && data.length > 0) {
      const match = data[0].bill_number.match(/-(\d+)$/)
      if (match) maxNum = parseInt(match[1])
    }
    setBillNoStr(`HP-S-${(maxNum + 1).toString().padStart(3, '0')}`)
  }

  const fetchInitialData = async () => {
    // 1. Settings
    const setts = await getSettings()
    setSettings(setts)

    // 2. Bills
    const { data: bData } = await supabase.from('bills').select('*').eq('is_deleted', false).order('created_at', { ascending: false })
    if (bData) setBills(bData)
    
    await fetchAndSetNextBillNo()

    // 3. Orders (for Tab 2)
    const { data: oData } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (oData) setOrders(oData)
  }

  useEffect(() => {
    fetchInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps

    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission()
    }

    const channel = supabase
      .channel('bills-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bills' }, (payload) => {
        const newBill = payload.new as Bill
        setBills(prev => [newBill, ...prev])
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          new Notification('Hanuman Paints', { body: `Naya Bill! ${newBill.customer_name} - ${inr(newBill.total_amount)}`, icon: '/favicon.ico' })
        }
        toast.success(`🔔 Naya Bill! ${newBill.customer_name} ka ₹${newBill.total_amount} ka bill bana`, { description: `Bill #${newBill.bill_number}` })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    const qData = localStorage.getItem('convert_quotation')
    if (qData) {
      try {
        const quotation = JSON.parse(qData)
        setCustomerName(quotation.customer_name || "")
        setCustomerPhone(quotation.customer_phone || "")
        setCustomerAddress(quotation.customer_address || "")

        setItems(quotation.items || [])
        setActiveTab("New Bill")
        localStorage.removeItem('convert_quotation')
        toast.success("Quotation loaded. You can now save it as a Bill.")
      } catch (e) {
        console.error("Failed to parse quotation data", e)
      }
    }
  }, [])

  useEffect(() => {
    const phone = customerPhone.replace(/\D/g, '')
    if (phone.length === 10) {
      supabase.from('customers').select('*').eq('phone', phone).single().then(({ data }) => {
        setCustomerRecord(data || null)
        if (data && !customerName) {
          setCustomerName(data.name)
        }
        if (data?.customer_type === 'wholesale') {
          setGlobalDiscount(10)
          toast.success("Wholesale customer detected. Wholesale discount applied.")
        } else {
          setGlobalDiscount(5)
        }
      })
    } else {
      setCustomerRecord(null)
    }
  }, [customerPhone, customerName])

  // --- Calculations ---
  const calculations = useMemo(() => {
    return items.reduce((acc, item) => {
      const gross = (item.mrp + (item.colorantCost || 0)) * item.qty
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
  const loadBillForEdit = (bill: Bill) => {
    setCustomerName(bill.customer_name || "")
    setCustomerPhone(bill.customer_phone || "")
    setCustomerAddress(bill.customer_address || "")
    setItems(bill.items || [])
    setPaymentStatus(bill.payment_status || "paid")
    setPaymentMethod(bill.payment_method || "cash")
    setBillNoStr(bill.bill_number)
    setBillMode((bill.bill_type as "MRP" | "DPL") || "MRP")
    const gross = bill.subtotal || 1
    const discPercent = bill.discount_amount ? Math.round((bill.discount_amount / gross) * 100) : 5
    setGlobalDiscount(discPercent)
    setEditBillId(bill.id)
    setSavedBillData(null)
    setActiveTab("New Bill")
  }

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

  const loadOrderToBill = (order: Order) => {
    setCustomerName(order.customer_name)
    setCustomerPhone(order.customer_phone)
    setCustomerAddress(order.customer_address)
    setLinkedOrderId(order.order_id)
    
    const mappedItems: BillItem[] = order.items?.map((item) => {
      const product = PRODUCTS.find(p => p.id === item.id)
      return {
        id: Math.random().toString(36).substr(2, 9),
        productId: item.id || "",
        name: item.name,
        size: item.size,
        qty: item.quantity || 1,
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
    
    let finalBillNoStr = billNoStr;
    if (!editBillId) {
      // Fetch latest number right before saving to prevent duplicates
      const { data: latestData } = await supabase.from('bills').select('bill_number').order('created_at', { ascending: false }).limit(1)
      let maxNum = 0
      if (latestData && latestData.length > 0) {
        const match = latestData[0].bill_number.match(/-(\d+)$/)
        if (match) maxNum = parseInt(match[1])
      }
      finalBillNoStr = `HP-S-${(maxNum + 1).toString().padStart(3, '0')}`
      setBillNoStr(finalBillNoStr)
    }

    const billData = {
      bill_number: finalBillNoStr,
      customer_name: customerName,
      customer_phone: customerPhone.replace(/\D/g,''),
      customer_address: customerAddress || null,

      items: items,
      subtotal: parseFloat(calculations.subtotal.toFixed(2)),
      discount_amount: parseFloat(calculations.discount.toFixed(2)),
      taxable_value: parseFloat(calculations.taxable.toFixed(2)),
      cgst_amount: parseFloat(cgst.toFixed(2)),
      sgst_amount: parseFloat(sgst.toFixed(2)),
      total_amount: parseFloat(finalTotal.toFixed(2)),
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      order_id: linkedOrderId || null,
      bill_type: billMode
    }

    let ledgerData: any = null
    if (paymentStatus !== 'paid' && customerPhone.replace(/\D/g,'').length === 10) {
      ledgerData = {
        customer_name: customerName,
        customer_phone: customerPhone.replace(/\D/g,''),
        type: 'receivable',
        amount: finalTotal,
        description: `Bill #${finalBillNoStr}`,
        date: new Date().toISOString().split('T')[0],
        due_date: paymentStatus === 'unpaid' && dueDate ? dueDate : null,
        bill_number: finalBillNoStr,
        status: paymentStatus === 'unpaid' ? 'pending' : paymentStatus
      }
    }

    console.log('Saving bill:', billData)
    if (ledgerData) console.log('Saving ledger:', ledgerData)

    if (editBillId) {
      const { data, error } = await supabase.from('bills').update(billData).eq('id', editBillId).select()
      setIsSaving(false)
      if (error) {
        toast.error(`Failed to update bill: ${error.message}`)
        return
      }
      toast.success("Bill updated successfully!")
      const updatedBill = data[0]
      setSavedBillData(updatedBill)
      setBills(bills.map(b => b.id === editBillId ? updatedBill : b))
      setEditBillId(null)
      return
    }

    // Try atomic RPC first
    const { data: rpcData, error: rpcError } = await supabase.rpc('save_bill_with_ledger', {
      p_bill: billData,
      p_ledger: ledgerData
    })

    console.log('Supabase RPC response:', rpcData, rpcError)

    if (!rpcError && rpcData?.success) {
      setIsSaving(false)
      toast.success("Bill saved successfully! (Atomic)")
      
      const newBill = { ...billData, id: rpcData.bill_id, created_at: new Date().toISOString() } as unknown as Bill
      setSavedBillData(newBill)
      setBills([newBill, ...bills])
      
      // Stock deduction
      let stockUpdateFailed = false
      for (const item of items) {
        if (!item.productId) continue
        const { error: stockError } = await supabase.rpc('deduct_stock', {
          p_product_id: item.productId,
          p_quantity: item.qty,
          p_changed_by: 'billing-auto'
        })
        if (stockError) stockUpdateFailed = true
      }
      if (stockUpdateFailed) toast.error("Bill saved, but stock update failed")

      // Update customer outstanding
      if (ledgerData && customerRecord) {
        await supabase.from('customers').update({
          current_outstanding: (customerRecord.current_outstanding || 0) + finalTotal,
          total_orders: (customerRecord.total_orders || 0) + 1,
          total_value: (customerRecord.total_value || 0) + finalTotal
        }).eq('id', customerRecord.id)
      }
      return
    }

    // Fallback if RPC fails or doesn't exist
    const { data, error } = await supabase.from("bills").insert([billData]).select()

    setIsSaving(false)

    console.log('Supabase Fallback response:', data, error)

    if (error) {
      if (error.code === '23505') toast.error("Bill number already exists!") // Unique constraint
      else toast.error(`Failed to save bill: ${error.message || error.details || JSON.stringify(error)} (RPC: ${rpcError?.message})`)
    } else {
      toast.success("Bill saved successfully!")
      const newBill = data[0]
      setSavedBillData(newBill)
      setBills([newBill, ...bills])

      let stockUpdateFailed = false

      for (const item of items) {
        if (!item.productId) continue

        const { error: stockError } = await supabase.rpc('deduct_stock', {
          p_product_id: item.productId,
          p_quantity: item.qty,
          p_changed_by: 'billing-auto'
        })

        if (stockError) stockUpdateFailed = true
      }

      if (stockUpdateFailed) {
        toast.error("Bill saved, but stock update failed")
      }

      if (ledgerData) {
        const { error: ledgerError } = await supabase.from('ledger').insert([ledgerData])
        
        if (ledgerError) {
          toast.error("⚠️ BILL SAVE HUA BUT UDHAAR ENTRY FAIL HUI. Ledger page mein manually add karo.")
        }
        
        if (customerRecord) {
          await supabase.from('customers').update({
            current_outstanding: (customerRecord.current_outstanding || 0) + finalTotal,
            total_orders: (customerRecord.total_orders || 0) + 1,
            total_value: (customerRecord.total_value || 0) + finalTotal
          }).eq('id', customerRecord.id)
        }
      }
    }
  }

  const handlePDF = (targetId: string = 'bill-print-area', providedBillData?: Bill) => {
    const printArea = document.getElementById(targetId)
    if (!printArea) return
    
    const bd = providedBillData || savedBillData
    const billNumber = bd?.bill_number || billNoStr
    const cName = bd?.customer_name ? `-${bd.customer_name.replace(/[^a-zA-Z0-9]/g, '')}` : (customerName ? `-${customerName.replace(/[^a-zA-Z0-9]/g, '')}` : '')
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

    setItems([])
    setPaymentStatus("paid")
    setDueDate("")
    setPaymentMethod("cash")
    setGlobalDiscount(5)
    setLinkedOrderId(null)
    setSavedBillData(null)
    setEditBillId(null)
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

  const deleteBill = async (bill: Bill) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return
    const pwd = window.prompt("Enter password to confirm deletion:")
    if (pwd !== "1234") {
      toast.error("Incorrect password. Deletion cancelled.")
      return
    }
    const { error } = await supabase.from('bills').update({ is_deleted: true }).eq('id', bill.id)
    if (!error) {
      setBills(bills.filter(b => b.id !== bill.id))
      toast.success("Bill deleted")
      const { error: ledgerError } = await supabase.from('ledger').delete().eq('bill_number', bill.bill_number)
      if (ledgerError) console.error("Failed to delete ledger entry:", ledgerError)
    } else {
      toast.error("Failed to delete bill")
    }
  }

  // View Bill from History
  const viewHistoricalBill = (bill: Bill) => {
    setSelectedHistoryBill(bill)
  }

  // Filter Bills
  const filteredBills = bills.filter(b => {
    if (historyFilter !== "All" && b.payment_status !== historyFilter.toLowerCase()) return false
    if (historySearch) {
      const s = historySearch.toLowerCase()
      return b.bill_number.toLowerCase().includes(s) || b.customer_name.toLowerCase().includes(s) || b.customer_phone.includes(s)
    }
    return true
  })

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            {activeTab === "New Bill" ? "Create New Bill" : activeTab}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64 bg-background" />
          </div>
          <button className="p-2 border border-border/60 rounded-xl hover:bg-muted relative">
            <Bell className="size-5 text-muted-foreground" />
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="p-1 border border-border/60 rounded-full bg-muted">
            <CircleUserRound className="size-7 text-muted-foreground" />
          </button>
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
        {/* Helper toggles moved here for neatness */}
        <div className="ml-auto flex bg-muted p-1 rounded-xl">
          <button onClick={() => setBillMode("MRP")} className={`px-4 py-1 text-xs font-bold rounded-lg transition-colors ${billMode === "MRP" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"}`}>MRP Bill</button>
          <button onClick={() => setBillMode("DPL")} className={`px-4 py-1 text-xs font-bold rounded-lg transition-colors ${billMode === "DPL" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"}`}>DPL Bill</button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "New Bill" && (
          <motion.div key="new-bill" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid gap-6 xl:grid-cols-12">
            
            {/* Left: Form */}
            <div className="xl:col-span-8 space-y-6">
              {savedBillData && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 p-4 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-2"><CheckCircle2 className="size-5" /> Bill #{savedBillData.bill_number} Saved</div>
                  <Button variant="outline" size="sm" onClick={resetForm} className="bg-white hover:bg-emerald-50 text-emerald-700">Create New</Button>
                </div>
              )}

              {/* Customer Info Card */}
              <div className="bg-white border border-border/60 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-bold flex items-center gap-2"><User className="size-5 text-primary" /> Customer Details</h2>
                  <div className="flex gap-2 items-center">
                    {customerRecord && customerRecord.credit_limit > 0 && (
                      <div className={`text-xs font-bold px-3 py-1 rounded-lg ${customerRecord.current_outstanding + finalTotal > customerRecord.credit_limit ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        Credit Limit: {inr(customerRecord.credit_limit)} | Out: {inr(customerRecord.current_outstanding)}
                        {customerRecord.current_outstanding + finalTotal > customerRecord.credit_limit && ' (LIMIT EXCEEDED)'}
                      </div>
                    )}
                    <div className="text-sm font-bold bg-muted px-3 py-1 rounded-lg text-muted-foreground border border-border/60">No: {billNoStr}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Mobile Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input type="tel" placeholder="Enter mobile number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} disabled={!!savedBillData} maxLength={10} className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Customer Name *</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input type="text" placeholder="Enter customer name" value={customerName} onChange={e => setCustomerName(e.target.value)} disabled={!!savedBillData} className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground">Billing Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input type="text" placeholder="Enter full address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} disabled={!!savedBillData} className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Products & Items Card */}
              <div className="bg-white border border-border/60 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold flex items-center gap-2"><ShoppingBag className="size-5 text-primary" /> Products & Items</h2>
                  {!savedBillData && <Button onClick={handleAddRow} size="sm" className="rounded-xl h-9 gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold"><Plus className="size-4" /> Add Item</Button>}
                </div>

                {!savedBillData && (
                  <div className="mb-6 space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Item Search</label>
                    <div className="relative">
                      <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                      <input type="text" placeholder="Scan barcode or search by name" className="w-full rounded-xl border border-border bg-background pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                  </div>
                )}

                <div className="border border-border/60 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 text-xs font-bold text-muted-foreground bg-muted/40 p-3 border-b border-border/60">
                    <div className="col-span-6">Item Description</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-center">Rate</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>

                  <div className="divide-y divide-border/60">
                    {items.map((item, index) => {
                      const product = PRODUCTS.find(p => p.id === item.productId)
                      const itemAmount = ((item.mrp + (item.colorantCost || 0)) * item.qty * (1 - globalDiscount/100)) * (1 + item.taxRate/100);
                      return (
                        <div key={item.id} className="p-3 relative group flex flex-col gap-3 bg-white">
                          <div className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-6 flex flex-col gap-2">
                              <select disabled={!!savedBillData} value={item.productId} onChange={(e) => handleProductSelect(index, e.target.value)} className="w-full rounded-lg border-0 bg-transparent text-sm font-semibold focus:ring-0 p-0 cursor-pointer appearance-none outline-none">
                                <option value="" disabled>Select Product...</option>
                                {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                              </select>
                              <select disabled={!!savedBillData || !product} value={item.size} onChange={e => {
                                const newI = [...items]; newI[index].size = e.target.value;
                                newI[index].mrp = product?.sizes?.find(s => s.size === e.target.value)?.mrp || 0;
                                setItems(newI);
                              }} className="text-xs text-muted-foreground bg-transparent border-0 p-0 cursor-pointer outline-none w-max">
                                <option value="" disabled>Size</option>
                                {product?.sizes?.map(s => <option key={s.size} value={s.size}>{s.size}</option>)}
                              </select>
                            </div>
                            
                            <div className="col-span-2 flex justify-center">
                              <div className="flex items-center border border-border/60 rounded-lg overflow-hidden bg-background">
                                <button disabled={!!savedBillData} onClick={() => { const newI = [...items]; newI[index].qty = Math.max(1, newI[index].qty - 1); setItems(newI) }} className="px-2 py-1.5 text-muted-foreground hover:bg-muted border-r border-border/60"><Minus className="size-3" /></button>
                                <input disabled={!!savedBillData} type="number" min="1" value={item.qty} onChange={e => {
                                  const newI = [...items]; newI[index].qty = Math.max(1, parseInt(e.target.value) || 1); setItems(newI)
                                }} className="w-10 text-center text-xs font-semibold p-0 border-0 outline-none focus:ring-0 bg-transparent" />
                                <button disabled={!!savedBillData} onClick={() => { const newI = [...items]; newI[index].qty += 1; setItems(newI) }} className="px-2 py-1.5 text-muted-foreground hover:bg-muted border-l border-border/60"><Plus className="size-3" /></button>
                              </div>
                            </div>
                            
                            <div className="col-span-2 flex items-center justify-center gap-1 text-sm">
                              <span className="text-muted-foreground">₹</span>
                              <input disabled={!!savedBillData} type="number" value={item.mrp || ""} onChange={e => {
                                const newI = [...items]; newI[index].mrp = parseFloat(e.target.value) || 0; setItems(newI)
                              }} className="w-16 text-center text-sm p-0 border-0 outline-none focus:ring-0 bg-transparent" />
                            </div>
                            
                            <div className="col-span-2 flex items-center justify-end gap-2 text-sm font-bold">
                              ₹ {itemAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              {!savedBillData && (
                                <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-red-500 hover:text-red-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="size-4" /></button>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-4 items-center">
                            {!expandedItems.has(item.id) ? (
                              <button onClick={() => { const ns = new Set(expandedItems); ns.add(item.id); setExpandedItems(ns); }} className="text-xs text-primary hover:underline">+ Add Colorant / Tax</button>
                            ) : (
                              <div className="flex gap-4 items-center bg-muted/20 p-2 rounded-lg w-full border border-border/40">
                                <div className="flex items-center gap-2">
                                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Color Code</label>
                                  <input disabled={!!savedBillData} type="text" value={item.colorCode || ""} onChange={e => { const newI = [...items]; newI[index].colorCode = e.target.value; setItems(newI) }} className="w-20 rounded-md border border-border bg-background px-2 py-1 text-xs outline-none" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Colorant Cost</label>
                                  <input disabled={!!savedBillData} type="number" value={item.colorantCost || ""} onChange={e => { const newI = [...items]; newI[index].colorantCost = parseFloat(e.target.value) || 0; setItems(newI) }} className="w-16 rounded-md border border-border bg-background px-2 py-1 text-xs outline-none" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">GST %</label>
                                  <select disabled={!!savedBillData} value={item.taxRate} onChange={e => {
                                    const newI = [...items]; newI[index].taxRate = parseFloat(e.target.value) || 0; setItems(newI)
                                  }} className="rounded-md border border-border bg-background px-1 py-1 text-xs outline-none">
                                    <option value="0">0%</option><option value="5">5%</option><option value="12">12%</option><option value="18">18%</option><option value="28">28%</option>
                                  </select>
                                </div>
                                {!savedBillData && <button onClick={() => { const ns = new Set(expandedItems); ns.delete(item.id); setExpandedItems(ns); const newI = [...items]; delete newI[index].colorCode; delete newI[index].colorantCost; setItems(newI); }} className="text-xs text-red-500 font-bold hover:underline ml-auto">Hide</button>}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {items.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No items added. Search or add a new item above.</div>}
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-white border border-border/60 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-6"><Receipt className="size-5 text-primary" /> Payment & Remarks</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-2">Quick Discounts</label>
                      <div className="flex flex-wrap gap-2">
                        {[{val: 0, label: "None"}, {val: 2, label: "2% Cash"}, {val: 5, label: "5% Trade"}, {val: 10, label: "10%"}, {val: 15, label: "15%"}].map(d => (
                          <button 
                            key={d.val}
                            disabled={!!savedBillData}
                            onClick={() => setGlobalDiscount(d.val)}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-colors ${globalDiscount === d.val ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-background text-muted-foreground border-border hover:bg-muted'}`}
                          >
                            {d.label}
                          </button>
                        ))}
                        <div className="flex items-center">
                           <input 
                              disabled={!!savedBillData}
                              type="number" 
                              placeholder="Custom"
                              value={![0,2,5,10,15].includes(globalDiscount) ? globalDiscount : ""} 
                              onChange={e => setGlobalDiscount(parseFloat(e.target.value) || 0)} 
                              className={`w-20 rounded-full border px-3 py-1.5 text-xs outline-none transition-colors ${![0,2,5,10,15].includes(globalDiscount) ? 'bg-blue-100 text-blue-700 border-blue-200 focus:ring-2 focus:ring-blue-500' : 'bg-background text-muted-foreground border-border focus:ring-2 focus:ring-primary'}`} 
                            />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-2">Payment Mode</label>
                      <div className="flex flex-wrap gap-2">
                        {PAYMENT_METHODS.map(p => (
                          <button 
                            key={p}
                            disabled={!!savedBillData}
                            onClick={() => setPaymentMethod(p)}
                            className={`px-6 py-2 text-sm font-semibold rounded-xl border transition-colors capitalize ${paymentMethod === p ? 'bg-[#0f2142] text-white border-[#0f2142]' : 'bg-background text-muted-foreground border-border hover:bg-muted'}`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-2">Remarks / Internal Note</label>
                      <textarea 
                        disabled={!!savedBillData}
                        placeholder="Add any notes here..."
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none h-24 resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <Button onClick={handleSaveBill} disabled={isSaving || !!savedBillData} className="rounded-xl w-full h-12 text-lg font-bold bg-[#0f2142] hover:bg-[#0f2142]/90 shadow-md">
                    <Printer className="size-5 mr-2" /> {isSaving ? 'Saving...' : 'Generate Bill'}
                  </Button>
                </div>
              </div>

            </div>

            {/* Right: PDF Preview & Actions */}
            <div className="xl:col-span-4 space-y-4">
              
              {savedBillData && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Button onClick={() => handlePDF()} variant="secondary" className="rounded-xl w-full"><Download className="size-4 mr-2"/> PDF</Button>
                  <Button onClick={() => window.print()} variant="outline" className="rounded-xl w-full"><Printer className="size-4 mr-2"/> Print</Button>
                  <Button onClick={shareWhatsApp} className="col-span-2 rounded-xl w-full bg-[#25D366] hover:bg-[#128C7E] text-white"><MessageCircle className="size-4 mr-2"/> Share on WhatsApp</Button>
                </div>
              )}

              {/* LIVE RECEIPT PREVIEW */}
              <div className="bg-white border border-border/60 rounded-2xl p-6 shadow-sm flex flex-col font-mono text-sm print:hidden">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-black tracking-wider text-[#0f2142]">{settings.shop_name || "HANUMAN PAINTS"}</h1>
                  <p className="text-xs text-muted-foreground mt-1">{settings.shop_address || "123 Market Road, Central District"}</p>
                  <p className="text-xs text-muted-foreground">Ph: 8292889540</p>
                  <p className="text-xs text-muted-foreground font-bold mt-1">GSTIN: {settings.shop_gstin || "22AAAAA0000A1Z5"}</p>
                </div>

                <div className="flex justify-between text-xs mb-1">
                  <span>Bill No: <strong>{savedBillData?.bill_number || billNoStr}</strong></span>
                  <span>Time: <strong>{new Date().toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'})}</strong></span>
                </div>
                <div className="flex justify-between text-xs mb-4">
                  <span>Date: <strong>{new Date().toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</strong></span>
                  <span className="capitalize">Mode: <strong>{paymentMethod}</strong></span>
                </div>

                <div className="border-t border-dashed border-gray-300 py-3 mb-3 text-xs">
                  <p>Customer: {customerName || "Walking Customer"}</p>
                  <p>Phone: {customerPhone || "-"}</p>
                </div>

                <table className="w-full text-xs mb-4">
                  <thead className="border-y border-dashed border-gray-300">
                    <tr>
                      <th className="py-2 text-left font-normal">Item</th>
                      <th className="py-2 text-center font-normal">Qty</th>
                      <th className="py-2 text-right font-normal">Amt(₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => {
                      const itemAmount = ((item.mrp + (item.colorantCost || 0)) * item.qty * (1 - globalDiscount/100)) * (1 + item.taxRate/100);
                      return (
                        <tr key={item.id} className="border-b border-gray-50/50">
                          <td className="py-2 pr-2">
                            <div className="font-semibold truncate max-w-[160px]">{item.name}</div>
                            <div className="text-[10px] text-muted-foreground">{item.size}</div>
                          </td>
                          <td className="py-2 text-center">{item.qty}</td>
                          <td className="py-2 text-right font-semibold">{itemAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      )
                    })}
                    {items.length === 0 && (
                      <tr><td colSpan={3} className="py-4 text-center text-muted-foreground italic">No items</td></tr>
                    )}
                  </tbody>
                </table>

                <div className="border-t border-dashed border-gray-300 pt-3 text-xs space-y-1">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹ {calculations.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                  {calculations.discount > 0 && <div className="flex justify-between text-blue-600"><span>Discount ({globalDiscount}%)</span><span>- ₹ {calculations.discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>}
                  <div className="flex justify-between"><span>GST</span><span>₹ {calculations.gst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                </div>

                <div className="border-t-2 border-gray-800 mt-3 pt-3 flex justify-between items-center mb-6">
                  <span className="text-base font-bold text-[#0f2142]">Net Total</span>
                  <span className="text-xl font-black text-[#0f2142]">₹ {finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="text-center text-[10px] text-muted-foreground italic">
                  *** Thank you for your business! ***
                </div>
              </div>

              {/* EXACT A4 PRINT LAYOUT - HIDDEN ON SCREEN */}
              <div className="hidden print:block">
                <div id="bill-print-area" ref={printRef} className="print-area flex flex-col items-center">
                  {(() => {
                    const itemChunks: BillItem[][] = items.length > 0 ? [] : [[]];
                    if (items.length > 0) {
                      for (let i = 0; i < items.length; i += 5) itemChunks.push(items.slice(i, i + 5));
                    }
                    return itemChunks.map((chunk, chunkIndex) => (
                      <div key={chunkIndex} className={`bg-white p-8 w-[210mm] min-h-[297mm] text-black shadow-lg origin-top scale-[0.45] sm:scale-[0.5] md:scale-[0.6] xl:scale-[0.55] print:scale-100 print:shadow-none print:w-full print:p-0 ${chunkIndex < itemChunks.length - 1 ? 'mb-8 print:mb-0' : ''}`} style={chunkIndex < itemChunks.length - 1 ? { pageBreakAfter: 'always' } : {}}>
                        {/* PDF Header */}
                        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-4">
                          <div>
                            <h1 className="text-3xl font-extrabold text-orange-600 uppercase">{settings.shop_name || "Hanuman Paints"}</h1>
                            <p className="text-sm font-bold text-gray-600 mt-1">Authorized Dulux Blue Store</p>
                            <p className="text-xs text-gray-500 mt-1 max-w-xs">{settings.shop_address}</p>
                            <p className="text-xs text-gray-500">Ph: 8292889540</p>
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
                          </div>
                        </div>

                        {/* Items Table */}
                        <table className="w-full mb-6 border-collapse">
                          <thead>
                            <tr className="bg-gray-800 text-white text-xs uppercase">
                              <th className="py-2 px-2 text-left">S.No</th>
                              <th className="py-2 px-2 text-left">Item Description</th>
                              <th className="py-2 px-2 text-center">Qty</th>
                              <th className="py-2 px-2 text-right">{billMode === "DPL" ? "DPL" : "MRP"}</th>
                              <th className="py-2 px-2 text-right">Disc%</th>
                              <th className="py-2 px-2 text-right">Taxable</th>
                              <th className="py-2 px-2 text-right">GST%</th>
                              <th className="py-2 px-2 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm border-b-2 border-gray-800">
                            {chunk.map((item, localIndex) => {
                              const globalIndex = chunkIndex * 5 + localIndex;
                              const gross = (item.mrp + (item.colorantCost || 0)) * item.qty; const disc = gross * (globalDiscount/100);
                              const taxable = gross - disc; const gst = taxable * (item.taxRate/100);
                              return (
                                <tr key={globalIndex} className="border-b border-gray-200">
                                  <td className="py-3 px-2 text-gray-500">{globalIndex+1}</td>
                                  <td className="py-3 px-2">
                                    <strong>{item.name}</strong><br/>
                                    <span className="text-xs text-gray-500">{item.size}</span>
                                    {item.colorCode && (
                                      <div className="pl-4 mt-1 text-xs text-gray-600 font-medium">
                                        <div>└ Color Code: {item.colorCode}</div>
                                        <div>└ Colorant: ₹{(item.colorantCost || 0).toFixed(2)}</div>
                                      </div>
                                    )}
                                  </td>
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

                        {chunkIndex === itemChunks.length - 1 && (
                          <div className="flex justify-between items-end">
                            <div className="text-xs text-gray-500 space-y-1">
                              <p><strong>Terms & Conditions:</strong></p>
                              <p>1. Goods once sold cannot be returned or exchanged.</p>
                              <p>2. Subject to Madhubani jurisdiction only.</p>
                              <p className="mt-4 italic">Payment Status: <strong className="uppercase">{paymentStatus}</strong> via {paymentMethod}</p>
                              {billMode === "DPL" && <p className="mt-1 italic text-xs">* Prices as per Dealer Price List</p>}
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
                        )}

                        {chunkIndex === itemChunks.length - 1 && (
                          <div className="mt-16 flex justify-between border-t border-gray-300 pt-4 text-sm font-bold text-gray-600">
                          </div>
                        )}
                      </div>
                    ))
                  })()}
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
                  <div key={order.order_id} className="bg-card border border-border/60 p-5 rounded-2xl flex items-center justify-between">
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
                          <Button size="icon" variant="outline" onClick={() => loadBillForEdit(bill)} className="size-8 rounded-lg text-blue-600"><Edit className="size-4" /></Button>
                          <Button size="icon" variant="outline" onClick={() => viewHistoricalBill(bill)} className="size-8 rounded-lg"><Eye className="size-4" /></Button>
                          <Button size="icon" variant="destructive" onClick={() => deleteBill(bill)} className="size-8 rounded-lg"><Trash2 className="size-4" /></Button>
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

      {/* Bill History Modal */}
      <AnimatePresence>
        {selectedHistoryBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedHistoryBill(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-card rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-border/60"
            >
              {/* Header */}
              <div className="p-6 border-b border-border/60 flex justify-between items-center bg-muted/20">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="size-6 text-primary" /> Bill Preview
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    #{selectedHistoryBill.bill_number} • {new Date(selectedHistoryBill.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handlePDF('history-bill-print-area', selectedHistoryBill)} variant="outline" className="rounded-xl bg-white text-black"><Download className="size-4 mr-2"/> PDF</Button>
                  <Button onClick={() => {
                    const pa = document.getElementById('history-bill-print-area')
                    if (!pa) return
                    const printWindow = window.open('', '_blank')
                    if (!printWindow) return
                    printWindow.document.write(`
                      <html><head><title>Print ${selectedHistoryBill.bill_number}</title>
                      <script src="https://cdn.tailwindcss.com"></script></head>
                      <body class="bg-white"><div style="width: 210mm; margin: 0 auto; padding: 20px;">${pa.innerHTML}</div>
                      <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 800) }</script></body></html>
                    `)
                    printWindow.document.close()
                  }} variant="outline" className="rounded-xl"><Printer className="size-4 mr-2"/> Print</Button>
                  <button onClick={() => setSelectedHistoryBill(null)} className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors ml-2"><X className="size-5" /></button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-muted/10 flex justify-center">
                <div id="history-bill-print-area" className="print-area flex flex-col items-center">
                  {(() => {
                    const itemsArr = selectedHistoryBill.items || [];
                    const itemChunks: BillItem[][] = itemsArr.length > 0 ? [] : [[]];
                    if (itemsArr.length > 0) {
                      for (let i = 0; i < itemsArr.length; i += 5) itemChunks.push(itemsArr.slice(i, i + 5));
                    }
                    return itemChunks.map((chunk, chunkIndex) => (
                      <div key={chunkIndex} className={`bg-white p-8 w-[210mm] min-h-[297mm] text-black shadow-lg origin-top scale-[0.6] sm:scale-[0.8] md:scale-[0.9] lg:scale-100 mb-20 lg:mb-0 print:scale-100 print:shadow-none print:w-full print:p-0 ${chunkIndex < itemChunks.length - 1 ? 'mb-8 print:mb-0' : ''}`} style={chunkIndex < itemChunks.length - 1 ? { pageBreakAfter: 'always' } : {}}>
                        {/* PDF Header */}
                        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-4">
                          <div>
                            <h1 className="text-3xl font-extrabold text-orange-600 uppercase">{settings.shop_name || "Hanuman Paints"}</h1>
                            <p className="text-sm font-bold text-gray-600 mt-1">Authorized Dulux Blue Store</p>
                            <p className="text-xs text-gray-500 mt-1 max-w-xs">{settings.shop_address}</p>
                            <p className="text-xs text-gray-500">Ph: 8292889540</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-gray-200 uppercase tracking-widest">TAX INVOICE</div>
                            <div className="mt-2 text-sm"><strong>Bill No:</strong> {selectedHistoryBill.bill_number}</div>
                            <div className="text-sm"><strong>Date:</strong> {new Date(selectedHistoryBill.created_at).toLocaleDateString('en-IN')}</div>
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="border border-gray-300 rounded p-4 mb-6 bg-gray-50">
                          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
                          <div className="flex justify-between">
                            <div>
                              <div className="font-bold text-lg">{selectedHistoryBill.customer_name || "Cash Customer"}</div>
                              <div className="text-sm text-gray-600">{selectedHistoryBill.customer_phone}</div>
                              {selectedHistoryBill.customer_address && <div className="text-sm text-gray-600">{selectedHistoryBill.customer_address}</div>}
                            </div>
                          </div>
                        </div>

                        {/* Items Table */}
                        <table className="w-full mb-6 border-collapse">
                          <thead>
                            <tr className="bg-gray-800 text-white text-xs uppercase">
                              <th className="py-2 px-2 text-left">S.No</th>
                              <th className="py-2 px-2 text-left">Item Description</th>
                              <th className="py-2 px-2 text-center">Qty</th>
                              <th className="py-2 px-2 text-right">{selectedHistoryBill.bill_type === "DPL" ? "DPL" : "MRP"}</th>
                              <th className="py-2 px-2 text-right">Taxable</th>
                              <th className="py-2 px-2 text-right">GST%</th>
                              <th className="py-2 px-2 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm border-b-2 border-gray-800">
                            {chunk.map((item: BillItem, localIndex: number) => {
                              const globalIndex = chunkIndex * 5 + localIndex;
                              const taxable = (item.mrp + (item.colorantCost || 0)) * item.qty * (1 - (selectedHistoryBill.discount_amount / (selectedHistoryBill.subtotal || 1)));
                              const gst = taxable * (item.taxRate/100);
                              return (
                                <tr key={globalIndex} className="border-b border-gray-200">
                                  <td className="py-3 px-2 text-gray-500">{globalIndex+1}</td>
                                  <td className="py-3 px-2">
                                    <strong>{item.name}</strong><br/>
                                    <span className="text-xs text-gray-500">{item.size}</span>
                                    {item.colorCode && (
                                      <div className="pl-4 mt-1 text-xs text-gray-600 font-medium">
                                        <div>└ Color Code: {item.colorCode}</div>
                                        <div>└ Colorant: ₹{(item.colorantCost || 0).toFixed(2)}</div>
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3 px-2 text-center">{item.qty}</td>
                                  <td className="py-3 px-2 text-right">{item.mrp.toFixed(2)}</td>
                                  <td className="py-3 px-2 text-right">{taxable.toFixed(2)}</td>
                                  <td className="py-3 px-2 text-right">{item.taxRate}%</td>
                                  <td className="py-3 px-2 text-right font-bold">{(taxable + gst).toFixed(2)}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>

                        {/* Totals */}
                        {chunkIndex === itemChunks.length - 1 && (
                          <div className="flex justify-between items-end">
                            <div className="text-xs text-gray-500 space-y-1">
                              <p><strong>Terms & Conditions:</strong></p>
                              <p>1. Goods once sold cannot be returned or exchanged.</p>
                              <p>2. Subject to Madhubani jurisdiction only.</p>
                              <p className="mt-4 italic">Payment Status: <strong className="uppercase">{selectedHistoryBill.payment_status}</strong> via {selectedHistoryBill.payment_method}</p>
                              {selectedHistoryBill.bill_type === "DPL" && <p className="mt-1 italic text-xs">* Prices as per Dealer Price List</p>}
                            </div>
                            <div className="w-64">
                              <div className="flex justify-between text-sm py-1 border-b border-gray-100"><span>Sub Total</span><span>{selectedHistoryBill.subtotal?.toFixed(2)}</span></div>
                              {selectedHistoryBill.discount_amount > 0 && (
                                <div className="flex justify-between text-sm py-1 border-b border-gray-100 text-green-700"><span>Discount</span><span>-{selectedHistoryBill.discount_amount?.toFixed(2)}</span></div>
                              )}
                              <div className="flex justify-between text-sm py-1 border-b border-gray-100"><span>Taxable Value</span><span>{selectedHistoryBill.taxable_value?.toFixed(2)}</span></div>
                              <div className="flex justify-between text-sm py-1 border-b border-gray-100"><span>CGST</span><span>{selectedHistoryBill.cgst_amount?.toFixed(2)}</span></div>
                              <div className="flex justify-between text-sm py-1 border-b border-gray-800"><span>SGST</span><span>{selectedHistoryBill.sgst_amount?.toFixed(2)}</span></div>
                              <div className="flex justify-between text-xl font-black py-2"><span>Grand Total</span><span>₹{selectedHistoryBill.total_amount?.toFixed(2)}</span></div>
                            </div>
                          </div>
                        )}

                        {chunkIndex === itemChunks.length - 1 && (
                          <div className="mt-16 flex justify-between border-t border-gray-300 pt-4 text-sm font-bold text-gray-600">
                          </div>
                        )}
                      </div>
                    ))
                  })()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
