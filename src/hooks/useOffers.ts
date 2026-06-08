import { useEffect, useState } from "react"
import { supabase } from "@/services/supabase"

type Offer = {
  id: string
  title: string
  offer_type: string
  discount_value: number
  applicable_on: string
  category_id: string
  product_id: string
  badge_text: string
  badge_color: string
}

let cachedOffers: Offer[] | null = null
let fetchPromise: Promise<Offer[]> | null = null

export function useActiveOffers() {
  const [offers, setOffers] = useState<Offer[]>(cachedOffers || [])

  useEffect(() => {
    if (cachedOffers) {
      setOffers(cachedOffers)
      return
    }

    if (!fetchPromise) {
      fetchPromise = Promise.resolve(
        supabase
          .from('offers')
          .select('*')
          .eq('is_active', true)
      ).then(({ data }) => {
        const res = (data as Offer[]) || []
        cachedOffers = res
        return res
      })
    }

    fetchPromise.then((res) => {
      setOffers(res)
    })
  }, [])

  return offers
}
