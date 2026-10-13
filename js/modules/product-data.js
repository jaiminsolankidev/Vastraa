/**
 * Vastraa - Product Data Module
 * Single Source of Truth for the demonstration catalogue.
 * All prices are stored in integer paise (1 INR = 100 paise) to prevent floating-point rounding errors.
 */

const INITIAL_PRODUCTS = [
  {
    id: "vas-w-001",
    slug: "royal-crimson-kanjivaram-silk-saree",
    name: "Royal Crimson Kanjivaram Silk Saree",
    category: "women",
    subcategory: "saree",
    description: "Handcrafted by master weavers in Kanchipuram, this heirloom crimson silk saree features pure zari korvai borders with intricate peacock (Mayil) and temple motifs. Woven with pure mulberry silk threads and certified silver-gold zari.",
    pricePaise: 2850000, // ₹28,500
    compareAtPricePaise: 3400000, // ₹34,000
    currency: "INR",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80"
    ],
    fallbackImage: "assets/images/products/fallback-women.svg",
    availableSizes: ["Free Size (Unstitched Blouse)"],
    availableColors: [
      { name: "Crimson Red", hex: "#7E1929" },
      { name: "Vermilion Gold", hex: "#A83232" }
    ],
    availability: "in_stock",
    stockQuantity: 6,
    material: "100% Pure Mulberry Silk & Silver Zari",
    careInstructions: "Strictly dry clean only. Store wrapped in pure unbleached cotton or muslin in a moisture-free cedar trunk.",
    occasion: "Bridal & Wedding",
    featured: true,
    newArrival: false,
    bestseller: true,
    createdAt: "2026-01-15T10:00:00Z"
  },
  {
    id: "vas-w-002",
    slug: "noorani-zardozi-embroidered-bridal-lehenga",
    name: "Noorani Zardozi Embroidered Bridal Lehenga",
    category: "women",
    subcategory: "lehenga",
    description: "An architectural masterpiece in deep wine velvet, featuring 16 kalis individually embellished with heritage dabka, nakshi, and marodi threadwork. Accompanied by a hand-dyed organza veil with scalloped mathapatti borders.",
    pricePaise: 8800000, // ₹88,000
    compareAtPricePaise: 9800000,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80"
    ],
    fallbackImage: "assets/images/products/fallback-women.svg",
    availableSizes: ["XS", "S", "M", "L", "XL", "Custom"],
    availableColors: [
      { name: "Royal Wine", hex: "#4E1220" },
      { name: "Ruby Red", hex: "#6D1726" }
    ],
    availability: "in_stock",
    stockQuantity: 3,
    material: "Micro Velvet & Pure Silk Organza",
    careInstructions: "Specialist dry clean only. Hang on padded hangers to protect heavy embroidery.",
    occasion: "Bridal & Wedding",
    featured: true,
    newArrival: true,
    bestseller: false,
    createdAt: "2026-03-01T12:00:00Z"
  },
  {
    id: "vas-w-003",
    slug: "emerald-green-banarasi-brocade-saree",
    name: "Emerald Green Banarasi Katan Silk Saree",
    category: "women",
    subcategory: "saree",
    description: "Woven in the ancient sacred ghats of Varanasi, this emerald katan silk saree features a jangla jaal pattern of floral vines and birds woven in antiqued gold zari. Soft, fluid drape with a majestic pallu.",
    pricePaise: 2450000, // ₹24,500
    compareAtPricePaise: 2900000,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80"
    ],
    fallbackImage: "assets/images/products/fallback-women.svg",
    availableSizes: ["Free Size (Unstitched Blouse)"],
    availableColors: [
      { name: "Emerald Green", hex: "#174D38" },
      { name: "Forest Jade", hex: "#0E3A2A" }
    ],
    availability: "in_stock",
    stockQuantity: 8,
    material: "Pure Handloom Katan Silk",
    careInstructions: "Dry clean only. Roll fold periodically to prevent zari creases.",
    occasion: "Festive Celebration",
    featured: false,
    newArrival: true,
    bestseller: true,
    createdAt: "2026-02-18T09:30:00Z"
  },
  {
    id: "vas-w-004",
    slug: "gulbagh-chanderi-anarkali-suit-set",
    name: "Gulbagh Chanderi Silk Anarkali Suit Set",
    category: "women",
    subcategory: "salwar-suit",
    description: "A breezy 48-inch kalidar anarkali kurta crafted from gossamer Chanderi silk with hand-block printed rose motifs and hand-embroidered gota patti neckline. Paired with modal silk churidar and sheer organza dupatta.",
    pricePaise: 1650000, // ₹16,500
    compareAtPricePaise: 1950000,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80"
    ],
    fallbackImage: "assets/images/products/fallback-women.svg",
    availableSizes: ["XS", "S", "M", "L", "XL", "XXL"],
    availableColors: [
      { name: "Blush Rose", hex: "#D68C93" },
      { name: "Ivory Sand", hex: "#E9DFD1" }
    ],
    availability: "in_stock",
    stockQuantity: 12,
    material: "Chanderi Silk & Mulmul Cotton Lining",
    careInstructions: "Gentle professional dry clean.",
    occasion: "Festive Celebration",
    featured: false,
    newArrival: true,
    bestseller: false,
    createdAt: "2026-03-05T14:15:00Z"
  },
  {
    id: "vas-w-005",
    slug: "sunehri-tissue-organza-silk-saree",
    name: "Sunehri Tissue Organza Silk Saree",
    category: "women",
    subcategory: "saree",
    description: "Luminous metallic gold tissue saree woven with gossamer silk warp and golden weft. Finished with micro-scalloped hand cutwork along all borders and paired with unstitched brocade blouse fabric.",
    pricePaise: 3100000, // ₹31,000
    compareAtPricePaise: 3600000,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80"
    ],
    fallbackImage: "assets/images/products/fallback-women.svg",
    availableSizes: ["Free Size (Unstitched Blouse)"],
    availableColors: [
      { name: "Champagne Gold", hex: "#D1B26F" },
      { name: "Rose Gold", hex: "#C7957E" }
    ],
    availability: "in_stock",
    stockQuantity: 4,
    material: "Pure Tissue Organza Silk",
    careInstructions: "Dry clean only. Do not steam press directly on tissue.",
    occasion: "Cocktail & Evening",
    featured: true,
    newArrival: false,
    bestseller: true,
    createdAt: "2026-01-28T16:00:00Z"
  },
  {
    id: "vas-w-006",
    slug: "mehrunissa-velvet-embroidered-gharara-set",
    name: "Mehrunissa Velvet Embroidered Gharara Set",
    category: "women",
    subcategory: "salwar-suit",
    description: "Evoking Awadhi royal court grandeur, this rich plum velvet kurta and flaring gharara features tilla threadwork, pearl bead accents, and a gossamer badla net dupatta with scalloped borders.",
    pricePaise: 4200000, // ₹42,000
    compareAtPricePaise: 4800000,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80"
    ],
    fallbackImage: "assets/images/products/fallback-women.svg",
    availableSizes: ["S", "M", "L", "XL"],
    availableColors: [
      { name: "Deep Plum", hex: "#3F1829" },
      { name: "Burgundy", hex: "#641E2B" }
    ],
    availability: "low_stock",
    stockQuantity: 2,
    material: "Pure Silk Velvet & Fine Net Dupatta",
    careInstructions: "Specialist dry clean only.",
    occasion: "Festive Celebration",
    featured: false,
    newArrival: false,
    bestseller: false,
    createdAt: "2026-02-02T11:20:00Z"
  },
  {
    id: "vas-w-007",
    slug: "aafreen-raw-silk-mirror-work-lehenga",
    name: "Aafreen Raw Silk Mirror-Work Lehenga",
    category: "women",
    subcategory: "lehenga",
    description: "Contemporary luxury meets Rajasthani heritage craft. Mustard ochre raw silk lehenga with authentic abhala (mirror) work, silk resham embroidery, and hand-pleated volume for effortless festive celebrations.",
    pricePaise: 5400000, // ₹54,000
    compareAtPricePaise: 6200000,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80"
    ],
    fallbackImage: "assets/images/products/fallback-women.svg",
    availableSizes: ["XS", "S", "M", "L", "XL"],
    availableColors: [
      { name: "Mustard Ochre", hex: "#C78B2E" },
      { name: "Tangerine Sunset", hex: "#D15E36" }
    ],
    availability: "in_stock",
    stockQuantity: 5,
    material: "Handwoven Raw Silk & Georgette Dupatta",
    careInstructions: "Dry clean only. Keep mirrors covered during pressing.",
    occasion: "Festive Celebration",
    featured: false,
    newArrival: true,
    bestseller: false,
    createdAt: "2026-02-25T08:00:00Z"
  },

  // MEN'S COLLECTION
  {
    id: "vas-m-001",
    slug: "shahi-raw-silk-ivory-sherwani-set",
    name: "Shahi Raw Silk Ivory Sherwani Set",
    category: "men",
    subcategory: "sherwani",
    description: "Regal ivory raw silk groom's sherwani adorned with tone-on-tone French knot resham embroidery, seed pearl detailing, and custom gilt metal buttons. Paired with chanderi churidar and pure georgette safa fabric.",
    pricePaise: 6500000, // ₹65,000
    compareAtPricePaise: 7500000,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=900&q=80"
    ],
    fallbackImage: "assets/images/products/fallback-men.svg",
    availableSizes: ["38", "40", "42", "44", "46"],
    availableColors: [
      { name: "Ivory Cream", hex: "#F3EDE4" },
      { name: "Antique Sand", hex: "#DECDB6" }
    ],
    availability: "in_stock",
    stockQuantity: 5,
    material: "100% Pure Raw Silk with Soft Cotton Lining",
    careInstructions: "Specialist dry clean only. Protect gilt buttons during pressing.",
    occasion: "Bridal & Wedding",
    featured: true,
    newArrival: false,
    bestseller: true,
    createdAt: "2026-01-10T11:00:00Z"
  },
  {
    id: "vas-m-002",
    slug: "badami-tussar-silk-kurta-churidar-set",
    name: "Badami Tussar Silk Kurta Churidar Set",
    category: "men",
    subcategory: "kurta-set",
    description: "Crafted in natural golden Tussar wild silk, this comfortable classic mandarin-collar kurta features delicate pintuck pleating along the placket and tone-on-tone thread accents. Complete with matching churidar pants.",
    pricePaise: 1250000, // ₹12,500
    compareAtPricePaise: 1500000,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80"
    ],
    fallbackImage: "assets/images/products/fallback-men.svg",
    availableSizes: ["38", "40", "42", "44", "46"],
    availableColors: [
      { name: "Badami Almond", hex: "#D6C3A5" },
      { name: "Natural Ivory", hex: "#EBE3D3" }
    ],
    availability: "in_stock",
    stockQuantity: 15,
    material: "Pure Handloom Tussar Silk",
    careInstructions: "Dry clean or gentle hand wash with neutral detergent.",
    occasion: "Festive Celebration",
    featured: false,
    newArrival: true,
    bestseller: true,
    createdAt: "2026-02-14T09:00:00Z"
  },
  {
    id: "vas-m-003",
    slug: "nawabi-jamdani-woven-nehru-bandi-jacket",
    name: "Nawabi Jamdani Woven Nehru Bandi Jacket",
    category: "men",
    subcategory: "nehru-jacket",
    description: "An authentic sleeveless Nehru jacket in structured matka silk, woven with geometric Jamdani motifs and fitted with bespoke antique brass buttons. Perfect layered over kurtas for evening soirees.",
    pricePaise: 1450000, // ₹14,500
    compareAtPricePaise: 1750000,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=900&q=80"
    ],
    fallbackImage: "assets/images/products/fallback-men.svg",
    availableSizes: ["38", "40", "42", "44"],
    availableColors: [
      { name: "Deep Charcoal", hex: "#292521" },
      { name: "Burgundy Wine", hex: "#641E2B" }
    ],
    availability: "in_stock",
    stockQuantity: 9,
    material: "Handwoven Matka Silk",
    careInstructions: "Dry clean only.",
    occasion: "Festive Celebration",
    featured: true,
    newArrival: false,
    bestseller: false,
    createdAt: "2026-01-20T15:30:00Z"
  },
  {
    id: "vas-m-004",
    slug: "midnight-navy-velvet-bandhgala-suit",
    name: "Midnight Navy Velvet Jodhpuri Bandhgala",
    category: "men",
    subcategory: "sherwani",
    description: "Tailored to sharp imperial precision in deep midnight velvet. Features a closed high collar with subtle gold piping, structured shoulders, and bespoke monogram buttons. Paired with tailored wool-blend trousers.",
    pricePaise: 4800000, // ₹48,000
    compareAtPricePaise: 5500000,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80"
    ],
    fallbackImage: "assets/images/products/fallback-men.svg",
    availableSizes: ["38", "40", "42", "44", "46"],
    availableColors: [
      { name: "Midnight Navy", hex: "#162032" },
      { name: "Imperial Onyx", hex: "#1B1917" }
    ],
    availability: "in_stock",
    stockQuantity: 4,
    material: "Micro Velvet & Japanese Cupro Lining",
    careInstructions: "Professional dry clean only. Steam with cloth guard.",
    occasion: "Cocktail & Evening",
    featured: false,
    newArrival: true,
    bestseller: false,
    createdAt: "2026-02-28T13:45:00Z"
  },
  {
    id: "vas-m-005",
    slug: "saffron-chanderi-silk-angrakha-kurta",
    name: "Saffron Chanderi Silk Angrakha Kurta Set",
    category: "men",
    subcategory: "kurta-set",
    description: "Inspired by Mughal court silhouettes, this overlapping crossover Angrakha kurta in auspicious saffron silk features hand-twisted fabric tie-ups and gold zari borders. Includes matching tapered aligarhi pyjamas.",
    pricePaise: 1850000, // ₹18,500
    compareAtPricePaise: 2200000,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=900&q=80"
    ],
    fallbackImage: "assets/images/products/fallback-men.svg",
    availableSizes: ["38", "40", "42", "44"],
    availableColors: [
      { name: "Kesariya Saffron", hex: "#DD7A2C" },
      { name: "Turmeric Gold", hex: "#C59B27" }
    ],
    availability: "in_stock",
    stockQuantity: 7,
    material: "Chanderi Silk Blend with Cotton Lining",
    careInstructions: "Dry clean recommended.",
    occasion: "Traditional Rituals",
    featured: false,
    newArrival: false,
    bestseller: false,
    createdAt: "2026-01-05T10:00:00Z"
  },
  {
    id: "vas-m-006",
    slug: "pistachio-green-embroidered-silk-kurta-set",
    name: "Pistachio Green Embroidered Silk Kurta Set",
    category: "men",
    subcategory: "kurta-set",
    description: "Contemporary festive kurta crafted in subtle pastel pistachio dupion silk, highlighted with geometric thread embroidery around collar and cuffs. Comfortable breathable tailored fit.",
    pricePaise: 1550000, // ₹15,500
    compareAtPricePaise: 1800000,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80"
    ],
    fallbackImage: "assets/images/products/fallback-men.svg",
    availableSizes: ["38", "40", "42", "44", "46"],
    availableColors: [
      { name: "Pistachio Green", hex: "#94AB89" },
      { name: "Sage Mist", hex: "#7E9675" }
    ],
    availability: "in_stock",
    stockQuantity: 11,
    material: "Dupion Art Silk & Cotton Lining",
    careInstructions: "Dry clean only.",
    occasion: "Festive Celebration",
    featured: false,
    newArrival: true,
    bestseller: false,
    createdAt: "2026-03-02T16:00:00Z"
  },

  // KIDS' COLLECTION
  {
    id: "vas-k-001",
    slug: "gulabi-chanderi-gota-patti-girls-lehenga",
    name: "Gulabi Chanderi Gota Patti Girls Lehenga Set",
    category: "kids",
    subcategory: "lehenga",
    description: "Designed for effortless elegance and comfort. Soft baby pink chanderi lehenga with authentic Jaipur gota patti borders, gentle elasticated waistband, breathable cotton lining, and lightweight pre-draped net dupatta.",
    pricePaise: 890000, // ₹8,900
    compareAtPricePaise: 1100000,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80"
    ],
    fallbackImage: "assets/images/products/fallback-kids.svg",
    availableSizes: ["2-3 Yrs", "4-5 Yrs", "6-7 Yrs", "8-9 Yrs", "10-12 Yrs"],
    availableColors: [
      { name: "Gulabi Pink", hex: "#E89AA8" },
      { name: "Pari Peach", hex: "#F2B8A0" }
    ],
    availability: "in_stock",
    stockQuantity: 14,
    material: "Chanderi Silk with 100% Cotton Malmal Voile Lining",
    careInstructions: "Gentle dry clean. Iron on reverse low heat.",
    occasion: "Festive Celebration",
    featured: true,
    newArrival: false,
    bestseller: true,
    createdAt: "2026-01-18T14:00:00Z"
  },
  {
    id: "vas-k-002",
    slug: "royal-blue-brocade-boys-kurta-dhoti-set",
    name: "Royal Blue Brocade Boys Kurta Dhoti Set",
    category: "kids",
    subcategory: "kurta-set",
    description: "Dapper celebratory festive attire for young boys. Rich royal blue woven banarasi brocade kurta paired with ready-to-wear pre-stitched pleated dhoti pants with elastic waistband for playful freedom of movement.",
    pricePaise: 750000, // ₹7,500
    compareAtPricePaise: 950000,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=80"
    ],
    fallbackImage: "assets/images/products/fallback-kids.svg",
    availableSizes: ["2-3 Yrs", "4-5 Yrs", "6-7 Yrs", "8-9 Yrs", "10-12 Yrs"],
    availableColors: [
      { name: "Royal Sapphire", hex: "#1C3F73" },
      { name: "Mor Pankh Teal", hex: "#155866" }
    ],
    availability: "in_stock",
    stockQuantity: 10,
    material: "Brocade Silk Blend with Soft Cotton Voile Lining",
    careInstructions: "Dry clean only.",
    occasion: "Festive Celebration",
    featured: false,
    newArrival: true,
    bestseller: true,
    createdAt: "2026-02-12T11:30:00Z"
  },
  {
    id: "vas-k-003",
    slug: "haldi-yellow-silk-boys-sherwani-jacket-set",
    name: "Haldi Yellow Silk Boys Sherwani Jacket Set",
    category: "kids",
    subcategory: "sherwani",
    description: "Sunny haldi yellow raw silk Nehru jacket with miniature metallic thread floral motifs, worn over an ivory mulmul kurta and comfortable tapered pants.",
    pricePaise: 820000, // ₹8,200
    compareAtPricePaise: 990000,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80"
    ],
    fallbackImage: "assets/images/products/fallback-kids.svg",
    availableSizes: ["2-3 Yrs", "4-5 Yrs", "6-7 Yrs", "8-9 Yrs"],
    availableColors: [
      { name: "Haldi Yellow", hex: "#EBB12F" },
      { name: "Sunlit Ochre", hex: "#D49826" }
    ],
    availability: "in_stock",
    stockQuantity: 8,
    material: "Raw Silk Blend Jacket & Pure Cotton Kurta",
    careInstructions: "Dry clean.",
    occasion: "Bridal & Wedding",
    featured: false,
    newArrival: true,
    bestseller: false,
    createdAt: "2026-02-20T10:00:00Z"
  },
  {
    id: "vas-k-004",
    slug: "rani-pink-bandhani-printed-girls-anarkali-set",
    name: "Rani Pink Bandhani Silk Girls Anarkali Set",
    category: "kids",
    subcategory: "salwar-suit",
    description: "Celebration-ready traditional bandhani tie-dye printed georgette anarkali with mirror lace trimming, comfortable cotton churidar, and feather-light dupatta with latkan tassels.",
    pricePaise: 790000, // ₹7,900
    compareAtPricePaise: 950000,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80"
    ],
    fallbackImage: "assets/images/products/fallback-kids.svg",
    availableSizes: ["2-3 Yrs", "4-5 Yrs", "6-7 Yrs", "8-9 Yrs", "10-12 Yrs"],
    availableColors: [
      { name: "Rani Pink", hex: "#B82361" },
      { name: "Phirozi Cyan", hex: "#1C8899" }
    ],
    availability: "in_stock",
    stockQuantity: 12,
    material: "Soft Art Georgette with Pure Cotton Lining",
    careInstructions: "Gentle wash or dry clean.",
    occasion: "Festive Celebration",
    featured: false,
    newArrival: false,
    bestseller: false,
    createdAt: "2026-01-25T14:45:00Z"
  }
];

