export type Product = {
  id: string
  name: string
  brand: string
  category: string
  finish: string
  surface: string
  price: number
  mrp: number
  rating: number
  reviews: number
  image: string
  tag?: string
  colors: string[]
  sizes: { label: string; price: number }[]
  description: string
  stock: number
}

export const categories = [
  { id: "interior", name: "Interior Paints", count: 120, icon: "PaintBucket" },
  { id: "exterior", name: "Exterior Paints", count: 80, icon: "Building2" },
  { id: "enamel", name: "Enamels & Gloss", count: 60, icon: "Brush" },
  { id: "primer", name: "Primers & Putty", count: 45, icon: "Layers" },
  { id: "waterproofing", name: "Waterproofing", count: 30, icon: "Droplets" },
  { id: "tools", name: "Tools & Brushes", count: 90, icon: "Wrench" },
] as const

export const products: Product[] = [
  {
    id: "velvet-touch-interior",
    name: "Velvet Touch Interior Emulsion",
    brand: "Dulux",
    category: "interior",
    finish: "Luxury Matt",
    surface: "Interior Walls",
    price: 3499,
    mrp: 4200,
    rating: 4.9,
    reviews: 412,
    image: "/product-interior.png",
    tag: "Bestseller",
    colors: ["#F4E9DC", "#E7C9A9", "#C97B5A", "#7C9B8E", "#4A6FA5"],
    sizes: [
      { label: "1 L", price: 899 },
      { label: "4 L", price: 3499 },
      { label: "10 L", price: 8200 },
      { label: "20 L", price: 15800 },
    ],
    description:
      "A luxurious matt finish emulsion that gives your walls a rich, velvety look with superior stain resistance and easy maintenance.",
    stock: 64,
  },
  {
    id: "weathershield-exterior",
    name: "WeatherShield Exterior",
    brand: "Dulux",
    category: "exterior",
    finish: "Smooth",
    surface: "Exterior Walls",
    price: 4150,
    mrp: 4900,
    rating: 4.8,
    reviews: 318,
    image: "/product-exterior.png",
    tag: "Popular",
    colors: ["#E8E2D5", "#B7C4C9", "#6E8898", "#3D5A6C", "#27384A"],
    sizes: [
      { label: "1 L", price: 1090 },
      { label: "4 L", price: 4150 },
      { label: "10 L", price: 9800 },
      { label: "20 L", price: 18900 },
    ],
    description:
      "10-year protection against the harshest weather. Resists algae, fungal growth and fading while keeping walls cooler.",
    stock: 41,
  },
  {
    id: "all-surface-primer",
    name: "All-Surface Primer",
    brand: "Dulux",
    category: "primer",
    finish: "Water Based",
    surface: "All Surfaces",
    price: 1250,
    mrp: 1500,
    rating: 4.7,
    reviews: 156,
    image: "/product-primer.png",
    colors: ["#FFFFFF", "#F2F2F2", "#E5E5E5"],
    sizes: [
      { label: "1 L", price: 360 },
      { label: "4 L", price: 1250 },
      { label: "10 L", price: 2950 },
    ],
    description:
      "A versatile water-based primer that ensures excellent adhesion and a uniform base for top coats on any surface.",
    stock: 8,
  },
  {
    id: "high-gloss-enamel",
    name: "High Gloss Enamel",
    brand: "Dulux",
    category: "enamel",
    finish: "High Gloss",
    surface: "Wood & Metal",
    price: 980,
    mrp: 1150,
    rating: 4.9,
    reviews: 204,
    image: "/product-enamel.png",
    tag: "New",
    colors: ["#1B1B1B", "#C0392B", "#1E6F5C", "#2C3E70", "#E0A800"],
    sizes: [
      { label: "500 ml", price: 540 },
      { label: "1 L", price: 980 },
      { label: "4 L", price: 3650 },
    ],
    description:
      "A durable high-gloss enamel for wood and metal with a mirror-like finish that resists chipping and yellowing.",
    stock: 52,
  },
  {
    id: "easyclean-interior",
    name: "EasyClean Washable Emulsion",
    brand: "Dulux",
    category: "interior",
    finish: "Soft Sheen",
    surface: "Interior Walls",
    price: 2890,
    mrp: 3400,
    rating: 4.8,
    reviews: 271,
    image: "/product-interior.png",
    tag: "Bestseller",
    colors: ["#FBF3E4", "#F2D6B3", "#D98E73", "#88A0A8", "#5A7D7C"],
    sizes: [
      { label: "1 L", price: 760 },
      { label: "4 L", price: 2890 },
      { label: "10 L", price: 6900 },
    ],
    description:
      "Stains wipe off effortlessly. Perfect for homes with kids, this washable emulsion keeps walls looking fresh for years.",
    stock: 33,
  },
  {
    id: "roof-waterproof",
    name: "RoofGuard Waterproofing",
    brand: "Dulux",
    category: "waterproofing",
    finish: "Elastomeric",
    surface: "Roofs & Terraces",
    price: 5600,
    mrp: 6500,
    rating: 4.6,
    reviews: 98,
    image: "/product-exterior.png",
    colors: ["#D8DEE9", "#9AA5B1", "#5C6B7A"],
    sizes: [
      { label: "4 L", price: 5600 },
      { label: "20 L", price: 24500 },
    ],
    description:
      "A flexible elastomeric coating that bridges hairline cracks and creates a seamless waterproof barrier on roofs and terraces.",
    stock: 4,
  },
  {
    id: "wood-finish-pu",
    name: "Premium PU Wood Finish",
    brand: "Dulux",
    category: "enamel",
    finish: "Satin",
    surface: "Wood",
    price: 2150,
    mrp: 2600,
    rating: 4.7,
    reviews: 142,
    image: "/product-enamel.png",
    colors: ["#6B4226", "#8B5A2B", "#A9743B", "#3B2417"],
    sizes: [
      { label: "1 L", price: 2150 },
      { label: "4 L", price: 7900 },
    ],
    description:
      "A polyurethane wood finish that enhances natural grain with a tough, scratch-resistant satin coat.",
    stock: 19,
  },
  {
    id: "wall-putty",
    name: "SmoothPro Wall Putty",
    brand: "Dulux",
    category: "primer",
    finish: "Powder",
    surface: "Interior & Exterior",
    price: 720,
    mrp: 850,
    rating: 4.5,
    reviews: 87,
    image: "/product-primer.png",
    colors: ["#FFFFFF", "#F5F5F5"],
    sizes: [
      { label: "5 kg", price: 720 },
      { label: "20 kg", price: 2600 },
    ],
    description:
      "A white cement-based putty that fills imperfections and gives walls a smooth, even base for painting.",
    stock: 76,
  },
]

