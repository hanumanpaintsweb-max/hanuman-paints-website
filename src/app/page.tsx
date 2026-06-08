import { SiteShell } from "@/components/site/site-shell"
import { Hero } from "@/components/hero"
import { HeroBanner } from "@/components/offers/HeroBanner"
import { Categories } from "@/components/categories"
import { PopularProducts } from "@/components/popular-products"
import { WhyOrderOnline } from "@/components/why-order-online"

export default function Page() {
  return (
    <SiteShell>
      <div className="pt-24 md:pt-32" />
      <HeroBanner />
      <Hero />
      <Categories />
      <PopularProducts />
      <WhyOrderOnline />
    </SiteShell>
  )
}
