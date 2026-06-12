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
    <div className="p-container-padding max-w-5xl mx-auto space-y-element-gap w-full pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Settings className="size-8 text-primary" /> Settings
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {unsavedChanges && <span className="text-sm font-bold text-orange-500 animate-pulse">Unsaved changes...</span>}
          <Button onClick={handleSave} disabled={saving || !unsavedChanges} className="rounded-xl px-8 shadow-sm">
            {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

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
        </div>
      </section>

      {/* Section 2: Billing Preferences */}
      <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="border-b border-outline-variant/30 p-6 flex items-center gap-3 bg-surface/50">
          <span className="material-symbols-outlined text-primary-container">receipt</span>
          <h3 className="font-headline-sm text-headline-sm">Billing Preferences</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block font-label-md text-label-md text-on-surface-variant">Bill Number Prefix</label>
              <input 
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-on-surface font-mono uppercase" 
                type="text" 
                value={settings.bill_prefix} 
                onChange={e => handleChange('bill_prefix', e.target.value)} 
              />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-1 grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="block font-label-md text-label-md text-on-surface-variant">Default GST (%)</label>
                <input 
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-on-surface" 
                  type="number" 
                  value={settings.default_gst} 
                  onChange={e => handleChange('default_gst', e.target.value)} 
                />
              </div>
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-1 grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="block font-label-md text-label-md text-on-surface-variant">Default Discount (%)</label>
                <input 
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-on-surface" 
                  type="number" 
                  value={settings.default_discount} 
                  onChange={e => handleChange('default_discount', e.target.value)} 
                />
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-start">
             <Button onClick={resetBillsWarning} variant="destructive" className="rounded-lg shadow-sm border border-red-500/20">
                Reset Bill Number Sequence
             </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 border border-outline-variant rounded-lg bg-surface-container-low flex items-start gap-4">
              <div className="p-3 bg-surface rounded-full shadow-sm text-on-surface-variant">
                <span className="material-symbols-outlined">database</span>
              </div>
              <div className="flex-1">
                <h4 className="font-label-md text-label-md text-on-surface mb-1">Backup Data</h4>
                <p className="text-sm text-on-surface-variant mb-4">Download a complete backup of your current database.</p>
                <button className="px-4 py-2 bg-surface border border-outline-variant text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container transition-colors shadow-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">download</span>
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
