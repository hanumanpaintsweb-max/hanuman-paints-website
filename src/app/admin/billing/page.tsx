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
import { inr } from "@/lib/format"
import { toast } from "sonner"
import { getSettings } from "@/lib/settings"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

type BillItem = {
  id: string
  productId: string
  name: string
  size: string
  qty: number
  mrp: number
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
  staff_name?: string
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
  const [staffName, setStaffName] = useState("")

  const [items, setItems] = useState<BillItem[]>([{ id: Date.now().toString(), productId: "", name: "", size: "1 Ltr", qty: 1, mrp: "" as unknown as number }])
  const [paymentStatus, setPaymentStatus] = useState("Paid")
  const [dueDate, setDueDate] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [linkedOrderId, setLinkedOrderId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [savedBillData, setSavedBillData] = useState<Bill | null>(null)
  const [globalDiscount, setGlobalDiscount] = useState<number | "">("")
  const [globalGst, setGlobalGst] = useState<number | "">("")

  const handleGlobalGstChange = (val: number | "") => {
    setGlobalGst(val)
  }
  const [customerRecord, setCustomerRecord] = useState<any>(null)
  const [billMode, setBillMode] = useState<"MRP" | "DPL">("MRP")
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [productSearchTerm, setProductSearchTerm] = useState<string>("")

  // Premium Combobox exact states from user
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  // -- TAB 3: HISTORY STATE --
  const [historySearch, setHistorySearch] = useState("")
  const [historyFilter, setHistoryFilter] = useState("All")
  const [historyDate, setHistoryDate] = useState("")
  const [dbProducts, setDbProducts] = useState<any[]>([])

  const filteredProducts = dbProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const [dbStaff, setDbStaff] = useState<any[]>([])
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

    // 4. Products
    const { data: pData } = await supabase.from('products').select('*').order('name', { ascending: true })
    if (pData) {
      const sorted = pData.sort((a, b) => {
        const aStock = a.current_stock || 0
        const bStock = b.current_stock || 0
        if (aStock > 0 && bStock <= 0) return -1
        if (aStock <= 0 && bStock > 0) return 1
        return 0
      })
      setDbProducts(sorted)
    }

    // 5. Staff
    const { data: staffData } = await supabase.from('staff').select('*').eq('is_active', true).order('name', { ascending: true })
    if (staffData) setDbStaff(staffData)
  }

  useEffect(() => {
    fetchInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps

    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission()
    }

    /* Temporarily disabled realtime to avoid console spam
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
    */
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
    const handleReset = () => {
      resetForm();
      setActiveTab("New Bill");
    };
    window.addEventListener('reset-invoice', handleReset);
    return () => window.removeEventListener('reset-invoice', handleReset);
  }, []);

  useEffect(() => {
    if (bills.length > 0) {
      const action = localStorage.getItem("billing_intent_action")
      const targetBillNo = localStorage.getItem("billing_intent_bill")
      if (action && targetBillNo) {
        const targetBill = bills.find(b => b.bill_number === targetBillNo)
        if (targetBill) {
          if (action === "edit") {
            loadBillForEdit(targetBill)
            setActiveTab("New Bill")
          } else if (action === "view") {
            setSelectedHistoryBill(targetBill)
            setActiveTab("Bill History")
          } else if (action === "print") {
            setSelectedHistoryBill(targetBill)
            setActiveTab("Bill History")
            setTimeout(() => handlePrint('history-bill-print-area', targetBill), 500)
          }
          localStorage.removeItem("billing_intent_action")
          localStorage.removeItem("billing_intent_bill")
        }
      }
    }
  }, [bills])

  useEffect(() => {
    const phone = customerPhone.replace(/\D/g, '')
    if (phone.length === 10) {
      supabase.from('customers').select('*').eq('phone', phone).maybeSingle().then(({ data }) => {
        setCustomerRecord(data || null)
        if (data && !customerName) {
          setCustomerName(data.name)
        }
        if (data?.customer_type === 'wholesale') {
          setGlobalDiscount(10)
          toast.success("Wholesale customer detected. Wholesale discount applied.")
        } else {
          setGlobalDiscount("")
        }
      })
    } else {
      setCustomerRecord(null)
    }
  }, [customerPhone, customerName])

  // --- Calculations ---
  const calculations = useMemo(() => {
    let baseSubtotal = 0
    let colorantTotal = 0

    items.forEach(item => {
      if (!item.productId) return

      const price = Number(item.mrp || 0)
      const cPrice = Number(item.colorantCost || 0)
      let ltrQty = 1
      if (item.size.toLowerCase().includes('l') && !item.size.toLowerCase().includes('ml')) ltrQty = parseFloat(item.size) || 1
      if (item.size.toLowerCase().includes('ml')) ltrQty = (parseFloat(item.size) || 1000) / 1000

      baseSubtotal += price * item.qty
      colorantTotal += cPrice * item.qty
    })

    const activeDiscount = typeof globalDiscount === 'number' ? globalDiscount : 0;
    const discount = baseSubtotal * (activeDiscount / 100)
    let taxableBase = baseSubtotal - discount
    let gst = 0

    const effectiveGst = typeof globalGst === 'number' ? globalGst : (globalGst === "" ? 0 : 18);

    if (effectiveGst > 0) {
      gst = taxableBase * (effectiveGst / 100)
    } else if (effectiveGst < 0) {
      const rate = Math.abs(effectiveGst) / 100
      const originalTaxable = taxableBase
      taxableBase = originalTaxable / (1 + rate)
      gst = originalTaxable - taxableBase
    }

    const finalTotal = taxableBase + gst + colorantTotal

    return {
      subtotal: baseSubtotal,
      colorantTotal,
      discount,
      taxable: taxableBase,
      gst,
      total: finalTotal
    }
  }, [items, globalDiscount, globalGst])

  const cgst = calculations.gst / 2
  const sgst = calculations.gst / 2
  const finalTotal = Math.round(calculations.total)

  // --- Actions ---
  const loadBillForEdit = (bill: Bill) => {
    setCustomerName(bill.customer_name || "")
    setCustomerPhone(bill.customer_phone)
    setCustomerAddress(bill.customer_address || "")
    setStaffName(bill.staff_name || "")

    setItems(bill.items || [])
    setPaymentStatus(bill.payment_status || "Paid")
    setPaymentMethod(bill.payment_method || "Cash")
    setBillNoStr(bill.bill_number)
    setBillMode((bill.bill_type as "MRP" | "DPL") || "MRP")
    const gross = bill.subtotal || 1
    const discPercent = bill.discount_amount ? Math.round((bill.discount_amount / gross) * 100) : 0
    setGlobalDiscount(discPercent)
    setEditBillId(bill.id)
    setSavedBillData(null)
    setActiveTab("New Bill")
  }

  const handleAddRow = () => {
    setItems([...items, {
      id: Date.now().toString(), productId: "", name: "", size: "1 Ltr", qty: 1, mrp: "" as unknown as number
    }])
  }
  const handleProductSelect = (index: number, productId: string) => {
    const product = dbProducts.find((p) => p.id === productId)
    if (!product) {
      const newItems = [...items]
      newItems[index] = { ...newItems[index], productId: "", name: "", mrp: 0 }
      setItems(newItems)
      return
    }
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      productId: product.id,
      name: product.name,
      size: product.unit || product.size || "1 Ltr",
      mrp: product.base_mrp || product.mrp || 0,
      qty: 1
    }
    setItems(newItems)
  }

  const loadOrderToBill = (order: Order) => {
    setCustomerName(order.customer_name)
    setCustomerPhone(order.customer_phone)
    setCustomerAddress(order.customer_address)
    setLinkedOrderId(order.order_id)

    const mappedItems: BillItem[] = order.items?.map((item) => {
      return {
        id: Math.random().toString(36).substr(2, 9),
        productId: item.id || "",
        name: item.name,
        size: item.size,
        qty: item.quantity || 1,
        mrp: item.price || item.mrp || 0
      }
    }) || []
    setItems(mappedItems)
    setSavedBillData(null)
    setActiveTab("New Bill")
  }

  const handleSaveBill = async () => {
    if (!customerName || customerPhone.replace(/\D/g, '').length !== 10) {
      toast.error("Valid customer name and 10-digit phone required")
      return
    }
    if (items.length === 0 || items.some(i => !i.productId)) {
      toast.error("Please add valid products to the bill")
      return
    }

    setIsSaving(true)

    // Always re-fetch the latest bill sequence directly from the database before saving
    let finalBillNoStr = billNoStr;
    if (!editBillId) {
      const { data: latestData, error: seqError } = await supabase.from('bills').select('bill_number').order('created_at', { ascending: false }).limit(1)
      if (seqError) {
        console.error('SUPABASE DB ERROR (Sequence Fetch):', seqError)
        alert('Failed to fetch latest bill sequence: ' + seqError.message)
        setIsSaving(false)
        return
      }
      
      let maxNum = 0
      if (latestData && latestData.length > 0) {
        const match = latestData[0].bill_number.match(/-(\d+)$/)
        if (match) maxNum = parseInt(match[1])
      }
      finalBillNoStr = `HP-S-${(maxNum + 1).toString().padStart(3, '0')}`
      setBillNoStr(finalBillNoStr)
    }

    const newBillId = editBillId || crypto.randomUUID()

    const billData: any = {
      id: newBillId,
      bill_number: finalBillNoStr,
      customer_name: customerName,
      customer_phone: customerPhone.replace(/\D/g, ''),
      customer_address: customerAddress || null,

      items: items,
      subtotal: parseFloat(calculations.subtotal.toFixed(2)),
      discount_amount: parseFloat(calculations.discount.toFixed(2)),
      taxable_value: parseFloat(calculations.taxable.toFixed(2)),
      cgst_amount: parseFloat(cgst.toFixed(2)),
      sgst_amount: parseFloat(sgst.toFixed(2)),
      total_amount: finalTotal,
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      order_id: linkedOrderId || null,
      staff_name: staffName || null,
      bill_type: billMode
    }

    let ledgerData: any = null
    if (paymentStatus !== 'Paid' && customerPhone.replace(/\D/g, '').length === 10) {
      ledgerData = {
        id: crypto.randomUUID(),
        customer_name: customerName,
        customer_phone: customerPhone.replace(/\D/g, ''),
        type: 'receivable',
        amount: finalTotal,
        description: `Bill #${finalBillNoStr}`,
        date: new Date().toISOString().split('T')[0],
        due_date: paymentStatus === 'Unpaid' && dueDate ? dueDate : null,
        bill_number: finalBillNoStr,
        status: paymentStatus === 'Unpaid' ? 'pending' : paymentStatus
      }
    }

    console.log('Attempting to save bill:', billData)

    if (editBillId) {
      const { data, error } = await supabase.from('bills').update(billData).eq('id', editBillId).select()
      
      if (error) {
        console.error('SUPABASE DB ERROR (Update):', error);
        alert('Failed to update in Database: ' + error.message);
        setIsSaving(false)
        return
      }

      if (!data || data.length === 0) {
        console.error('SUPABASE DB ERROR: No data returned from update.');
        alert('Failed to update in Database: No data returned.');
        setIsSaving(false)
        return
      }

      toast.success("Bill updated successfully!")
      const updatedBill = data[0]
      setSavedBillData(updatedBill)
      setBills(bills.map(b => b.id === editBillId ? updatedBill : b))
      setEditBillId(null)
      setIsSaving(false)
      return
    }

    // STRICT INSERT CALL
    const { data, error } = await supabase.from('bills').insert([billData]).select()

    if (error) {
      console.error('SUPABASE DB ERROR:', error);
      alert('Failed to save in Database: ' + error.message);
      setIsSaving(false)
      return;
    }

    if (!data || data.length === 0) {
      console.error('SUPABASE DB ERROR: No data returned from insert. (RLS issue?)');
      alert('Failed to save in Database: No data returned.');
      setIsSaving(false)
      return;
    }

    // ONLY update local state AFTER exact confirmation from DB
    console.log("DB confirmed save, updating local state.", data[0])
    toast.success("Bill saved successfully!")
    const newBill = data[0]
    setSavedBillData(newBill)
    setBills([newBill, ...bills])

    // Fetch sequence immediately so next "Create New" is accurate
    const { data: fetchNext } = await supabase.from('bills').select('bill_number').order('created_at', { ascending: false }).limit(1)
    if (fetchNext && fetchNext.length > 0) {
      const match = fetchNext[0].bill_number.match(/-(\d+)$/)
      if (match) {
        // Just keeping it ready, though resetForm will fetch it again
        const nextNum = parseInt(match[1]) + 1
      }
    }

    // Stock deduction
    let stockUpdateFailed = false;
    for (const item of items) {
      console.log('Processing stock deduction for item:', item);
      if (!item.productId) {
        console.warn('SKIPPED DEDUCTION: No productId found for', item.name);
        continue;
      }

      const { error: stockError } = await supabase.rpc('deduct_stock', {
        p_product_id: item.productId,
        p_quantity: item.qty
      });

      if (stockError) {
        console.error('SUPABASE RPC STOCK ERROR for', item.name, ':', stockError);
        stockUpdateFailed = true;
      } else {
        console.log('Successfully deducted', item.qty, 'from product', item.productId);
      }
    }
    if (stockUpdateFailed) toast.error("Bill saved, but some stock updates failed. Check console.");

    // Ledger insertion
    if (ledgerData) {
      const { error: ledgerError } = await supabase.from('ledger').insert([ledgerData])
      if (ledgerError) {
        console.error('SUPABASE DB ERROR (Ledger):', ledgerError);
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
    
    setIsSaving(false)
  }

  const handlePrint = (targetId: string = 'bill-print-area', providedBillData?: Bill) => {
    const printArea = document.getElementById(targetId)
    if (!printArea) return

    const bd = providedBillData || savedBillData
    const billNumber = bd?.bill_number || billNoStr
    const cName = bd?.customer_name ? `-${bd.customer_name.replace(/[^a-zA-Z0-9]/g, '')}` : (customerName ? `-${customerName.replace(/[^a-zA-Z0-9]/g, '')}` : '')
    const fileName = `${billNumber}${cName}`

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error("Please allow popups to print")
      return
    }

    // Remove tailwind scaling classes to ensure full-size print
    const cleanHTML = printArea.innerHTML
      .replace(/scale-\[[^\]]+\]/g, 'scale-100')
      .replace(/sm:scale-\[[^\]]+\]/g, '')
      .replace(/md:scale-\[[^\]]+\]/g, '')
      .replace(/xl:scale-\[[^\]]+\]/g, '')
      .replace(/lg:scale-100/g, '')
      .replace(/print:scale-100/g, '');

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
              background: white;
            }
            @media print {
              @page { size: A4 portrait; margin: 5mm; }
            }
          </style>
        </head>
        <body class="bg-white">
          <div style="width: 210mm; margin: 0 auto; padding: 20px;">
            ${cleanHTML}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print()
                window.close()
              }, 800)
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const handlePDF = async (targetId: string = 'bill-print-area', providedBillData?: Bill, returnFile: boolean = false): Promise<File | void> => {
    const printArea = document.getElementById(targetId)
    if (!printArea) return

    const bd = providedBillData || savedBillData
    const billNumber = bd?.bill_number || billNoStr
    const fileName = `bill_${billNumber}.pdf`

    try {
      const clone = printArea.cloneNode(true) as HTMLElement;
      
      clone.style.width = '210mm';
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.transform = 'none';
      clone.style.display = 'block';

      const scaledElements = clone.querySelectorAll('[class*="scale-"]');
      scaledElements.forEach(el => {
         el.className = el.className.replace(/scale-\[[^\]]+\]/g, '').replace(/sm:scale-\[[^\]]+\]/g, '').replace(/md:scale-\[[^\]]+\]/g, '').replace(/xl:scale-\[[^\]]+\]/g, '').replace(/lg:scale-100/g, '');
         el.classList.add('scale-100');
         (el as HTMLElement).style.transform = 'none';
      });

      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      if (returnFile) {
        const pdfBlob = pdf.output('blob');
        return new File([pdfBlob], fileName, { type: 'application/pdf' });
      }

      pdf.save(fileName);
      
      toast.success('PDF downloaded successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate PDF');
    }
  }

  const shareWhatsApp = async (historyBill?: Bill) => {
    const bd = historyBill || savedBillData
    const billNumber = bd?.bill_number || billNoStr
    const fileName = `bill_${billNumber}.pdf`
    const cName = bd?.customer_name || customerName
    const cPhone = bd?.customer_phone || customerPhone
    const cTotal = bd?.total_amount || finalTotal
    const cStatus = bd?.payment_status || paymentStatus
    const targetId = historyBill ? 'history-bill-print-area' : 'print-a4-container-hidden'
    
    // 1. Generate PDF file
    const file = await handlePDF(targetId, bd || undefined, true) as File | undefined;
    
    // 2. Try Web Share API directly
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        const text = `Namaste ${cName}!\n\nAapka Hanuman Paints ka bill ${billNumber} generate ho gaya hai.\n\nTotal Amount: ${inr(cTotal)}\nPayment Status: ${cStatus.toUpperCase()}\n\nDhanyawad! 🎨`;
        await navigator.share({
          files: [file],
          title: fileName,
          text: text,
        });
        toast.success("Shared via WhatsApp!");
        return;
      } catch (err) {
        console.error("Web share failed", err);
      }
    }
    
    // 3. Fallback: Trigger download manually, then open WhatsApp
    if (file) {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
    
    const fallbackText = `Hello, here is your bill from Hanuman Paints. (Please attach the downloaded PDF).\n\nBill #${billNumber} - ${inr(cTotal)}\nDhanyawad! 🎨`;
    const waUrl = `https://wa.me/91${cPhone.replace(/\D/g, "")}?text=${encodeURIComponent(fallbackText)}`
    window.open(waUrl, "_blank")
  }

  const resetForm = async () => {
    setCustomerName("")
    setCustomerPhone("")
    setCustomerAddress("")
    setStaffName("")
    setGlobalDiscount(0)
    setGlobalGst("")
    setDueDate("")
    setPaymentStatus("Paid")
    setPaymentMethod("Cash")
    setItems([{ id: Date.now().toString(), productId: "", name: "", size: "1 Ltr", qty: 1, mrp: "" as unknown as number }])
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
    if (!window.confirm("Are you sure you want to cancel this bill? This will reverse stock and ledger balances.")) return
    const pwd = window.prompt("Enter password to confirm cancellation:")
    if (pwd !== "1234") {
      toast.error("Incorrect password. Cancellation aborted.")
      return
    }
    
    // Soft delete the bill
    const { error } = await supabase.from('bills').update({ is_deleted: true, payment_status: 'Cancelled', total_amount: 0 }).eq('id', bill.id)
    if (!error) {
      // Stock Reversal
      for (const item of bill.items) {
        if (item.productId) {
          const { data: pData } = await supabase.from('products').select('current_stock').eq('id', item.productId).single()
          if (pData) {
            await supabase.from('products').update({ current_stock: (pData.current_stock || 0) + item.qty }).eq('id', item.productId)
          }
        }
      }

      // Outstanding Reversal
      if (bill.payment_status === 'Unpaid' || bill.payment_status === 'Partial') {
        const { data: ledgers } = await supabase.from('ledger').select('type, amount').eq('bill_number', bill.bill_number)
        if (ledgers && bill.customer_phone) {
          let netOwedFromThisBill = 0
          ledgers.forEach(l => {
            if (l.type === 'receivable') netOwedFromThisBill += l.amount
            if (l.type === 'received') netOwedFromThisBill -= l.amount
          })
          if (netOwedFromThisBill > 0) {
            const { data: cust } = await supabase.from('customers').select('current_outstanding, id').eq('phone', bill.customer_phone).single()
            if (cust) {
               const newOut = Math.max(0, (cust.current_outstanding || 0) - netOwedFromThisBill)
               await supabase.from('customers').update({ current_outstanding: newOut }).eq('id', cust.id)
            }
          }
        }
      }

      // Ledger Cleanup
      const { error: ledgerError } = await supabase.from('ledger').delete().eq('bill_number', bill.bill_number)
      if (ledgerError) console.error("Failed to delete ledger entry:", ledgerError)

      setBills(bills.map(b => b.id === bill.id ? { ...b, is_deleted: true, payment_status: 'Cancelled', total_amount: 0 } as any : b))
      toast.success("Bill cancelled and reversed successfully")
    } else {
      toast.error("Failed to cancel bill")
    }
  }

  // View Bill from History
  const viewHistoricalBill = (bill: Bill) => {
    setSelectedHistoryBill(bill)
  }

  // Filter Bills
  const filteredBills = bills.filter(b => {
    if (historyFilter !== "All" && b.payment_status.toLowerCase() !== historyFilter.toLowerCase()) return false
    if (historyDate) {
      const bDate = new Date(b.created_at).toISOString().split('T')[0]
      if (bDate !== historyDate) return false
    }
    if (historySearch) {
      const s = historySearch.toLowerCase()
      return b.bill_number.toLowerCase().includes(s) || b.customer_name.toLowerCase().includes(s) || b.customer_phone.includes(s)
    }
    return true
  })

  // Group filtered bills by date
  const groupedBills = filteredBills.reduce((groups, bill) => {
    const dateStr = new Date(bill.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    if (!groups[dateStr]) groups[dateStr] = []
    groups[dateStr].push(bill)
    return groups
  }, {} as Record<string, Bill[]>)

  // Get sorted dates (newest first assuming bills are already sorted, but let's be safe)
  const sortedDates = Object.keys(groupedBills)

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
                <button onClick={() => handlePrint('print-a4-container', savedBillData)} className="border border-outline-variant text-primary px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-surface-container transition-colors">
                  <Printer className="size-[18px]" />
                  <span className="font-label-md text-label-md">Print</span>
                </button>
                {/* PHASE2_HIDDEN: PDF Download button temporarily disabled
                <button onClick={() => handlePDF('print-a4-container', savedBillData)} className="border border-outline-variant text-primary px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-surface-container transition-colors">
                  <FileDown className="size-[18px]" />
                  <span className="font-label-md text-label-md">PDF</span>
                </button>
                */}
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
                    <label className="font-label-md text-label-md text-on-surface-variant">Customer Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 text-outline size-5" />
                      <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} disabled={!!savedBillData} className="w-full pl-10 pr-3 py-2 border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-body-md text-on-surface" placeholder="Enter Name" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-label-md text-on-surface-variant">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 text-outline size-5" />
                      <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} disabled={!!savedBillData} maxLength={10} className="w-full pl-10 pr-3 py-2 border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-body-md text-on-surface" placeholder="Enter Mobile..." />
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
                    <label className="font-label-md text-label-md text-on-surface-variant">Address (Optional)</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 text-outline size-5" />
                      <input type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} disabled={!!savedBillData} className="w-full pl-10 pr-3 py-2 border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-body-md text-on-surface" placeholder="Enter Address (Optional)" />
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
                    <label className="font-label-md text-label-md text-on-surface-variant">Sales Staff / Attended By</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 text-outline size-5" />
                      <select value={staffName} onChange={e => setStaffName(e.target.value)} disabled={!!savedBillData} className="w-full pl-10 pr-3 py-2 border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-body-md text-on-surface bg-white">
                        <option value="">-- None --</option>
                        {dbStaff.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
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
                  const product = dbProducts.find(p => p.id === item.productId);
                  return (
                    <div key={item.id} className="border border-outline-variant rounded-xl p-4 mb-4 bg-surface relative">
                      <div className="flex flex-row items-end gap-3 w-full pr-12 flex-wrap xl:flex-nowrap">
                        <div className="flex-1 min-w-[250px] flex flex-col gap-1">
                          <div className="relative w-full" ref={searchRef}>
                            <label className="block text-sm font-bold text-on-surface mb-2">Select Product</label>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant" />
                              <input
                                type="text"
                                disabled={!!savedBillData}
                                placeholder={savedBillData ? (product?.name || "") : "Type to search..."}
                                value={openDropdownId === item.id ? searchQuery : (product?.name || "")}
                                onChange={(e) => {
                                  setSearchQuery(e.target.value);
                                  setIsDropdownOpen(true);
                                  setOpenDropdownId(item.id);
                                }}
                                onFocus={() => {
                                  if (!savedBillData) {
                                    setIsDropdownOpen(true);
                                    setOpenDropdownId(item.id);
                                    setSearchQuery("");
                                  }
                                }}
                                className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg bg-surface text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                              />
                            </div>

                            {/* DROPDOWN MENU - FIXED WIDTH */}
                            {isDropdownOpen && openDropdownId === item.id && (
                              <div className="absolute left-0 z-50 w-[450px] mt-1 bg-surface border border-outline-variant rounded-xl shadow-2xl max-h-72 overflow-y-auto overflow-x-hidden">
                                {filteredProducts.length > 0 ? (
                                  filteredProducts.map(p => (
                                    <div
                                      key={p.id}
                                      onClick={() => {
                                        handleProductSelect(index, p.id);
                                        setSearchQuery("");
                                        setIsDropdownOpen(false);
                                        setOpenDropdownId(null);
                                      }}
                                      className="p-3 border-b border-outline-variant hover:bg-primary/5 cursor-pointer flex justify-between items-center transition-colors group"
                                    >
                                      <div className="flex flex-col overflow-hidden mr-4">
                                        <span className="font-bold text-on-surface flex items-center gap-2 truncate text-sm">
                                          {p.name} 
                                          {p.type === 'base' && (
                                            <span className="text-[9px] font-black bg-primary text-white px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">BASE</span>
                                          )}
                                        </span>
                                        <span className="text-xs text-on-surface-variant mt-0.5 truncate">
                                          {p.category || 'General'} • Size: {p.size || p.unit || '1 Ltr'} • MRP: ₹{p.base_mrp || 0}
                                        </span>
                                      </div>
                                      <div className={`text-sm font-black whitespace-nowrap shrink-0 ${(p.current_stock || 0) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {(p.current_stock || 0) > 0 ? `Stock: ${p.current_stock}` : 'OUT OF STOCK'}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-6 text-center text-on-surface-variant flex flex-col items-center">
                                    <Search className="size-6 opacity-20 mb-2" />
                                    <p className="text-sm">No products found matching "{searchQuery}"</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="w-20 min-w-[80px] flex flex-col gap-1">
                          <label className="font-label-md text-label-md text-on-surface-variant">Qty</label>
                          <input type="number" min="1" disabled={!!savedBillData} value={item.qty} onChange={(e) => updateItem(item.id, { qty: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 h-10 border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-body-md text-on-surface" />
                        </div>

                        <div className="w-28 min-w-[100px] flex flex-col gap-1">
                          <label className="font-label-md text-label-md text-on-surface-variant">Unit</label>
                          <div className="flex bg-white rounded-lg border border-outline-variant focus-within:border-primary focus-within:ring-1 focus-within:ring-primary overflow-hidden h-10">
                            <input
                              type="number"
                              disabled={!!savedBillData || !product}
                              value={parseFloat(item.size) || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                const currentUnit = item.size.replace(/[^a-zA-Z]/g, '').toUpperCase() || 'L';
                                const unit = currentUnit === 'ML' ? 'ML' : 'L';
                                const newSize = `${val} ${unit}`;
                                updateItem(item.id, { size: newSize });
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
                                updateItem(item.id, { size: newSize });
                              }}
                              className="w-16 bg-surface-container-low px-1 outline-none text-sm cursor-pointer"
                            >
                              <option value="ML">ML</option>
                              <option value="L">L</option>
                            </select>
                          </div>
                        </div>

                        <div className="w-24 shrink-0 flex flex-col gap-1">
                          <label className="font-label-md text-label-md text-on-surface-variant">Rate</label>
                          <input type="number" disabled={!!savedBillData} value={item.mrp === "" as any ? "" : (item.mrp || "")} onChange={(e) => updateItem(item.id, { mrp: e.target.value === "" ? "" as any : parseFloat(e.target.value) })} className="w-full px-3 py-2 h-10 border border-outline-variant rounded-lg bg-surface-container outline-none font-body-md text-body-md text-on-surface-variant [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        </div>
                      </div>

                      {!savedBillData && (
                        <button onClick={() => removeItem(item.id)} className="absolute right-3 top-6 p-2 text-rose-500 hover:bg-rose-50 rounded-md transition-colors">
                          <Trash2 className="size-5" />
                        </button>
                      )}

                      {/* Colorant Expandable logic */}
                      {true && (
                        <div className="border-t border-outline-variant pt-3 mt-1">
                          {item.colorantCost !== undefined && (item.colorantCost > 0 || item.colorantCost === ("" as any)) ? (
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-outline">Color Code</label>
                                <input type="text" placeholder="e.g. Off White" disabled={!!savedBillData} value={item.colorCode || ""} onChange={(e) => updateItem(item.id, { colorCode: e.target.value })} className="px-3 py-1.5 text-sm border border-outline-variant rounded-md w-40 outline-none focus:border-primary" />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-outline">Colorant Price</label>
                                <input type="number" disabled={!!savedBillData} value={item.colorantCost === "" as any ? "" : (item.colorantCost || "")} onChange={(e) => updateItem(item.id, { colorantCost: e.target.value === "" ? "" as any : parseFloat(e.target.value) })} className="px-3 py-1.5 text-sm border border-outline-variant rounded-md w-32 outline-none focus:border-primary" />
                              </div>
                              {!savedBillData && (
                                <button onClick={() => updateItem(item.id, { colorantCost: 0, colorCode: "" })} className="mt-5 text-error p-1 hover:bg-error/10 rounded">
                                  <X className="size-4" />
                                </button>
                              )}
                            </div>
                          ) : (
                            !savedBillData && (
                              <button onClick={() => updateItem(item.id, { colorantCost: "" as any, colorCode: "" })} className="flex items-center gap-2 text-primary font-label-md text-label-md hover:underline">
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
              <div className="flex flex-col lg:flex-row gap-6 lg:items-start pt-6 border-t border-outline-variant">
                <div className="flex-1 max-w-sm flex flex-col gap-4">
                  <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant flex flex-col gap-4">
                    {/* Discount Config */}
                    <div className="flex flex-col gap-2">
                      <label className="font-label-md text-label-md text-on-surface-variant">Apply Discount</label>
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => setGlobalDiscount(0)} disabled={!!savedBillData} className={`px-3 py-1 rounded-full font-label-md text-label-md transition-colors ${globalDiscount === 0 || globalDiscount === "" ? 'border border-blue-200 bg-blue-100 text-blue-700' : 'border border-outline-variant hover:bg-surface-container text-on-surface'}`}>0%</button>
                        {[5, 10, 15].map(pct => (
                          <button key={pct} onClick={() => setGlobalDiscount(pct)} disabled={!!savedBillData} className={`px-3 py-1 rounded-full font-label-md text-label-md transition-colors ${globalDiscount === pct ? 'border border-blue-200 bg-blue-100 text-blue-700' : 'border border-outline-variant hover:bg-surface-container text-on-surface'}`}>
                            {pct}%
                          </button>
                        ))}
                        <input type="number" disabled={!!savedBillData} value={(globalDiscount !== "" && ![0, 5, 10, 15].includes(globalDiscount)) ? globalDiscount : ""} onChange={(e) => setGlobalDiscount(e.target.value === "" ? "" : (parseFloat(e.target.value) || 0))} className={`w-24 px-3 py-1 border rounded-full outline-none font-label-md text-label-md transition-colors ${(globalDiscount !== "" && ![0, 5, 10, 15].includes(globalDiscount)) ? 'border-blue-200 bg-blue-100 text-blue-700' : 'border-outline-variant hover:bg-surface-container text-on-surface'} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`} placeholder="Custom %" />
                      </div>
                    </div>

                    <div className="border-t border-outline-variant/30 my-1"></div>

                    {/* GST Config */}
                    <div className="flex flex-col gap-2">
                      <label className="font-label-md text-label-md text-on-surface-variant">GST Configuration</label>
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => handleGlobalGstChange(0)} disabled={!!savedBillData} className={`px-3 py-1 rounded-full font-label-md text-label-md transition-colors ${globalGst === 0 || globalGst === "" ? 'border border-blue-200 bg-blue-100 text-blue-700' : 'border border-outline-variant hover:bg-surface-container text-on-surface'}`}>0%</button>
                        <button onClick={() => handleGlobalGstChange(18)} disabled={!!savedBillData} className={`px-3 py-1 rounded-full font-label-md text-label-md transition-colors ${globalGst === 18 ? 'border border-blue-200 bg-blue-100 text-blue-700' : 'border border-outline-variant hover:bg-surface-container text-on-surface'}`}>+18%</button>
                        <button onClick={() => handleGlobalGstChange(-18)} disabled={!!savedBillData} className={`px-3 py-1 rounded-full font-label-md text-label-md transition-colors ${globalGst === -18 ? 'border border-blue-200 bg-blue-100 text-blue-700' : 'border border-outline-variant hover:bg-surface-container text-on-surface'}`}>-18%</button>
                        <input type="number" disabled={!!savedBillData} value={(globalGst !== "" && ![0, 18, -18].includes(globalGst)) ? globalGst : ""} onChange={(e) => handleGlobalGstChange(e.target.value === "" ? "" : (parseFloat(e.target.value) || 0))} className={`w-24 px-3 py-1 border rounded-full outline-none font-label-md text-label-md transition-colors ${(globalGst !== "" && ![0, 18, -18].includes(globalGst)) ? 'border-blue-200 bg-blue-100 text-blue-700' : 'border-outline-variant hover:bg-surface-container text-on-surface'} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`} placeholder="Manual %" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 w-full sm:w-[200px]">
                    <label className="font-label-md text-label-md text-on-surface-variant">Payment Status</label>
                    <select disabled={!!savedBillData} value={paymentStatus === 'Unpaid' ? 'Unpaid' : paymentMethod === 'UPI' ? 'UPI' : 'Cash'} onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'Unpaid') {
                        setPaymentStatus('Unpaid');
                        setPaymentMethod('Unpaid');
                      } else if (val === 'UPI') {
                        setPaymentStatus('Paid');
                        setPaymentMethod('UPI');
                      } else {
                        setPaymentStatus('Paid');
                        setPaymentMethod('Cash');
                      }
                    }} className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:border-primary outline-none font-body-md text-body-md text-on-surface bg-white">
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-2 bg-surface-container-low rounded-xl p-6 border border-outline-variant min-w-[280px]">
                  <div className="flex justify-between font-body-md text-on-surface-variant">
                    <span>Subtotal</span><span>{inr(calculations.subtotal)}</span>
                  </div>
                  {calculations.discount > 0 && (
                    <div className="flex justify-between font-body-md text-error">
                      <span>Discount ({globalDiscount}%)</span><span>- {inr(calculations.discount)}</span>
                    </div>
                  )}
                  {calculations.gst !== 0 && (
                    <div className="flex justify-between font-body-md text-on-surface-variant">
                      <span>Total GST</span><span>{inr(calculations.gst)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-headline-sm text-headline-sm text-primary pt-3 border-t border-outline-variant mt-1">
                    <span>Final Total</span><span>{inr(finalTotal)}</span>
                  </div>
                </div>
              </div>
              <div className="h-8"></div>
            </div>

            {/* Right Column (Live Preview / A4 Sheet) */}
            <div className="hidden lg:flex w-[40%] bg-surface-container-highest border-l border-outline-variant flex-col items-center justify-start overflow-y-auto pt-8 pb-20 print:hidden relative">
              <div className="sticky top-0 z-10 w-[210mm] text-center mb-2 font-label-md text-label-md text-outline">Live A4 Preview</div>

              <div id="print-a4-container" ref={printRef} className="print-area flex flex-col items-center drop-shadow-md print:m-0 print:p-0 print:w-[210mm] print:h-auto print:overflow-hidden">
                {(() => {
                  const itemChunks: BillItem[][] = items.length > 0 ? [] : [[]];
                  if (items.length > 0) {
                    for (let i = 0; i < items.length; i += 5) itemChunks.push(items.slice(i, i + 5));
                  }
                  return itemChunks.map((chunk, chunkIndex) => (
                    <div key={chunkIndex} className={`bg-white p-8 w-[210mm] min-h-[297mm] text-black shadow-lg origin-top scale-[0.5] xl:scale-[0.6] print:scale-100 print:shadow-none print:w-[210mm] print:p-0 print:min-h-0 print:h-auto ${chunkIndex < itemChunks.length - 1 ? 'mb-8 print:mb-0' : ''}`} style={chunkIndex < itemChunks.length - 1 ? { pageBreakAfter: 'always' } : {}}>
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
                      {/* Items Table */}
                      <table className="w-full mb-6 border-collapse">
                        <thead>
                          <tr className="bg-gray-800 text-white text-xs uppercase">
                            <th className="py-2 px-2 text-left">S.No</th>
                            <th className="py-2 px-2 text-left">Item Description</th>
                            <th className="py-2 px-2 text-center">Qty</th>
                            <th className="py-2 px-2 text-right">{billMode === "DPL" ? "DPL" : "MRP"}</th>
                            <th className="py-2 px-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm border-b-2 border-gray-800">
                          {chunk.map((item, localIndex) => {
                            const globalIndex = chunkIndex * 5 + localIndex;
                            let ltrQty = 1;
                            if (item.size.toLowerCase().includes('l') && !item.size.toLowerCase().includes('ml')) ltrQty = parseFloat(item.size) || 1;
                            if (item.size.toLowerCase().includes('ml')) ltrQty = (parseFloat(item.size) || 1000) / 1000;

                            const baseGross = Number(item.mrp || 0) * item.qty;
                            const colGross = (item.colorantCost || 0) * item.qty;

                            return (
                              <React.Fragment key={globalIndex}>
                                <tr className="border-b border-gray-100">
                                  <td className="py-3 px-2 text-gray-500">{globalIndex + 1}</td>
                                  <td className="py-3 px-2">
                                    <strong>
                                      {item.name}
                                      {item.colorCode && (dbProducts.find(p => p.id === item.productId)?.type === 'base' || !dbProducts.find(p => p.id === item.productId)) ? ` - ${item.colorCode}` : ''}
                                    </strong><br />
                                    <span className="text-xs text-gray-500">Base: {item.size}</span>
                                  </td>
                                  <td className="py-3 px-2 text-center">{item.qty}</td>
                                  <td className="py-3 px-2 text-right">{Number(item.mrp || 0).toFixed(2)}</td>
                                  <td className="py-3 px-2 text-right font-bold">{baseGross.toFixed(2)}</td>
                                </tr>
                                {((item.colorantCost !== undefined && item.colorantCost > 0) || (item.colorCode && item.colorCode.trim() !== "")) && (
                                  <tr className="border-b border-gray-200 bg-blue-50/30">
                                    <td className="py-2 px-2 text-gray-400 text-xs"></td>
                                    <td className="py-2 px-2 text-xs text-gray-600">
                                      └ Colorant <em>({item.colorCode || "Custom Mix"})</em><br />
                                      {item.colorantCost ? <span className="text-[10px] text-gray-400">Rate: ₹{Number(item.colorantCost || 0).toFixed(2)}</span> : null}
                                    </td>
                                    <td className="py-2 px-2 text-center text-xs">{item.qty}</td>
                                    <td className="py-2 px-2 text-right text-xs">{item.colorantCost ? Number(item.colorantCost).toFixed(2) : ""}</td>
                                    <td className="py-2 px-2 text-right font-bold text-xs">{item.colorantCost ? colGross.toFixed(2) : ""}</td>
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
                            <div className="flex justify-between text-sm py-1 border-b border-gray-100"><span>Base Sub Total</span><span>{calculations.subtotal.toFixed(2)}</span></div>
                            {calculations.discount > 0 && <div className="flex justify-between text-sm py-1 border-b border-gray-100 text-green-700"><span>Discount</span><span>-{calculations.discount.toFixed(2)}</span></div>}

                            {calculations.gst !== 0 && (
                              <>
                                <div className="flex justify-between text-sm py-1 border-b border-gray-100"><span>CGST</span><span>{cgst.toFixed(2)}</span></div>
                                <div className="flex justify-between text-sm py-1 border-b border-gray-100"><span>SGST</span><span>{cgst.toFixed(2)}</span></div>
                              </>
                            )}
                            {calculations.colorantTotal > 0 && <div className="flex justify-between text-sm py-1 border-b border-gray-800 text-blue-800 font-semibold"><span>Colorant Total</span><span>{calculations.colorantTotal.toFixed(2)}</span></div>}
                            <div className="flex justify-between text-xl font-black py-2 border-t border-gray-800 mt-1"><span>Grand Total</span><span>₹{finalTotal.toFixed(2)}</span></div>
                          </div>
                        </div>
                      )}

                      {chunkIndex === itemChunks.length - 1 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          {(savedBillData?.staff_name || staffName) && (
                            <div className="text-xs text-gray-500 font-medium">
                              Sold By / Attended By: {savedBillData ? savedBillData.staff_name : staffName}
                            </div>
                          )}
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
          <div className="w-full h-full p-container-padding">
            <div className="bg-white border border-outline-variant rounded-xl shadow-sm flex flex-col h-full max-h-full">
              <div className="p-4 border-b border-outline-variant flex flex-col md:flex-row justify-between gap-4 items-center bg-surface-bright shrink-0">
                <h2 className="text-lg font-bold">Past Invoices</h2>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-48">
                    <Search className="absolute left-3 top-2.5 size-4 text-outline" />
                    <input type="text" placeholder="Search bill, phone..." value={historySearch} onChange={e => setHistorySearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-surface rounded-lg border border-outline-variant text-sm outline-none focus:border-primary" />
                  </div>
                  <input type="date" value={historyDate} onChange={e => setHistoryDate(e.target.value)} className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none w-full md:w-auto" />
                  <select value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value)} className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none w-full md:w-auto">
                    <option value="All">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto flex-1 overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-on-surface-variant uppercase bg-surface-container-low border-b border-outline-variant sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-6 py-4 w-32">Time</th>
                      <th className="px-6 py-4 w-32">Bill No</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4 w-32 text-right">Amount</th>
                      <th className="px-6 py-4 w-32 text-center">Status</th>
                      <th className="px-6 py-4 w-32 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDates.map(dateStr => (
                      <React.Fragment key={dateStr}>
                        {/* Sticky Date Header Row */}
                        <tr className="bg-surface-container-highest sticky top-[53px] z-10 border-b border-outline-variant/50">
                          <td colSpan={6} className="px-6 py-2 text-xs font-bold text-on-surface uppercase tracking-wider">
                            {dateStr}
                          </td>
                        </tr>
                        {/* Bills for this Date */}
                        {groupedBills[dateStr].map((b) => {
                          const isCancelled = b.is_deleted || b.payment_status.toLowerCase() === 'cancelled';
                          return (
                          <tr key={b.id} className={`border-b border-outline-variant/50 transition-colors ${isCancelled ? 'opacity-50 bg-rose-50/50' : 'hover:bg-surface-bright'}`}>
                            <td className="px-6 py-4 font-medium text-xs text-on-surface-variant">{new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                            <td className={`px-6 py-4 font-semibold ${isCancelled ? 'line-through text-on-surface-variant' : 'text-primary'}`}>
                              {b.bill_number}
                              {isCancelled && <span className="ml-2 px-1.5 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded uppercase">Cancelled</span>}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-on-surface">{b.customer_name}</div>
                              <div className="text-xs text-on-surface-variant">{b.customer_phone}</div>
                            </td>
                            <td className={`px-6 py-4 font-bold text-right ${isCancelled ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>{inr(b.total_amount)}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                isCancelled ? "bg-rose-100 text-rose-700" :
                                b.payment_status.toLowerCase() === "paid" ? "bg-emerald-100 text-emerald-700" :
                                b.payment_status.toLowerCase() === "unpaid" ? "bg-rose-100 text-rose-700" : "bg-orange-100 text-orange-700"
                                }`}>
                                {isCancelled ? 'CANCELLED' : b.payment_status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => viewHistoricalBill(b)} className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors" title="View"><Eye className="size-4" /></button>
                                <button onClick={() => { setSelectedHistoryBill(b); setTimeout(() => handlePrint('history-bill-print-area', b), 100); }} className="p-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-md transition-colors" title="Print"><Printer className="size-4" /></button>
                                {!isCancelled && (
                                  <>
                                    <button onClick={() => loadBillForEdit(b)} className="p-1.5 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 rounded-md transition-colors" title="Edit"><Edit className="size-4" /></button>
                                    <button onClick={() => deleteBill(b)} className="p-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 rounded-md transition-colors" title="Delete"><Trash2 className="size-4" /></button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                          )
                        })}
                      </React.Fragment>
                    ))}
                    {sortedDates.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                          No bills found matching your criteria.
                        </td>
                      </tr>
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
                  <button onClick={() => shareWhatsApp(selectedHistoryBill)} className="px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-2"><Share2 className="size-4" /> Share</button>
                  <button onClick={() => handlePrint('history-bill-print-area', selectedHistoryBill)} className="px-4 py-2 bg-primary text-white hover:bg-opacity-90 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"><Printer className="size-4" /> Print</button>
                  {/* PHASE2_HIDDEN: PDF button temporarily disabled 
                  <button onClick={() => handlePDF('history-bill-print-area', selectedHistoryBill)} className="px-4 py-2 bg-primary text-white hover:bg-opacity-90 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"><Download className="size-4" /> PDF</button>
                  */}
                  <button onClick={() => setSelectedHistoryBill(null)} className="p-2 bg-surface-variant hover:bg-outline-variant rounded-full transition-colors ml-2"><X className="size-5" /></button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-surface-variant/20 flex justify-center">
                <div id="history-bill-print-area" className="print-area flex flex-col items-center print:m-0 print:p-0 print:w-[210mm] print:h-auto print:overflow-hidden">
                  {(() => {
                    const itemsArr = selectedHistoryBill.items || [];
                    const itemChunks: BillItem[][] = itemsArr.length > 0 ? [] : [[]];
                    if (itemsArr.length > 0) {
                      for (let i = 0; i < itemsArr.length; i += 5) itemChunks.push(itemsArr.slice(i, i + 5));
                    }
                    return itemChunks.map((chunk, chunkIndex) => (
                      <div key={chunkIndex} className={`bg-white p-8 w-[210mm] min-h-[297mm] text-black shadow-lg origin-top scale-[0.6] sm:scale-[0.8] md:scale-[0.9] lg:scale-100 mb-20 lg:mb-0 print:scale-100 print:shadow-none print:w-[210mm] print:p-0 print:min-h-0 print:h-auto ${chunkIndex < itemChunks.length - 1 ? 'mb-8 print:mb-0' : ''}`} style={chunkIndex < itemChunks.length - 1 ? { pageBreakAfter: 'always' } : {}}>
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
                              <th className="py-2 px-2 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm border-b-2 border-gray-800">
                            {chunk.map((item: BillItem, localIndex: number) => {
                              const globalIndex = chunkIndex * 5 + localIndex;
                              let ltrQty = 1;
                              if (item.size.toLowerCase().includes('l') && !item.size.toLowerCase().includes('ml')) ltrQty = parseFloat(item.size) || 1;
                              if (item.size.toLowerCase().includes('ml')) ltrQty = (parseFloat(item.size) || 1000) / 1000;

                              const baseGross = Number(item.mrp || 0) * item.qty;
                              const colGross = (item.colorantCost || 0) * item.qty;

                              return (
                                <React.Fragment key={globalIndex}>
                                  <tr className="border-b border-gray-100">
                                    <td className="py-3 px-2 text-gray-500">{globalIndex + 1}</td>
                                    <td className="py-3 px-2">
                                      <strong>
                                        {item.name}
                                        {item.colorCode && (dbProducts.find(p => p.id === item.productId)?.type === 'base' || !dbProducts.find(p => p.id === item.productId)) ? ` - ${item.colorCode}` : ''}
                                      </strong><br />
                                      <span className="text-xs text-gray-500">Base: {item.size}</span>
                                    </td>
                                    <td className="py-3 px-2 text-center">{item.qty}</td>
                                    <td className="py-3 px-2 text-right">{Number(item.mrp || 0).toFixed(2)}</td>
                                    <td className="py-3 px-2 text-right font-bold">{baseGross.toFixed(2)}</td>
                                  </tr>
                                  {((item.colorantCost !== undefined && item.colorantCost > 0) || (item.colorCode && item.colorCode.trim() !== "")) && (
                                    <tr className="border-b border-gray-200 bg-blue-50/30">
                                      <td className="py-2 px-2 text-gray-400 text-xs"></td>
                                      <td className="py-2 px-2 text-xs text-gray-600">
                                        └ Colorant <em>({item.colorCode || "Custom Mix"})</em><br />
                                        {item.colorantCost ? <span className="text-[10px] text-gray-400">Rate: ₹{Number(item.colorantCost || 0).toFixed(2)}</span> : null}
                                      </td>
                                      <td className="py-2 px-2 text-center text-xs">{item.qty}</td>
                                      <td className="py-2 px-2 text-right text-xs">{item.colorantCost ? Number(item.colorantCost).toFixed(2) : ""}</td>
                                      <td className="py-2 px-2 text-right font-bold text-xs">{item.colorantCost ? colGross.toFixed(2) : ""}</td>
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
                              <div className="flex justify-between text-sm py-1 border-b border-gray-100"><span>Base Sub Total</span><span>{selectedHistoryBill.subtotal?.toFixed(2)}</span></div>
                              {selectedHistoryBill.discount_amount > 0 && (
                                <div className="flex justify-between text-sm py-1 border-b border-gray-100 text-green-700"><span>Discount</span><span>-{selectedHistoryBill.discount_amount?.toFixed(2)}</span></div>
                              )}

                              {(selectedHistoryBill.cgst_amount || 0) !== 0 && (
                                <>
                                  <div className="flex justify-between text-sm py-1 border-b border-gray-100"><span>CGST</span><span>{selectedHistoryBill.cgst_amount?.toFixed(2)}</span></div>
                                  <div className="flex justify-between text-sm py-1 border-b border-gray-100"><span>SGST</span><span>{selectedHistoryBill.sgst_amount?.toFixed(2)}</span></div>
                                </>
                              )}
                              {selectedHistoryBill.total_amount - (selectedHistoryBill.taxable_value + selectedHistoryBill.cgst_amount + selectedHistoryBill.sgst_amount) > 0 && (
                                <div className="flex justify-between text-sm py-1 border-b border-gray-800 text-blue-800 font-semibold"><span>Colorant Total</span><span>{(selectedHistoryBill.total_amount - (selectedHistoryBill.taxable_value + selectedHistoryBill.cgst_amount + selectedHistoryBill.sgst_amount)).toFixed(2)}</span></div>
                              )}
                              <div className="flex justify-between text-xl font-black py-2 border-t border-gray-800 mt-1"><span>Grand Total</span><span>₹{selectedHistoryBill.total_amount?.toFixed(2)}</span></div>
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
      <div id="print-a4-container-hidden" className="hidden print:block absolute inset-0 bg-white z-[9999]">
        {/* A4 template logic remains unchanged in DOM, just visually hidden unless printing */}
      </div>
    </div>
  )
}