export function getProduct(id: string) {
  return products.find((p) => p.id === id)
}

export const ordersSeed = [
  {
    id: "HP-10482",
    customer: "Priya Sharma",
    date: "2026-06-04",
    items: 3,
    total: 8740,
    status: "Delivered",
    payment: "Paid",
  },
  {
    id: "HP-10481",
    customer: "Rakesh Verma",
    date: "2026-06-04",
    items: 12,
    total: 42600,
    status: "Out for Delivery",
    payment: "Paid",
  },
  {
    id: "HP-10480",
    customer: "Anjali Mehta",
    date: "2026-06-03",
    items: 2,
    total: 5980,
    status: "Packed",
    payment: "Paid",
  },
  {
    id: "HP-10479",
    customer: "Suresh Patil",
    date: "2026-06-03",
    items: 5,
    total: 14250,
    status: "Processing",
    payment: "COD",
  },
  {
    id: "HP-10478",
    customer: "Meena Iyer",
    date: "2026-06-02",
    items: 1,
    total: 3499,
    status: "Delivered",
    payment: "Paid",
  },
  {
    id: "HP-10477",
    customer: "Arjun Nair",
    date: "2026-06-02",
    items: 8,
    total: 28900,
    status: "Cancelled",
    payment: "Refunded",
  },
]

export const customersSeed = [
  { id: "C-201", name: "Priya Sharma", phone: "+91 98200 11223", city: "Pune", orders: 14, spent: 124500, type: "Homeowner" },
  { id: "C-202", name: "Rakesh Verma", phone: "+91 99300 44556", city: "Mumbai", orders: 62, spent: 842000, type: "Contractor" },
  { id: "C-203", name: "Anjali Mehta", phone: "+91 97600 77889", city: "Pune", orders: 9, spent: 67800, type: "Designer" },
  { id: "C-204", name: "Suresh Patil", phone: "+91 90400 33221", city: "Nashik", orders: 21, spent: 198000, type: "Contractor" },
  { id: "C-205", name: "Meena Iyer", phone: "+91 96500 66778", city: "Pune", orders: 4, spent: 18900, type: "Homeowner" },
  { id: "C-206", name: "Arjun Nair", phone: "+91 93100 99001", city: "Mumbai", orders: 31, spent: 376000, type: "Contractor" },
]

export const couponsSeed = [
  { code: "FRESH15", desc: "15% off interior paints", discount: "15%", active: true, used: 218, limit: 500 },
  { code: "MONSOON500", desc: "₹500 off waterproofing", discount: "₹500", active: true, used: 96, limit: 300 },
  { code: "BULK10", desc: "10% off orders above ₹25,000", discount: "10%", active: true, used: 54, limit: 200 },
  { code: "WELCOME200", desc: "₹200 off first order", discount: "₹200", active: false, used: 1200, limit: 1200 },
]

export const staffSeed = [
  { id: "S-01", name: "Vikram Singh", role: "Store Manager", phone: "+91 98111 22334", orders: 142, performance: 94, initials: "VS" },
  { id: "S-02", name: "Deepa Rao", role: "Billing Executive", phone: "+91 97222 33445", orders: 98, performance: 88, initials: "DR" },
  { id: "S-03", name: "Imran Khan", role: "Delivery Lead", phone: "+91 96333 44556", orders: 211, performance: 91, initials: "IK" },
  { id: "S-04", name: "Sneha Joshi", role: "Color Consultant", phone: "+91 95444 55667", orders: 76, performance: 96, initials: "SJ" },
]

export const revenueData = [
  { month: "Jan", revenue: 420000, orders: 180 },
  { month: "Feb", revenue: 510000, orders: 214 },
  { month: "Mar", revenue: 680000, orders: 290 },
  { month: "Apr", revenue: 590000, orders: 256 },
  { month: "May", revenue: 760000, orders: 332 },
  { month: "Jun", revenue: 890000, orders: 401 },
]

export const categorySales = [
  { name: "Interior", value: 42 },
  { name: "Exterior", value: 28 },
  { name: "Enamel", value: 16 },
  { name: "Primer", value: 9 },
  { name: "Other", value: 5 },
]

export const orderStatuses = ["Processing", "Packed", "Out for Delivery", "Delivered"] as const
