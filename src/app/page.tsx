import { SiteShell } from "@/components/site/site-shell"
import { Hero } from "@/components/hero"
import { Categories } from "@/components/categories"
import { PopularProducts } from "@/components/popular-products"
import { WhyOrderOnline } from "@/components/why-order-online"

export default function Page() {
  return (
    <SiteShell>
      <Hero />
      <Categories />
      <PopularProducts />
      <WhyOrderOnline />
    </SiteShell>
  )
}
