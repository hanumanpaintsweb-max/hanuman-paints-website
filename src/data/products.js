const rawProducts = [
  {
    id: 101,
    name: "Dulux Velvet Touch Diamond Glo",
    category: "Interior",
    subcategory: "Premium Emulsion",
    description: "High sheen finish. Enhanced Smoothness.",
    sizes: [
      { size: "1 Ltr", mrp: 1124 },
      { size: "4 Ltr", mrp: 4396 },
      { size: "10 Ltr", mrp: 10662 },
      { size: "20 Ltr", mrp: 21188 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/af/ed/63/a9/packshot_large.png",
    popular: true,
    features: ["High sheen finish", "Enhanced Smoothness", "Best in class stain and water repellence"]
  },
  {
    id: 102,
    name: "Dulux Velvet Touch Pearl Glo",
    category: "Interior",
    subcategory: "Premium Emulsion",
    description: "Mid sheen finish. Best-in-Class Smoothness.",
    sizes: [
      { size: "1 Ltr", mrp: 995 },
      { size: "4 Ltr", mrp: 3916 },
      { size: "10 Ltr", mrp: 9713 },
      { size: "20 Ltr", mrp: 19247 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/d0/3a/1c/5d/packshot_large.png",
    popular: true,
    features: ["Mid sheen finish", "Best-in-Class Smoothness", "Long lasting pearl like finish"]
  },
  {
    id: 103,
    name: "Dulux Velvet Touch Platinum Glo",
    category: "Interior",
    subcategory: "Premium Emulsion",
    description: "Rich Matt finish. High durability.",
    sizes: [
      { size: "1 Ltr", mrp: 997 },
      { size: "4 Ltr", mrp: 3963 },
      { size: "10 Ltr", mrp: 9852 },
      { size: "20 Ltr", mrp: 19533 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/f1/e6/1b/97/packshot_large.png",
    popular: true,
    features: ["Rich Matt finish", "High durability", "Best in class washability"]
  },
  {
    id: 104,
    name: "Dulux Velvet Touch Eterna Sheen",
    category: "Interior",
    subcategory: "Premium Emulsion",
    description: "Tru Colour+ with anti oxidants for long lasting richness and vibrancy of colours. PU Re Acrylic Dust Resistant technology for durable and dust free walls.",
    sizes: [
      { size: "1 Ltr", mrp: 1130 },
      { size: "4 Ltr", mrp: 4430 },
      { size: "10 Ltr", mrp: 10985 },
      { size: "20 Ltr", mrp: 21790 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/be/21/08/fa/vt_eterna_tcpackshot_large.png",
    popular: false,
    features: ["Tru Colour+ with anti oxidants for long lasting richness and vibrancy of colours", "PU Re Acrylic Dust Resistant technology for durable and dust free walls", "Ultra smooth finish"]
  },
  {
    id: 105,
    name: "Dulux Velvet Touch Eterna Matt",
    category: "Interior",
    subcategory: "Premium Emulsion",
    description: "Tru Colour+ with anti oxidants for long lasting richness and vibrancy of colours. PU Re Acrylic Dust Resistant technology for durable and dust free walls.",
    sizes: [
      { size: "1 Ltr", mrp: 1322 },
      { size: "4 Ltr", mrp: 5065 },
      { size: "10 Ltr", mrp: 12320 },
      { size: "20 Ltr", mrp: 24094 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/be/21/08/fa/vt_eterna_tcpackshot_large.png",
    popular: false,
    features: ["Tru Colour+ with anti oxidants for long lasting richness and vibrancy of colours", "PU Re Acrylic Dust Resistant technology for durable and dust free walls", "Ultra smooth finish"]
  },
  {
    id: 106,
    name: "Dulux Velvet Touch Eterna Basecoat",
    category: "Interior",
    subcategory: "Basecoat",
    description: "Specially formulated basecoat to ensure maximum performance and finish for Velvet Touch topcoats.",
    sizes: [
      { size: "1 Ltr", mrp: 340 },
      { size: "4 Ltr", mrp: 1230 },
      { size: "10 Ltr", mrp: 2940 },
      { size: "20 Ltr", mrp: 5700 }
    ],
    image: "/images/products/dulux-vt-eterna-basecoat.jpg",
    popular: false,
    features: ["Excellent Adhesion", "Improves Topcoat Finish", "High Opacity"]
  },
  {
    id: 107,
    name: "Dulux SuperClean 3in1 Mark Resistance",
    category: "Interior",
    subcategory: "Washable Emulsion",
    description: "Scuff Mark Resistance. Superior Washability.",
    sizes: [
      { size: "1 Ltr", mrp: 705 },
      { size: "4 Ltr", mrp: 2790 },
      { size: "10 Ltr", mrp: 6740 },
      { size: "20 Ltr", mrp: 13200 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/78/d7/58/54/superclean_3in1_packshot_copy.jpg",
    popular: true,
    features: ["Scuff Mark Resistance", "Superior Washability", "Rich and Soothing Sheen Finish"]
  },
  {
    id: 108,
    name: "Dulux SuperClean",
    category: "Interior",
    subcategory: "Washable Emulsion",
    description: "High Washability. Super Smooth & Sheen Finish.",
    sizes: [
      { size: "1 Ltr", mrp: 560 },
      { size: "4 Ltr", mrp: 2170 },
      { size: "10 Ltr", mrp: 5390 },
      { size: "20 Ltr", mrp: 10600 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/2a/f3/ab/f8/super_packshot_largepx01.png",
    popular: true,
    features: ["High Washability", "Super Smooth & Sheen Finish", "Anti-Viral"]
  },
  {
    id: 109,
    name: "Dulux SuperCover Ultra",
    category: "Interior",
    subcategory: "Standard Emulsion",
    description: "Silicone technology. Colourguard Technology - Long Lasting Colours.",
    sizes: [
      { size: "1 Ltr", mrp: 510 },
      { size: "4 Ltr", mrp: 1960 },
      { size: "10 Ltr", mrp: 4800 },
      { size: "20 Ltr", mrp: 9350 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/22/32/45/9c/supercover_ultra_packshot_large.png",
    popular: false,
    features: ["Silicone technology", "Colourguard Technology - Long Lasting Colours", "Anti-Bacterial"]
  },
  {
    id: 201,
    name: "Dulux Weathershield Powerflexx (12 Years)",
    category: "Exterior",
    subcategory: "Premium Emulsion",
    description: "Superior Crack Proof. Triple Defence Technology.",
    sizes: [
      { size: "1 Ltr", mrp: 892 },
      { size: "4 Ltr", mrp: 3272 },
      { size: "10 Ltr", mrp: 7765 },
      { size: "20 Ltr", mrp: 15162 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/49/0b/2b/33/160.png",
    popular: true,
    features: ["Superior Crack Proof", "Triple Defence Technology", "PU Modified Acrylic"]
  },
  {
    id: 202,
    name: "Dulux Weathershield Max",
    category: "Exterior",
    subcategory: "Premium Emulsion",
    description: "High-performance exterior paint featuring advanced dirt pick-up resistance and long-lasting color.",
    sizes: [
      { size: "1 Ltr", mrp: 832 },
      { size: "4 Ltr", mrp: 3251 },
      { size: "10 Ltr", mrp: 7699 },
      { size: "20 Ltr", mrp: 14883 }
    ],
    image: "/images/products/dulux-ws-max.jpg",
    popular: true,
    features: ["Dirt Resistance", "Algae Resistance", "Long Lasting Color"]
  },
  {
    id: 203,
    name: "Dulux Weathershield Protect",
    category: "Exterior",
    subcategory: "Standard Emulsion",
    description: "Dependable exterior protection against harsh weather conditions with excellent durability.",
    sizes: [
      { size: "1 Ltr", mrp: 513 },
      { size: "4 Ltr", mrp: 1981 },
      { size: "10 Ltr", mrp: 4786 },
      { size: "20 Ltr", mrp: 9252 }
    ],
    image: "/images/products/dulux-ws-protect.jpg",
    popular: false,
    features: ["Weather Protection", "Anti-Fungal", "Durable Finish"]
  },
  {
    id: 204,
    name: "Dulux Weathershield Protect Rainproof",
    category: "Exterior",
    subcategory: "Specialty Emulsion",
    description: "Silicone technology. High durability.",
    sizes: [
      { size: "1 Ltr", mrp: 786 },
      { size: "4 Ltr", mrp: 3080 },
      { size: "10 Ltr", mrp: 7441 },
      { size: "20 Ltr", mrp: 14396 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/c5/53/25/b3/160.png",
    popular: false,
    features: ["Silicone technology", "High durability", "Soft Sheen finish"]
  },
  {
    id: 205,
    name: "Dulux Weathershield Protect Dustproof",
    category: "Exterior",
    subcategory: "Specialty Emulsion",
    description: "6 Years Warranty. Dust shield Technology.",
    sizes: [
      { size: "1 Ltr", mrp: 556 },
      { size: "4 Ltr", mrp: 2147 },
      { size: "10 Ltr", mrp: 5199 },
      { size: "20 Ltr", mrp: 10077 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/4d/03/05/f0/dust_proof_packshot_large.png",
    popular: false,
    features: ["6 Years Warranty", "Dust shield Technology", "Advanced Algal and Fungus Guard"]
  },
  {
    id: 206,
    name: "Dulux Floor Plus Base",
    category: "Exterior",
    subcategory: "Floor Paint",
    description: "Durable and tough floor paint designed for exterior and semi-exterior concrete surfaces.",
    sizes: [
      { size: "1 Ltr", mrp: 783 },
      { size: "4 Ltr", mrp: 3057 },
      { size: "10 Ltr", mrp: 15049 }
    ],
    image: "/cat-exterior.jpg",
    popular: false,
    features: ["High Abrasion Resistance", "Washable", "Tough Finish"]
  },
  {
    id: 301,
    name: "Dulux Aquatech PU Coat (15 Years)",
    category: "Waterproofing",
    subcategory: "Roof Waterproofing",
    description: "Superior Waterproofing Performance of upto 15 years. Upto 4mm crackbridging.",
    sizes: [
      { size: "4 Ltr", mrp: 2466 },
      { size: "20 Ltr", mrp: 12332 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/0e/97/6d/82/packshot_large.png",
    popular: true,
    features: ["Superior Waterproofing Performance of upto 15 years", "Upto 4mm crackbridging", "Surface Temperature reduction of upto 12 deg C"]
  },
  {
    id: 302,
    name: "Dulux Aquatech Flexible Basecoat Advance (12 Years)",
    category: "Waterproofing",
    subcategory: "Wall Waterproofing",
    description: "Strong reinforcing polyfibre network. Reduces exterior surface temperature up to 5 degrees.",
    sizes: [
      { size: "1 Ltr", mrp: 636 },
      { size: "4 Ltr", mrp: 2272 },
      { size: "10 Ltr", mrp: 5367 },
      { size: "20 Ltr", mrp: 10388 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/26/b0/d4/49/ext_advance_packshot_large.png",
    popular: true,
    features: ["Strong reinforcing polyfibre network", "Reduces exterior surface temperature up to 5 degrees"]
  },
  {
    id: 303,
    name: "Dulux Aquatech Flexible Basecoat Neo (10 Years)",
    category: "Waterproofing",
    subcategory: "Wall Waterproofing",
    description: "Strong reinforcing polyfibre network. Crack Bridging upto 2.5 mm.",
    sizes: [
      { size: "1 Ltr", mrp: 522 },
      { size: "4 Ltr", mrp: 1859 },
      { size: "10 Ltr", mrp: 3927 },
      { size: "20 Ltr", mrp: 8428 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/c4/b5/45/1d/neo_packshot_large.png",
    popular: false,
    features: ["Strong reinforcing polyfibre network", "Crack Bridging upto 2.5 mm", "Good Alkaline Resistance"]
  },
  {
    id: 304,
    name: "Dulux Aquatech Damp Protect 2in1 (8 Years)",
    category: "Waterproofing",
    subcategory: "Interior Waterproofing",
    description: "8 years Waterproofing Performance. Crack bridging up to 1mm.",
    sizes: [
      { size: "1 Ltr", mrp: 498 },
      { size: "4 Ltr", mrp: 1799 },
      { size: "10 Ltr", mrp: 4192 },
      { size: "20 Ltr", mrp: 8155 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/d3/eb/2f/2e/packshot_large.png",
    popular: false,
    features: ["8 years Waterproofing Performance", "Crack bridging up to 1mm", "Surface Temperature reduction of upto 10 deg C (On Roof)"]
  },
  {
    id: 305,
    name: "Dulux Aquatech Roof Waterproof White (12 Years)",
    category: "Waterproofing",
    subcategory: "Roof Waterproofing",
    description: "Crack bridging up to 2mm. Suitable for waterproofing of sunken areas.",
    sizes: [
      { size: "1 Ltr", mrp: 537 },
      { size: "4 Ltr", mrp: 2076 },
      { size: "10 Ltr", mrp: 5040 },
      { size: "20 Ltr", mrp: 9913 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/48/96/b2/1b/roof_packshot_large.png",
    popular: true,
    features: ["Crack bridging up to 2mm", "Suitable for waterproofing of sunken areas", "Upto 10 deg C Temperature Reduction with Sun Reflect"]
  },
  {
    id: 306,
    name: "Dulux Aquatech Damp Protect Basecoat (5 Years)",
    category: "Waterproofing",
    subcategory: "Basecoat",
    description: "Crack bridging up to 1mm. Good adhesion.",
    sizes: [
      { size: "1 Ltr", mrp: 381 },
      { size: "4 Ltr", mrp: 1369 },
      { size: "10 Ltr", mrp: 3185 },
      { size: "20 Ltr", mrp: 6192 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/b8/2a/61/53/damp_protect_packshot_large.png",
    popular: false,
    features: ["Crack bridging up to 1mm", "Good adhesion", "Strong reinforcing polyfibre network"]
  },
  {
    id: 401,
    name: "Dulux Promise Sheen Interior",
    category: "Mid-Tier",
    subcategory: "Interior Emulsion",
    description: "Rich and Soothing Sheen Finish. Advance Anti Chalking Formula.",
    sizes: [
      { size: "1 Ltr", mrp: 355 },
      { size: "4 Ltr", mrp: 1360 },
      { size: "10 Ltr", mrp: 3270 },
      { size: "20 Ltr", mrp: 6310 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/f7/d3/28/53/dulux_promise_sheen_int_packshot_large.png",
    popular: true,
    features: ["Rich and Soothing Sheen Finish", "Advance Anti Chalking Formula", "ChromaBrite Technology"]
  },
  {
    id: 402,
    name: "Dulux Promise Sheen Exterior",
    category: "Mid-Tier",
    subcategory: "Exterior Emulsion",
    description: "Best-in-Class Sheen. Advance Anti peel formula.",
    sizes: [
      { size: "1 Ltr", mrp: 360 },
      { size: "4 Ltr", mrp: 1380 },
      { size: "10 Ltr", mrp: 3285 },
      { size: "20 Ltr", mrp: 6310 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/d9/a1/47/b4/dulux_promise_sheen_ext_packshot_large.png",
    popular: true,
    features: ["Best-in-Class Sheen", "Advance Anti peel formula", "ChromaBrite Technology"]
  },
  {
    id: 403,
    name: "Dulux Promise Interior",
    category: "Mid-Tier",
    subcategory: "Interior Emulsion",
    description: "A high-quality, budget-friendly interior paint offering a clean, smooth matte finish.",
    sizes: [
      { size: "1 Ltr", mrp: 290 },
      { size: "4 Ltr", mrp: 1085 },
      { size: "10 Ltr", mrp: 2570 },
      { size: "20 Ltr", mrp: 4975 }
    ],
    image: "/images/products/dulux-promise-interior.jpg",
    popular: false,
    features: ["Matte Finish", "Chalking Resistance", "Budget Friendly"]
  },
  {
    id: 404,
    name: "Dulux Promise Exterior",
    category: "Mid-Tier",
    subcategory: "Exterior Emulsion",
    description: "Reliable and affordable exterior paint formulated to withstand regular weather variations.",
    sizes: [
      { size: "1 Ltr", mrp: 325 },
      { size: "4 Ltr", mrp: 1250 },
      { size: "10 Ltr", mrp: 3015 },
      { size: "20 Ltr", mrp: 5770 }
    ],
    image: "/images/products/dulux-promise-exterior.jpg",
    popular: false,
    features: ["Weather Resistance", "Anti-Peeling", "Affordable"]
  },
  {
    id: 405,
    name: "Dulux Promise SmartChoice Interior",
    category: "Mid-Tier",
    subcategory: "Interior Emulsion",
    description: "Good coverage & Opacity. Anti-Chalking.",
    sizes: [
      { size: "1 Ltr", mrp: 230 },
      { size: "5 Ltr", mrp: 875 },
      { size: "10 Ltr", mrp: 2070 },
      { size: "20 Ltr", mrp: 4020 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/15/50/74/af/dulux_promise_int_sc_packshot_large.png",
    popular: false,
    features: ["Good coverage & Opacity", "Anti-Chalking", "Smooth Matt Finish"]
  },
  {
    id: 406,
    name: "Dulux Promise SmartChoice Exterior",
    category: "Mid-Tier",
    subcategory: "Exterior Emulsion",
    description: "Good coverage & Opacity. Anti-Peel.",
    sizes: [
      { size: "1 Ltr", mrp: 285 },
      { size: "4 Ltr", mrp: 1095 },
      { size: "10 Ltr", mrp: 2585 },
      { size: "20 Ltr", mrp: 4745 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/ff/d5/d3/19/dulux_promise_sc_ext_packshot_large.png",
    popular: false,
    features: ["Good coverage & Opacity", "Anti-Peel", "Smooth Matt Finish"]
  },
  {
    id: 407,
    name: "Dulux Promise Freedom Interior",
    category: "Mid-Tier",
    subcategory: "Interior Distemper",
    description: "High-quality acrylic distemper for interiors, offering a smoother finish than ordinary distempers.",
    sizes: [
      { size: "5 Kg", mrp: 480 },
      { size: "10 Kg", mrp: 870 },
      { size: "20 Kg", mrp: 1580 }
    ],
    image: "/images/products/dulux-promise-freedom-interior.jpg",
    popular: false,
    features: ["Smooth Finish", "Acrylic Based", "Cost Effective"]
  },
  {
    id: 408,
    name: "Dulux Promise Freedom Exterior",
    category: "Mid-Tier",
    subcategory: "Exterior Cement Paint",
    description: "A durable cement-based paint for basic exterior finishing and protection.",
    sizes: [
      { size: "5 Kg", mrp: 675 },
      { size: "10 Kg", mrp: 1300 },
      { size: "20 Kg", mrp: 2500 }
    ],
    image: "/images/products/dulux-promise-freedom-exterior.jpg",
    popular: false,
    features: ["Cement Based", "Durable", "Basic Exterior Use"]
  },
  {
    id: 501,
    name: "Sadolin Luxurio PU Clear Gloss",
    category: "Woodcare",
    subcategory: "PU Finish",
    description: "Premium polyurethane clear gloss finish protecting and enhancing the natural beauty of wood.",
    sizes: [
      { size: "1 Ltr", mrp: 2200 },
      { size: "4 Ltr", mrp: 8545 }
    ],
    image: "/images/products/sadolin-luxurio-clear.jpg",
    popular: false,
    features: ["High Gloss", "Tough Protection", "Enhances Wood Grain"]
  },
  {
    id: 502,
    name: "Sadolin Luxurio PU Clear Matt",
    category: "Woodcare",
    subcategory: "PU Finish",
    description: "Premium polyurethane clear matte finish for a sophisticated, non-reflective wooden surface.",
    sizes: [
      { size: "1 Ltr", mrp: 1545 },
      { size: "4 Ltr", mrp: 5995 }
    ],
    image: "/images/products/sadolin-luxurio-clear.jpg",
    popular: false,
    features: ["Matte Finish", "Scratch Resistant", "Premium Look"]
  },
  {
    id: 503,
    name: "Sadolin Luxurio PU Clear Sealer",
    category: "Woodcare",
    subcategory: "Wood Sealer",
    description: "High-performance PU sealer that prepares wood surfaces for a flawless topcoat application.",
    sizes: [
      { size: "1 Ltr", mrp: 1395 },
      { size: "4 Ltr", mrp: 5475 }
    ],
    image: "/images/products/sadolin-luxurio-clear.jpg",
    popular: false,
    features: ["Seals Pores", "Improves Topcoat Adhesion", "Fast Drying"]
  },
  {
    id: 504,
    name: "Sadolin 2KPU Exterior Clear Gloss",
    category: "Woodcare",
    subcategory: "Exterior PU",
    description: "Excellent scratch & stain resistance. Wood crack protection.",
    sizes: [
      { size: "1 Ltr", mrp: 1325 },
      { size: "4 Ltr", mrp: 5230 },
      { size: "20 Ltr", mrp: 25420 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/b5/21/fb/2d/packshot_large.png",
    popular: false,
    features: ["Excellent scratch & stain resistance", "Wood crack protection", "All Weather Durable & UV resistant"]
  },
  {
    id: 505,
    name: "Sadolin 2KPU Interior Clear Gloss",
    category: "Woodcare",
    subcategory: "Interior PU",
    description: "Excellent scratch & stain resistance. Excellent Wood crack protection.",
    sizes: [
      { size: "1 Ltr", mrp: 1195 },
      { size: "4 Ltr", mrp: 4700 },
      { size: "20 Ltr", mrp: 22950 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/62/ca/f9/e5/packshot_large.png",
    popular: false,
    features: ["Excellent scratch & stain resistance", "Excellent Wood crack protection", "Excellent Water Resistance"]
  },
  {
    id: 506,
    name: "Sadolin PU Prime Clear Gloss",
    category: "Woodcare",
    subcategory: "Primer",
    description: "High-quality PU primer that provides an excellent foundation for glossy wood finishes.",
    sizes: [
      { size: "1 Ltr", mrp: 675 },
      { size: "4 Ltr", mrp: 2635 },
      { size: "20 Ltr", mrp: 12760 }
    ],
    image: "/images/products/sadolin-pu-prime-clear.jpg",
    popular: false,
    features: ["Excellent Foundation", "Good Sandability", "Fast Curing"]
  },
  {
    id: 507,
    name: "Sadolin Melamine Gloss",
    category: "Woodcare",
    subcategory: "Melamine Finish",
    description: "Excellent scratch & stain resistance. Non-yellowing.",
    sizes: [
      { size: "1 Ltr", mrp: 550 },
      { size: "4 Ltr", mrp: 2085 },
      { size: "20 Ltr", mrp: 9740 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/6f/91/e1/10/packshot_large.png",
    popular: false,
    features: ["Excellent scratch & stain resistance", "Non-yellowing", "Long lasting beauty"]
  },
  {
    id: 508,
    name: "Sadolin Wood Stain Teak",
    category: "Woodcare",
    subcategory: "Wood Stain",
    description: "Deep-penetrating wood stain that imparts a rich, classic Teak color to interior and exterior wood.",
    sizes: [
      { size: "100 ml", mrp: 75 },
      { size: "500 ml", mrp: 355 },
      { size: "1 Ltr", mrp: 630 }
    ],
    image: "/images/products/sadolin-wood-stain-teak.jpg",
    popular: true,
    features: ["Rich Teak Color", "Deep Penetration", "Enhances Grain"]
  },
  {
    id: 509,
    name: "Sadolin Wood Stain Walnut",
    category: "Woodcare",
    subcategory: "Wood Stain",
    description: "Deep-penetrating wood stain that provides a luxurious, dark Walnut hue to any wooden surface.",
    sizes: [
      { size: "100 ml", mrp: 75 },
      { size: "500 ml", mrp: 355 },
      { size: "1 Ltr", mrp: 630 }
    ],
    image: "/images/products/sadolin-wood-stain-walnut.jpg",
    popular: false,
    features: ["Dark Walnut Color", "Deep Penetration", "Even Application"]
  },
  {
    id: 601,
    name: "Dulux Super PU Satin Brilliant White",
    category: "Enamels",
    subcategory: "PU Enamel",
    description: "Premium PU-based enamel delivering a smooth, washable, and tough satin finish for wood and metal.",
    sizes: [
      { size: "1 Ltr", mrp: 525 },
      { size: "4 Ltr", mrp: 2005 },
      { size: "10 Ltr", mrp: 4935 },
      { size: "20 Ltr", mrp: 9730 }
    ],
    image: "/images/products/dulux-super-pu-satin-white.jpg",
    popular: false,
    features: ["Satin Finish", "PU Enhanced Toughness", "Washable"]
  },
  {
    id: 602,
    name: "Dulux Stay Bright PU Satin White",
    category: "Enamels",
    subcategory: "PU Enamel",
    description: "Advanced formulation that prevents yellowing and keeps the white satin finish bright for years.",
    sizes: [
      { size: "1 Ltr", mrp: 580 },
      { size: "4 Ltr", mrp: 2215 },
      { size: "10 Ltr", mrp: 5440 },
      { size: "20 Ltr", mrp: 10475 }
    ],
    image: "/images/products/dulux-stay-bright-pu-satin.jpg",
    popular: false,
    features: ["Non-Yellowing", "Bright White", "Satin Elegance"]
  },
  {
    id: 603,
    name: "Dulux Super Gloss 5in1 White",
    category: "Enamels",
    subcategory: "High Gloss Enamel",
    description: "High-gloss enamel providing 5 distinct benefits including superior coverage, shine, and anti-rust properties.",
    sizes: [
      { size: "500 ml", mrp: 290 },
      { size: "1 Ltr", mrp: 545 },
      { size: "4 Ltr", mrp: 2130 }
    ],
    image: "/images/products/dulux-super-gloss-5in1-white.jpg",
    popular: true,
    features: ["High Gloss", "5-in-1 Benefits", "Anti-Rust", "Fungus Resistant"]
  },
  {
    id: 604,
    name: "Dulux Gloss Premium Brilliant White",
    category: "Enamels",
    subcategory: "Gloss Enamel",
    description: "Classic premium enamel offering a durable, mirror-like brilliant white finish for wood and metal.",
    sizes: [
      { size: "500 ml", mrp: 270 },
      { size: "1 Ltr", mrp: 510 },
      { size: "4 Ltr", mrp: 1935 },
      { size: "10 Ltr", mrp: 4620 },
      { size: "20 Ltr", mrp: 9020 }
    ],
    image: "/images/products/dulux-gloss-premium-white.jpg",
    popular: false,
    features: ["Brilliant White", "Mirror-like Gloss", "Durable"]
  },
  {
    id: 605,
    name: "Dulux Promise Enamel White",
    category: "Enamels",
    subcategory: "Standard Enamel",
    description: "Economical enamel paint that delivers reliable protection and a decent glossy finish.",
    sizes: [
      { size: "500 ml", mrp: 180 },
      { size: "1 Ltr", mrp: 330 },
      { size: "4 Ltr", mrp: 1270 },
      { size: "10 Ltr", mrp: 3020 },
      { size: "20 Ltr", mrp: 5890 }
    ],
    image: "/images/products/dulux-promise-enamel.jpg",
    popular: false,
    features: ["Economical", "Good Coverage", "Glossy Finish"]
  },
  {
    id: 606,
    name: "Dulux PU Enamel 12-in-1 White",
    category: "Enamels",
    subcategory: "Specialty Enamel",
    description: "The ultimate PU enamel offering 12 specialized benefits for comprehensive wood and metal protection.",
    sizes: [
      { size: "500 ml", mrp: 275 },
      { size: "1 Ltr", mrp: 535 },
      { size: "4 Ltr", mrp: 2075 }
    ],
    image: "/images/products/dulux-pu-enamel-12in1-white.jpg",
    popular: false,
    features: ["12-in-1 Benefits", "Ultimate Protection", "PU Fortified"]
  },
  {
    id: 607,
    name: "Dulux Lustre Finish White",
    category: "Enamels",
    subcategory: "Lustre Enamel",
    description: "Unique enamel formulation that provides a beautiful, subtle pearlescent lustre finish to walls and trims.",
    sizes: [
      { size: "1 Ltr", mrp: 415 },
      { size: "4 Ltr", mrp: 1620 },
      { size: "10 Ltr", mrp: 3965 },
      { size: "20 Ltr", mrp: 7765 }
    ],
    image: "/images/products/dulux-lustre-finish.jpg",
    popular: false,
    features: ["Subtle Lustre", "Washable", "Unique Texture"]
  },
  {
    id: 701,
    name: "Dulux Velvet Touch Eterna Base Coat",
    category: "Primers",
    subcategory: "Interior Primer",
    description: "Premium basecoat designed to enhance the opulence and durability of Velvet Touch topcoats.",
    sizes: [
      { size: "1 Ltr", mrp: 340 },
      { size: "4 Ltr", mrp: 1230 },
      { size: "10 Ltr", mrp: 2940 },
      { size: "20 Ltr", mrp: 5700 }
    ],
    image: "/images/products/dulux-vt-eterna-basecoat.jpg",
    popular: true,
    features: ["Enhances Topcoat", "Premium Finish", "High Opacity"]
  },
  {
    id: 702,
    name: "Dulux Water Based Cement Primer Interior",
    category: "Primers",
    subcategory: "Interior Primer",
    description: "Superior Adhesion. Alkali Resistance.",
    sizes: [
      { size: "1 Ltr", mrp: 265 },
      { size: "4 Ltr", mrp: 975 },
      { size: "10 Ltr", mrp: 2305 },
      { size: "20 Ltr", mrp: 4385 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/aa/55/97/de/packshot_large.png",
    popular: false,
    features: ["Superior Adhesion", "Alkali Resistance", "Superior Whiteness"]
  },
  {
    id: 703,
    name: "Dulux Promise Interior Primer",
    category: "Primers",
    subcategory: "Interior Primer",
    description: "Superior Adhesion. Superior Whiteness.",
    sizes: [
      { size: "1 Ltr", mrp: 190 },
      { size: "4 Ltr", mrp: 690 },
      { size: "10 Ltr", mrp: 1600 },
      { size: "20 Ltr", mrp: 3040 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/8e/5f/70/64/packshot_large.png",
    popular: false,
    features: ["Superior Adhesion", "Superior Whiteness", "Anti-Chalking"]
  },
  {
    id: 704,
    name: "Dulux WS Alkali Bloc Primer",
    category: "Primers",
    subcategory: "Exterior Primer",
    description: "PU Reinforced Technology. Advanced Alkali Protection.",
    sizes: [
      { size: "1 Ltr", mrp: 315 },
      { size: "4 Ltr", mrp: 1245 },
      { size: "10 Ltr", mrp: 3050 },
      { size: "20 Ltr", mrp: 5910 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/af/49/64/76/pu_plus_packshot_large.png",
    popular: false,
    features: ["PU Reinforced Technology", "Advanced Alkali Protection", "Superior Adhesion"]
  },
  {
    id: 705,
    name: "Dulux Promise Exterior Primer",
    category: "Primers",
    subcategory: "Exterior Primer",
    description: "Better Coverage. Anti-Chalking.",
    sizes: [
      { size: "1 Ltr", mrp: 250 },
      { size: "4 Ltr", mrp: 890 },
      { size: "10 Ltr", mrp: 2310 },
      { size: "20 Ltr", mrp: 4110 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/fa/fd/66/f1/packshot_large.png",
    popular: false,
    features: ["Better Coverage", "Anti-Chalking", "Fast Drying"]
  },
  {
    id: 706,
    name: "Dulux SmartChoice Exterior Primer",
    category: "Primers",
    subcategory: "Exterior Primer",
    description: "Superior Whiteness. Anti-Chalking.",
    sizes: [
      { size: "1 Ltr", mrp: 195 },
      { size: "4 Ltr", mrp: 745 },
      { size: "10 Ltr", mrp: 1685 },
      { size: "20 Ltr", mrp: 3035 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/e0/9e/74/03/promise_sc_ext_primer_2025_copy_packshot_large.png",
    popular: false,
    features: ["Superior Whiteness", "Anti-Chalking"]
  },
  {
    id: 707,
    name: "Dulux Red Oxide Metal Primer",
    category: "Primers",
    subcategory: "Metal Primer",
    description: "Stronger Adhesion. Effective Corrosion Protection.",
    sizes: [
      { size: "500 ml", mrp: 165 },
      { size: "1 Ltr", mrp: 320 },
      { size: "4 Ltr", mrp: 1210 },
      { size: "10 Ltr", mrp: 2890 },
      { size: "20 Ltr", mrp: 5610 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/16/4a/45/e4/packshot_large.png",
    popular: false,
    features: ["Stronger Adhesion", "Effective Corrosion Protection"]
  },
  {
    id: 708,
    name: "Dulux Wood Primer White",
    category: "Primers",
    subcategory: "Wood Primer",
    description: "High-quality solvent-based primer that seals wood pores and prepares surfaces for enamel.",
    sizes: [
      { size: "500 ml", mrp: 185 },
      { size: "1 Ltr", mrp: 350 },
      { size: "4 Ltr", mrp: 1335 },
      { size: "10 Ltr", mrp: 3290 },
      { size: "20 Ltr", mrp: 6320 }
    ],
    image: "/images/products/dulux-wood-primer.jpg",
    popular: false,
    features: ["Seals Pores", "Improves Finish", "Solvent Based"]
  },
  {
    id: 801,
    name: "Dulux Duwel Magik White Distemper",
    category: "Distempers & Putty",
    subcategory: "Distemper",
    description: "Economical acrylic distemper providing a bright, chalk-free white finish for interior walls.",
    sizes: [
      { size: "1 Kg", mrp: 140 },
      { size: "2 Kg", mrp: 265 },
      { size: "5 Kg", mrp: 635 },
      { size: "10 Kg", mrp: 1165 },
      { size: "20 Kg", mrp: 2210 }
    ],
    image: "/images/products/dulux-duwel-magik-distemper.jpg",
    popular: false,
    features: ["Bright White", "Chalk-free", "Economical"]
  },
  {
    id: 802,
    name: "Dulux Acrylic Putty",
    category: "Distempers & Putty",
    subcategory: "Putty",
    description: "Premium ready-to-use acrylic putty that fills uneven surfaces, creating a buttery smooth base.",
    sizes: [
      { size: "1 Kg", mrp: 120 },
      { size: "5 Kg", mrp: 540 },
      { size: "20 Kg", mrp: 1880 }
    ],
    image: "/images/products/dulux-acrylic-putty.jpg",
    popular: false,
    features: ["Buttery Smooth", "Ready to Use", "Excellent Adhesion"]
  },
  {
    id: 803,
    name: "Dulux Waterproof Putty",
    category: "Distempers & Putty",
    subcategory: "Putty",
    description: "Advanced cement-based putty with superior water resistance, perfect for damp-prone areas.",
    sizes: [
      { size: "20 Kg", mrp: 1920 },
      { size: "40 Kg", mrp: 3680 }
    ],
    image: "/images/products/dulux-waterproof-putty.jpg",
    popular: false,
    features: ["Water Resistant", "Cement Based", "High Durability"]
  },
  {
    id: 110,
    name: "Dulux VAF Trends Non-Metallic",
    category: "Interior",
    subcategory: "Special Effects",
    description: "Premium interior texture finish for beautiful non-metallic wall patterns.",
    sizes: [
      { size: "1 Ltr", mrp: 1290 }
    ],
    image: "/images/products/dulux-vaf-trends-non-metallic.jpg",
    popular: false,
    features: ["Non-Metallic", "Textured", "Durable"]
  },
  {
    id: 111,
    name: "Dulux VAF Trends Glitter Silver",
    category: "Interior",
    subcategory: "Special Effects",
    description: "Adds a stunning silver glitter effect to your interior walls.",
    sizes: [
      { size: "1 Ltr", mrp: 1970 }
    ],
    image: "/images/products/dulux-vaf-trends-glitter-silver.jpg",
    popular: false,
    features: ["Silver Glitter", "Luxurious", "Easy Apply"]
  },
  {
    id: 112,
    name: "Dulux VAF Trends Glitter Gold",
    category: "Interior",
    subcategory: "Special Effects",
    description: "Adds a stunning gold glitter effect to your interior walls.",
    sizes: [
      { size: "1 Ltr", mrp: 1970 }
    ],
    image: "/images/products/dulux-vaf-trends-glitter-gold.jpg",
    popular: false,
    features: ["Gold Glitter", "Luxurious", "Easy Apply"]
  },
  {
    id: 113,
    name: "Dulux VAF Metallic Silver",
    category: "Interior",
    subcategory: "Special Effects",
    description: "Lustrous metallic silver finish for accent walls and details.",
    sizes: [
      { size: "1 Ltr", mrp: 1650 }
    ],
    image: "/images/products/dulux-vaf-metallic-silver.jpg",
    popular: false,
    features: ["Metallic Silver", "Rich Lustre", "Accent"]
  },
  {
    id: 114,
    name: "Dulux VAF Metallic Gold",
    category: "Interior",
    subcategory: "Special Effects",
    description: "Lustrous metallic gold finish for accent walls and details.",
    sizes: [
      { size: "1 Ltr", mrp: 1750 }
    ],
    image: "/images/products/dulux-vaf-metallic-gold.jpg",
    popular: false,
    features: ["Metallic Gold", "Rich Lustre", "Accent"]
  },
  {
    id: 115,
    name: "Dulux VT Luxury Finishes Marble",
    category: "Interior",
    subcategory: "Luxury Finishes",
    description: "Ultra-premium finish that replicates the luxurious look of real marble.",
    sizes: [
      { size: "1 Kg", mrp: 1100 },
      { size: "5 Kg", mrp: 5500 }
    ],
    image: "/images/products/dulux-vt-luxury-marble.jpg",
    popular: false,
    features: ["Marble Effect", "Premium", "Washable"]
  },
  {
    id: 116,
    name: "Dulux VT Luxury Finishes Concrete",
    category: "Interior",
    subcategory: "Luxury Finishes",
    description: "Modern luxury finish mimicking the raw, industrial appeal of concrete.",
    sizes: [
      { size: "5 Kg", mrp: 3355 },
      { size: "10 Kg", mrp: 6560 },
      { size: "15 Kg", mrp: 9615 },
      { size: "25 Kg", mrp: 15650 }
    ],
    image: "/images/products/dulux-vt-luxury-concrete.jpg",
    popular: false,
    features: ["Concrete Effect", "Industrial", "Durable"]
  },
  {
    id: 117,
    name: "Dulux VT Luxury Finishes Velvetino Gold Base",
    category: "Interior",
    subcategory: "Luxury Finishes",
    description: "A sophisticated gold base for crafting luxurious velvetino wall effects.",
    sizes: [
      { size: "1 Ltr", mrp: 2226 }
    ],
    image: "/images/products/dulux-vt-luxury-velvetino-gold.jpg",
    popular: false,
    features: ["Gold Base", "Velvetino Effect", "Premium"]
  },
  {
    id: 118,
    name: "Dulux VT Luxury Finishes Velvetino Silver Base",
    category: "Interior",
    subcategory: "Luxury Finishes",
    description: "A sophisticated silver base for crafting luxurious velvetino wall effects.",
    sizes: [
      { size: "1 Ltr", mrp: 2226 }
    ],
    image: "/images/products/dulux-vt-luxury-velvetino-silver.jpg",
    popular: false,
    features: ["Silver Base", "Velvetino Effect", "Premium"]
  },
  {
    id: 119,
    name: "Dulux VT Luxury Finishes Protective Clear Coat Matt",
    category: "Interior",
    subcategory: "Luxury Finishes",
    description: "Clear matte protective coat designed to seal and protect luxury interior finishes.",
    sizes: [
      { size: "1 Ltr", mrp: 1526 }
    ],
    image: "/images/products/dulux-vt-luxury-clear-coat.jpg",
    popular: false,
    features: ["Clear Matt", "Protective", "Durable"]
  },
  {
    id: 207,
    name: "Dulux WS Tile Clear",
    category: "Exterior",
    subcategory: "Tile Coat",
    description: "Clear protective coating that preserves the natural beauty of exterior tiles.",
    sizes: [
      { size: "1 Ltr", mrp: 524 },
      { size: "4 Ltr", mrp: 2030 },
      { size: "10 Ltr", mrp: 10068 }
    ],
    image: "/images/products/dulux-ws-tile-clear.jpg",
    popular: false,
    features: ["Clear Finish", "Protects Tiles", "Water Resistant"]
  },
  {
    id: 208,
    name: "Dulux WS Tile Group II",
    category: "Exterior",
    subcategory: "Tile Coat",
    description: "Colored protective tile coating available in rich terracotta and spice shades.",
    sizes: [
      { size: "0.9 Ltr", mrp: 515 },
      { size: "3.6 Ltr", mrp: 2014 },
      { size: "9 Ltr", mrp: 4977 },
      { size: "18 Ltr", mrp: 9742 }
    ],
    image: "/images/products/dulux-ws-tile.jpg",
    popular: false,
    features: ["Colored Coat", "Weather Protection", "Durable"]
  },
  {
    id: 209,
    name: "Dulux WS Tile Group III",
    category: "Exterior",
    subcategory: "Tile Coat",
    description: "Vibrant protective tile coating available in Flame Red, Sunrise, and Magenta.",
    sizes: [
      { size: "0.9 Ltr", mrp: 554 },
      { size: "3.6 Ltr", mrp: 2182 },
      { size: "9 Ltr", mrp: 5399 },
      { size: "18 Ltr", mrp: 10590 }
    ],
    image: "/images/products/dulux-ws-tile.jpg",
    popular: false,
    features: ["Vibrant Coat", "Weather Protection", "Durable"]
  },
  {
    id: 210,
    name: "Dulux WS Protect Dustproof Hi-sheen",
    category: "Exterior",
    subcategory: "Premium Emulsion",
    description: "Advanced dust-repellent exterior emulsion providing a brilliant high-sheen finish.",
    sizes: [
      { size: "1 Ltr", mrp: 590 },
      { size: "4 Ltr", mrp: 2239 },
      { size: "10 Ltr", mrp: 5373 },
      { size: "20 Ltr", mrp: 10220 }
    ],
    image: "/images/products/dulux-ws-protect-dustproof-hisheen.jpg",
    popular: false,
    features: ["Dustproof", "High Sheen", "Weather Resistant"]
  },
  {
    id: 211,
    name: "Dulux WS Metallics Gold",
    category: "Exterior",
    subcategory: "Exterior Metallics",
    description: "Premium exterior metallic gold finish for striking architectural highlights.",
    sizes: [
      { size: "200 ml", mrp: 384 },
      { size: "500 ml", mrp: 913 },
      { size: "1 Ltr", mrp: 1728 }
    ],
    image: "/images/products/dulux-ws-metallics-gold.jpg",
    popular: false,
    features: ["Metallic Gold", "Exterior Grade", "UV Resistant"]
  },
  {
    id: 212,
    name: "Dulux WS Metallics Silver",
    category: "Exterior",
    subcategory: "Exterior Metallics",
    description: "Premium exterior metallic silver finish for striking architectural highlights.",
    sizes: [
      { size: "200 ml", mrp: 344 },
      { size: "500 ml", mrp: 823 },
      { size: "1 Ltr", mrp: 1560 }
    ],
    image: "/images/products/dulux-ws-metallics-silver.jpg",
    popular: false,
    features: ["Metallic Silver", "Exterior Grade", "UV Resistant"]
  },
  {
    id: 213,
    name: "Dulux WS Texture Rustic",
    category: "Exterior",
    subcategory: "Exterior Texture",
    description: "Heavy-duty exterior texture offering a classic, rugged rustic appearance.",
    sizes: [
      { size: "25 Kg", mrp: 1900 }
    ],
    image: "/images/products/dulux-ws-texture.jpg",
    popular: false,
    features: ["Rustic Texture", "Hides Imperfections", "Weatherproof"]
  },
  {
    id: 214,
    name: "Dulux WS Texture Ultrafine",
    category: "Exterior",
    subcategory: "Exterior Texture",
    description: "Premium exterior texture delivering an elegant, subtly granular ultrafine finish.",
    sizes: [
      { size: "25 Kg", mrp: 2450 }
    ],
    image: "/images/products/dulux-ws-texture.jpg",
    popular: false,
    features: ["Ultrafine Texture", "Elegant Finish", "Weatherproof"]
  },
  {
    id: 215,
    name: "Dulux WS Texture Superfine",
    category: "Exterior",
    subcategory: "Exterior Texture",
    description: "Premium exterior texture delivering a sleek and consistent superfine finish.",
    sizes: [
      { size: "25 Kg", mrp: 2450 }
    ],
    image: "/images/products/dulux-ws-texture.jpg",
    popular: false,
    features: ["Superfine Texture", "Consistent", "Weatherproof"]
  },
  {
    id: 216,
    name: "Dulux WS Texture Dholpur",
    category: "Exterior",
    subcategory: "Exterior Texture",
    description: "Specialty exterior texture inspired by traditional Indian Dholpur stone.",
    sizes: [
      { size: "25 Kg", mrp: 2750 }
    ],
    image: "/images/products/dulux-ws-texture.jpg",
    popular: false,
    features: ["Dholpur Stone", "Highly Durable", "Weatherproof"]
  },
  {
    id: 217,
    name: "Dulux WS Floor Plus Ready Made",
    category: "Exterior",
    subcategory: "Floor Paint",
    description: "Ready-to-use highly durable floor paint designed for driveways and patios.",
    sizes: [
      { size: "1 Ltr", mrp: 748 },
      { size: "4 Ltr", mrp: 2929 }
    ],
    image: "/images/products/dulux-ws-floor-plus.jpg",
    popular: false,
    features: ["Ready Made", "Floor Protection", "Abrasion Resistant"]
  },
  {
    id: 307,
    name: "Dulux Aquatech Roof Waterproof Terracotta (12 Years)",
    category: "Waterproofing",
    subcategory: "Roof Waterproofing",
    description: "High-performance roof waterproofing in a classic terracotta shade.",
    sizes: [
      { size: "1 Ltr", mrp: 576 },
      { size: "4 Ltr", mrp: 2178 },
      { size: "10 Ltr", mrp: 10476 }
    ],
    image: "/images/products/dulux-aquatech-roof-waterproof-terracotta.jpg",
    popular: false,
    features: ["12 Years Warranty", "Terracotta", "Heat Reduction"]
  },
  {
    id: 308,
    name: "Dulux Aquatech Roof Waterproof Grey (12 Years)",
    category: "Waterproofing",
    subcategory: "Roof Waterproofing",
    description: "High-performance roof waterproofing in a neutral grey shade.",
    sizes: [
      { size: "1 Ltr", mrp: 558 },
      { size: "4 Ltr", mrp: 2104 },
      { size: "10 Ltr", mrp: 10156 }
    ],
    image: "/images/products/dulux-aquatech-roof-waterproof-grey.jpg",
    popular: false,
    features: ["12 Years Warranty", "Grey", "Heat Reduction"]
  },
  {
    id: 309,
    name: "Dulux Aquatech Interior Waterproof Basecoat (2 Years)",
    category: "Waterproofing",
    subcategory: "Interior Waterproofing",
    description: "10X Better Waterproofing than Primer. 2X Higher Stretchability than Primer.",
    sizes: [
      { size: "1 Ltr", mrp: 402 },
      { size: "4 Ltr", mrp: 1463 },
      { size: "10 Ltr", mrp: 3483 },
      { size: "20 Ltr", mrp: 6703 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/f8/a8/af/19/packshot_large.png",
    popular: false,
    features: ["10X Better Waterproofing than Primer", "2X Higher Stretchability than Primer", "Improves Topcoat Finish & Performance"]
  },
  {
    id: 310,
    name: "Dulux Aquatech Interior Waterproof Basecoat (3 Years)",
    category: "Waterproofing",
    subcategory: "Interior Waterproofing",
    description: "Crackproof technology. Ease of application.",
    sizes: [
      { size: "1 Ltr", mrp: 358 },
      { size: "4 Ltr", mrp: 1305 },
      { size: "10 Ltr", mrp: 3108 },
      { size: "20 Ltr", mrp: 5987 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/23/dd/ac/7c/int_advance_packshot_large.png",
    popular: false,
    features: ["Crackproof technology", "Ease of application"]
  },
  {
    id: 311,
    name: "Dulux Aquatech Damp Cure (5 Years)",
    category: "Waterproofing",
    subcategory: "Damp Treatment",
    description: "Intensive treatment for severe interior dampness.",
    sizes: [
      { size: "1 Ltr", mrp: 731 },
      { size: "4 Ltr", mrp: 2882 }
    ],
    image: "/images/products/dulux-aquatech-damp-cure.jpg",
    popular: false,
    features: ["5 Years Warranty", "Severe Damp", "High Penetration"]
  },
  {
    id: 312,
    name: "Dulux Aquatech Pre Treatment Coat",
    category: "Waterproofing",
    subcategory: "Pre-Treatment",
    description: "Surface Prep Wash. FungiClean Technology.",
    sizes: [
      { size: "1 Ltr", mrp: 408 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/cb/f4/58/19/packshot_large.png",
    popular: false,
    features: ["Surface Prep Wash", "FungiClean Technology", "Anti algal & anti fungal"]
  },
  {
    id: 313,
    name: "Dulux Aquatech Superplast+",
    category: "Waterproofing",
    subcategory: "Admixtures",
    description: "Advanced cement-mixing compound that reduces water permeability in concrete.",
    sizes: [
      { size: "0.2 Kg", mrp: 50 },
      { size: "0.5 Kg", mrp: 186 },
      { size: "1 Kg", mrp: 846 },
      { size: "5 Kg", mrp: 2620 }
    ],
    image: "/images/products/dulux-aquatech-superplast.jpg",
    popular: false,
    features: ["Cement Additive", "Reduces Permeability", "Increases Strength"]
  },
  {
    id: 314,
    name: "Dulux Aquatech Repair Pro Latex",
    category: "Waterproofing",
    subcategory: "Repair",
    description: "High water resistance.",
    sizes: [
      { size: "0.2 Kg", mrp: 207 },
      { size: "0.5 Kg", mrp: 393 },
      { size: "1 Kg", mrp: 1854 },
      { size: "5 Kg", mrp: 6149 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/9d/24/f2/64/rpl_packshot_large.png",
    popular: false,
    features: ["High water resistance"]
  },
  {
    id: 315,
    name: "Dulux Aquatech Waterproof Repair Polymer",
    category: "Waterproofing",
    subcategory: "Repair",
    description: "High adhesive strength. High water resistance.",
    sizes: [
      { size: "0.5 Kg", mrp: 240 },
      { size: "1 Kg", mrp: 460 },
      { size: "5 Kg", mrp: 2130 },
      { size: "20 Kg", mrp: 7060 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/61/84/38/97/packshot_large.png",
    popular: false,
    features: ["High adhesive strength", "High water resistance", "Improves hardness & abrasion resistance"]
  },
  {
    id: 316,
    name: "Dulux Aquatech Waterblock 2K (5 Years)",
    category: "Waterproofing",
    subcategory: "2K System",
    description: "2K Cementitious Waterproofing coating. Excellent anti-alkali property.",
    sizes: [
      { size: "3 Kg", mrp: 870 },
      { size: "15 Kg", mrp: 2876 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/bd/c1/76/5e/packshot_large.png",
    popular: false,
    features: ["2K Cementitious Waterproofing coating", "Excellent anti-alkali property", "Suitable for waterproofing of sunken areas"]
  },
  {
    id: 317,
    name: "Dulux Aquatech Crackfiller 20MM",
    category: "Waterproofing",
    subcategory: "Crack Fillers",
    description: "Fills cracks of upto 20mm. Shrinkfree- fills in just one application.",
    sizes: [
      { size: "0.4 Kg", mrp: 711 },
      { size: "5 Kg", mrp: 3113 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/ed/22/c8/ae/packshot_large.png",
    popular: false,
    features: ["Fills cracks of upto 20mm", "Shrinkfree- fills in just one application", "Quick dry & tough- Accepts nails and screws in 4-6 hrs"]
  },
  {
    id: 318,
    name: "Dulux Aquatech Crackfiller 10MM",
    category: "Waterproofing",
    subcategory: "Crack Fillers",
    description: "Fills cracks of upto 20mm. Shrinkfree- fills in just one application.",
    sizes: [
      { size: "0.5 Kg", mrp: 311 },
      { size: "1 Kg", mrp: 581 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/ed/22/c8/ae/packshot_large.png",
    popular: false,
    features: ["Fills cracks of upto 20mm", "Shrinkfree- fills in just one application", "Quick dry & tough- Accepts nails and screws in 4-6 hrs"]
  },
  {
    id: 319,
    name: "Dulux Aquatech Crackfiller 5MM",
    category: "Waterproofing",
    subcategory: "Crack Fillers",
    description: "Fills cracks of upto 20mm. Shrinkfree- fills in just one application.",
    sizes: [
      { size: "0.5 Kg", mrp: 275 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/ed/22/c8/ae/packshot_large.png",
    popular: false,
    features: ["Fills cracks of upto 20mm", "Shrinkfree- fills in just one application", "Quick dry & tough- Accepts nails and screws in 4-6 hrs"]
  },
  {
    id: 320,
    name: "Dulux Aquatech Crackfiller Paste 5MM",
    category: "Waterproofing",
    subcategory: "Crack Fillers",
    description: "Ready-to-use paste formulation for quickly filling hairline cracks up to 5mm.",
    sizes: [
      { size: "0.3 Kg", mrp: 183 },
      { size: "1 Kg", mrp: 508 }
    ],
    image: "/images/products/dulux-aquatech-crackfiller-paste.jpg",
    popular: false,
    features: ["Ready Paste", "Fills up to 5mm", "Smooth"]
  },
  {
    id: 510,
    name: "Sadolin Luxurio PU White Sealer",
    category: "Woodcare",
    subcategory: "PU Finish",
    description: "Premium white PU sealer providing an excellent, highly opaque base.",
    sizes: [
      { size: "1 Ltr", mrp: 1240 },
      { size: "4 Ltr", mrp: 4720 },
      { size: "30 Ltr", mrp: 24660 }
    ],
    image: "/images/products/sadolin-luxurio-white.jpg",
    popular: false,
    features: ["White Base", "High Opacity", "Excellent Sanding"]
  },
  {
    id: 511,
    name: "Sadolin Luxurio PU Matt White/Black",
    category: "Woodcare",
    subcategory: "PU Finish",
    description: "Luxurious matte PU finish available in stunning solid white and black.",
    sizes: [
      { size: "1 Ltr", mrp: 1875 },
      { size: "4 Ltr", mrp: 7460 },
      { size: "30 Ltr", mrp: 37000 }
    ],
    image: "/images/products/sadolin-luxurio-white.jpg",
    popular: false,
    features: ["Premium Matte", "Solid Colors", "Scratch Resistant"]
  },
  {
    id: 512,
    name: "Sadolin Luxurio PU Gloss White/Black",
    category: "Woodcare",
    subcategory: "PU Finish",
    description: "High-gloss, ultra-luxurious PU finish in solid white and black.",
    sizes: [
      { size: "1 Ltr", mrp: 2040 },
      { size: "4 Ltr", mrp: 7460 },
      { size: "40 Ltr", mrp: 41865 }
    ],
    image: "/images/products/sadolin-luxurio-white.jpg",
    popular: false,
    features: ["High Gloss", "Solid Colors", "Durable"]
  },
  {
    id: 513,
    name: "Sadolin 2KPU Exterior Clear Matt",
    category: "Woodcare",
    subcategory: "Exterior PU",
    description: "Excellent scratch & stain resistance. Wood crack protection.",
    sizes: [
      { size: "1 Ltr", mrp: 1305 },
      { size: "4 Ltr", mrp: 5140 },
      { size: "20 Ltr", mrp: 25030 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/40/da/bf/e2/packshot_large.png",
    popular: false,
    features: ["Excellent scratch & stain resistance", "Wood crack protection", "All Weather Durable & UV resistant"]
  },
  {
    id: 514,
    name: "Sadolin 2KPU Exterior Clear Sealer",
    category: "Woodcare",
    subcategory: "Exterior PU",
    description: "Excellent scratch & stain resistance. Wood crack protection.",
    sizes: [
      { size: "1 Ltr", mrp: 1245 },
      { size: "4 Ltr", mrp: 4870 },
      { size: "20 Ltr", mrp: 23790 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/ee/ab/af/4a/packshot_large.png",
    popular: false,
    features: ["Excellent scratch & stain resistance", "Wood crack protection", "All Weather Durable & UV resistant"]
  },
  {
    id: 515,
    name: "Sadolin 2KPU Interior Clear Matt",
    category: "Woodcare",
    subcategory: "Interior PU",
    description: "Excellent scratch & stain resistance. Excellent Wood crack protection.",
    sizes: [
      { size: "1 Ltr", mrp: 1225 },
      { size: "4 Ltr", mrp: 4790 },
      { size: "20 Ltr", mrp: 23930 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/00/c0/a9/32/packshot_large.png",
    popular: false,
    features: ["Excellent scratch & stain resistance", "Excellent Wood crack protection", "Excellent Water Resistance"]
  },
  {
    id: 516,
    name: "Sadolin 2KPU Interior Clear Sealer",
    category: "Woodcare",
    subcategory: "Interior PU",
    description: "Excellent scratch & stain resistance. Excellent Wood crack protection.",
    sizes: [
      { size: "1 Ltr", mrp: 1175 },
      { size: "4 Ltr", mrp: 4600 },
      { size: "20 Ltr", mrp: 22080 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/19/14/82/a9/packshot_large.png",
    popular: false,
    features: ["Excellent scratch & stain resistance", "Excellent Wood crack protection", "Excellent Water Resistance"]
  },
  {
    id: 517,
    name: "Sadolin 2KPU Opaque Gloss White",
    category: "Woodcare",
    subcategory: "Opaque PU",
    description: "Excellent scratch & stain resistance. Wood crack protection.",
    sizes: [
      { size: "1 Ltr", mrp: 1235 },
      { size: "4 Ltr", mrp: 4825 },
      { size: "20 Ltr", mrp: 23200 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/8e/8e/fa/05/packshot_large.png",
    popular: false,
    features: ["Excellent scratch & stain resistance", "Wood crack protection", "All Weather Durable & UV resistant"]
  },
  {
    id: 518,
    name: "Sadolin 2KPU Opaque Matt White",
    category: "Woodcare",
    subcategory: "Opaque PU",
    description: "Excellent scratch & stain resistance. Wood crack protection.",
    sizes: [
      { size: "1 Ltr", mrp: 1245 },
      { size: "4 Ltr", mrp: 4935 },
      { size: "20 Ltr", mrp: 23380 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/06/a8/8d/1d/packshot_large.png",
    popular: false,
    features: ["Excellent scratch & stain resistance", "Wood crack protection", "All Weather Durable & UV resistant"]
  },
  {
    id: 519,
    name: "Sadolin 2KPU Primer Surfacer",
    category: "Woodcare",
    subcategory: "PU Primer",
    description: "Excellent scratch & stain resistance. Wood crack protection.",
    sizes: [
      { size: "1 Ltr", mrp: 955 },
      { size: "4 Ltr", mrp: 3620 },
      { size: "20 Ltr", mrp: 17900 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/9e/57/06/35/packshot_large.png",
    popular: false,
    features: ["Excellent scratch & stain resistance", "Wood crack protection", "All Weather Durable & UV resistant"]
  },
  {
    id: 520,
    name: "Sadolin Epoxy Insulator",
    category: "Woodcare",
    subcategory: "Insulator",
    description: "Specialized epoxy barrier coat preventing tannin bleed.",
    sizes: [
      { size: "1 Ltr", mrp: 1290 },
      { size: "4 Ltr", mrp: 4675 }
    ],
    image: "/images/products/sadolin-epoxy-insulator.jpg",
    popular: false,
    features: ["Blocks Tannins", "Epoxy Base", "Prepares Wood"]
  },
  {
    id: 521,
    name: "Sadolin PU Prime Clear Matt",
    category: "Woodcare",
    subcategory: "PU Finish",
    description: "Standard PU clear matte finish offering good protection.",
    sizes: [
      { size: "1 Ltr", mrp: 685 },
      { size: "4 Ltr", mrp: 2670 },
      { size: "20 Ltr", mrp: 12935 }
    ],
    image: "/images/products/sadolin-pu-prime-clear.jpg",
    popular: false,
    features: ["Clear Matt", "Cost Effective", "Durable"]
  },
  {
    id: 522,
    name: "Sadolin PU Prime Clear Sealer",
    category: "Woodcare",
    subcategory: "PU Primer",
    description: "Standard clear PU sealer providing a reliable base.",
    sizes: [
      { size: "1 Ltr", mrp: 680 },
      { size: "4 Ltr", mrp: 2655 },
      { size: "20 Ltr", mrp: 12675 }
    ],
    image: "/images/products/sadolin-pu-prime-clear.jpg",
    popular: false,
    features: ["Clear Base", "Good Sandability", "Economical"]
  },
  {
    id: 523,
    name: "Sadolin PU Prime White Gloss",
    category: "Woodcare",
    subcategory: "PU Finish",
    description: "Standard PU white gloss finish providing a durable opaque coating.",
    sizes: [
      { size: "1 Ltr", mrp: 900 },
      { size: "4 Ltr", mrp: 3495 },
      { size: "20 Ltr", mrp: 16970 }
    ],
    image: "/images/products/sadolin-pu-prime-white.jpg",
    popular: false,
    features: ["White Gloss", "Opaque", "Good Coverage"]
  },
  {
    id: 524,
    name: "Sadolin PU Prime White Matt",
    category: "Woodcare",
    subcategory: "PU Finish",
    description: "Standard PU white matte finish offering an elegant look.",
    sizes: [
      { size: "1 Ltr", mrp: 890 },
      { size: "4 Ltr", mrp: 3465 },
      { size: "20 Ltr", mrp: 16795 }
    ],
    image: "/images/products/sadolin-pu-prime-white.jpg",
    popular: false,
    features: ["White Matt", "Opaque", "Elegant"]
  },
  {
    id: 525,
    name: "Sadolin PU Prime White Sealer",
    category: "Woodcare",
    subcategory: "PU Primer",
    description: "Standard white PU sealer ideal for priming wood prior to opaque topcoats.",
    sizes: [
      { size: "1 Ltr", mrp: 805 },
      { size: "4 Ltr", mrp: 3145 },
      { size: "20 Ltr", mrp: 14990 }
    ],
    image: "/images/products/sadolin-pu-prime-white.jpg",
    popular: false,
    features: ["White Base", "Good Opacity", "Cost Effective"]
  },
  {
    id: 526,
    name: "Sadolin Melamine Matt",
    category: "Woodcare",
    subcategory: "Melamine Finish",
    description: "Excellent scratch & stain resistance. Non-yellowing.",
    sizes: [
      { size: "1 Ltr", mrp: 575 },
      { size: "4 Ltr", mrp: 2175 },
      { size: "20 Ltr", mrp: 10185 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/e4/d0/32/8b/packshot_large.png",
    popular: false,
    features: ["Excellent scratch & stain resistance", "Non-yellowing", "Long lasting beauty"]
  },
  {
    id: 527,
    name: "Sadolin Melamine Sealer",
    category: "Woodcare",
    subcategory: "Melamine Primer",
    description: "Excellent scratch & stain resistance. Non-yellowing.",
    sizes: [
      { size: "1 Ltr", mrp: 575 },
      { size: "4 Ltr", mrp: 2085 },
      { size: "20 Ltr", mrp: 10195 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/50/12/42/22/packshot_large.jpg",
    popular: false,
    features: ["Excellent scratch & stain resistance", "Non-yellowing", "Long lasting beauty"]
  },
  {
    id: 528,
    name: "Sadolin NC Clear Lacquer",
    category: "Woodcare",
    subcategory: "NC Finish",
    description: "Fast-drying nitrocellulose clear lacquer for quick finishing.",
    sizes: [
      { size: "500 ml", mrp: 280 },
      { size: "1 Ltr", mrp: 545 },
      { size: "4 Ltr", mrp: 2145 }
    ],
    image: "/images/products/sadolin-nc-lacquer.jpg",
    popular: false,
    features: ["NC Clear", "Fast Drying", "Traditional Polish"]
  },
  {
    id: 529,
    name: "Sadolin NC Sanding Sealer",
    category: "Woodcare",
    subcategory: "NC Primer",
    description: "Quick-drying NC sanding sealer designed for rapid grain filling.",
    sizes: [
      { size: "500 ml", mrp: 220 },
      { size: "1 Ltr", mrp: 420 },
      { size: "4 Ltr", mrp: 1595 },
      { size: "20 Ltr", mrp: 7870 }
    ],
    image: "/images/products/sadolin-nc-lacquer.jpg",
    popular: false,
    features: ["NC Base", "Rapid Sanding", "Fills Grain"]
  },
  {
    id: 530,
    name: "Sadolin Interior Clear 1KPU Gloss",
    category: "Woodcare",
    subcategory: "1KPU Finish",
    description: "Good gloss retention.",
    sizes: [
      { size: "1 Ltr", mrp: 260 },
      { size: "3 Ltr", mrp: 495 },
      { size: "5 Ltr", mrp: 1955 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/d8/7c/50/22/packshot_large.png",
    popular: false,
    features: ["Good gloss retention"]
  },
  {
    id: 531,
    name: "Sadolin Synthetic Clear Varnish",
    category: "Woodcare",
    subcategory: "Varnish",
    description: "Economical synthetic clear varnish providing basic protection.",
    sizes: [
      { size: "1 Ltr", mrp: 225 },
      { size: "3 Ltr", mrp: 430 },
      { size: "5 Ltr", mrp: 1675 },
      { size: "20 Ltr", mrp: 8125 }
    ],
    image: "/images/products/sadolin-1kpu-varnish.jpg",
    popular: false,
    features: ["Economical", "Clear Varnish", "Basic Shine"]
  },
  {
    id: 532,
    name: "Sadolin 2KPU Thinner",
    category: "Woodcare",
    subcategory: "Thinners",
    description: "Premium specialized thinner formulated for diluting Sadolin 2KPU.",
    sizes: [
      { size: "1 Ltr", mrp: 445 },
      { size: "3 Ltr", mrp: 1280 },
      { size: "20 Ltr", mrp: 7945 }
    ],
    image: "/images/products/sadolin-thinner.jpg",
    popular: false,
    features: ["PU Compatible", "Optimizes Flow", "Reduces Viscosity"]
  },
  {
    id: 533,
    name: "Sadolin NC Wood Thinner",
    category: "Woodcare",
    subcategory: "Thinners",
    description: "High-quality NC thinner designed for use with Sadolin nitrocellulose.",
    sizes: [
      { size: "1 Ltr", mrp: 390 },
      { size: "4 Ltr", mrp: 1405 },
      { size: "20 Ltr", mrp: 6685 }
    ],
    image: "/images/products/sadolin-thinner.jpg",
    popular: false,
    features: ["NC Compatible", "Fast Evaporation", "Solvency"]
  },
  {
    id: 534,
    name: "Sadolin Melamine Thinner",
    category: "Woodcare",
    subcategory: "Thinners",
    description: "Dedicated thinner optimized for adjusting melamine finishes.",
    sizes: [
      { size: "1 Ltr", mrp: 360 },
      { size: "5 Ltr", mrp: 1700 },
      { size: "20 Ltr", mrp: 6440 }
    ],
    image: "/images/products/sadolin-thinner.jpg",
    popular: false,
    features: ["Melamine Compatible", "Improves Flow", "Anti-blushing"]
  },
  {
    id: 535,
    name: "Sadolin Multipurpose Thinner",
    category: "Woodcare",
    subcategory: "Thinners",
    description: "Versatile thinner suitable for diluting standard wood finishes.",
    sizes: [
      { size: "1 Ltr", mrp: 315 },
      { size: "5 Ltr", mrp: 1495 },
      { size: "20 Ltr", mrp: 5705 }
    ],
    image: "/images/products/sadolin-thinner.jpg",
    popular: false,
    features: ["Multipurpose", "Tool Cleaning", "Economical"]
  },
  {
    id: 536,
    name: "Sadolin Wood Filler Teak",
    category: "Woodcare",
    subcategory: "Wood Filler",
    description: "Easy-to-use wood filler perfectly tinted to match Teak surfaces.",
    sizes: [
      { size: "500 gm", mrp: 180 },
      { size: "1 Kg", mrp: 395 }
    ],
    image: "/images/products/sadolin-wood-filler.jpg",
    popular: false,
    features: ["Teak Tint", "Fills Cracks", "Easy Sanding"]
  },
  {
    id: 537,
    name: "Sadolin Wood Filler White",
    category: "Woodcare",
    subcategory: "Wood Filler",
    description: "Versatile white wood filler ideal for opaque finishes.",
    sizes: [
      { size: "500 gm", mrp: 180 },
      { size: "1 Kg", mrp: 395 }
    ],
    image: "/images/products/sadolin-wood-filler.jpg",
    popular: false,
    features: ["White Base", "Fills Cracks", "Easy Sanding"]
  },
  {
    id: 538,
    name: "Sadolin Wood Filler Walnut",
    category: "Woodcare",
    subcategory: "Wood Filler",
    description: "Pre-tinted wood filler expertly matched for dark Walnut repairs.",
    sizes: [
      { size: "500 gm", mrp: 180 },
      { size: "1 Kg", mrp: 395 }
    ],
    image: "/images/products/sadolin-wood-filler.jpg",
    popular: false,
    features: ["Walnut Tint", "Fills Cracks", "Easy Sanding"]
  },
  {
    id: 539,
    name: "Sadolin Wood Stain Charcoal",
    category: "Woodcare",
    subcategory: "Wood Stain",
    description: "Deep-penetrating stain providing a bold charcoal hue.",
    sizes: [
      { size: "100 ml", mrp: 70 },
      { size: "500 ml", mrp: 355 },
      { size: "1 Ltr", mrp: 650 }
    ],
    image: "/images/products/sadolin-wood-stain-charcoal.jpg",
    popular: false,
    features: ["Charcoal", "Penetrating", "Enhances Grain"]
  },
  {
    id: 540,
    name: "Sadolin Wood Stain Rosewood",
    category: "Woodcare",
    subcategory: "Wood Stain",
    description: "Deep-penetrating stain imparting a classic rosewood tone.",
    sizes: [
      { size: "100 ml", mrp: 75 },
      { size: "500 ml", mrp: 355 },
      { size: "1 Ltr", mrp: 630 }
    ],
    image: "/images/products/sadolin-wood-stain-rosewood.jpg",
    popular: false,
    features: ["Rosewood", "Penetrating", "Enhances Grain"]
  },
  {
    id: 608,
    name: "Dulux Super PU Satin Dark Colours",
    category: "Enamels",
    subcategory: "PU Enamel",
    description: "Luxurious satin PU enamel available in deep shades.",
    sizes: [
      { size: "500 ml", mrp: 255 },
      { size: "1 Ltr", mrp: 515 },
      { size: "4 Ltr", mrp: 1955 },
      { size: "20 Ltr", mrp: 9620 }
    ],
    image: "/images/products/dulux-super-pu-satin-colours.jpg",
    popular: false,
    features: ["Dark Shades", "Satin Finish", "PU Enhanced"]
  },
  {
    id: 609,
    name: "Dulux Super PU Satin Orchid White/Suede/Almond",
    category: "Enamels",
    subcategory: "PU Enamel",
    description: "Elegant off-white satin PU finishes perfect for subtle accents.",
    sizes: [
      { size: "1 Ltr", mrp: 535 },
      { size: "4 Ltr", mrp: 2055 },
      { size: "10 Ltr", mrp: 5005 },
      { size: "20 Ltr", mrp: 9870 }
    ],
    image: "/images/products/dulux-super-pu-satin-colours.jpg",
    popular: false,
    features: ["Off-White", "Satin Finish", "PU Enhanced"]
  },
  {
    id: 610,
    name: "Dulux Super PU Satin Dark Brown",
    category: "Enamels",
    subcategory: "PU Enamel",
    description: "Rich dark brown PU enamel offering a durable satin finish.",
    sizes: [
      { size: "1 Ltr", mrp: 535 },
      { size: "4 Ltr", mrp: 2095 },
      { size: "10 Ltr", mrp: 5135 },
      { size: "20 Ltr", mrp: 10175 }
    ],
    image: "/images/products/dulux-super-pu-satin-colours.jpg",
    popular: false,
    features: ["Dark Brown", "Satin Finish", "PU Enhanced"]
  },
  {
    id: 611,
    name: "Dulux Super PU Satin Cherry",
    category: "Enamels",
    subcategory: "PU Enamel",
    description: "Vibrant cherry red PU enamel delivering a tough satin finish.",
    sizes: [
      { size: "1 Ltr", mrp: 545 },
      { size: "4 Ltr", mrp: 2125 },
      { size: "10 Ltr", mrp: 5235 }
    ],
    image: "/images/products/dulux-super-pu-satin-colours.jpg",
    popular: false,
    features: ["Cherry Red", "Satin Finish", "PU Enhanced"]
  },
  {
    id: 612,
    name: "Dulux Super PU Satin Rosewood",
    category: "Enamels",
    subcategory: "PU Enamel",
    description: "Elegant rosewood-tinted PU enamel for a classic satin look.",
    sizes: [
      { size: "1 Ltr", mrp: 515 },
      { size: "4 Ltr", mrp: 1955 }
    ],
    image: "/images/products/dulux-super-pu-satin-colours.jpg",
    popular: false,
    features: ["Rosewood", "Satin Finish", "PU Enhanced"]
  },
  {
    id: 613,
    name: "Dulux Super Gloss 5in1 Colours Group 1",
    category: "Enamels",
    subcategory: "High Gloss Enamel",
    description: "High-performance gloss enamel in popular shades like Blue and Green.",
    sizes: [
      { size: "500 ml", mrp: 270 },
      { size: "1 Ltr", mrp: 515 },
      { size: "4 Ltr", mrp: 1990 }
    ],
    image: "/images/products/dulux-super-gloss-5in1-colours.jpg",
    popular: false,
    features: ["Group 1", "5-in-1 Benefits", "High Gloss"]
  },
  {
    id: 614,
    name: "Dulux Super Gloss 5in1 Colours Group 4",
    category: "Enamels",
    subcategory: "High Gloss Enamel",
    description: "High-performance gloss enamel in pastel shades.",
    sizes: [
      { size: "500 ml", mrp: 280 },
      { size: "1 Ltr", mrp: 535 },
      { size: "4 Ltr", mrp: 2070 }
    ],
    image: "/images/products/dulux-super-gloss-5in1-colours.jpg",
    popular: false,
    features: ["Group 4", "5-in-1 Benefits", "High Gloss"]
  },
  {
    id: 615,
    name: "Dulux Super Gloss 5in1 Golden Yellow/Sand Stone",
    category: "Enamels",
    subcategory: "High Gloss Enamel",
    description: "Bright and earthy shades of high-gloss enamel.",
    sizes: [
      { size: "500 ml", mrp: 280 },
      { size: "1 Ltr", mrp: 535 },
      { size: "4 Ltr", mrp: 2080 }
    ],
    image: "/images/products/dulux-super-gloss-5in1-colours.jpg",
    popular: false,
    features: ["Yellow & Sand", "5-in-1 Benefits", "High Gloss"]
  },
  {
    id: 616,
    name: "Dulux Super Gloss 5in1 PO Red",
    category: "Enamels",
    subcategory: "High Gloss Enamel",
    description: "Striking Post Office Red high-gloss enamel ensuring maximum visibility.",
    sizes: [
      { size: "500 ml", mrp: 280 },
      { size: "1 Ltr", mrp: 545 },
      { size: "4 Ltr", mrp: 2080 }
    ],
    image: "/images/products/dulux-super-gloss-5in1-colours.jpg",
    popular: false,
    features: ["PO Red", "5-in-1 Benefits", "High Gloss"]
  },
  {
    id: 617,
    name: "Dulux Super Gloss 5in1 Cherry",
    category: "Enamels",
    subcategory: "High Gloss Enamel",
    description: "Deep cherry high-gloss enamel providing superior shine.",
    sizes: [
      { size: "500 ml", mrp: 290 },
      { size: "1 Ltr", mrp: 555 },
      { size: "4 Ltr", mrp: 2170 }
    ],
    image: "/images/products/dulux-super-gloss-5in1-colours.jpg",
    popular: false,
    features: ["Cherry", "5-in-1 Benefits", "High Gloss"]
  },
  {
    id: 618,
    name: "Dulux Gloss Premium Dark Colours",
    category: "Enamels",
    subcategory: "Gloss Enamel",
    description: "Premium quality standard gloss enamel in essential dark shades.",
    sizes: [
      { size: "500 ml", mrp: 265 },
      { size: "1 Ltr", mrp: 475 },
      { size: "4 Ltr", mrp: 1840 },
      { size: "10 Ltr", mrp: 4430 },
      { size: "20 Ltr", mrp: 8620 }
    ],
    image: "/images/products/dulux-gloss-premium-colours.jpg",
    popular: false,
    features: ["Dark Colors", "Mirror Gloss", "Durable"]
  },
  {
    id: 619,
    name: "Dulux Gloss Premium Mixed Colours",
    category: "Enamels",
    subcategory: "Gloss Enamel",
    description: "A vast range of vibrant mixed colors in Dulux's trusted premium gloss finish.",
    sizes: [
      { size: "500 ml", mrp: 270 },
      { size: "1 Ltr", mrp: 525 },
      { size: "4 Ltr", mrp: 2020 },
      { size: "10 Ltr", mrp: 4870 },
      { size: "20 Ltr", mrp: 9555 }
    ],
    image: "/images/products/dulux-gloss-premium-colours.jpg",
    popular: false,
    features: ["Mixed Colors", "Mirror Gloss", "Durable"]
  },
  {
    id: 620,
    name: "Dulux Gloss Small Packs Dark",
    category: "Enamels",
    subcategory: "Gloss Enamel",
    description: "Convenient small packs of premium gloss enamel in dark shades.",
    sizes: [
      { size: "100 ml", mrp: 65 },
      { size: "200 ml", mrp: 120 }
    ],
    image: "/images/products/dulux-gloss-small-pack.jpg",
    popular: false,
    features: ["Touch-up", "Dark Colors", "Mirror Gloss"]
  },
  {
    id: 621,
    name: "Dulux Gloss Small Packs Bright",
    category: "Enamels",
    subcategory: "Gloss Enamel",
    description: "Convenient small packs of premium gloss enamel in bright shades.",
    sizes: [
      { size: "100 ml", mrp: 75 },
      { size: "200 ml", mrp: 130 }
    ],
    image: "/images/products/dulux-gloss-small-pack.jpg",
    popular: false,
    features: ["Touch-up", "Bright Colors", "Mirror Gloss"]
  },
  {
    id: 622,
    name: "Dulux Promise Enamel Colours",
    category: "Enamels",
    subcategory: "Standard Enamel",
    description: "Economical colored enamel paint delivering reliable protection.",
    sizes: [
      { size: "500 ml", mrp: 180 },
      { size: "1 Ltr", mrp: 330 },
      { size: "4 Ltr", mrp: 1270 },
      { size: "10 Ltr", mrp: 3020 },
      { size: "20 Ltr", mrp: 5890 }
    ],
    image: "/images/products/dulux-promise-enamel.jpg",
    popular: false,
    features: ["Colored Enamel", "Economical", "Glossy"]
  },
  {
    id: 623,
    name: "Dulux PU Enamel 12-in-1 Black",
    category: "Enamels",
    subcategory: "Specialty Enamel",
    description: "The ultimate black PU enamel offering 12 specialized benefits.",
    sizes: [
      { size: "500 ml", mrp: 270 },
      { size: "1 Ltr", mrp: 525 },
      { size: "4 Ltr", mrp: 2025 }
    ],
    image: "/images/products/dulux-pu-enamel-12in1-black.jpg",
    popular: false,
    features: ["12-in-1", "Black", "PU Fortified"]
  },
  {
    id: 709,
    name: "Dulux WS Prime Coat Primer",
    category: "Primers",
    subcategory: "Exterior Primer",
    description: "Superior Adhesion. Superior Whiteness.",
    sizes: [
      { size: "1 Ltr", mrp: 280 },
      { size: "4 Ltr", mrp: 1090 },
      { size: "10 Ltr", mrp: 2630 },
      { size: "20 Ltr", mrp: 5135 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/67/76/46/a6/prime_coat_packshot_large.png",
    popular: false,
    features: ["Superior Adhesion", "Superior Whiteness", "Superior Coverage"]
  },
  {
    id: 710,
    name: "Dulux Promise 2in1 Primer",
    category: "Primers",
    subcategory: "Multipurpose Primer",
    description: "Versatile, budget-friendly primer suitable for interior and exterior walls.",
    sizes: [
      { size: "1 Ltr", mrp: 215 },
      { size: "4 Ltr", mrp: 840 },
      { size: "10 Ltr", mrp: 1885 },
      { size: "20 Ltr", mrp: 3550 }
    ],
    image: "/images/products/dulux-promise-primer.jpg",
    popular: false,
    features: ["2-in-1 Usage", "Economical", "Good Coverage"]
  },
  {
    id: 711,
    name: "Dulux SmartChoice Interior Primer",
    category: "Primers",
    subcategory: "Interior Primer",
    description: "Anti-Chalking. Fast Drying.",
    sizes: [
      { size: "1 Ltr", mrp: 165 },
      { size: "4 Ltr", mrp: 600 },
      { size: "10 Ltr", mrp: 1375 },
      { size: "20 Ltr", mrp: 2595 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/86/1d/da/fe/promise_sc_int_primer_2025_copy_packshot_large.png",
    popular: false,
    features: ["Anti-Chalking", "Fast Drying"]
  },
  {
    id: 712,
    name: "Dulux Promise Freedom 2in1 Primer",
    category: "Primers",
    subcategory: "Multipurpose Primer",
    description: "Highly cost-effective 2-in-1 primer ensuring standard protection.",
    sizes: [
      { size: "1 Ltr", mrp: 140 },
      { size: "4 Ltr", mrp: 470 },
      { size: "10 Ltr", mrp: 1035 },
      { size: "20 Ltr", mrp: 1890 }
    ],
    image: "/images/products/dulux-promise-primer.jpg",
    popular: false,
    features: ["Ultra Economical", "2-in-1", "Standard Base"]
  },
  {
    id: 713,
    name: "Dulux Zinc Yellow Metal Primer",
    category: "Primers",
    subcategory: "Metal Primer",
    description: "Zinc-Phosphate Based. Stronger Adhesion.",
    sizes: [
      { size: "500 ml", mrp: 225 },
      { size: "1 Ltr", mrp: 405 },
      { size: "4 Ltr", mrp: 1565 },
      { size: "10 Ltr", mrp: 3830 },
      { size: "20 Ltr", mrp: 7330 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/76/19/02/9c/packshot_large.png",
    popular: false,
    features: ["Zinc-Phosphate Based", "Stronger Adhesion", "Superior Corrosion Resistance"]
  },
  {
    id: 714,
    name: "Dulux Solvent Based Cement Primer",
    category: "Primers",
    subcategory: "Cement Primer",
    description: "Superior Adhesion. Better Top Coat Coverage.",
    sizes: [
      { size: "1 Ltr", mrp: 320 },
      { size: "4 Ltr", mrp: 1245 },
      { size: "10 Ltr", mrp: 2980 },
      { size: "20 Ltr", mrp: 5700 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/ad/94/29/10/packshot_large.png",
    popular: false,
    features: ["Superior Adhesion", "Better Top Coat Coverage", "Better Quality Finish"]
  },
  {
    id: 715,
    name: "Dulux Wood Primer Pink",
    category: "Primers",
    subcategory: "Wood Primer",
    description: "Superior Adhesion. Superior Wood Penetration.",
    sizes: [
      { size: "500 ml", mrp: 175 },
      { size: "1 Ltr", mrp: 320 },
      { size: "4 Ltr", mrp: 1230 },
      { size: "10 Ltr", mrp: 3030 },
      { size: "20 Ltr", mrp: 5905 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/fd/a7/8b/08/pink_wood_packshot_large.png",
    popular: false,
    features: ["Superior Adhesion", "Superior Wood Penetration", "Better Top Coat Coverage"]
  },
  {
    id: 716,
    name: "Dulux Duwel White Primer",
    category: "Primers",
    subcategory: "Standard Primer",
    description: "Good adhesion. Enhances Top-Coat Coverage.",
    sizes: [
      { size: "1 Ltr", mrp: 285 },
      { size: "4 Ltr", mrp: 1120 },
      { size: "10 Ltr", mrp: 2760 },
      { size: "20 Ltr", mrp: 5355 }
    ],
    image: "https://msp.images.akzonobel.com/prd/dh/aindlx/packshots/8f/89/17/5d/white_pimer_packshot_large.png",
    popular: false,
    features: ["Good adhesion", "Enhances Top-Coat Coverage"]
  },
  {
    id: 804,
    name: "Dulux Promise SmartChoice Acrylic Distemper",
    category: "Distempers & Putty",
    subcategory: "Distemper",
    description: "Highly economical acrylic distemper providing a smooth interior finish.",
    sizes: [
      { size: "5 Kg", mrp: 465 },
      { size: "10 Kg", mrp: 860 },
      { size: "20 Kg", mrp: 1610 }
    ],
    image: "/images/products/dulux-promise-smartchoice-distemper.jpg",
    popular: false,
    features: ["Acrylic Base", "Economical", "Smooth Finish"]
  },
  {
    id: 805,
    name: "Dulux Polyputty",
    category: "Distempers & Putty",
    subcategory: "Putty",
    description: "High-quality polyester-based putty engineered for rapid drying.",
    sizes: [
      { size: "20 Kg", mrp: 920 },
      { size: "40 Kg", mrp: 1635 }
    ],
    image: "/images/products/dulux-polyputty.jpg",
    popular: false,
    features: ["Fast Drying", "Effortless Sanding", "Polyester"]
  },
  {
    id: 1001,
    name: "Dulux Universal Stainer Group 1",
    category: "Accessories",
    subcategory: "Stainer",
    description: "High-strength universal stainer in Fast Red, Yellow Oxide, Burnt Sienna.",
    sizes: [
      { size: "50 ml", mrp: 80 },
      { size: "100 ml", mrp: 150 },
      { size: "200 ml", mrp: 285 }
    ],
    image: "/images/products/dulux-universal-stainer-group1.jpg",
    popular: false,
    features: ["High Strength", "Universal Tint", "Vibrant"]
  },
  {
    id: 1002,
    name: "Dulux Universal Stainer Group 2",
    category: "Accessories",
    subcategory: "Stainer",
    description: "High-strength universal stainer in Fast Yellow, Green, Blue, Violet, Black.",
    sizes: [
      { size: "50 ml", mrp: 70 },
      { size: "100 ml", mrp: 150 },
      { size: "200 ml", mrp: 235 }
    ],
    image: "/images/products/dulux-universal-stainer-group2.jpg",
    popular: false,
    features: ["High Strength", "Universal Tint", "Vibrant"]
  },
  {
    id: 1003,
    name: "Dulux Tinter WH1 White",
    category: "Tinters & Stainers",
    subcategory: "Tinter",
    description: "Automated dispensing tinter for precise white shade matching.",
    sizes: [
      { size: "1 Ltr", mrp: 1324 }
    ],
    image: "/images/products/tinter-acotone.jpg",
    popular: false,
    features: ["Automated Tinter", "Precise Shade", "White"]
  },
  {
    id: 1004,
    name: "Dulux Tinter NO1 Black",
    category: "Tinters & Stainers",
    subcategory: "Tinter",
    description: "Automated dispensing tinter for precise black shade matching.",
    sizes: [
      { size: "1 Ltr", mrp: 1191 }
    ],
    image: "/images/products/tinter-standard-dark.jpg",
    popular: false,
    features: ["Automated Tinter", "Precise Shade", "Black"]
  },
  {
    id: 1005,
    name: "Dulux Tinter YE1 Yellow 1",
    category: "Tinters & Stainers",
    subcategory: "Tinter",
    description: "Automated dispensing tinter for precise yellow shade matching.",
    sizes: [
      { size: "1 Ltr", mrp: 1324 }
    ],
    image: "/images/products/tinter-standard-dark.jpg",
    popular: false,
    features: ["Automated Tinter", "Precise Shade", "Yellow"]
  },
  {
    id: 1006,
    name: "Dulux Tinter YE2 Yellow 2",
    category: "Tinters & Stainers",
    subcategory: "Tinter",
    description: "Automated dispensing tinter for vibrant yellow shade matching.",
    sizes: [
      { size: "1 Ltr", mrp: 4924 }
    ],
    image: "/images/products/tinter-standard-dark.jpg",
    popular: false,
    features: ["Automated Tinter", "Precise Shade", "Vibrant Yellow"]
  },
  {
    id: 1007,
    name: "Dulux Tinter XY1 Yellow Oxide",
    category: "Tinters & Stainers",
    subcategory: "Tinter",
    description: "Automated dispensing tinter for earthy yellow oxide matching.",
    sizes: [
      { size: "1 Ltr", mrp: 1293 }
    ],
    image: "/images/products/tinter-standard-dark.jpg",
    popular: false,
    features: ["Automated Tinter", "Precise Shade", "Yellow Oxide"]
  },
  {
    id: 1008,
    name: "Dulux Tinter RE1 Red 1",
    category: "Tinters & Stainers",
    subcategory: "Tinter",
    description: "Automated dispensing tinter for precise red shade matching.",
    sizes: [
      { size: "1 Ltr", mrp: 1960 }
    ],
    image: "/images/products/tinter-standard-dark.jpg",
    popular: false,
    features: ["Automated Tinter", "Precise Shade", "Red"]
  },
  {
    id: 1009,
    name: "Dulux Tinter XR1 Red Oxide",
    category: "Tinters & Stainers",
    subcategory: "Tinter",
    description: "Automated dispensing tinter for earthy red oxide matching.",
    sizes: [
      { size: "1 Ltr", mrp: 1522 }
    ],
    image: "/images/products/tinter-standard-dark.jpg",
    popular: false,
    features: ["Automated Tinter", "Precise Shade", "Red Oxide"]
  },
  {
    id: 1010,
    name: "Dulux Tinter MA1 Magenta",
    category: "Tinters & Stainers",
    subcategory: "Tinter",
    description: "Automated dispensing tinter for vibrant magenta shade matching.",
    sizes: [
      { size: "1 Ltr", mrp: 2173 }
    ],
    image: "/images/products/tinter-standard-dark.jpg",
    popular: false,
    features: ["Automated Tinter", "Precise Shade", "Magenta"]
  },
  {
    id: 1011,
    name: "Dulux Tinter OR1 Orange",
    category: "Tinters & Stainers",
    subcategory: "Tinter",
    description: "Automated dispensing tinter for vibrant orange shade matching.",
    sizes: [
      { size: "1 Ltr", mrp: 2230 }
    ],
    image: "/images/products/tinter-standard-dark.jpg",
    popular: false,
    features: ["Automated Tinter", "Precise Shade", "Orange"]
  },
  {
    id: 1012,
    name: "Dulux Tinter GR1 Green",
    category: "Tinters & Stainers",
    subcategory: "Tinter",
    description: "Automated dispensing tinter for precise green shade matching.",
    sizes: [
      { size: "1 Ltr", mrp: 1512 }
    ],
    image: "/images/products/tinter-standard-dark.jpg",
    popular: false,
    features: ["Automated Tinter", "Precise Shade", "Green"]
  },
  {
    id: 1013,
    name: "Dulux Tinter BU1 Blue 1",
    category: "Tinters & Stainers",
    subcategory: "Tinter",
    description: "Automated dispensing tinter for precise blue shade matching.",
    sizes: [
      { size: "1 Ltr", mrp: 1512 }
    ],
    image: "/images/products/tinter-standard-dark.jpg",
    popular: false,
    features: ["Automated Tinter", "Precise Shade", "Blue"]
  },
  {
    id: 1014,
    name: "Dulux Tinter BU2 Blue 2",
    category: "Tinters & Stainers",
    subcategory: "Tinter",
    description: "Automated dispensing tinter for deep blue shade matching.",
    sizes: [
      { size: "1 Ltr", mrp: 4682 }
    ],
    image: "/images/products/tinter-standard-dark.jpg",
    popular: false,
    features: ["Automated Tinter", "Precise Shade", "Deep Blue"]
  },
  {
    id: 1015,
    name: "Dulux Tinter YOX Yellow Oxide Standard",
    category: "Tinters & Stainers",
    subcategory: "Tinter",
    description: "Standard grade dispensing tinter for yellow oxide color creation.",
    sizes: [
      { size: "1 Ltr", mrp: 980 }
    ],
    image: "/images/products/tinter-standard-light.jpg",
    popular: false,
    features: ["Standard Tinter", "Reliable Shade", "Yellow Oxide"]
  },
  {
    id: 1016,
    name: "Dulux Tinter LFY Light Fast Yellow",
    category: "Tinters & Stainers",
    subcategory: "Tinter",
    description: "Standard grade dispensing tinter for UV-resistant light fast yellow color.",
    sizes: [
      { size: "1 Ltr", mrp: 1090 }
    ],
    image: "/images/products/tinter-standard-light.jpg",
    popular: false,
    features: ["Standard Tinter", "UV Resistant", "Yellow"]
  },
  {
    id: 1017,
    name: "Dulux Tinter GRN Green Standard",
    category: "Tinters & Stainers",
    subcategory: "Tinter",
    description: "Standard grade dispensing tinter for reliable green color creation.",
    sizes: [
      { size: "1 Ltr", mrp: 980 }
    ],
    image: "/images/products/tinter-standard-light.jpg",
    popular: false,
    features: ["Standard Tinter", "Reliable Shade", "Green"]
  },
  {
    id: 1018,
    name: "Dulux Tinter TBL Pthalo Blue",
    category: "Tinters & Stainers",
    subcategory: "Tinter",
    description: "Standard grade dispensing tinter for intense Pthalo Blue color creation.",
    sizes: [
      { size: "1 Ltr", mrp: 960 }
    ],
    image: "/images/products/tinter-standard-light.jpg",
    popular: false,
    features: ["Standard Tinter", "Reliable Shade", "Pthalo Blue"]
  },
  {
    id: 1019,
    name: "Dulux Tinter MAG Magenta Standard",
    category: "Tinters & Stainers",
    subcategory: "Tinter",
    description: "Standard grade dispensing tinter for magenta color creation.",
    sizes: [
      { size: "1 Ltr", mrp: 1360 }
    ],
    image: "/images/products/tinter-standard-light.jpg",
    popular: false,
    features: ["Standard Tinter", "Reliable Shade", "Magenta"]
  },
  {
    id: 1020,
    name: "Dulux Tinter FFR Fast-Fast Red",
    category: "Tinters & Stainers",
    subcategory: "Tinter",
    description: "Standard grade dispensing tinter for vibrant, light-fast red color.",
    sizes: [
      { size: "1 Ltr", mrp: 1600 }
    ],
    image: "/images/products/tinter-standard-light.jpg",
    popular: false,
    features: ["Standard Tinter", "Light-fast", "Red"]
  },
  {
    id: 1021,
    name: "Dulux Tinter OXR Red Oxide Standard",
    category: "Tinters & Stainers",
    subcategory: "Tinter",
    description: "Standard grade dispensing tinter for red oxide color creation.",
    sizes: [
      { size: "1 Ltr", mrp: 930 }
    ],
    image: "/images/products/tinter-standard-light.jpg",
    popular: false,
    features: ["Standard Tinter", "Reliable Shade", "Red Oxide"]
  },
  {
    id: 1022,
    name: "Dulux Tinter BLK Black Standard",
    category: "Tinters & Stainers",
    subcategory: "Tinter",
    description: "Standard grade dispensing tinter for black color creation.",
    sizes: [
      { size: "1 Ltr", mrp: 850 }
    ],
    image: "/images/products/tinter-standard-light.jpg",
    popular: false,
    features: ["Standard Tinter", "Reliable Shade", "Black"]
  },
  {
    id: 1023,
    name: "Dulux Tinter WHT White Standard",
    category: "Tinters & Stainers",
    subcategory: "Tinter",
    description: "Standard grade dispensing tinter for white shade adjustment.",
    sizes: [
      { size: "1 Ltr", mrp: 920 }
    ],
    image: "/images/products/tinter-standard-light.jpg",
    popular: false,
    features: ["Standard Tinter", "Reliable Shade", "White"]
  }
];


export const PRODUCTS = rawProducts.map(p => ({
  ...p,
  categoryId: p.category.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-'),
  sizes: p.sizes.map(s => ({
    ...s,
    discounted: Math.round(s.mrp * 0.95)
  }))
}));

export const DISCOUNT = 5;

export const discountedPrice = (price) => {
  return Math.round(price * (1 - DISCOUNT / 100));
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};
