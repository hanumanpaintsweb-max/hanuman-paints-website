"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Plus, Trash2, Printer, Download, MessageCircle, FileText, CheckCircle2, User, Phone, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/services/supabase"
import { PRODUCTS } from "@/data/products"
import { inr } from "@/lib/format"
import { toast } from "sonner"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

type BillItem = {
  id: string
  productId: string
  name: string
  size: string
  qty: number
  mrp: number
  discountPercent: number
  taxRate: number
}

const TIN_WOOD_CATEGORIES = ["Tinters", "Woodcare"] // 12% GST items, rest 18%

export default function BillingPage() {
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [items, setItems] = useState<BillItem[]>([])
  const [billNo, setBillNo] = useState<number>(1001) // mock starting bill no
  const [isSaving, setIsSaving] = useState(false)
  const [savedBill, setSavedBill] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  // Fetch the latest bill number from supabase
  useEffect(() => {
    async function getLatestBillNo() {
      const { data, error } = await supabase
        .from("bills")
        .select("bill_number")
        .order("bill_number", { ascending: false })
        .limit(1)
      if (!error && data && data.length > 0) {
        setBillNo(data[0].bill_number + 1)
      }
    }
    getLatestBillNo()
  }, [])

  const addItemRow = () => {
    setItems([
      ...items,
      {
        id: Math.random().toString(36).substr(2, 9),
        productId: "",
        name: "",
        size: "",
        qty: 1,
        mrp: 0,
        discountPercent: 5,
        taxRate: 18,
      },
    ])
  }

  const removeItemRow = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleProductSelect = (index: number, productId: string) => {
    const product = PRODUCTS.find((p) => p.id.toString() === productId || p.id === productId)
    if (!product) return

    const newItems = [...items]
    const taxRate = TIN_WOOD_CATEGORIES.includes(product.category) ? 12 : 18
    const defaultSize = product.sizes?.[0]
    
    newItems[index] = {
      ...newItems[index],
      productId: product.id.toString(),
      name: product.name,
      size: defaultSize?.size || "",
      mrp: defaultSize?.mrp || 0,
      taxRate: taxRate,
    }
    setItems(newItems)
  }

  const handleSizeSelect = (index: number, size: string) => {
    const newItems = [...items]
    const item = newItems[index]
    const product = PRODUCTS.find((p) => p.id.toString() === item.productId)
    if (product) {
      const sizeObj = product.sizes?.find((s) => s.size === size)
      newItems[index] = {
        ...item,
        size,
        mrp: sizeObj?.mrp || 0,
      }
      setItems(newItems)
    }
  }

  const updateItemQty = (index: number, qty: number) => {
    const newItems = [...items]
    newItems[index].qty = Math.max(1, qty)
    setItems(newItems)
  }

  // Calculations
  const calculations = items.reduce(
    (acc, item) => {
      const gross = item.mrp * item.qty
      const discountVal = gross * (item.discountPercent / 100)
      const taxable = gross - discountVal
      const gstVal = taxable * (item.taxRate / 100)
      const total = taxable + gstVal

      return {
        subtotal: acc.subtotal + gross,
        discount: acc.discount + discountVal,
        taxable: acc.taxable + taxable,
        gst: acc.gst + gstVal,
        total: acc.total + total,
      }
    },
    { subtotal: 0, discount: 0, taxable: 0, gst: 0, total: 0 }
  )

  const finalTotal = Math.round(calculations.total)

  const handleSaveBill = async () => {
    if (!customerName || !customerPhone) {
      toast.error("Please enter customer name and phone")
      return
    }
    if (items.length === 0 || items.some(i => !i.productId)) {
      toast.error("Please add valid products to the bill")
      return
    }

    setIsSaving(true)
    const { data, error } = await supabase.from("bills").insert([{
      customer_name: customerName,
      customer_phone: customerPhone,
      items: items,
      subtotal: calculations.subtotal,
      discount: calculations.discount,
      gst: calculations.gst,
      total: finalTotal,
      status: 'Paid'
    }]).select()

    setIsSaving(false)
    if (error) {
      toast.error("Failed to save bill", { description: error.message })
    } else {
      toast.success("Bill saved successfully!")
      if (data && data[0]) setBillNo(data[0].bill_number)
      setSavedBill(true)
    }
  }

  const generatePDF = async () => {
    if (!printRef.current) return
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2 })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Hanuman_Paints_Bill_${billNo}.pdf`)
    } catch (err) {
      console.error("PDF generation failed", err)
      toast.error("Failed to generate PDF")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const shareWhatsApp = () => {
    const text = `Namaste ${customerName}!\n\nAapka Hanuman Paints ka bill #${billNo} generate ho gaya hai.\n\nTotal Amount: ${inr(finalTotal)}\nItems: ${items.length}\n\nDhanyawad! 🎨`
    const url = `https://wa.me/91${customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
  }

  const resetForm = () => {
    setCustomerName("")
    setCustomerPhone("")
    setItems([])
    setSavedBill(false)
    setBillNo(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing System</h1>
          <p className="text-sm text-muted-foreground mt-1">Create manual bills for offline customers</p>
        </div>
        <div className="flex items-center gap-2">
          {savedBill && (
            <Button onClick={resetForm} variant="outline" className="rounded-xl gap-2">
              <Plus className="size-4" /> New Bill
            </Button>
          )}
          <Button onClick={handleSaveBill} disabled={isSaving || savedBill || items.length === 0} className="rounded-xl gap-2">
            {isSaving ? <span className="animate-pulse">Saving...</span> : savedBill ? <Check className="size-4" /> : <CheckCircle2 className="size-4" />}
            {savedBill ? "Saved" : "Save & Generate"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Customer Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Customer Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2.5 text-sm outline-none ring-primary focus:ring-2"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input 
                    type="tel" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2.5 text-sm outline-none ring-primary focus:ring-2"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Products</h2>
              <Button onClick={addItemRow} size="sm" variant="secondary" className="rounded-lg gap-2 h-8">
                <Plus className="size-4" /> Add Item
              </Button>
            </div>
            
            <div className="space-y-4">
              <AnimatePresence>
                {items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                    No items added yet. Click 'Add Item' to start.
                  </div>
                ) : (
                  items.map((item, index) => {
                    const product = PRODUCTS.find(p => p.id.toString() === item.productId)
                    return (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col gap-3 p-4 bg-muted/30 rounded-xl border border-border/60 relative group"
                      >
                        <button 
                          onClick={() => removeItemRow(item.id)}
                          className="absolute -right-2 -top-2 bg-red-100 text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-5">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Select Product</label>
                            <select 
                              value={item.productId}
                              onChange={(e) => handleProductSelect(index, e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
                            >
                              <option value="" disabled>Choose product...</option>
                              {PRODUCTS.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="sm:col-span-3">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Size</label>
                            <select 
                              value={item.size}
                              onChange={(e) => handleSizeSelect(index, e.target.value)}
                              disabled={!product || !product.sizes}
                              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2 disabled:opacity-50"
                            >
                              <option value="" disabled>Size</option>
                              {product?.sizes?.map(s => (
                                <option key={s.size} value={s.size}>{s.size}</option>
                              ))}
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Qty</label>
                            <input 
                              type="number" 
                              min="1"
                              value={item.qty}
                              onChange={(e) => updateItemQty(index, parseInt(e.target.value) || 1)}
                              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">MRP</label>
                            <div className="py-2 text-sm font-semibold">{inr(item.mrp)}</div>
                          </div>
                        </div>
                        <div className="flex gap-4 text-xs mt-2 border-t border-border pt-2">
                          <span className="text-muted-foreground">Discount: <span className="font-bold text-foreground">5%</span></span>
                          <span className="text-muted-foreground">GST: <span className="font-bold text-foreground">{item.taxRate}%</span></span>
                          <span className="ml-auto font-bold text-primary">Item Total: {inr((item.mrp * item.qty * 0.95) * (1 + item.taxRate/100))}</span>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Column: Preview & Actions */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <FileText className="size-5 text-primary" /> Bill Summary
            </h2>
            
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{inr(calculations.subtotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Discount (5%)</span>
                <span>-{inr(calculations.discount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxable Value</span>
                <span className="font-medium">{inr(calculations.taxable)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total GST</span>
                <span className="font-medium">+{inr(calculations.gst)}</span>
              </div>
              <div className="pt-4 border-t border-dashed border-border flex justify-between text-lg font-extrabold text-foreground">
                <span>Grand Total</span>
                <span className="text-primary">{inr(finalTotal)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <Button onClick={generatePDF} disabled={!savedBill} variant="outline" className="rounded-xl w-full gap-2 text-xs h-12 print:hidden">
                <Download className="size-4" /> Download
              </Button>
              <Button onClick={handlePrint} disabled={!savedBill} variant="outline" className="rounded-xl w-full gap-2 text-xs h-12 print:hidden">
                <Printer className="size-4" /> Print
              </Button>
            </div>
            <Button onClick={shareWhatsApp} disabled={!savedBill} className="rounded-xl w-full gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white h-12 print:hidden">
              <MessageCircle className="size-4" /> Share on WhatsApp
            </Button>
            
            {!savedBill && items.length > 0 && (
              <p className="text-center text-xs text-muted-foreground mt-4">Save bill first to enable print & share</p>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Printable A4 Bill Format */}
      <div className="overflow-hidden h-0 w-0 absolute opacity-0">
        <div ref={printRef} className="bg-white p-10 font-sans text-black w-[800px] print:w-full print:p-0 print:block">
          <div className="text-center mb-8 border-b-2 border-gray-200 pb-6">
            <h1 className="text-4xl font-extrabold text-orange-600 tracking-tight">HANUMAN PAINTS</h1>
            <p className="text-gray-500 mt-1">Authorized Dulux Dealer</p>
            <p className="text-sm text-gray-500 mt-1">Main Road, Your City, India | Ph: +91 00000 00000</p>
          </div>
          
          <div className="flex justify-between mb-8">
            <div>
              <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Billed To:</h3>
              <p className="font-bold text-lg">{customerName || "Cash Customer"}</p>
              <p className="text-gray-600">{customerPhone}</p>
            </div>
            <div className="text-right">
              <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Invoice Details:</h3>
              <p className="font-bold text-lg">INV-{billNo}</p>
              <p className="text-gray-600">{new Date().toLocaleDateString("en-IN")}</p>
            </div>
          </div>

          <table className="w-full mb-8 border-collapse">
            <thead>
              <tr className="bg-gray-100 border-y-2 border-gray-200">
                <th className="py-3 px-2 text-left text-sm text-gray-600">Product</th>
                <th className="py-3 px-2 text-center text-sm text-gray-600">Qty</th>
                <th className="py-3 px-2 text-right text-sm text-gray-600">MRP</th>
                <th className="py-3 px-2 text-right text-sm text-gray-600">Disc.</th>
                <th className="py-3 px-2 text-right text-sm text-gray-600">GST</th>
                <th className="py-3 px-2 text-right text-sm text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const gross = item.mrp * item.qty
                const disc = gross * 0.05
                const tax = (gross - disc) * (item.taxRate / 100)
                const tot = (gross - disc) + tax
                return (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-4 px-2">
                      <div className="font-bold text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.size}</div>
                    </td>
                    <td className="py-4 px-2 text-center font-medium">{item.qty}</td>
                    <td className="py-4 px-2 text-right text-gray-600">₹{item.mrp}</td>
                    <td className="py-4 px-2 text-right text-emerald-600">-₹{disc.toFixed(2)}</td>
                    <td className="py-4 px-2 text-right text-gray-600">
                      {item.taxRate}%<br/><span className="text-xs text-gray-400">₹{tax.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-2 text-right font-bold text-gray-900">₹{tot.toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-72">
              <div className="flex justify-between py-2 text-gray-600">
                <span>Subtotal</span>
                <span>₹{calculations.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-emerald-600 border-b border-gray-100">
                <span>Discount (5%)</span>
                <span>-₹{calculations.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-gray-600">
                <span>Taxable Value</span>
                <span>₹{calculations.taxable.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-gray-600 border-b border-gray-200">
                <span>Total GST</span>
                <span>+₹{calculations.gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-4 text-2xl font-extrabold text-gray-900">
                <span>Grand Total</span>
                <span>₹{finalTotal}</span>
              </div>
              <div className="mt-2 flex justify-between py-2 rounded bg-green-50 px-3 text-green-800 font-bold text-center w-full">
                 <span>STATUS</span>
                 <span>PAID</span>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center text-sm text-gray-500 border-t border-gray-200 pt-6">
            <p>Thank you for shopping with Hanuman Paints!</p>
            <p className="text-xs mt-1">This is a computer generated invoice.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