function loadStoredCustomProducts() {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem("vastraa_custom_products");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function loadStockOverrides() {
  if (typeof window === "undefined" || !window.localStorage) return {};
  try {
    const raw = localStorage.getItem("vastraa_stock_overrides");
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function loadProductOverrides() {
  if (typeof window === "undefined" || !window.localStorage) return {};
  try {
    const raw = localStorage.getItem("vastraa_product_overrides");
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

// Build dynamic PRODUCTS combining custom admin items with initial stock and overrides
export function buildProductsList() {
  const custom = loadStoredCustomProducts();
  const overrides = loadProductOverrides();
  const stockOverrides = loadStockOverrides();

  // Combine custom with cloned initial items
  const combined = [...custom, ...INITIAL_PRODUCTS.map(p => ({ ...p }))];

  // Filter out any explicitly deleted items
  const active = combined.filter(p => !overrides[p.id]?._deleted);

  // Apply general property overrides and stock overrides
  for (const item of active) {
    if (overrides[item.id]) {
      Object.assign(item, overrides[item.id]);
    }
    if (stockOverrides[item.id]) {
      if (typeof stockOverrides[item.id].stockQuantity === "number") {
        item.stockQuantity = stockOverrides[item.id].stockQuantity;
      }
      if (stockOverrides[item.id].availability) {
        item.availability = stockOverrides[item.id].availability;
      }
    }
  }

  return active;
}

// Export dynamic PRODUCTS array
export const PRODUCTS = buildProductsList();

/**
 * Reload catalogue in-place from storage
 */
export function reloadCatalogue() {
  const updated = buildProductsList();
  PRODUCTS.length = 0;
  PRODUCTS.push(...updated);
  return PRODUCTS;
}

// Cross-tab and in-memory event listeners for instant synchronization
if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("storage", (e) => {
    if (e.key === "vastraa_custom_products" || e.key === "vastraa_stock_overrides" || e.key === "vastraa_product_overrides") {
      reloadCatalogue();
      window.dispatchEvent(new CustomEvent("vastraa:catalogue-updated"));
    }
  });

  window.addEventListener("vastraa:stock-updated", (e) => {
    if (e.detail?.productId) {
      const target = PRODUCTS.find(p => p.id === e.detail.productId);
      if (target) {
        if (typeof e.detail.stockQuantity === "number") target.stockQuantity = e.detail.stockQuantity;
        if (e.detail.availability) target.availability = e.detail.availability;
      }
    }
  });
}

/**
 * Add a new custom ensemble to the catalogue (Admin action).
 */
export function addCustomProduct(newProduct) {
  if (typeof window === "undefined" || !window.localStorage) return newProduct;
  const list = loadStoredCustomProducts();
  list.unshift(newProduct);
  window.localStorage.setItem("vastraa_custom_products", JSON.stringify(list));
  PRODUCTS.unshift(newProduct);
  if (typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new CustomEvent("vastraa:catalogue-updated", { detail: { product: newProduct } }));
  }
  return newProduct;
}

/**
 * Update any product's properties (title, price, image, sizes, materials, etc.)
 */
export function updateProduct(productId, updatedFields) {
  if (typeof window === "undefined" || !window.localStorage) return null;
  const customList = loadStoredCustomProducts();
  const customIdx = customList.findIndex(p => p.id === productId);

  if (customIdx !== -1) {
    // Update in custom products list directly
    customList[customIdx] = { ...customList[customIdx], ...updatedFields };
    window.localStorage.setItem("vastraa_custom_products", JSON.stringify(customList));
  } else {
    // Save in general product overrides for seed products
    const overrides = loadProductOverrides();
    overrides[productId] = { ...(overrides[productId] || {}), ...updatedFields };
    window.localStorage.setItem("vastraa_product_overrides", JSON.stringify(overrides));
  }

  // Update in-memory PRODUCTS array
  const target = PRODUCTS.find(p => p.id === productId);
  if (target) {
    Object.assign(target, updatedFields);
  }

  if (typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new CustomEvent("vastraa:catalogue-updated", { detail: { productId, updatedFields } }));
  }
  return target || updatedFields;
}

/**
 * Update stock count and status for any product (Admin action).
 */
export function updateProductStock(productId, newQuantity, newStatus) {
  if (typeof window === "undefined" || !window.localStorage) return;
  const overrides = loadStockOverrides();
  const qty = Math.max(0, parseInt(newQuantity, 10) || 0);
  const status = newStatus || (qty > 0 ? "in_stock" : "out_of_stock");
  overrides[productId] = { stockQuantity: qty, availability: status };
  window.localStorage.setItem("vastraa_stock_overrides", JSON.stringify(overrides));
  const target = PRODUCTS.find(p => p.id === productId);
  if (target) {
    target.stockQuantity = qty;
    target.availability = status;
  }
  if (typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new CustomEvent("vastraa:stock-updated", { detail: { productId, stockQuantity: qty, availability: status } }));
  }
}

/**
 * Delete or archive any product from the catalogue (Admin action).
 */
export function deleteProduct(productId) {
  if (typeof window === "undefined" || !window.localStorage) return false;
  const customList = loadStoredCustomProducts();
  const customIdx = customList.findIndex(p => p.id === productId);

  if (customIdx !== -1) {
    const remaining = customList.filter(p => p.id !== productId);
    window.localStorage.setItem("vastraa_custom_products", JSON.stringify(remaining));
  } else {
    const overrides = loadProductOverrides();
    overrides[productId] = { ...(overrides[productId] || {}), _deleted: true };
    window.localStorage.setItem("vastraa_product_overrides", JSON.stringify(overrides));
  }

  const idx = PRODUCTS.findIndex(p => p.id === productId);
  if (idx !== -1) {
    PRODUCTS.splice(idx, 1);
  }
  if (typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new CustomEvent("vastraa:catalogue-updated"));
  }
  return true;
}

