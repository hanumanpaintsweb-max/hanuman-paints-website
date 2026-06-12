"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { supabase } from "@/services/supabase"
import { 
  Settings, Store, MessageCircle, Receipt, Truck, 
  Clock, Save, Loader2, Send
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { revalidateSettings } from "@/app/actions/settings"

type SettingMap = Record<string, string>

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingMap>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  
  // WhatsApp Test State
  const [testPhone, setTestPhone] = useState("")

  const fetchSettings = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('settings').select('*')
    if (!error && data) {
      const map: SettingMap = {}
      data.forEach(item => {
        map[item.key] = item.value
      })
      // Ensure defaults if missing
      setSettings({
        shop_name: map.shop_name || "Hanuman Paints",
        shop_address: map.shop_address || "Loha Patty",
        shop_city: map.shop_city || "Madhubani",
        shop_state: map.shop_state || "Bihar",
        shop_pincode: map.shop_pincode || "842001",
        shop_phone: map.shop_phone || "",
        shop_email: map.shop_email || "",
        shop_gstin: map.shop_gstin || "",
        whatsapp_number: map.whatsapp_number || "",
        whatsapp_msg_accepted: map.whatsapp_msg_accepted || "Namaste {name}, your order #{orderId} has been accepted!",
        whatsapp_msg_out: map.whatsapp_msg_out || "Great news {name}, order #{orderId} is out for delivery!",
        whatsapp_msg_delivered: map.whatsapp_msg_delivered || "Order #{orderId} delivered! Thank you for choosing us.",
        default_discount: map.default_discount || "5",
        default_gst: map.default_gst || "18",
        bill_prefix: map.bill_prefix || "HP",
        min_order_value: map.min_order_value || "0",
        delivery_charge: map.delivery_charge || "0",
        free_delivery_above: map.free_delivery_above || "500",
        serviceable_pincodes: map.serviceable_pincodes || "842001,842002",
        opening_time: map.opening_time || "09:00",
        closing_time: map.closing_time || "20:00",
        closed_days: map.closed_days || "Sunday",
        holiday_mode: map.holiday_mode || "false"
      })
    }
    setLoading(false)
    setUnsavedChanges(false)
  }

  useEffect(() => {
    setTimeout(() => fetchSettings(), 0)
  }, [])

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setUnsavedChanges(true)
  }

  const handleToggle = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: prev[key] === "true" ? "false" : "true" }))
    setUnsavedChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const updates = Object.entries(settings).map(([key, value]) => ({ key, value }))
    
    // Using upsert on primary key 'key'
    const { error } = await supabase.from('settings').upsert(updates)
    
    setSaving(false)
    if (error) {
      toast.error("Failed to save settings")
    } else {
      await revalidateSettings()
      toast.success("Settings saved successfully!")
      setUnsavedChanges(false)
    }
  }

  const handleBackup = async () => {
    setSaving(true)
    try {
      const [billsRes, customersRes, ledgerRes] = await Promise.all([
        supabase.from('bills').select('*'),
        supabase.from('customers').select('*'),
        supabase.from('ledger').select('*')
      ])

      if (billsRes.error) throw billsRes.error;
      if (customersRes.error) throw customersRes.error;
      if (ledgerRes.error) throw ledgerRes.error;

      const backupData = {
        timestamp: new Date().toISOString(),
        bills: billsRes.data,
        customers: customersRes.data,
        ledger: ledgerRes.data
      }

      const jsonString = JSON.stringify(backupData, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hanuman_paints_backup_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Backup generated successfully!")
    } catch (e: any) {
      toast.error(`Backup failed: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  const sendTestWhatsApp = () => {
    if (!testPhone) {
      toast.error("Enter a test number")
      return
    }
    const text = "Hello from Hanuman Paints System Test! 🎨"
    window.open(`https://wa.me/91${testPhone}?text=${encodeURIComponent(text)}`, '_blank')
  }

  const resetBillsWarning = () => {
    if (confirm("Are you sure you want to reset bill sequence? This will NOT delete old bills but might cause invoice number conflicts if not managed well.")) {
      toast.success("Bill sequence reset marked. (Logic depends on next bill fetcher)")
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-container-padding max-w-[1000px] mx-auto w-full pb-20 space-y-element-gap pt-4">
      
      {/* Title is handled by Layout, but if we need a specific page title we can add it here. The design just has sections. */}
      {unsavedChanges && (
        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-700 p-4 rounded-xl flex items-center justify-between shadow-sm mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">info</span>
            <span className="font-label-md text-label-md">You have unsaved changes. Please save your preferences.</span>
          </div>
          <button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-label-md text-label-md transition-colors flex items-center gap-2">
             {saving ? <Loader2 className="size-4 animate-spin" /> : null}
             Save All Changes
          </button>
        </div>
      )}

      {/* Section 1: Shop Information */}
      <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="border-b border-outline-variant/30 p-6 flex items-center gap-3 bg-surface/50">
          <span className="material-symbols-outlined text-primary-container">storefront</span>
          <h3 className="font-headline-sm text-headline-sm">Shop Information</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block font-label-md text-label-md text-on-surface-variant">Shop Name</label>
              <input 
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-on-surface" 
                type="text" 
                value={settings.shop_name} 
                onChange={e => handleChange('shop_name', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="block font-label-md text-label-md text-on-surface-variant">Phone Number</label>
              <input 
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-on-surface" 
                type="tel" 
                value={settings.shop_phone} 
                onChange={e => handleChange('shop_phone', e.target.value)} 
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block font-label-md text-label-md text-on-surface-variant">Address</label>
              <textarea 
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-on-surface resize-none" 
                rows={2}
                value={settings.shop_address} 
                onChange={e => handleChange('shop_address', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="block font-label-md text-label-md text-on-surface-variant">GSTIN</label>
              <input 
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-on-surface uppercase font-mono" 
                type="text" 
                value={settings.shop_gstin} 
                onChange={e => handleChange('shop_gstin', e.target.value)} 
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end">
             <button onClick={handleSave} disabled={saving} className="bg-[#f97316] hover:bg-[#ea580c] text-white px-6 py-2.5 rounded-lg font-label-md text-label-md transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2">
                 {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                 Update Information
             </button>
          </div>
        </div>
      </section>



      {/* Section 4: System & Security */}
      <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden mb-12">
        <div className="border-b border-outline-variant/30 p-6 flex items-center gap-3 bg-surface/50">
          <span className="material-symbols-outlined text-primary-container">shield</span>
          <h3 className="font-headline-sm text-headline-sm">System & Security</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="p-5 border border-outline-variant rounded-lg bg-surface-container-low flex items-start gap-4">
              <div className="size-12 shrink-0 bg-surface rounded-full shadow-sm text-on-surface-variant flex items-center justify-center">
                <span className="material-symbols-outlined">database</span>
              </div>
              <div className="flex-1">
                <h4 className="font-label-md text-label-md text-on-surface mb-1">Backup Data</h4>
                <p className="text-sm text-on-surface-variant mb-4">Download a complete backup of your current database including bills, customers, and ledger.</p>
                <button onClick={handleBackup} disabled={saving} className="px-4 py-2 bg-surface border border-outline-variant text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container transition-colors shadow-sm flex items-center gap-2">
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <span className="material-symbols-outlined text-[18px]">download</span>}
                  Generate Backup
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
