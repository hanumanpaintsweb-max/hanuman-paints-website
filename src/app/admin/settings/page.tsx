"use client"

import { useEffect, useState } from "react"
import { Loader2, Phone, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSetting } from "@/services/settingsService"
import { updateSetting } from "@/app/actions/settings"
import { toast } from "sonner"

export default function SettingsPage() {
  const [whatsapp, setWhatsapp] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const num = await getSetting("whatsapp_number", "9204367192")
      setWhatsapp(num)
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSetting("whatsapp_number", whatsapp)
      toast.success("Settings updated successfully")
    } catch (err) {
      toast.error("Failed to update settings")
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground">Global Settings</h1>
      
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Contact Details</h2>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              WhatsApp Number
            </label>
            <div className="relative flex items-center">
              <Phone className="absolute left-4 size-4 text-muted-foreground" />
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter number (without +91)"
                className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              This number is used for "Consult on WhatsApp" buttons across the website.
            </p>
          </div>
          
          <Button onClick={handleSave} disabled={saving} className="gap-2 rounded-xl">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