export const deleteCustomProduct = deleteProduct;

/**
 * Reset catalogue back to initial pristine seed data.
 */
export function resetCatalogueToDefault() {
  if (typeof window === "undefined" || !window.localStorage) return;
  window.localStorage.removeItem("vastraa_custom_products");
  window.localStorage.removeItem("vastraa_stock_overrides");
  window.localStorage.removeItem("vastraa_product_overrides");
  PRODUCTS.length = 0;
  PRODUCTS.push(...INITIAL_PRODUCTS.map(p => ({ ...p })));
  if (typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new CustomEvent("vastraa:catalogue-updated"));
  }
}

/**
 * Format integer paise into INR formatted currency string.
 * Example: 2850000 paise -> "₹28,500"
 */
export function formatPrice(pricePaise) {
  if (typeof pricePaise !== "number" || isNaN(pricePaise)) return "₹0";
  const rupees = Math.round(pricePaise / 100);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(rupees);
}

/**
 * Calculate discount percentage between compare-at price and selling price.
 */
export function calculateDiscount(pricePaise, compareAtPricePaise) {
  if (!compareAtPricePaise || compareAtPricePaise <= pricePaise) return 0;
  return Math.round(((compareAtPricePaise - pricePaise) / compareAtPricePaise) * 100);
}

