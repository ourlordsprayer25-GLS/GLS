export interface BrandSeriesMapping {
  brand: string;
  series: string[];
}

export const LAPTOP_BRANDS: BrandSeriesMapping[] = [
  {
    brand: 'HP',
    series: ['EliteBook', 'ProBook', 'Pavilion', 'Envy', 'Spectre', 'Omen', 'Victus', 'ZBook Workstation', 'HP 250 / 255 Series'],
  },
  {
    brand: 'Dell',
    series: ['Latitude', 'XPS', 'Inspiron', 'Precision Workstation', 'Alienware', 'Vostro', 'OptiPlex (AIO/Desktop)'],
  },
  {
    brand: 'Lenovo',
    series: ['ThinkPad (T/X/E/L Series)', 'ThinkPad Carbon / Yoga', 'IdeaPad', 'Legion Gaming', 'Yoga 2-in-1', 'ThinkBook', 'LOQ Gaming'],
  },
  {
    brand: 'Apple',
    series: ['MacBook Pro 14"', 'MacBook Pro 16"', 'MacBook Pro 13"', 'MacBook Air 13"', 'MacBook Air 15"', 'iMac', 'Mac mini'],
  },
  {
    brand: 'Asus',
    series: ['ZenBook', 'ROG Strix / Zephyrus', 'TUF Gaming', 'VivoBook', 'ExpertBook Business'],
  },
  {
    brand: 'Acer',
    series: ['Aspire', 'Nitro Gaming', 'Predator Gaming', 'Swift Thin & Light', 'TravelMate Business'],
  },
  {
    brand: 'Toshiba / Dynabook',
    series: ['Portégé', 'Tecra Business', 'Satellite Pro'],
  },
  {
    brand: 'MSI',
    series: ['Stealth / Raider', 'Katana / Sword Gaming', 'Modern', 'Prestige Business', 'Creator Series'],
  },
  {
    brand: 'Microsoft',
    series: ['Surface Laptop', 'Surface Pro (2-in-1)', 'Surface Book', 'Surface Studio'],
  },
  {
    brand: 'Samsung',
    series: ['Galaxy Book Pro', 'Galaxy Book Ultra', 'Galaxy Book 360'],
  },
];

export interface ProcessorFamilyMapping {
  family: string;
  generations: string[];
}

export const PROCESSOR_CATALOG: ProcessorFamilyMapping[] = [
  {
    family: 'Intel Core i7',
    generations: ['14th Gen (2024)', '13th Gen (Raptor Lake)', '12th Gen (Alder Lake)', '11th Gen (Tiger Lake)', '10th Gen (Ice Lake)', '8th Gen (Quad-Core)', '7th Gen', '6th Gen (Skylake)', '5th Gen', '4th Gen (Haswell)'],
  },
  {
    family: 'Intel Core i5',
    generations: ['14th Gen (2024)', '13th Gen (Raptor Lake)', '12th Gen (Alder Lake)', '11th Gen (Tiger Lake)', '10th Gen (Ice Lake)', '8th Gen (Quad-Core)', '7th Gen', '6th Gen (Skylake)', '5th Gen', '4th Gen (Haswell)'],
  },
  {
    family: 'Intel Core i3',
    generations: ['13th / 14th Gen', '12th Gen', '11th Gen', '10th Gen', '8th Gen', '7th Gen', '6th Gen', '5th Gen', '4th Gen'],
  },
  {
    family: 'Intel Core i9',
    generations: ['14th Gen High-Performance', '13th Gen Extreme', '12th Gen', '11th Gen', '10th Gen', '9th Gen Octa-Core'],
  },
  {
    family: 'Intel Core Ultra',
    generations: ['Intel Core Ultra 7 (AI Boost)', 'Intel Core Ultra 5', 'Intel Core Ultra 9 Flagship'],
  },
  {
    family: 'AMD Ryzen 7',
    generations: ['8000 Series (AI Ready)', '7000 Series Zen 4', '6000 Series', '5000 Series Octa-Core', '4000 Series', '3000 Series'],
  },
  {
    family: 'AMD Ryzen 5',
    generations: ['8000 Series', '7000 Series Zen 4', '6000 Series', '5000 Series Hexa-Core', '4000 Series', '3000 Series'],
  },
  {
    family: 'AMD Ryzen 9',
    generations: ['9000 / 8000 Series Extreme', '7000 Series Zen 4', '6000 Series', '5000 Series'],
  },
  {
    family: 'Apple Silicon (M-Series)',
    generations: ['M4 Chip (Latest)', 'M3 Pro / Max', 'M3 Chip', 'M2 Pro / Max', 'M2 Chip', 'M1 Pro / Max', 'M1 Chip (Neural Engine)'],
  },
  {
    family: 'Intel Celeron / Pentium',
    generations: ['Intel Quad-Core N-Series', 'Intel Dual-Core Celeron', 'Intel Pentium Gold'],
  },
];

export const RAM_SPEC_OPTIONS = {
  types: ['DDR5 (High-Speed 4800/5600MHz)', 'DDR4 (3200MHz)', 'DDR4 (2400/2666MHz)', 'DDR3 / DDR3L', 'LPDDR5 On-Board', 'LPDDR4x'],
  capacities: ['4 GB', '8 GB', '12 GB', '16 GB', '24 GB', '32 GB', '64 GB', '128 GB'],
};

export const STORAGE_SPEC_OPTIONS = {
  driveTypes: ['High-Speed NVMe M.2 SSD', '2.5" SATA III SSD', 'Mechanical HDD (Hard Disk)', 'Dual Drive (SSD + 1TB HDD)'],
  capacities: ['64 GB eMMC', '128 GB', '256 GB', '512 GB', '1 TB (1000 GB)', '2 TB (2000 GB)', '4 TB NVMe'],
};

export const OS_CATALOG = [
  {
    family: 'Windows',
    editions: [
      'Windows 11 Pro (64-bit)',
      'Windows 11 Home',
      'Windows 10 Pro (64-bit)',
      'Windows 10 Home',
      'Windows 8.1 Professional',
      'Windows 7 Professional SP1',
    ],
  },
  {
    family: 'Apple macOS',
    editions: [
      'macOS Sonoma (Latest)',
      'macOS Ventura',
      'macOS Monterey',
      'macOS Big Sur',
    ],
  },
  {
    family: 'Linux & FreeDOS',
    editions: [
      'Ubuntu 24.04 / 22.04 LTS',
      'Linux Mint',
      'FreeDOS / No OS (Blank Disk)',
    ],
  },
  {
    family: 'ChromeOS',
    editions: ['Google ChromeOS Cloud Ready'],
  },
];

export const DISPLAY_OPTIONS = [
  '13.3" Full HD IPS (1920 x 1080)',
  '14.0" Full HD IPS Anti-Glare',
  '14.0" 2K / 2.8K OLED Touchscreen',
  '15.6" Full HD (1920 x 1080) Slim Bezel',
  '15.6" Full HD 144Hz Gaming Display',
  '16.0" QHD+ (2560 x 1600) 16:10 Ratio',
  '17.3" Full HD Wide Display',
  'Retina Liquid Display with True Tone',
];

export const WORKLOAD_OPTIONS = [
  'Office, Executive & Business Management',
  'Software Development & Engineering',
  'Graphic Design, Video Editing & 3D (CAD/Blender)',
  'High-End Gaming & Esports',
  'University, Student & Remote Learning',
  'Accounting, POS & Retail Operation',
];
