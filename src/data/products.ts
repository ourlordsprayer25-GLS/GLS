import { Product } from '../types/store';

// Image references
import choreCoatImg from '../assets/images/product_chore_coat_1790116559808.jpg';
import merinoKnitImg from '../assets/images/product_merino_knit_1790116576108.jpg';
import leatherToteImg from '../assets/images/product_leather_tote_1790116587937.jpg';
import woolTrenchImg from '../assets/images/wool_trench_coat_1790117159378.jpg';
import leatherWeekenderImg from '../assets/images/leather_weekend_bag_1790117170382.jpg';
import audiophileHeadphonesImg from '../assets/images/audiophile_headphones_1790153788692.jpg';
import smartEspressoImg from '../assets/images/smart_espresso_machine_1790153803517.jpg';
import smartAirPurifierImg from '../assets/images/smart_air_purifier_1790153815905.jpg';
import inductionKettleImg from '../assets/images/induction_kettle_1790153828614.jpg';

// Newly generated multi-department high-fidelity assets
import heroBannerImg from '../assets/images/general_department_hero_banner_1790694250421.jpg';
import synthImg from '../assets/images/musical_analog_synthesizer_1790694264160.jpg';
import turntableImg from '../assets/images/musical_vinyl_turntable_1790694276533.jpg';
import robotVacuumImg from '../assets/images/smart_robot_vacuum_station_1790694287531.jpg';
import studioMonitorsImg from '../assets/images/studio_monitor_speakers_1790694302203.jpg';

