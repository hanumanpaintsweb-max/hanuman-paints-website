import { SiteShell } from "@/components/site/site-shell"
import { Hero } from "@/components/hero"
import { Categories } from "@/components/categories"
import { Stats } from "@/components/stats"
import { PopularProducts } from "@/components/popular-products"
import { WhyOrderOnline } from "@/components/why-order-online"
import { Testimonials } from "@/components/testimonials"

export default function Page() {
  return (
    <SiteShell>
      <Hero />
      <Categories />
      <Stats />
      <PopularProducts />
      <WhyOrderOnline />
      <Testimonials />
    </SiteShell>
  )
}
