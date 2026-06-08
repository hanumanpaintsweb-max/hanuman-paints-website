import { SiteShell } from "@/components/site/site-shell"
import { Hero } from "@/components/hero"
import { HeroBanner } from "@/components/offers/HeroBanner"
import { Categories } from "@/components/categories"
import { PopularProducts } from "@/components/popular-products"
import { WhyOrderOnline } from "@/components/why-order-online"

export default function Page() {
  return (
    <SiteShell>
      <div className="pt-28 md:pt-36 pb-2">
        <HeroBanner />
      </div>
      <div className="-mt-32 md:-mt-40">
        <Hero />
      </div>
      <Categories />
      <PopularProducts />
      <WhyOrderOnline />
    </SiteShell>
  )
}