/**
 * Find product by slug
 */
export function getProductBySlug(slug) {
  if (!slug) return null;
  const p = PRODUCTS.find(prod => prod.slug.toLowerCase() === slug.toLowerCase().trim());
  if (p && typeof window !== "undefined" && window.localStorage) {
    const stockOverrides = loadStockOverrides();
    if (stockOverrides[p.id]) {
      if (typeof stockOverrides[p.id].stockQuantity === "number") {
        p.stockQuantity = stockOverrides[p.id].stockQuantity;
      }
      if (stockOverrides[p.id].availability) {
        p.availability = stockOverrides[p.id].availability;
      }
    }
  }
  return p || null;
}

/**
 * Find product by ID
 */
export function getProductById(id) {
  if (!id) return null;
  const p = PRODUCTS.find(prod => prod.id === id);
  if (p && typeof window !== "undefined" && window.localStorage) {
    const stockOverrides = loadStockOverrides();
    if (stockOverrides[id]) {
      if (typeof stockOverrides[id].stockQuantity === "number") {
        p.stockQuantity = stockOverrides[id].stockQuantity;
      }
      if (stockOverrides[id].availability) {
        p.availability = stockOverrides[id].availability;
      }
    }
  }
  return p || null;
}

/**
 * Retrieve related products for a given product
 */
export function getRelatedProducts(product, limit = 4) {
  if (!product) return [];
  return PRODUCTS
    .filter(p => p.id !== product.id && (p.category === product.category || p.occasion === product.occasion))
    .slice(0, limit);
}
