const productsList = [
  // EMULSIONS
  {
    id: "dulux-velvet-touch-diamond-glo",
    name: "Dulux Velvet Touch Diamond Glo",
    category: "Emulsions",
    categoryId: "interior",
    image: "https://www.dulux.in/content/dam/akzonobel-flourish/dulux/in/en/products/dulux-velvet-touch-diamond-glo/packshot.png",
    description: "Premium interior emulsion with a radiant glow and superior washability.",
    features: ["Radiant Glow", "Highly Washable", "Stain Resistant"],
    popular: true,
    sizes: [
      { size: "1L", mrp: 650, discounted: Math.round(650 * 0.95) },
      { size: "4L", mrp: 2500, discounted: Math.round(2500 * 0.95) },
      { size: "10L", mrp: 6000, discounted: Math.round(6000 * 0.95) }
    ]
  },
  {
    id: "dulux-promise-sheen-interior",
    name: "Dulux Promise Sheen Interior",
    category: "Emulsions",
    categoryId: "interior",
    image: "https://www.dulux.in/content/dam/akzonobel-flourish/dulux/in/en/products/dulux-promise-sheen-interior/packshot.png",
    description: "High quality interior emulsion with a rich sheen finish.",
    features: ["Rich Sheen", "Anti-Fungal", "Good Coverage"],
    sizes: [
      { size: "1L", mrp: 350, discounted: Math.round(350 * 0.95) },
      { size: "4L", mrp: 1300, discounted: Math.round(1300 * 0.95) },
      { size: "10L", mrp: 3100, discounted: Math.round(3100 * 0.95) }
    ]
  },
  {
    id: "dulux-promise-sheen-exterior",
    name: "Dulux Promise Sheen Exterior",
    category: "Emulsions",
    categoryId: "exterior",
    image: "https://www.dulux.in/content/dam/akzonobel-flourish/dulux/in/en/products/dulux-promise-sheen-exterior/packshot.png",
    description: "Durable exterior emulsion that protects your walls from the elements with a sheen.",
    features: ["Weather Resistance", "Anti-Algal", "Long Lasting"],
    sizes: [
      { size: "1L", mrp: 380, discounted: Math.round(380 * 0.95) },
      { size: "4L", mrp: 1450, discounted: Math.round(1450 * 0.95) },
      { size: "10L", mrp: 3500, discounted: Math.round(3500 * 0.95) }
    ]
  },
  {
    id: "dulux-promise-interior",
    name: "Dulux Promise Interior",
    category: "Emulsions",
    categoryId: "interior",
    image: "https://www.dulux.in/content/dam/akzonobel-flourish/dulux/in/en/products/dulux-promise-interior/packshot.png",
    description: "Reliable interior emulsion providing a smooth finish.",
    features: ["Smooth Finish", "Value for Money", "High Opacity"],
    popular: true,
    sizes: [
      { size: "4L", mrp: 950, discounted: Math.round(950 * 0.95) },
      { size: "10L", mrp: 2200, discounted: Math.round(2200 * 0.95) }
    ]
  },
  {
    id: "dulux-promise-exterior",
    name: "Dulux Promise Exterior",
    category: "Emulsions",
    categoryId: "exterior",
    image: "https://www.dulux.in/content/dam/akzonobel-flourish/dulux/in/en/products/dulux-promise-exterior/packshot.png",
    description: "Dependable exterior emulsion for everyday protection.",
    features: ["Weather Protection", "Good Adhesion", "Color Retention"],
    sizes: [
      { size: "4L", mrp: 1100, discounted: Math.round(1100 * 0.95) },
      { size: "10L", mrp: 2600, discounted: Math.round(2600 * 0.95) },
      { size: "20L", mrp: 5000, discounted: Math.round(5000 * 0.95) }
    ]
  },
  {
    id: "dulux-promise-smartchoice-interior",
    name: "Dulux Promise SmartChoice Interior",
    category: "Emulsions",
    categoryId: "mid-tier",
    image: "https://www.dulux.in/content/dam/akzonobel-flourish/dulux/in/en/products/dulux-promise-smartchoice-interior/packshot.png",
    description: "Budget friendly interior emulsion.",
    features: ["Economical", "Good Coverage", "Matt Finish"],
    sizes: [
      { size: "4L", mrp: 600, discounted: Math.round(600 * 0.95) },
      { size: "20L", mrp: 2800, discounted: Math.round(2800 * 0.95) }
    ]
  },
  {
    id: "dulux-promise-smartchoice-exterior",
    name: "Dulux Promise SmartChoice Exterior",
    category: "Emulsions",
    categoryId: "mid-tier",
    image: "https://www.dulux.in/content/dam/akzonobel-flourish/dulux/in/en/products/dulux-promise-smartchoice-exterior/packshot.png",
    description: "Budget friendly exterior emulsion.",
    features: ["Economical", "Weather Protection", "Matt Finish"],
    sizes: [
      { size: "20L", mrp: 3500, discounted: Math.round(3500 * 0.95) }
    ]
  },

  // WEATHERSHIELD
  {
    id: "dulux-weathershield-powerflexx-15yr",
    name: "Dulux Weathershield Powerflexx 15yr",
    category: "Weathershield",
    categoryId: "exterior",
    image: "https://www.dulux.in/content/dam/akzonobel-flourish/dulux/in/en/products/dulux-weathershield-powerflexx/packshot.png",
    description: "Ultimate exterior protection with advanced crack bridging technology.",
    features: ["15 Year Warranty", "Crack Bridging", "Water Repellent"],
    popular: true,
    sizes: [
      { size: "4L", mrp: 2800, discounted: Math.round(2800 * 0.95) },
      { size: "10L", mrp: 6800, discounted: Math.round(6800 * 0.95) },
      { size: "18L", mrp: 12000, discounted: Math.round(12000 * 0.95) },
      { size: "20L", mrp: 13200, discounted: Math.round(13200 * 0.95) }
    ]
  },
  {
    id: "dulux-weathershield-max-10yr",
    name: "Dulux Weathershield Max 10yr",
    category: "Weathershield",
    categoryId: "exterior",
    image: "https://www.dulux.in/content/dam/akzonobel-flourish/dulux/in/en/products/dulux-weathershield-max/packshot.png",
    description: "Premium exterior emulsion with 10-year weather protection.",
    features: ["10 Year Warranty", "Anti-Algal", "Dirt Resistance"],
    sizes: [
      { size: "1L", mrp: 550, discounted: Math.round(550 * 0.95) }
    ]
  },
  {
    id: "dulux-weathershield-protect-dustproof-hisheen",
    name: "Dulux Weathershield Protect Dustproof Hi-Sheen",
    category: "Weathershield",
    categoryId: "exterior",
    image: "https://www.dulux.in/content/dam/akzonobel-flourish/dulux/in/en/products/dulux-weathershield-protect/packshot.png",
    description: "High sheen exterior paint that resists dust.",
    features: ["Dustproof", "High Sheen", "Weather Protection"],
    sizes: [
      { size: "1L", mrp: 450, discounted: Math.round(450 * 0.95) },
      { size: "4L", mrp: 1700, discounted: Math.round(1700 * 0.95) },
      { size: "10L", mrp: 4100, discounted: Math.round(4100 * 0.95) },
      { size: "20L", mrp: 8000, discounted: Math.round(8000 * 0.95) }
    ]
  },
  {
    id: "dulux-floor-plus",
    name: "Dulux Floor Plus",
    category: "Weathershield",
    categoryId: "exterior",
    image: "https://www.dulux.in/content/dam/akzonobel-flourish/dulux/in/en/products/dulux-floor-plus/packshot.png",
    description: "Durable coating for exterior floors and tiles.",
    features: ["Abrasion Resistance", "Anti-Fungal", "Washable"],
    sizes: [
      { size: "1L", mrp: 380, discounted: Math.round(380 * 0.95) },
      { size: "4L", mrp: 1400, discounted: Math.round(1400 * 0.95) }
    ]
  },

  // WATERPROOFING
  {
    id: "dulux-aquatech-damp-protect-plus",
    name: "Dulux Aquatech Damp Protect Plus",
    category: "Waterproofing",
    categoryId: "waterproofing",
    image: "https://www.dulux.in/content/dam/akzonobel-flourish/dulux/in/en/products/dulux-aquatech-damp-protect/packshot.png",
    description: "Advanced waterproofing solution for interior and exterior walls.",
    features: ["Waterproofing", "Anti-Carbonation", "Crack Bridging"],
    popular: true,
    sizes: [
      { size: "10L", mrp: 4500, discounted: Math.round(4500 * 0.95) },
      { size: "20L", mrp: 8800, discounted: Math.round(8800 * 0.95) }
    ]
  },

  // ENAMELS
  {
    id: "dulux-gloss-white",
    name: "Dulux Gloss White",
    category: "Enamels",
    categoryId: "enamels",
    image: "https://www.dulux.in/content/dam/akzonobel-flourish/dulux/in/en/products/dulux-gloss/packshot.png",
    description: "High gloss enamel for wood and metal surfaces.",
    features: ["High Gloss", "Tough Finish", "Washable"],
    sizes: [
      { size: "1L", mrp: 350, discounted: Math.round(350 * 0.95) },
      { size: "4L", mrp: 1300, discounted: Math.round(1300 * 0.95) }
    ]
  },
  {
    id: "dulux-gloss-smoke-grey",
    name: "Dulux Gloss Smoke Grey",
    category: "Enamels",
    categoryId: "enamels",
    image: "https://www.dulux.in/content/dam/akzonobel-flourish/dulux/in/en/products/dulux-gloss/packshot.png",
    description: "High gloss enamel for wood and metal surfaces in Smoke Grey.",
    features: ["High Gloss", "Tough Finish", "Washable"],
    sizes: [
      { size: "20L", mrp: 6000, discounted: Math.round(6000 * 0.95) }
    ]
  },
  {
    id: "dulux-gloss-dark-brown",
    name: "Dulux Gloss Dark Brown",
    category: "Enamels",
    categoryId: "enamels",
    image: "https://www.dulux.in/content/dam/akzonobel-flourish/dulux/in/en/products/dulux-gloss/packshot.png",
    description: "High gloss enamel for wood and metal surfaces in Dark Brown.",
    features: ["High Gloss", "Tough Finish", "Washable"],
    sizes: [
      { size: "4L", mrp: 1300, discounted: Math.round(1300 * 0.95) }
    ]
  },
  {
    id: "dulux-gloss-golden-brown",
    name: "Dulux Gloss Golden Brown",
    category: "Enamels",
    categoryId: "enamels",
    image: "https://www.dulux.in/content/dam/akzonobel-flourish/dulux/in/en/products/dulux-gloss/packshot.png",
    description: "High gloss enamel for wood and metal surfaces in Golden Brown.",
    features: ["High Gloss", "Tough Finish", "Washable"],
    sizes: [
      { size: "4L", mrp: 1300, discounted: Math.round(1300 * 0.95) }
    ]
  },
  {
    id: "dulux-gloss-brilliant-white",
    name: "Dulux Gloss Brilliant White",
    category: "Enamels",
    categoryId: "enamels",
    image: "https://www.dulux.in/content/dam/akzonobel-flourish/dulux/in/en/products/dulux-gloss/packshot.png",
    description: "Premium high gloss enamel in Brilliant White.",
    features: ["High Gloss", "Tough Finish", "Non-Yellowing"],
    sizes: [
      { size: "1L", mrp: 380, discounted: Math.round(380 * 0.95) }
    ]
  },
  {
    id: "dulux-super-gloss-5in1-white",
    name: "Dulux Super Gloss 5in1 White",
    category: "Enamels",
    categoryId: "enamels",
    image: "https://www.dulux.in/content/dam/akzonobel-flourish/dulux/in/en/products/dulux-super-gloss-5in1/packshot.png",
    description: "Advanced 5in1 enamel offering superior protection and shine.",
    features: ["Anti-Rust", "Anti-Fungal", "High Gloss", "Non-Yellowing", "Washable"],
    sizes: [
      { size: "1L", mrp: 450, discounted: Math.round(450 * 0.95) }
    ]
  },

  // PRIMERS
  {
    id: "dulux-promise-primer",
    name: "Dulux Promise Primer",
    category: "Primers",
    categoryId: "primers",
    image: "https://www.dulux.in/content/dam/akzonobel-flourish/dulux/in/en/products/dulux-promise-primer/packshot.png",
    description: "High quality primer for interior walls.",
    features: ["Good Adhesion", "Alkali Resistance", "High Opacity"],
    sizes: [
      { size: "4L", mrp: 600, discounted: Math.round(600 * 0.95) },
      { size: "20L", mrp: 2800, discounted: Math.round(2800 * 0.95) }
    ]
  },
  {
    id: "dulux-promise-2in1-primer-int-ext",
    name: "Dulux Promise 2in1 Primer Int & Ext",
    category: "Primers",
    categoryId: "primers",
    image: "https://www.dulux.in/content/dam/akzonobel-flourish/dulux/in/en/products/dulux-promise-2in1-primer/packshot.png",
    description: "Versatile primer for both interior and exterior surfaces.",
    features: ["Interior & Exterior", "Good Adhesion", "Moisture Resistance"],
    sizes: [
      { size: "10L", mrp: 1600, discounted: Math.round(1600 * 0.95) },
      { size: "20L", mrp: 3000, discounted: Math.round(3000 * 0.95) }
    ]
  },
  {
    id: "dulux-promise-freedom-2in1-primer",
    name: "Dulux Promise Freedom 2in1 Primer",
    category: "Primers",
    categoryId: "primers",
    image: "https://www.dulux.in/content/dam/akzonobel-flourish/dulux/in/en/products/dulux-promise-freedom-primer/packshot.png",
    description: "Economy 2in1 primer for interior and exterior.",
    features: ["Economy Choice", "Good Coverage", "Quick Drying"],
    sizes: [
      { size: "10L", mrp: 1200, discounted: Math.round(1200 * 0.95) },
      { size: "20L", mrp: 2300, discounted: Math.round(2300 * 0.95) }
    ]
  },
  {
    id: "dulux-weathershield-alkali-bloc-primer",
    name: "Dulux Weathershield Alkali Bloc Primer",
    category: "Primers",
    categoryId: "primers",
    image: "https://www.dulux.in/content/dam/akzonobel-flourish/dulux/in/en/products/dulux-weathershield-alkali-bloc-primer/packshot.png",
    description: "Premium exterior primer preventing alkali attacks and efflorescence.",
    features: ["Alkali Resistance", "Efflorescence Resistance", "Excellent Adhesion"],
    sizes: [
      { size: "4L", mrp: 950, discounted: Math.round(950 * 0.95) }
    ]
  },
  {
    id: "dulux-rom-primer",
    name: "Dulux ROM Primer",
    category: "Primers",
    categoryId: "primers",
    image: "https://www.dulux.in/content/dam/akzonobel-flourish/dulux/in/en/products/dulux-rom-primer/packshot.png",
    description: "Red Oxide Metal Primer for preventing rust on iron surfaces.",
    features: ["Rust Prevention", "Metal Adhesion", "Quick Drying"],
    sizes: [
      { size: "1L", mrp: 280, discounted: Math.round(280 * 0.95) },
      { size: "20L", mrp: 4800, discounted: Math.round(4800 * 0.95) }
    ]
  },

  // WOODCARE
  {
    id: "sadolin-nc-wood-thinner",
    name: "Sadolin NC Wood Thinner",
    category: "Woodcare",
    categoryId: "woodcare",
    image: "/placeholder.svg",
    description: "High quality thinner for nitrocellulose based wood finishes.",
    features: ["Smooth Flow", "Quick Evaporation", "Excellent Solvency"],
    sizes: [
      { size: "1L", mrp: 250, discounted: Math.round(250 * 0.95) }
    ]
  },
  {
    id: "sadolin-nc-sanding-sealer",
    name: "Sadolin NC Sanding Sealer",
    category: "Woodcare",
    categoryId: "woodcare",
    image: "/placeholder.svg",
    description: "Nitrocellulose based sealer for interior wood.",
    features: ["Fills Pores", "Easy Sanding", "Quick Drying"],
    sizes: [
      { size: "1L", mrp: 380, discounted: Math.round(380 * 0.95) },
      { size: "4L", mrp: 1400, discounted: Math.round(1400 * 0.95) }
    ]
  },

  // TINTERS
  {
    id: "acotone-blue-tinter-bu1",
    name: "Acotone Blue Tinter BU1",
    category: "Tinters",
    categoryId: "tinters-stainers",
    image: "/placeholder.svg",
    description: "Universal stainer for emulsion and enamel paints in Blue.",
    features: ["High Tinting Strength", "Easy Mixing", "Bright Color"],
    sizes: [
      { size: "1L", mrp: 550, discounted: Math.round(550 * 0.95) }
    ]
  },
  {
    id: "acotone-magenta-tinter-ma1",
    name: "Acotone Magenta Tinter MA1",
    category: "Tinters",
    categoryId: "tinters-stainers",
    image: "/placeholder.svg",
    description: "Universal stainer for emulsion and enamel paints in Magenta.",
    features: ["High Tinting Strength", "Easy Mixing", "Bright Color"],
    sizes: [
      { size: "1L", mrp: 550, discounted: Math.round(550 * 0.95) }
    ]
  },
  {
    id: "acotone-orange-tinter-or1",
    name: "Acotone Orange Tinter OR1",
    category: "Tinters",
    categoryId: "tinters-stainers",
    image: "/placeholder.svg",
    description: "Universal stainer for emulsion and enamel paints in Orange.",
    features: ["High Tinting Strength", "Easy Mixing", "Bright Color"],
    sizes: [
      { size: "1L", mrp: 550, discounted: Math.round(550 * 0.95) }
    ]
  },
  {
    id: "acotone-yellow-oxide-tinter-xy1",
    name: "Acotone Yellow Oxide Tinter XY1",
    category: "Tinters",
    categoryId: "tinters-stainers",
    image: "/placeholder.svg",
    description: "Universal stainer for emulsion and enamel paints in Yellow Oxide.",
    features: ["High Tinting Strength", "Easy Mixing", "Bright Color"],
    sizes: [
      { size: "1L", mrp: 450, discounted: Math.round(450 * 0.95) }
    ]
  },
  {
    id: "acotone-white-tinter-wh1",
    name: "Acotone White Tinter WH1",
    category: "Tinters",
    categoryId: "tinters-stainers",
    image: "/placeholder.svg",
    description: "Universal stainer for emulsion and enamel paints in White.",
    features: ["High Tinting Strength", "Easy Mixing", "Bright Color"],
    sizes: [
      { size: "1L", mrp: 400, discounted: Math.round(400 * 0.95) }
    ]
  }
];

module.exports = productsList;