export const HERO_BANNER_IMAGE = heroBannerImg;

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-analog-synth',
    slug: 'polyphonic-analog-synthesizer',
    name: 'Polyphonic Analog Synthesizer',
    subtitle: '8-voice analog synthesizer with walnut end cheeks and discrete filters.',
    tagline: 'Pure analog warmth and sound design capability.',
    price: 1890,
    category: 'musical',
    categoryLabel: 'Musical Instruments',
    department: 'Music & Studio',
    brand: 'GLADYNS Studio',
    tag: 'Spotlight',
    description: 'A genuine 8-voice polyphonic analog synthesizer featuring discrete VCOs, classic ladder low-pass filters, dual LFOs, and custom walnut side panels. Built for professional composers, sound designers, and stage performers.',
    details: [
      '8 Discrete True-Analog Voices',
      'Solid American Walnut End Cheeks',
      'Dual multi-wave VCOs per voice with hard sync',
      '61-key semi-weighted keybed with polyphonic aftertouch',
      'Stereo analog BBD chorus and studio reverb'
    ],
    materials: 'Brushed Aluminum Chassis, Solid Walnut',
    care: 'Keep in dry studio environment; clean with lint-free microfiber',
    primaryImage: synthImg,
    images: [{ url: synthImg, alt: 'Polyphonic Analog Synthesizer' }],
    colors: [{ id: 'walnut-silver', name: 'Walnut & Silver', colorHex: '#451a03', inStock: true }],
    sizes: [{ name: '61-Key', inStock: true }],
    rating: 5.0,
    reviewCount: 34,
    reviews: [],
    featured: true,
    madeIn: 'Germany'
  },
  {
    id: 'prod-vinyl-turntable',
    slug: 'direct-drive-audiophile-turntable',
    name: 'Direct-Drive Audiophile Turntable',
    subtitle: 'Precision decoupled direct-drive turntable with carbon tonearm.',
    tagline: 'Pure vinyl acoustics and silent motor engineering.',
    price: 1450,
    category: 'musical',
    categoryLabel: 'Musical Instruments & Hi-Fi',
    department: 'Music & Studio',
    brand: 'GLADYNS Acoustics',
    tag: 'Bestseller',
    description: 'Engineered for true analog purists. Features a coreless direct-drive motor, high-mass resonance-damped aluminum platter, 9-inch carbon fiber tonearm, and pre-mounted microline diamond cartridge.',
    details: [
      'Coreless Ultra-Silent Direct Drive Motor',
      'Solid Walnut & High-Mass MDF Plinth',
      '9-inch Carbon Fiber Low-Resonance Tonearm',
      'Gold-plated RCA outputs and built-in switchable phono stage',
      '33 1/3, 45, and 78 RPM speed selector'
    ],
    materials: 'Solid Walnut Plinth, Carbon Fiber, Anodized Aluminum',
    care: 'Dust gently with antistatic brush',
    primaryImage: turntableImg,
    images: [{ url: turntableImg, alt: 'Direct-Drive Audiophile Turntable' }],
    colors: [{ id: 'walnut-gold', name: 'Walnut Gold', colorHex: '#78350f', inStock: true }],
    sizes: [{ name: 'Standard', inStock: true }],
    rating: 4.9,
    reviewCount: 48,
    reviews: [],
    featured: true,
    madeIn: 'Japan'
  },
  {
    id: 'prod-audiophile-headphones',
    slug: 'planar-magnetic-headphones',
    name: 'Planar Magnetic Studio Headphones',
    subtitle: 'High-fidelity acoustic precision with open-back architecture.',
    tagline: 'Studio-grade audio for the discerning ear.',
    price: 1200,
    category: 'electronics',
    categoryLabel: 'Electronics & Audio',
    department: 'Electronics',
    brand: 'GLADYNS Sound',
    tag: 'Bestseller',
    description: 'Featuring massive 100mm planar magnetic drivers and a suspension head-strap for extreme comfort during long mastering sessions. Wide acoustic soundstage and transparent response.',
    details: [
      '100mm Planar Magnetic Drivers',
      'Open-back planar transducer architecture',
      'Hand-stitched breathable lambskin ear cushions',
      'Ultra-wide frequency response: 5Hz – 50kHz',
      'Balanced 4.4mm Pentaconn & 6.35mm braided OFC cables included'
    ],
    materials: 'Aerospace Magnesium, Fine Italian Leather',
    care: 'Wipe with microfiber cloth',
    primaryImage: audiophileHeadphonesImg,
    images: [{ url: audiophileHeadphonesImg, alt: 'Planar Magnetic Studio Headphones' }],
    colors: [{ id: 'onyx', name: 'Onyx Black', colorHex: '#18181b', inStock: true }],
    sizes: [{ name: 'One Size', inStock: true }],
    rating: 5.0,
    reviewCount: 62,
    reviews: [],
    featured: true,
    madeIn: 'USA'
  },
  {
    id: 'prod-studio-monitors',
    slug: 'active-ribbon-studio-monitors',
    name: 'Active Ribbon Studio Monitors (Pair)',
    subtitle: 'Bi-amplified reference nearfield monitors with AMT ribbon tweeters.',
    tagline: 'Transparent acoustics for mixing and audiophile listening.',
    price: 1650,
    category: 'electronics',
    categoryLabel: 'Electronics & Audio',
    department: 'Electronics',
    brand: 'GLADYNS Acoustics',
    tag: 'Studio Grade',
    description: 'A pair of bi-amplified active reference monitors designed for critical mastering, home recording, and reference music listening. Powered by Class-D amplification with DSP acoustic room-tuning.',
    details: [
      'Air Motion Transformer (AMT) Ribbon Tweeters',
      '7-inch Carbon Fiber/Rohacell Sandwich Woofers',
      'Bi-amplified 250W Class-D RMS per speaker',
      'XLR, TRS Balanced, and Optical Digital inputs',
      'Integrated OLED room calibration EQ'
    ],
    materials: 'Birch Plywood Enclosure, Matte Black Acoustic Baffle',
    care: 'Keep away from direct heat sources',
    primaryImage: studioMonitorsImg,
    images: [{ url: studioMonitorsImg, alt: 'Active Ribbon Studio Monitors' }],
    colors: [{ id: 'birch-black', name: 'Birch & Matte Black', colorHex: '#27272a', inStock: true }],
    sizes: [{ name: 'Pair', inStock: true }],
    rating: 4.9,
    reviewCount: 29,
    reviews: [],
    featured: false,
    madeIn: 'Denmark'
  },
  {
    id: 'prod-smart-espresso',
    slug: 'dual-boiler-espresso-machine',
    name: 'Dual-Boiler Espresso Machine',
    subtitle: 'Commercial-grade engineering with dual PID climate control.',
    tagline: 'The pinnacle of home barista technology.',
    price: 3200,
    category: 'appliances',
    categoryLabel: 'Home Appliances',
    department: 'Appliances',
    brand: 'GLADYNS Atelier',
    tag: 'Exclusive',
    description: 'A dual-boiler powerhouse featuring independent steam and brew boilers with PID temperature control and an integrated pressure transducer for real-time extraction profiling via smartphone app.',
    details: [
      'Independent Dual Stainless Steel Boilers',
      'Dual PID Temperature Stability (±0.2°C)',
      'Rotary pump with direct water line connection kit',
      'Real-time extraction profiling with digital pressure transducer',
      'Solid walnut portafilter handles and steam knobs'
    ],
    materials: '304 Mirror Polished Stainless Steel, Walnut Wood',
    care: 'Regular backflushing and descaling recommended',
    primaryImage: smartEspressoImg,
    images: [{ url: smartEspressoImg, alt: 'Dual-Boiler Espresso Machine' }],
    colors: [{ id: 'silver', name: 'Mirror Stainless', colorHex: '#d4d4d8', inStock: true }],
    sizes: [{ name: 'Standard', inStock: true }],
    rating: 4.9,
    reviewCount: 56,
    reviews: [],
    featured: true,
    madeIn: 'Italy'
  },
  {
    id: 'prod-smart-air-purifier',
    slug: 'smart-hepa-air-purifier',
    name: 'HEPA 13 Smart Air Purifier',
    subtitle: 'Quiet dual-turbine 360-degree filtration with real-time AQI display.',
    tagline: 'Architectural clean air engineering for the modern home.',
    price: 490,
    category: 'appliances',
    categoryLabel: 'Home Appliances',
    department: 'Appliances',
    brand: 'GLADYNS Pure',
    tag: 'Smart Home',
    description: 'Engineered for open spaces up to 1,200 sq ft. Features a medical-grade True HEPA H13 filter with coconut shell activated carbon, laser particle sensor, and whisper-quiet brushless motor operating at 19dB in sleep mode.',
    details: [
      'Medical-grade H13 True HEPA + Activated Carbon Filter',
      'Laser PM2.5 & VOC ambient air quality sensor',
      'Dual-turbine centrifugal fan system (CADR 550 m³/h)',
      'App and voice assistant compatible (Wi-Fi + Matter)',
      'Acoustic sleep mode at 19 dB'
    ],
    materials: 'Anodized Aluminum Cylindrical Housing, Recycled ABS',
    care: 'Replace filter every 6-12 months',
    primaryImage: smartAirPurifierImg,
    images: [{ url: smartAirPurifierImg, alt: 'HEPA 13 Smart Air Purifier' }],
    colors: [{ id: 'graphite', name: 'Space Gray', colorHex: '#3f3f46', inStock: true }],
    sizes: [{ name: 'Standard (Up to 1200 sq ft)', inStock: true }],
    rating: 4.8,
    reviewCount: 77,
    reviews: [],
    featured: false,
    madeIn: 'Sweden'
  },
  {
    id: 'prod-robot-vacuum',
    slug: 'lidar-smart-robot-vacuum-station',
    name: 'LiDAR Smart Robot Vacuum & Mop Station',
    subtitle: '8000Pa suction with automated hot-water mop washing and auto-empty dock.',
    tagline: 'Autonomous home cleanliness, fully hands-free.',
    price: 1150,
    category: 'appliances',
    categoryLabel: 'Home Appliances',
    department: 'Appliances',
    brand: 'GLADYNS Home',
    tag: 'New Drop',
    description: 'Experience effortless home maintenance. Featuring 8000Pa hyper-suction, dual high-speed pressurized spinning mop pads, 3D LiDAR obstacle avoidance, and an all-in-one docking station that automatically empties dust, washes mop pads with 60°C hot water, and heat-dries them.',
    details: [
      '8000Pa Hyper-Suction Motor',
      'Dual High-Speed Pressurized Rotary Mops (180 RPM)',
      'All-in-One Auto-Empty, Hot Water Wash & Hot Air Dry Station',
      'AI LiDAR 3.0 Real-Time 3D Obstacle Avoidance',
      '3.5-Liter Clean & Dirty Water Tanks'
    ],
    materials: 'Matte Graphite Composite, Brushed Bronze Accents',
    care: 'Empty dirty water tank weekly',
    primaryImage: robotVacuumImg,
    images: [{ url: robotVacuumImg, alt: 'LiDAR Smart Robot Vacuum & Mop Station' }],
    colors: [{ id: 'graphite-bronze', name: 'Matte Graphite', colorHex: '#27272a', inStock: true }],
    sizes: [{ name: 'Full Station Kit', inStock: true }],
    rating: 4.9,
    reviewCount: 43,
    reviews: [],
    featured: false,
    madeIn: 'South Korea'
  },
  {
    id: 'prod-induction-kettle',
    slug: 'precision-gooseneck-induction-kettle',
    name: 'Precision Gooseneck Smart Kettle',
    subtitle: 'Variable temperature control with integrated brew timer and OLED dial.',
    tagline: 'Craft pouring precision for pour-overs and teas.',
    price: 195,
    category: 'appliances',
    categoryLabel: 'Home Appliances',
    department: 'Appliances',
    brand: 'GLADYNS Atelier',
    tag: 'Barista Tool',
    description: 'Designed for specialty coffee baristas and fine tea connoisseurs. Offers single-degree temperature adjustments (40°C – 100°C), 60-minute keep-warm mode, and an ergonomically balanced counterbalanced handle.',
    details: [
      '1200W Rapid-Boil Base with OLED Display',
      'Single-degree temperature accuracy (104°F – 212°F)',
      'Precision fluted gooseneck spout for laminar pour flow',
      '304 Food-grade stainless steel interior',
      'Integrated stopwatch brew timer'
    ],
    materials: '304 Stainless Steel, Matte Powdercoat, Walnut Accents',
    care: 'Hand wash exterior; descale with vinegar periodically',
    primaryImage: inductionKettleImg,
    images: [{ url: inductionKettleImg, alt: 'Precision Gooseneck Smart Kettle' }],
    colors: [{ id: 'matte-black', name: 'Matte Black', colorHex: '#18181b', inStock: true }],
    sizes: [{ name: '0.9 Liter', inStock: true }],
    rating: 4.9,
    reviewCount: 112,
    reviews: [],
    featured: false,
    madeIn: 'Japan'
  },
  {
    id: 'prod-chore-coat',
    slug: 'japanese-twill-chore-coat',
    name: 'Japanese Selvedge Twill Chore Coat',
    subtitle: 'Classic utility in custom-milled 14.5oz selvedge twill with corozo buttons.',
    tagline: 'The definitive foundation of timeless utility wardrobe.',
    price: 245,
    category: 'apparel',
    categoryLabel: 'Fashion & Apparel',
    department: 'Apparel',
    brand: 'GLADYNS Atelier',
    tag: 'Bestseller',
    description: 'A structural masterpiece crafted from heavyweight Japanese selvedge twill. Featuring reinforced internal pockets, corozo nut hardware, and triple-needle stitched seams.',
    details: ['14.5oz Japanese Selvedge Twill', 'Reinforced internal pockets', 'Corozo nut hardware', 'Triple-needle stitched seams'],
    materials: '100% Organic Cotton',
    care: 'Dry clean or cold gentle wash, hang dry',
    primaryImage: choreCoatImg,
    images: [{ url: choreCoatImg, alt: 'Japanese Selvedge Twill Chore Coat' }],
    colors: [{ id: 'navy', name: 'Navy', colorHex: '#1e1b4b', inStock: true }],
    sizes: [{ name: 'S', inStock: true }, { name: 'M', inStock: true }, { name: 'L', inStock: true }, { name: 'XL', inStock: true }],
    rating: 4.9,
    reviewCount: 124,
    reviews: [],
    featured: false,
    madeIn: 'Portugal'
  },
  {
    id: 'prod-wool-trench',
    slug: 'architectural-wool-trench',
    name: 'Architectural Wool Overcoat',
    subtitle: 'Italian double-faced virgin wool in a structured tailored silhouette.',
    tagline: 'Precision tailoring for cold-weather elegance.',
    price: 850,
    category: 'apparel',
    categoryLabel: 'Fashion & Apparel',
    department: 'Apparel',
    brand: 'GLADYNS Sartorial',
    tag: 'Tailored Cut',
    description: 'An unlined trench coat featuring precision split-seam construction. Crafted from double-faced virgin wool for maximum insulation without burdensome weight.',
    details: ['Double-faced Italian virgin wool', 'Split-seam construction', 'Adjustable storm flaps', 'Concealed button placket'],
    materials: '100% Virgin Wool',
    care: 'Professional dry clean only',
    primaryImage: woolTrenchImg,
    images: [{ url: woolTrenchImg, alt: 'Architectural Wool Overcoat' }],
    colors: [{ id: 'camel', name: 'Camel', colorHex: '#c19a6b', inStock: true }],
    sizes: [{ name: 'S', inStock: true }, { name: 'M', inStock: true }, { name: 'L', inStock: true }],
    rating: 4.8,
    reviewCount: 42,
    reviews: [],
    featured: false,
    madeIn: 'Italy'
  },
  {
    id: 'prod-merino-knit',
    slug: 'fisherman-merino-knit',
    name: 'Fisherman Merino Wool Knit',
    subtitle: '7-gauge ribbed knit in premium Tasmanian merino wool.',
    tagline: 'Enduring warmth, engineered silhouette.',
    price: 185,
    category: 'apparel',
    categoryLabel: 'Fashion & Apparel',
    department: 'Apparel',
    brand: 'GLADYNS Atelier',
    tag: 'Archival',
    description: 'Engineered with a heavy 7-gauge fisherman rib, this sweater provides exceptional thermoregulation and maintains its structure for years of wear.',
    details: ['7-gauge Fisherman Rib', 'Tasmanian Merino Wool', 'RWS Certified', 'Hand-linked seams'],
    materials: '100% Merino Wool',
    care: 'Hand wash cold, dry flat',
    primaryImage: merinoKnitImg,
    images: [{ url: merinoKnitImg, alt: 'Fisherman Merino Wool Knit' }],
    colors: [{ id: 'olive', name: 'Deep Olive', colorHex: '#3f6212', inStock: true }],
    sizes: [{ name: 'S', inStock: true }, { name: 'M', inStock: true }, { name: 'L', inStock: true }],
    rating: 4.7,
    reviewCount: 89,
    reviews: [],
    featured: false,
    madeIn: 'Portugal'
  },
  {
    id: 'prod-leather-weekender',
    slug: 'tuscan-leather-weekender',
    name: 'Tuscan Leather Weekender Bag',
    subtitle: 'Hand-burnished full-grain vegetable-tanned travel carry.',
    tagline: 'Designed to patinate beautifully, built to travel.',
    price: 650,
    category: 'leather-goods',
    categoryLabel: 'Leather Goods & Accessories',
    department: 'Accessories',
    brand: 'GLADYNS Leathercraft',
    tag: 'Heritage Leather',
    description: 'A classic cabin-sized weekender crafted from 3.5mm thick Tuscan vegetable-tanned leather. Features solid brass hardware, YKK Excella zippers, and reinforced base studs.',
    details: ['Full-grain Tuscan Leather', 'Solid brass hardware', 'Reinforced base with studs', 'Internal laptop sleeve and passport slot'],
    materials: 'Vegetable-Tanned Full Grain Leather',
    care: 'Condition once a season with beeswax balm',
    primaryImage: leatherWeekenderImg,
    images: [{ url: leatherWeekenderImg, alt: 'Tuscan Leather Weekender Bag' }],
    colors: [{ id: 'mahogany', name: 'Mahogany', colorHex: '#451a03', inStock: true }],
    sizes: [{ name: 'One Size (45L)', inStock: true }],
    rating: 4.9,
    reviewCount: 67,
    reviews: [],
    featured: false,
    madeIn: 'Italy'
  },
  {
    id: 'prod-leather-tote',
    slug: 'architectural-leather-tote',
    name: 'Architectural Daily Leather Tote',
    subtitle: 'Structured everyday carry in durable bridle leather.',
    tagline: 'Minimalist architecture for daily essentials.',
    price: 380,
    category: 'leather-goods',
    categoryLabel: 'Leather Goods & Accessories',
    department: 'Accessories',
    brand: 'GLADYNS Leathercraft',
    tag: 'Daily Carry',
    description: 'Engineered with clean architectural lines, dual carry handles, magnetic top closure, and a dedicated padded 15-inch laptop compartment.',
    details: ['Bridle Full-Grain Leather', 'Magnetic German Fidlock closure', 'Padded 15-inch laptop sleeve', 'Reinforced dual shoulder straps'],
    materials: 'Full-Grain Bridle Leather',
    care: 'Wipe with damp cloth',
    primaryImage: leatherToteImg,
    images: [{ url: leatherToteImg, alt: 'Architectural Daily Leather Tote' }],
    colors: [{ id: 'black', name: 'Matte Black', colorHex: '#18181b', inStock: true }],
    sizes: [{ name: 'One Size', inStock: true }],
    rating: 4.8,
    reviewCount: 51,
    reviews: [],
    featured: false,
    madeIn: 'Italy'
  }
];

