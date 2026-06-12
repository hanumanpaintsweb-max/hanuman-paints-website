"use client"

import React, { useState, useEffect, useMemo, useRef, Fragment } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  Plus, Trash2, Printer, Download, MessageCircle, FileText, 
  CheckCircle2, User, Receipt, 
  Search, FileSpreadsheet, Eye, ShoppingBag, X, Edit,
  Share2, FileDown, PlusCircle, Phone, MapPin, Save
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
  const [globalGst, setGlobalGst] = useState<number | "Item-wise">("Item-wise")

  const handleGlobalGstChange = (val: number | "Item-wise") => {
    setGlobalGst(val)
    if (typeof val === "number") {
      setItems(prevItems => prevItems.map(item => ({ ...item, taxRate: val })))
    }
  }
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
    let subtotal = 0
    let discount = 0
    let taxable = 0
    let gst = 0
    
    items.forEach(item => {
      if(!item.productId) return
      
      const price = item.mrp || 0
      const cPrice = item.colorantCost || 0
      let ltrQty = 1
      if(item.size.toLowerCase().includes('l') && !item.size.toLowerCase().includes('ml')) ltrQty = parseFloat(item.size) || 1
      if(item.size.toLowerCase().includes('ml')) ltrQty = (parseFloat(item.size) || 1000) / 1000
      
      const itemGross = (price + (cPrice * ltrQty)) * item.qty
      const itemDisc = itemGross * (globalDiscount / 100)
      let itemTaxable = itemGross - itemDisc
      
      let itemGst = 0
      if (item.taxRate > 0) {
        itemGst = itemTaxable * (item.taxRate / 100)
      } else if (item.taxRate < 0) {
        const rate = Math.abs(item.taxRate) / 100
        const originalTotal = itemTaxable
        itemTaxable = originalTotal / (1 + rate)
        itemGst = originalTotal - itemTaxable
      }
      
      subtotal += itemGross
      discount += itemDisc
      taxable += itemTaxable
      gst += itemGst
    })
    
    return { subtotal, discount, taxable, gst, total: taxable + gst }
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

  const updateItem = (id: string, updates: Partial<any>) => {
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item))
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  return (
    <div className="min-h-screen bg-surface-container-low overflow-hidden flex flex-col font-body-lg text-on-surface">
      {/* TopAppBar for Billing */}
      <header className="bg-surface border-b border-outline-variant w-full h-16 flex justify-between items-center px-container-padding z-20 shrink-0">
        <div className="flex items-center gap-6">
          <Receipt className="size-6 text-primary" />
          <nav className="flex p-1 bg-surface-container rounded-lg border border-outline-variant/50">
            <button 
              onClick={() => setActiveTab("New Bill")}
              className={`px-4 py-1.5 font-bold text-sm rounded-md transition-all ${activeTab === "New Bill" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-primary"}`}
            >
              New Bill
            </button>
            <div className="w-px bg-outline-variant/50 mx-1 my-1"></div>
            <button 
              onClick={() => setActiveTab("Bill History")}
              className={`px-4 py-1.5 font-bold text-sm rounded-md transition-all ${activeTab === "Bill History" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-primary"}`}
            >
              Bill History
            </button>
          </nav>
        </div>
        
        {activeTab === "New Bill" && (
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-surface-container rounded-full p-1 border border-outline-variant">
              <button onClick={() => setBillMode("MRP")} className={`px-3 py-1 rounded-full font-label-md text-label-md transition-colors ${billMode === "MRP" ? "bg-white shadow-sm text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}>MRP Bill</button>
              <button onClick={() => setBillMode("DPL")} className={`px-3 py-1 rounded-full font-label-md text-label-md transition-colors ${billMode === "DPL" ? "bg-white shadow-sm text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}>DPL Bill</button>
            </div>
            {savedBillData && (
              <>
                <button onClick={() => shareWhatsApp()} className="bg-[#25D366] text-white px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors">
                  <Share2 className="size-[18px]" />
                  <span className="font-label-md text-label-md">Share</span>
                </button>
                <button onClick={() => handlePDF('print-a4-container', savedBillData)} className="border border-outline-variant text-primary px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-surface-container transition-colors">
                  <Printer className="size-[18px]" />
                  <span className="font-label-md text-label-md">Print</span>
                </button>
                <button onClick={() => handlePDF('print-a4-container', savedBillData)} className="border border-outline-variant text-primary px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-surface-container transition-colors">
                  <FileDown className="size-[18px]" />
                  <span className="font-label-md text-label-md">PDF</span>
                </button>
                <button onClick={resetForm} className="bg-primary text-white px-4 py-1.5 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors">
                  <Plus className="size-[18px]" />
                  <span className="font-label-md text-label-md">Create New</span>
                </button>
              </>
            )}
            {!savedBillData && (
              <button onClick={handleSaveBill} disabled={items.length === 0} className="bg-[#f97316] text-white px-4 py-1.5 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Save className="size-[18px]" />
                <span className="font-label-md text-label-md">{editBillId ? "Update Bill" : "Save Bill"}</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === "New Bill" ? (
          <>
            {/* Left Column (Form) */}
            <div className="w-full lg:w-[60%] h-full overflow-y-auto p-container-padding flex flex-col gap-element-gap">
              
              {/* Customer Info */}
              <div className="bg-white rounded-xl shadow-sm border border-outline-variant p-6">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-outline-variant">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Customer Details</h3>
                  <div className="flex gap-2 items-center">
                    {customerRecord && customerRecord.credit_limit > 0 && (
                      <span className={`px-3 py-1 rounded font-label-md text-label-md border ${customerRecord.current_outstanding + finalTotal > customerRecord.credit_limit ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                        Limit: {inr(customerRecord.credit_limit)} | Out: {inr(customerRecord.current_outstanding)}
                      </span>
                    )}
                    <span className="bg-surface-container px-3 py-1 rounded text-primary font-label-md text-label-md border border-outline-variant">Bill #{billNoStr}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-label-md text-on-surface-variant">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 text-outline size-5" />
                      <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} disabled={!!savedBillData} maxLength={10} className="w-full pl-10 pr-3 py-2 border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-body-md text-on-surface" placeholder="Enter Mobile..." />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-label-md text-on-surface-variant">Customer Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 text-outline size-5" />
                      <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} disabled={!!savedBillData} className="w-full pl-10 pr-3 py-2 border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-body-md text-on-surface" placeholder="Enter Name" />
                    </div>
                  </div>
                  <div className="col-span-2 flex flex-col gap-2">
                    <label className="font-label-md text-label-md text-on-surface-variant">Address (Optional)</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 text-outline size-5" />
                      <input type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} disabled={!!savedBillData} className="w-full pl-10 pr-3 py-2 border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-body-md text-on-surface" placeholder="Enter Address (Optional)" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="bg-white rounded-xl shadow-sm border border-outline-variant p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center pb-2 border-b border-outline-variant">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Products</h3>
                </div>
                
                {items.map((item, index) => {
                  const product = PRODUCTS.find(p => p.id === item.productId);
                  return (
                    <div key={item.id} className="border border-outline-variant rounded-lg p-4 bg-surface-bright flex flex-col gap-4 relative">
                      <div className="flex gap-4 items-start flex-wrap lg:flex-nowrap">
                        <div className="flex-1 min-w-[200px] flex flex-col gap-1 relative">
                          <label className="font-label-md text-label-md text-on-surface-variant">Select Product</label>
                          <select 
                            disabled={!!savedBillData}
                            value={item.productId}
                            onChange={(e) => handleProductSelect(index, e.target.value)}
                            className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-body-md text-on-surface bg-white"
                          >
                            <option value="">-- Select --</option>
                            {PRODUCTS.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="w-24 flex flex-col gap-1">
                          <label className="font-label-md text-label-md text-on-surface-variant">Qty</label>
                          <input type="number" min="1" disabled={!!savedBillData} value={item.qty} onChange={(e) => updateItem(item.id, { qty: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-body-md text-on-surface" />
                        </div>
                        
                        <div className="w-36 flex flex-col gap-1">
                          <label className="font-label-md text-label-md text-on-surface-variant">Unit</label>
                          <div className="flex bg-white rounded-lg border border-outline-variant focus-within:border-primary focus-within:ring-1 focus-within:ring-primary overflow-hidden h-[38px]">
                            <input 
                              type="number" 
                              disabled={!!savedBillData || !product} 
                              value={parseFloat(item.size) || ""} 
                              onChange={(e) => {
                                const val = e.target.value;
                                const currentUnit = item.size.replace(/[^a-zA-Z]/g, '').toUpperCase() || 'L';
                                const unit = currentUnit === 'ML' ? 'ML' : 'L';
                                const newSize = `${val} ${unit}`;
                                const foundSize = product?.sizes?.find(s => s.size.toLowerCase() === newSize.toLowerCase() || s.size.toLowerCase() === `${val} ltr`);
                                updateItem(item.id, { size: newSize, mrp: foundSize ? foundSize.mrp : item.mrp });
                              }}
                              className="w-full px-2 outline-none font-body-md text-body-md text-on-surface [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder="0"
                            />
                            <div className="w-px bg-outline-variant"></div>
                            <select 
                              disabled={!!savedBillData || !product}
                              value={(item.size.replace(/[^a-zA-Z]/g, '').toUpperCase() === 'ML') ? 'ML' : 'L'}
                              onChange={(e) => {
                                const unit = e.target.value;
                                const val = parseFloat(item.size) || "";
                                const newSize = `${val} ${unit}`;
                                const foundSize = product?.sizes?.find(s => s.size.toLowerCase() === newSize.toLowerCase() || s.size.toLowerCase() === `${val} ltr`);
                                updateItem(item.id, { size: newSize, mrp: foundSize ? foundSize.mrp : item.mrp });
                              }}
                              className="w-16 bg-surface-container-low px-1 outline-none text-sm cursor-pointer"
                            >
                              <option value="ML">ML</option>
                              <option value="L">L</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="w-32 flex flex-col gap-1">
                          <label className="font-label-md text-label-md text-on-surface-variant">Rate</label>
                          <input type="number" disabled={!!savedBillData} value={item.mrp || 0} onChange={(e) => updateItem(item.id, { mrp: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 h-[38px] border border-outline-variant rounded-lg bg-surface-container outline-none font-body-md text-body-md text-on-surface-variant [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        </div>
                        
                        {!savedBillData && (
                          <button onClick={() => removeItem(item.id)} className="mt-7 text-error hover:bg-error-container p-2 rounded-full transition-colors shrink-0">
                            <Trash2 className="size-5" />
                          </button>
                        )}
                      </div>

                      {/* Colorant Expandable logic */}
                      {true && (
                        <div className="border-t border-outline-variant pt-3 mt-1">
                          {item.colorantCost !== undefined && item.colorantCost > 0 ? (
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-outline">Colorant Name</label>
                                <input type="text" placeholder="e.g. Off White" disabled={!!savedBillData} value={item.colorCode || ""} onChange={(e) => updateItem(item.id, { colorCode: e.target.value })} className="px-3 py-1.5 text-sm border border-outline-variant rounded-md w-40 outline-none focus:border-primary" />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-outline">Colorant Price (per Ltr)</label>
                                <input type="number" disabled={!!savedBillData} value={item.colorantCost || 0} onChange={(e) => updateItem(item.id, { colorantCost: parseFloat(e.target.value) || 0 })} className="px-3 py-1.5 text-sm border border-outline-variant rounded-md w-32 outline-none focus:border-primary" />
                              </div>
                              {!savedBillData && (
                                <button onClick={() => updateItem(item.id, { colorantCost: 0, colorCode: "" })} className="mt-5 text-error p-1 hover:bg-error/10 rounded">
                                  <X className="size-4" />
                                </button>
                              )}
                            </div>
                          ) : (
                            !savedBillData && (
                              <button onClick={() => updateItem(item.id, { colorantCost: 1, colorCode: "" })} className="flex items-center gap-2 text-primary font-label-md text-label-md hover:underline">
                                <PlusCircle className="size-4" /> Add Colorant / Base
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {!savedBillData && (
                  <button onClick={handleAddRow} className="border-2 border-dashed border-outline-variant rounded-lg py-4 text-on-surface-variant font-label-md text-label-md hover:bg-surface-container transition-colors flex items-center justify-center gap-2">
                    <Plus className="size-5" /> Add Another Item
                  </button>
                )}
              </div>

              {/* Payment Info & Calculation */}
              <div className="bg-white rounded-xl shadow-sm border border-outline-variant p-6 flex flex-col md:flex-row gap-8">
                {/* Left: Payment details */}
                <div className="flex-1 flex flex-col gap-4 md:border-r border-outline-variant md:pr-8">
                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-label-md text-on-surface-variant">Apply Discount</label>
                    <div className="flex gap-2 items-center flex-wrap">
                      {[0, 5, 10, 15].map(pct => (
                        <button key={pct} onClick={() => setGlobalDiscount(pct)} disabled={!!savedBillData} className={`px-3 py-1 rounded-full font-label-md text-label-md transition-colors ${globalDiscount === pct ? 'border border-blue-200 bg-blue-100 text-blue-700' : 'border border-outline-variant hover:bg-surface-container text-on-surface'}`}>
                          {pct}%
                        </button>
                      ))}
                      <input type="number" disabled={!!savedBillData} value={globalDiscount} onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)} className="w-24 px-3 py-1 border border-outline-variant rounded-full outline-none font-body-md text-body-md text-on-surface [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="Custom %" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/30">
                    <label className="font-label-md text-label-md text-on-surface-variant">GST Configuration</label>
                    <div className="flex gap-2 items-center flex-wrap">
                      <button onClick={() => handleGlobalGstChange(18)} disabled={!!savedBillData} className={`px-3 py-1 rounded-full font-label-md text-label-md transition-colors ${globalGst === 18 ? 'border border-blue-200 bg-blue-100 text-blue-700' : 'border border-outline-variant hover:bg-surface-container text-on-surface'}`}>+18%</button>
                      <button onClick={() => handleGlobalGstChange(-18)} disabled={!!savedBillData} className={`px-3 py-1 rounded-full font-label-md text-label-md transition-colors ${globalGst === -18 ? 'border border-blue-200 bg-blue-100 text-blue-700' : 'border border-outline-variant hover:bg-surface-container text-on-surface'}`}>-18%</button>
                      <input type="number" disabled={!!savedBillData} value={typeof globalGst === "number" ? globalGst : ""} onChange={(e) => handleGlobalGstChange(parseFloat(e.target.value) || 0)} className="w-24 px-3 py-1 border border-outline-variant rounded-full outline-none font-body-md text-body-md text-on-surface [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="Manual %" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/30 mt-2">
                    <div className="flex flex-col gap-1 w-full sm:w-[200px]">
                      <label className="font-label-md text-label-md text-on-surface-variant">Payment Status</label>
                      <select disabled={!!savedBillData} value={paymentStatus === 'unpaid' ? 'unpaid' : paymentMethod === 'UPI' ? 'upi' : 'paid'} onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'unpaid') {
                          setPaymentStatus('unpaid');
                          setPaymentMethod('CREDIT');
                        } else if (val === 'upi') {
                          setPaymentStatus('paid');
                          setPaymentMethod('UPI');
                        } else {
                          setPaymentStatus('paid');
                          setPaymentMethod('CASH');
                        }
                      }} className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:border-primary outline-none font-body-md text-body-md text-on-surface bg-white">
                        <option value="paid">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="unpaid">Unpaid</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Right: Totals */}
                <div className="w-full md:w-64 flex flex-col gap-3 justify-end">
                  <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                    <span>Subtotal</span><span>{inr(calculations.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                    <span>Discount ({globalDiscount}%)</span><span className="text-error">- {inr(calculations.discount)}</span>
                  </div>
                  <div className="flex justify-between items-center font-body-md text-body-md text-on-surface">
                    <span>Taxable Amount</span><span>{inr(calculations.taxable)}</span>
                  </div>
                  <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                    <span>CGST (9%)</span><span>{inr(cgst)}</span>
                  </div>
                  <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                    <span>SGST (9%)</span><span>{inr(cgst)}</span>
                  </div>
                  <div className="border-t border-outline-variant pt-3 mt-1 flex justify-between items-center font-headline-md text-headline-md text-primary">
                    <span>Total</span><span>{inr(finalTotal)}</span>
                  </div>
                </div>
              </div>
              <div className="h-8"></div>
            </div>

            {/* Right Column (Live Preview / A4 Sheet) */}
            <div className="hidden lg:flex w-[40%] bg-surface-container-highest border-l border-outline-variant flex-col items-center justify-start overflow-y-auto pt-8 pb-20 print:hidden relative">
              <div className="sticky top-0 z-10 w-[210mm] text-center mb-2 font-label-md text-label-md text-outline">Live A4 Preview</div>
              
              <div id="print-a4-container" ref={printRef} className="print-area flex flex-col items-center drop-shadow-md">
                {(() => {
                  const itemChunks: BillItem[][] = items.length > 0 ? [] : [[]];
                  if (items.length > 0) {
                    for (let i = 0; i < items.length; i += 5) itemChunks.push(items.slice(i, i + 5));
                  }
                  return itemChunks.map((chunk, chunkIndex) => (
                    <div key={chunkIndex} className={`bg-white p-8 w-[210mm] min-h-[297mm] text-black shadow-lg origin-top scale-[0.5] xl:scale-[0.6] print:scale-100 print:shadow-none print:w-full print:p-0 ${chunkIndex < itemChunks.length - 1 ? 'mb-8 print:mb-0' : ''}`} style={chunkIndex < itemChunks.length - 1 ? { pageBreakAfter: 'always' } : {}}>
                      {/* PDF Header */}
                      <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-4">
                        <div>
                          <h1 className="text-3xl font-extrabold text-orange-600 uppercase">{settings.shop_name || "Hanuman Paints"}</h1>
                          <p className="text-sm font-bold text-gray-600 mt-1">Authorized Dulux Blue Store</p>
                          <p className="text-xs text-gray-500 mt-1 max-w-xs">{settings.shop_address || "Madhubani"}</p>
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
                            let ltrQty = 1;
                            if(item.size.toLowerCase().includes('l') && !item.size.toLowerCase().includes('ml')) ltrQty = parseFloat(item.size) || 1;
                            if(item.size.toLowerCase().includes('ml')) ltrQty = (parseFloat(item.size) || 1000) / 1000;
                            
                            const baseGross = item.mrp * item.qty;
                            const colGross = (item.colorantCost || 0) * ltrQty * item.qty;
                            
                            const baseDisc = baseGross * (globalDiscount/100);
                            const colDisc = colGross * (globalDiscount/100);
                            
                            let baseTaxable = baseGross - baseDisc;
                            let colTaxable = colGross - colDisc;
                            let baseGst = 0; let colGst = 0;
                            
                            if (item.taxRate > 0) {
                              baseGst = baseTaxable * (item.taxRate/100);
                              colGst = colTaxable * (item.taxRate/100);
                            } else if (item.taxRate < 0) {
                              const rate = Math.abs(item.taxRate) / 100;
                              const origBase = baseTaxable; baseTaxable = origBase / (1 + rate); baseGst = origBase - baseTaxable;
                              const origCol = colTaxable; colTaxable = origCol / (1 + rate); colGst = origCol - colTaxable;
                            }
                            
                            return (
                              <React.Fragment key={globalIndex}>
                                <tr className="border-b border-gray-100">
                                  <td className="py-3 px-2 text-gray-500">{globalIndex+1}</td>
                                  <td className="py-3 px-2">
                                    <strong>{item.name}</strong><br/>
                                    <span className="text-xs text-gray-500">Base: {item.size}</span>
                                  </td>
                                  <td className="py-3 px-2 text-center">{item.qty}</td>
                                  <td className="py-3 px-2 text-right">{item.mrp.toFixed(2)}</td>
                                  <td className="py-3 px-2 text-right">{globalDiscount}%</td>
                                  <td className="py-3 px-2 text-right">{baseTaxable.toFixed(2)}</td>
                                  <td className="py-3 px-2 text-right">{item.taxRate}%</td>
                                  <td className="py-3 px-2 text-right font-bold">{(baseTaxable + baseGst).toFixed(2)}</td>
                                </tr>
                                {item.colorantCost !== undefined && item.colorantCost > 0 && (
                                  <tr className="border-b border-gray-200 bg-blue-50/30">
                                    <td className="py-2 px-2 text-gray-400 text-xs"></td>
                                    <td className="py-2 px-2 text-xs text-gray-600">
                                      └ Colorant <em>({item.colorCode || "Custom Mix"})</em><br/>
                                      <span className="text-[10px] text-gray-400">Rate: ₹{item.colorantCost.toFixed(2)}/L × {ltrQty}L</span>
                                    </td>
                                    <td className="py-2 px-2 text-center text-xs">{item.qty}</td>
                                    <td className="py-2 px-2 text-right text-xs">{(item.colorantCost * ltrQty).toFixed(2)}</td>
                                    <td className="py-2 px-2 text-right text-xs">{globalDiscount}%</td>
                                    <td className="py-2 px-2 text-right text-xs">{colTaxable.toFixed(2)}</td>
                                    <td className="py-2 px-2 text-right text-xs">{item.taxRate}%</td>
                                    <td className="py-2 px-2 text-right font-bold text-xs">{(colTaxable + colGst).toFixed(2)}</td>
                                  </tr>
                                )}
                              </React.Fragment>
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
                            <div className="flex justify-between text-sm py-1 border-b border-gray-100"><span>CGST</span><span>{cgst.toFixed(2)}</span></div>
                            <div className="flex justify-between text-sm py-1 border-b border-gray-800"><span>SGST</span><span>{sgst.toFixed(2)}</span></div>
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
          </>
        ) : (
          /* BILL HISTORY TAB */
          <div className="w-full h-full p-container-padding overflow-y-auto">
            <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col h-full max-h-[800px]">
              <div className="p-4 border-b border-outline-variant flex flex-col md:flex-row justify-between gap-4 items-center bg-surface-bright">
                <h2 className="text-lg font-bold">Past Invoices</h2>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-2.5 size-4 text-outline" />
                    <input type="text" placeholder="Search bill, phone..." value={historySearch} onChange={e => setHistorySearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-surface rounded-lg border border-outline-variant text-sm outline-none focus:border-primary" />
                  </div>
                  <select value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value)} className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none">
                    <option value="All">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-on-surface-variant uppercase bg-surface-container-low border-b border-outline-variant sticky top-0">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Bill No</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.map((b) => (
                      <tr key={b.id} className="border-b border-outline-variant/50 hover:bg-surface-bright transition-colors">
                        <td className="px-6 py-4 font-medium">{new Date(b.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-primary font-semibold">{b.bill_number}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-on-surface">{b.customer_name}</div>
                          <div className="text-xs text-on-surface-variant">{b.customer_phone}</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-on-surface">{inr(b.total_amount)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            b.payment_status === "paid" ? "bg-emerald-100 text-emerald-700" :
                            b.payment_status === "unpaid" ? "bg-rose-100 text-rose-700" : "bg-orange-100 text-orange-700"
                          }`}>
                            {b.payment_status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => viewHistoricalBill(b)} className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors" title="View"><Eye className="size-4" /></button>
                            <button onClick={() => handlePDF('print-a4-container', b)} className="p-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-md transition-colors" title="Print"><Printer className="size-4" /></button>
                            <button onClick={() => loadBillForEdit(b)} className="p-1.5 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 rounded-md transition-colors" title="Edit"><Edit className="size-4" /></button>
                            <button onClick={() => deleteBill(b)} className="p-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 rounded-md transition-colors" title="Delete"><Trash2 className="size-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredBills.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">No bills found matching your criteria.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bill History Modal */}
      <AnimatePresence>
        {selectedHistoryBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedHistoryBill(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-surface rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant"
            >
              {/* Header */}
              <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Receipt className="size-6 text-primary" /> Bill Preview
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-1">
                    #{selectedHistoryBill.bill_number} • {new Date(selectedHistoryBill.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <select value={selectedHistoryBill.payment_status} onChange={(e) => updateBillStatus(selectedHistoryBill.id, e.target.value)} className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none font-medium mr-2">
                    <option value="paid">Mark Paid</option>
                    <option value="unpaid">Mark Unpaid</option>
                    <option value="partial">Mark Partial</option>
                  </select>
                  <button onClick={() => shareWhatsApp()} className="px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-2"><Share2 className="size-4" /> Share</button>
                  <button onClick={() => handlePDF('history-bill-print-area', selectedHistoryBill)} className="px-4 py-2 border border-outline-variant hover:bg-surface-container-high rounded-xl font-bold text-sm transition-colors flex items-center gap-2 bg-white text-on-surface"><Printer className="size-4" /> PDF / Print</button>
                  <button onClick={() => setSelectedHistoryBill(null)} className="p-2 bg-surface-variant hover:bg-outline-variant rounded-full transition-colors ml-2"><X className="size-5" /></button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-surface-variant/20 flex justify-center">
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
                            <p className="text-xs text-gray-500 mt-1 max-w-xs">{settings.shop_address || "Madhubani"}</p>
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
                              let ltrQty = 1;
                              if(item.size.toLowerCase().includes('l') && !item.size.toLowerCase().includes('ml')) ltrQty = parseFloat(item.size) || 1;
                              if(item.size.toLowerCase().includes('ml')) ltrQty = (parseFloat(item.size) || 1000) / 1000;
                              
                              const baseGross = item.mrp * item.qty;
                              const colGross = (item.colorantCost || 0) * ltrQty * item.qty;
                              const globalDiscountRatio = selectedHistoryBill.discount_amount / (selectedHistoryBill.subtotal || 1);
                              
                              let baseTaxable = baseGross * (1 - globalDiscountRatio);
                              let colTaxable = colGross * (1 - globalDiscountRatio);
                              let baseGst = 0; let colGst = 0;
                              
                              if (item.taxRate > 0) {
                                baseGst = baseTaxable * (item.taxRate/100);
                                colGst = colTaxable * (item.taxRate/100);
                              } else if (item.taxRate < 0) {
                                const rate = Math.abs(item.taxRate) / 100;
                                const origBase = baseTaxable; baseTaxable = origBase / (1 + rate); baseGst = origBase - baseTaxable;
                                const origCol = colTaxable; colTaxable = origCol / (1 + rate); colGst = origCol - colTaxable;
                              }
                              
                              return (
                                <React.Fragment key={globalIndex}>
                                  <tr className="border-b border-gray-100">
                                    <td className="py-3 px-2 text-gray-500">{globalIndex+1}</td>
                                    <td className="py-3 px-2">
                                      <strong>{item.name}</strong><br/>
                                      <span className="text-xs text-gray-500">Base: {item.size}</span>
                                    </td>
                                    <td className="py-3 px-2 text-center">{item.qty}</td>
                                    <td className="py-3 px-2 text-right">{item.mrp.toFixed(2)}</td>
                                    <td className="py-3 px-2 text-right">{baseTaxable.toFixed(2)}</td>
                                    <td className="py-3 px-2 text-right">{item.taxRate}%</td>
                                    <td className="py-3 px-2 text-right font-bold">{(baseTaxable + baseGst).toFixed(2)}</td>
                                  </tr>
                                  {item.colorantCost !== undefined && item.colorantCost > 0 && (
                                    <tr className="border-b border-gray-200 bg-blue-50/30">
                                      <td className="py-2 px-2 text-gray-400 text-xs"></td>
                                      <td className="py-2 px-2 text-xs text-gray-600">
                                        └ Colorant <em>({item.colorCode || "Custom Mix"})</em><br/>
                                        <span className="text-[10px] text-gray-400">Rate: ₹{item.colorantCost.toFixed(2)}/L × {ltrQty}L</span>
                                      </td>
                                      <td className="py-2 px-2 text-center text-xs">{item.qty}</td>
                                      <td className="py-2 px-2 text-right text-xs">{(item.colorantCost * ltrQty).toFixed(2)}</td>
                                      <td className="py-2 px-2 text-right text-xs">{colTaxable.toFixed(2)}</td>
                                      <td className="py-2 px-2 text-right text-xs">{item.taxRate}%</td>
                                      <td className="py-2 px-2 text-right font-bold text-xs">{(colTaxable + colGst).toFixed(2)}</td>
                                    </tr>
                                  )}
                                </React.Fragment>
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
      
      {/* Hidden A4 Print Container */}
      <div id="print-a4-container" className="hidden print:block absolute inset-0 bg-white z-[9999]">
        {/* A4 template logic remains unchanged in DOM, just visually hidden unless printing */}
      </div>
    </div>
  )
}
