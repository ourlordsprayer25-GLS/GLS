export interface ProductVariant {
  id?: string;
  name: string; // e.g. "Deep Olive", "Onyx Black"
  colorHex?: string;
  value?: string;
  image?: string;
  inStock?: boolean;
}

export interface ProductSize {
  name: string; // "XS", "S", "M", "L", "XL"
  inStock: boolean;
  stockCount?: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number; // 1-5
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  sizePurchased?: string;
  variantPurchased?: string;
  fitRating?: 'Runs Small' | 'True to Size' | 'Runs Large';
  helpfulVotes?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  tagline: string;
  price: number;
  originalPrice?: number;
  category: 'outerwear' | 'knitwear' | 'leather-goods' | 'essentials' | 'electronics' | 'appliances' | string;
  categoryLabel: string;
  department?: 'Electronics' | 'Appliances' | 'Apparel' | 'Living' | string;
  warranty?: string;
  specs?: { label: string; value: string }[];
  brand?: string;
  brandOrigin?: string;
  tag?: string; // e.g. "New Arrival", "Bestseller", "Archival", "Hot Deal"
  isNewArrival?: boolean;
  isHotDeal?: boolean;
  discountPercentage?: number;
  dealEndsIn?: string;
  description: string;
  details: string[];
  materials: string;
  care: string;
  primaryImage: string;
  images: {
    url: string;
    alt: string;
    caption?: string;
  }[];
  colors: ProductVariant[];
  sizes: ProductSize[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
  featured?: boolean;
  modelInfo?: string;
  madeIn: string;
  sku?: string;
  barcode?: string;
  stockLevel?: number;
  created_at?: string;
}

export interface CartItem {
  id: string; // unique item id: product.id + '-' + color + '-' + size
  product: Product;
  selectedColor: ProductVariant;
  selectedSize: ProductSize;
  quantity: number;
  addedAt: number;
}

export interface StoreNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'order' | 'drop' | 'restock' | 'promo' | 'wishlist' | 'product';
  linkTarget?: string;
    customerId?: string;
    isAdminOnly?: boolean; // e.g. "product-chore-coat"
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderTimelineStep {
  status: string;
  label: string;
  description: string;
  date: string;
  completed: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  shippingMethod: 'standard' | 'express';
  shippingCost: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'card' | 'apple-pay' | 'klarna' | 'cod';
  status: 'placed' | 'confirmed' | 'processing' | 'shipping' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber: string;
  customerId?: string;
  carrier?: string;
  estimatedDelivery: string;
  timeline?: OrderTimelineStep[];
  cancelledAt?: string;
  cancelReason?: string;
  returnRequested?: boolean;
}

export interface UserAddress extends ShippingAddress {
  id: string;
  isDefault?: boolean;
  label?: string; // 'Home', 'Atelier Studio', 'Office'
}

export interface UserPreferences {
  newsletter: boolean;
  dropAlerts: boolean;
  sustainablePackaging: boolean;
  preferredSize: 'XS' | 'S' | 'M' | 'L' | 'XL';
}

export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Patron Club' | 'Atelier Circle' | 'Privilege';

export interface PointsTransaction {
  id: string;
  date: string;
  description: string;
  points: number; // positive for earned, negative for redeemed
  type: 'order_reward' | 'tier_bonus' | 'review' | 'referral' | 'redemption' | 'welcome';
  orderId?: string;
  orderNumber?: string;
}

export interface StoreSectionConfig {
  id: string;
  name: string;
  subtitle: string;
  enabled: boolean;
  position: number;
  type: string;
}

export interface StoreSettings {
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  whatsappNumber?: string;
  operatingHours?: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    tiktok?: string;
  };
  aboutUs: {
    title: string;
    subtitle?: string;
    content: string;
    image?: string;
    secondaryImage?: string;
    foundedYear?: string;
    atelierLocation?: string;
    missionStatement?: string;
  };
  terms: {
    title: string;
    lastUpdated?: string;
    content: string;
    warrantyPolicy?: string;
    returnPolicy?: string;
    privacyPolicy?: string;
    shippingPolicy?: string;
  };
  refundPolicy?: {
    title: string;
    lastUpdated?: string;
    returnWindowDays?: string;
    overview?: string;
    eligibility?: string;
    stepByStepProcess?: string;
    processingTime?: string;
    returnShipping?: string;
    exceptions?: string;
  };
  announcementBar: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  heroContent: {
    title: string;
    subtitle: string;
    buttonText: string;
    image: string;
  };
  moreToLoveSection: {
    enabled: boolean;
    title: string;
    subtitle: string;
    tagLabel: string;
    itemCount: number;
  };
  sections: StoreSectionConfig[];
}

export interface UserActivityEvent {
  id: string;
  action: string;
  target?: string;
  timestamp: string;
  page?: string;
}

export interface CustomerDeviceTracker {
  deviceType: 'mobile' | 'desktop' | 'tablet';
  os: string;
  browser: string;
  isPwa: boolean;
}

export interface CustomerLocationTracker {
  country: string;
  countryCode: string;
  city: string;
  flag: string;
  ipAddress?: string;
}

export interface CustomerRegistrationDetails {
  year: number;
  month: string;
  day: number;
  time: string;
  exactTimestamp: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  memberSince: string;
  tier: LoyaltyTier;
  loyaltyPoints: number;
  lifetimePoints?: number;
  pointsHistory?: PointsTransaction[];
  addresses: UserAddress[];
  preferences: UserPreferences;
  registeredDateExact?: string;
  registrationDetails?: CustomerRegistrationDetails;
  deviceInfo?: CustomerDeviceTracker;
  location?: CustomerLocationTracker;
  sessionStatus?: 'online' | 'idle' | 'logged_out' | 'offline';
  lastSeen?: string;
  sessionDurationMinutes?: number;
  recentActivity?: UserActivityEvent[];
}