export const CATEGORIES = [
  { id: 'all', label: 'All Departments' },
  { id: 'electronics', label: 'Electronics & Audio' },
  { id: 'musical', label: 'Musical Instruments & Gear' },
  { id: 'appliances', label: 'Home Appliances & Living' },
  { id: 'apparel', label: 'Fashion & Apparel' },
  { id: 'leather-goods', label: 'Leather Goods & Accessories' }
] as const;

export interface CategoryCardData {
  id: 'electronics' | 'musical' | 'appliances' | 'apparel' | 'leather-goods' | string;
  title: string;
  subtitle: string;
  count: string;
  image: string;
  tag: string;
}

export const VISUAL_CATEGORIES: CategoryCardData[] = [
  {
    id: 'electronics',
    title: 'Electronics & Audio',
    subtitle: 'Planar magnetic headphones, ribbon studio monitors & audiophile gear',
    count: 'Curated Audio',
    image: audiophileHeadphonesImg,
    tag: 'Acoustic Precision'
  },
  {
    id: 'musical',
    title: 'Musical Instruments & Studio',
    subtitle: 'Polyphonic analog synthesizers, direct-drive turntables & vinyl decks',
    count: 'Studio Instruments',
    image: synthImg,
    tag: 'Sound Design'
  },
  {
    id: 'appliances',
    title: 'Home Appliances & Living',
    subtitle: 'Dual-boiler espresso machines, smart HEPA purifiers & robot vacuums',
    count: 'Smart Living',
    image: smartEspressoImg,
    tag: 'Craft Living'
  },
  {
    id: 'apparel',
    title: 'Fashion & Apparel',
    subtitle: 'Japanese selvedge twill chore coats & tailored virgin wool overcoats',
    count: 'Wardrobe Editions',
    image: choreCoatImg,
    tag: 'Artisanal Tailoring'
  },
  {
    id: 'leather-goods',
    title: 'Leather Goods & Accessories',
    subtitle: 'Tuscan vegetable-tanned leather travel weekenders & daily totes',
    count: 'Heritage Carry',
    image: leatherWeekenderImg,
    tag: 'Hand-Burnished'
  }
];
