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

type SettingMap = Record<string, string>

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingMap>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  
  // WhatsApp Test State
  const [testPhone, setTestPhone] = useState("")

  useEffect(() => {
    fetchSettings()
  }, [])

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
    <div className="space-y-6 pb-20 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10 bg-muted/40 backdrop-blur-md py-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Settings className="size-8 text-primary" /> System Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage store preferences, billing configs, and notifications</p>
        </div>
        <div className="flex items-center gap-4">
          {unsavedChanges && <span className="text-sm font-bold text-orange-500 animate-pulse">Unsaved changes...</span>}
          <Button onClick={handleSave} disabled={saving || !unsavedChanges} className="rounded-xl px-8 shadow-lg shadow-primary/20">
            {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: Shop Information */}
        <section className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border/60 pb-3 mb-4">
            <Store className="size-5 text-primary" /> Shop Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Shop Name</label>
              <input type="text" value={settings.shop_name} onChange={e => handleChange('shop_name', e.target.value)} className="w-full mt-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Full Address</label>
              <textarea value={settings.shop_address} onChange={e => handleChange('shop_address', e.target.value)} rows={2} className="w-full mt-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="text-xs font-semibold text-muted-foreground">City</label>
                <input type="text" value={settings.shop_city} onChange={e => handleChange('shop_city', e.target.value)} className="w-full mt-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="col-span-1">
                <label className="text-xs font-semibold text-muted-foreground">State</label>
                <input type="text" value={settings.shop_state} onChange={e => handleChange('shop_state', e.target.value)} className="w-full mt-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="col-span-1">
                <label className="text-xs font-semibold text-muted-foreground">Pincode</label>
                <input type="text" value={settings.shop_pincode} onChange={e => handleChange('shop_pincode', e.target.value)} className="w-full mt-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                <input type="text" value={settings.shop_phone} onChange={e => handleChange('shop_phone', e.target.value)} className="w-full mt-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                <input type="email" value={settings.shop_email} onChange={e => handleChange('shop_email', e.target.value)} className="w-full mt-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">GSTIN Number</label>
              <input type="text" value={settings.shop_gstin} onChange={e => handleChange('shop_gstin', e.target.value)} className="w-full mt-1 rounded-xl border border-input bg-background px-3 py-2 text-sm uppercase font-mono focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>
        </section>

        {/* Section 2: WhatsApp Settings */}
        <section className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border/60 pb-3 mb-4">
            <MessageCircle className="size-5 text-[#25D366]" /> WhatsApp Integration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Official WhatsApp Number</label>
              <div className="flex gap-2 mt-1">
                <input type="text" value={settings.whatsapp_number} onChange={e => handleChange('whatsapp_number', e.target.value)} className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-[#25D366] outline-none" />
              </div>
            </div>
            
            <div className="bg-muted/30 p-3 rounded-xl border border-border/60 mt-4 space-y-2">
              <label className="text-xs font-bold text-muted-foreground">Test Configuration</label>
              <div className="flex gap-2">
                <input type="text" placeholder="Enter your number to test" value={testPhone} onChange={e => setTestPhone(e.target.value)} className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-[#25D366] outline-none" />
                <Button onClick={sendTestWhatsApp} variant="secondary" className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl"><Send className="size-4 mr-2"/> Test</Button>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-foreground">Message Templates</label>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Order Accepted Template</label>
                <textarea value={settings.whatsapp_msg_accepted} onChange={e => handleChange('whatsapp_msg_accepted', e.target.value)} rows={2} className="w-full mt-1 rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-[#25D366] outline-none resize-none" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Out for Delivery Template</label>
                <textarea value={settings.whatsapp_msg_out} onChange={e => handleChange('whatsapp_msg_out', e.target.value)} rows={2} className="w-full mt-1 rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-[#25D366] outline-none resize-none" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Delivered Template</label>
                <textarea value={settings.whatsapp_msg_delivered} onChange={e => handleChange('whatsapp_msg_delivered', e.target.value)} rows={2} className="w-full mt-1 rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-[#25D366] outline-none resize-none" />
              </div>
              <p className="text-[10px] text-muted-foreground italic">Available variables: {'{name}'}, {'{orderId}'}, {'{amount}'}</p>
            </div>
          </div>
        </section>

        {/* Section 3: Billing Settings */}
        <section className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border/60 pb-3 mb-4">
            <Receipt className="size-5 text-primary" /> Billing Configurations
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Default Discount (%)</label>
                <input type="number" value={settings.default_discount} onChange={e => handleChange('default_discount', e.target.value)} className="w-full mt-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Default GST (%)</label>
                <input type="number" value={settings.default_gst} onChange={e => handleChange('default_gst', e.target.value)} className="w-full mt-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Bill Number Prefix</label>
              <input type="text" value={settings.bill_prefix} onChange={e => handleChange('bill_prefix', e.target.value)} placeholder="HP" className="w-full mt-1 rounded-xl border border-input bg-background px-3 py-2 text-sm uppercase font-mono focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div className="pt-2">
              <Button onClick={resetBillsWarning} variant="destructive" className="w-full rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20">
                Reset Bill Number Sequence
              </Button>
            </div>
          </div>
        </section>

        {/* Section 4 & 5: Delivery & Hours */}
        <div className="space-y-6">
          <section className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border/60 pb-3 mb-4">
              <Truck className="size-5 text-primary" /> Delivery Options
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Min Order Value (₹)</label>
                  <input type="number" value={settings.min_order_value} onChange={e => handleChange('min_order_value', e.target.value)} className="w-full mt-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Delivery Charge (₹)</label>
                  <input type="number" value={settings.delivery_charge} onChange={e => handleChange('delivery_charge', e.target.value)} className="w-full mt-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Free Delivery Above (₹)</label>
                <input type="number" value={settings.free_delivery_above} onChange={e => handleChange('free_delivery_above', e.target.value)} className="w-full mt-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Serviceable Pincodes (comma separated)</label>
                <textarea value={settings.serviceable_pincodes} onChange={e => handleChange('serviceable_pincodes', e.target.value)} rows={2} className="w-full mt-1 rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary outline-none resize-none" />
              </div>
            </div>
          </section>

          <section className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border/60 pb-3 mb-4">
              <Clock className="size-5 text-primary" /> Business Hours
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Opening Time</label>
                  <input type="time" value={settings.opening_time} onChange={e => handleChange('opening_time', e.target.value)} className="w-full mt-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Closing Time</label>
                  <input type="time" value={settings.closing_time} onChange={e => handleChange('closing_time', e.target.value)} className="w-full mt-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Closed Days</label>
                <input type="text" value={settings.closed_days} onChange={e => handleChange('closed_days', e.target.value)} placeholder="e.g. Sunday" className="w-full mt-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl mt-4">
                <div>
                  <div className="font-bold text-orange-700">Holiday Mode</div>
                  <div className="text-xs text-orange-600/80">Display "Store Closed" on website</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.holiday_mode === "true"}
                    onChange={() => handleToggle('holiday_mode')} 
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  )
}
