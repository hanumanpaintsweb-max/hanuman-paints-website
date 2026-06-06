import { redirect } from "next/navigation"
import { getSession } from "@/app/actions/auth"
import { getOrdersByPhone } from "@/services/orderService"
import { SiteShell } from "@/components/site/site-shell"
import { OrdersClient } from "./orders-client"

export const metadata = {
  title: "My Orders | Hanuman Paints",
}

export default async function MyOrdersPage() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  let orders = []
  try {
    orders = await getOrdersByPhone(session.phone)
  } catch {
    orders = []
  }

  return (
    <SiteShell>
      <div className="min-h-[80vh] px-4 pt-36 pb-16 sm:px-6 sm:pt-40">
        <OrdersClient orders={orders || []} />
      </div>
    </SiteShell>
  )
}
