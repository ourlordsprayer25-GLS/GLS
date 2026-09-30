import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Product, ProductVariant, ProductSize, CartItem, StoreNotification, Order, UserProfile, StoreSettings } from './types/store';
import { INITIAL_PRODUCTS, CATEGORIES } from './data/products';
import { INITIAL_ORDERS, INITIAL_CUSTOMERS, DEFAULT_USER_PROFILE } from './data/user';
import { INITIAL_NOTIFICATIONS } from './data/notifications';
import { StorefrontView } from './components/StorefrontView';
import { AdminView } from './components/admin/AdminView';
import { FastLoadingScreen } from './components/FastLoadingScreen';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SectionType } from './components/SectionPage';
import {
  subscribeToProducts,
  subscribeToOrders,
  subscribeToNotifications,
  subscribeToSettings,
  subscribeToUsers,
  initServerSync,
  addRealtimeOrder,
  updateRealtimeOrderStatus,
  deleteRealtimeOrder,
  saveRealtimeProduct,
  deleteRealtimeProduct,
  saveRealtimeSettings,
  addRealtimeNotification,
  markRealtimeNotificationRead,
  updateRealtimeUserProfile,
  fetchRealtimeCart,
  saveRealtimeCart,
  fetchRealtimeWishlist,
  saveRealtimeWishlist,
  fetchRealtimeUserProfile,
} from './services/supabaseService';
import defaultShopImg from './assets/images/workshop_textile_banner_1790121031293.jpg';

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'GLADYNS DEPARTMENT STORE',
  storeDescription: 'Curated Department House redefining modern living through audio precision, musical instruments, smart home appliances, and artisanal fashion.',
  contactEmail: 'concierge@gladyns.com',
  contactPhone: '+33 1 23 45 67 89',
  contactAddress: 'Rua Miguel Bombarda 142, 4050-377 Porto, Portugal',
  whatsappNumber: '+33 1 23 45 67 89',
  operatingHours: 'Monday – Saturday: 10:00 AM – 7:00 PM CET',
  socialLinks: {
    instagram: 'https://instagram.com/gladyns',
    twitter: 'https://twitter.com/gladyns',
    facebook: 'https://facebook.com/gladyns',
  },
  aboutUs: {
    title: 'About GLADYNS Department Store',
    subtitle: 'Curated Multi-Department House & Living Standards',
    content: 'GLADYNS is a modern multi-department store curating premium electronics, studio musical instruments, autonomous smart home appliances, and timeless wardrobe foundations. Every department represents uncompromising engineering, sustainable materials, and rigorous functional design.',
    image: defaultShopImg,
    secondaryImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop',
    foundedYear: '2018',
    atelierLocation: 'Porto, Portugal & Florence, Italy',
    missionStatement: 'Pure Engineering, Acoustic Precision, and Enduring Quality Across Every Department.',
  },
  terms: {
    title: 'Terms & Conditions of Sale',
    lastUpdated: 'September 2025',
    content: 'These terms and conditions apply to all purchases placed through the official GLADYNS boutique. By completing an order, the customer agrees unconditionally to all service terms and warranty protocols.',
    warrantyPolicy: 'All curated items, studio equipment, and appliances come with a complimentary 2-year GLADYNS warranty. In the event of functional, material, or hardware issues, we repair or replace your item free of charge.',
    returnPolicy: 'You have 30 days from delivery to return any unworn item with original tags. Prepaid carbon-neutral return labels can be generated directly from your live Order Pipeline dashboard.',
    privacyPolicy: 'GLADYNS is committed to absolute personal data privacy adhering strictly to EU GDPR standards. Payment processing is secured using 256-bit SSL encryption, and financial credentials are never stored on our servers.',
    shippingPolicy: 'Global express dispatch with complimentary carbon-neutral courier delivery on all qualifying orders. Live 5-stage tracking is available for all member acquisitions.',
  },
  refundPolicy: {
    title: 'Return & Refund Policy',
    lastUpdated: 'September 2025',
    returnWindowDays: '30',
    overview: 'At GLADYNS, we stand behind the exceptional quality and artisanal construction of every piece. If your acquisition does not fully meet your expectations, we provide a seamless 30-day return window with 100% complimentary return shipping.',
    eligibility: 'Items must be returned in their original condition with all GLADYNS security tags, packaging, and presentation boxes intact.',
    stepByStepProcess: 'Initiate your return with one click in your Order Pipeline or contact our Concierge. Print your complimentary prepaid carbon-neutral shipping label, pack your items, and drop off at any authorized regional point. Upon swift verification by our team, your refund is processed immediately.',
    processingTime: 'Refunds are issued to your original payment method (Credit Card, PayPal, Apple Pay) within 24 to 48 hours of inspection. Funds typically reflect in your account within 2-5 business days depending on your financial institution.',
    returnShipping: 'Complimentary on all orders. GLADYNS covers all courier and return shipping charges worldwide.',
    exceptions: 'Custom-tailored bespoke creations, personalized engraved pieces, and intimate garments with broken sanitary seals cannot be returned unless a manufacturing imperfection exists.',
  },
  announcementBar: {
    enabled: true,
    text: 'GLOBAL EXPRESS DISPATCH ACTIVE — CARBON NEUTRAL COURIER ON ALL DEPARTMENTS',
  },
  heroContent: {
    title: 'ELECTRONICS, MUSIC, APPLIANCES & ATELIER',
    subtitle: 'Curated studio analog synthesizers, planar acoustics, smart living tech, and timeless apparel.',
    buttonText: 'EXPLORE CATALOG',
    image: defaultShopImg,
  },
  moreToLoveSection: {
    enabled: true,
    title: 'More to Love',
    subtitle: 'Explore curated alternatives featuring pristine cuts and high-fashion engineering from our global archive.',
    tagLabel: 'ARCHIVAL DISCOVERIES',
    itemCount: 4,
  },
  sections: [
    { id: 'announcement', name: 'Announcement Bar', subtitle: 'Top promotional ticker', enabled: true, position: 1, type: 'announcement' },
    { id: 'hero', name: 'Hero Campaign', subtitle: 'Main landing banner and CTA', enabled: true, position: 2, type: 'hero' },
    { id: 'collections', name: 'Featured Collections', subtitle: 'Curated category showcase', enabled: true, position: 3, type: 'collections' },
    { id: 'new_arrivals', name: 'New Arrivals Grid', subtitle: 'Latest drops and releases', enabled: true, position: 4, type: 'grid' },
    { id: 'heritage', name: 'Brand Heritage & Craft', subtitle: 'Store story and values', enabled: true, position: 5, type: 'about' },
    { id: 'reviews', name: 'Patron Testimonials', subtitle: 'Client reviews and trust', enabled: true, position: 6, type: 'testimonials' },
    { id: 'newsletter', name: 'VIP Newsletter Club', subtitle: 'Subscriber acquisition banner', enabled: true, position: 7, type: 'newsletter' },
    { id: 'more_to_love', name: 'More to Love Recommendations', subtitle: 'Product page cross-sell section', enabled: true, position: 8, type: 'more_to_love' },
  ],
};

function AppContent() {
  const { user: authUser, login: authLogin, logout: authLogout } = useAuth();
  
  const [isInitialBootLoading, setIsInitialBootLoading] = useState(true);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [notifications, setNotifications] = useState<StoreNotification[]>(INITIAL_NOTIFICATIONS);
  const [users, setUsers] = useState<UserProfile[]>([]);

  // Initialize and attach cross-device real-time sync listeners
  useEffect(() => {
    initServerSync({
      products: INITIAL_PRODUCTS,
      orders: INITIAL_ORDERS,
      users: INITIAL_CUSTOMERS,
      notifications: INITIAL_NOTIFICATIONS,
      settings: DEFAULT_STORE_SETTINGS,
      categories: CATEGORIES as any,
      brands: [],
    });

    const unsubProducts = subscribeToProducts(setProducts);
    const unsubOrders = subscribeToOrders(setOrders);
    const unsubNotifs = subscribeToNotifications(setNotifications);
    const unsubSettings = subscribeToSettings(DEFAULT_STORE_SETTINGS, setStoreSettings);
    const unsubUsers = subscribeToUsers(setUsers);

    return () => {
      unsubProducts();
      unsubOrders();
      unsubNotifs();
      unsubSettings();
      unsubUsers();
    };
  }, []);

  const [categories, setCategories] = useState(() => {
    const unique = INITIAL_PRODUCTS.reduce((acc, p) => {
      if (!acc.some((c) => c.id === p.category)) {
        acc.push({ id: p.category, label: p.categoryLabel });
      }
      return acc;
    }, [] as { id: string; label: string }[]);
    return unique;
  });

  const [brands, setBrands] = useState(() => {
    const unique = INITIAL_PRODUCTS.reduce((acc, p) => {
      if (p.brand && !acc.some((b) => b.name === p.brand)) {
        acc.push({ name: p.brand, origin: p.brandOrigin || 'Unknown' });
      }
      return acc;
    }, [] as { name: string; origin: string }[]);
    return unique;
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  // User Profile State with Cloud / Supabase persistence
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const isPwa = typeof window !== 'undefined' && (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const deviceType: 'mobile' | 'desktop' | 'tablet' = /iPad|tablet/i.test(ua) ? 'tablet' : isMobile ? 'mobile' : 'desktop';
    const os = /iPhone|iPad|iPod/.test(ua) ? 'iOS Mobile' : /Android/.test(ua) ? 'Android' : /Macintosh/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : 'Desktop OS';
    const browser = isPwa ? 'GLADYNS PWA Standalone' : /Chrome/.test(ua) ? 'Chrome' : /Safari/.test(ua) ? 'Safari' : 'Web Browser';

    if (authUser) {
      const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || '';
      const now = new Date();
      const currentRegDetails = {
        year: now.getFullYear(),
        month: now.toLocaleDateString('en-US', { month: 'long' }),
        day: now.getDate(),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        exactTimestamp: now.toISOString(),
      };

      const updatedProfile: UserProfile = {
        ...DEFAULT_USER_PROFILE,
        ...(user || {}),
        id: authUser.id,
        email: authUser.email || user?.email || '',
        firstName: fullName.split(' ')[0] || user?.firstName || 'Patron',
        lastName: fullName.split(' ').slice(1).join(' ') || user?.lastName || '',
        registeredDateExact: user?.registeredDateExact || now.toISOString().replace('T', ' ').slice(0, 19),
        registrationDetails: user?.registrationDetails || currentRegDetails,
        deviceInfo: {
          deviceType,
          os,
          browser,
          isPwa,
        },
        location: user?.location || {
          country: "Côte d'Ivoire",
          countryCode: 'CI',
          city: 'Abidjan',
          flag: '🇨🇮',
          ipAddress: '154.120.91.44',
        },
        sessionStatus: 'online',
        lastSeen: 'Active Now',
        sessionDurationMinutes: (user?.sessionDurationMinutes || 0) + 1,
        recentActivity: [
          {
            id: `act-${Date.now()}`,
            action: 'Customer Successfully Signed In to GLADYNS',
            page: 'Storefront Header',
            timestamp: 'Just now',
          },
          ...(user?.recentActivity || []),
        ],
      };

      setUser(updatedProfile);
      updateRealtimeUserProfile(updatedProfile);

      // Keep in sync with users database
      setUsers((prevUsers) => {
        const existingIdx = prevUsers.findIndex((u) => u.id === authUser.id || u.email.toLowerCase() === authUser.email?.toLowerCase());
        if (existingIdx >= 0) {
          const updated = [...prevUsers];
          updated[existingIdx] = {
            ...updated[existingIdx],
            ...updatedProfile,
            sessionStatus: 'online',
            lastSeen: 'Active Now',
          };
          return updated;
        } else {
          return [updatedProfile, ...prevUsers];
        }
      });
    } else {
      // Mark as logged out if user was previously authenticated
      if (user && user.id !== 'usr-guest') {
        const loggedOutId = user.id;
        setUsers((prevUsers) =>
          prevUsers.map((u) => {
            if (u.id === loggedOutId) {
              const updated = {
                ...u,
                sessionStatus: 'logged_out' as const,
                lastSeen: 'Just now (Logged Out)',
                recentActivity: [
                  {
                    id: `act-${Date.now()}`,
                    action: 'Customer Logged Out of Session',
                    page: 'Profile Drawer',
                    timestamp: 'Just now',
                  },
                  ...(u.recentActivity || []),
                ],
              };
              updateRealtimeUserProfile(updated);
              return updated;
            }
            return u;
          })
        );
      }
      setUser(null);
    }
  }, [authUser]);

  // Ref to track last known status of each order to detect transitions
  const lastKnownStatusesRef = useRef<Record<string, Order['status']>>({});

  // Initialize the last known statuses ref with existing orders on mount
  useEffect(() => {
    const initialMap: Record<string, Order['status']> = {};
    orders.forEach((o) => {
      initialMap[o.id] = o.status;
    });
    lastKnownStatusesRef.current = initialMap;
  }, []);

  // Premium elegant synthesizer chime using Web Audio API (cross-browser & local-offline compatible)
  const playPremiumChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      // First chime tone (high and sweet - A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime); 
      gain1.gain.setValueAtTime(0.06, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      // Second tone slightly delayed (even higher - E6) for a professional double-chime experience
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.12);
      gain2.gain.setValueAtTime(0, ctx.currentTime);
      gain2.gain.setValueAtTime(0.06, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.45);

      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.55);
    } catch (e) {
      console.warn('Audio playback was prevented by browser autoplay policy restrictions.', e);
    }
  };

  // Trigger native system banner notifications (drops from top, stays in background)
  const triggerSystemNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const defaultOptions: any = {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [100, 50, 100],
      tag: 'gladyns-notif',
      ...options,
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, defaultOptions);
      }).catch(() => {
        new Notification(title, defaultOptions);
      });
    } else {
      new Notification(title, defaultOptions);
    }
  }, []);

  // Request notification permissions
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        triggerSystemNotification('GLADYNS Notifications Active', {
          body: 'You will receive real-time order status updates and category arrivals.',
          icon: '/pwa-192x192.png',
        });
        return true;
      }
    } catch (e) {
      console.error('Error requesting notification permission', e);
    }
    return false;
  }, [triggerSystemNotification]);

  // Send real-time transaction email notifications to customers via full-stack Express API
  const dispatchOrderStatusEmail = useCallback((toEmail: string, orderNumber: string, statusText: string, detailsText: string) => {
    if (!toEmail) return;

    const customerName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Valued Patron';
    const subject = `GLADYNS — Order #${orderNumber} Update: ${statusText}`;

    fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toEmail,
        subject,
        customerName,
        orderNumber,
        statusText,
        detailsText,
      }),
    })
    .then((res) => {
      if (!res.ok) throw new Error('API returned error during email dispatch');
      return res.json();
    })
    .then((data) => {
      console.log('Real-time transaction email successfully dispatched:', data);
    })
    .catch((err) => {
      console.error('Failed to dispatch transactional email notification:', err);
    });
  }, [user]);

  // Effect that checks for changes in the orders state and triggers a new notification if status transitions
  useEffect(() => {
    orders.forEach((order) => {
      const prevStatus = lastKnownStatusesRef.current[order.id];

      // If the order existed and its status has transitioned
      if (prevStatus !== undefined && prevStatus !== order.status) {
        // Play premium chime sound for auditory feedback
        playPremiumChime();

        let title = '';
        let message = '';

        switch (order.status) {
          case 'confirmed':
            title = `Order ${order.orderNumber} Confirmed`;
            message = `Excellent news. Payment and boutique materials are fully verified (Stage 2: Confirmed). Preparation is now underway.`;
            break;
          case 'processing':
            title = `Order ${order.orderNumber} in Production`;
            message = `Product verification, quality testing & premium packaging have commenced (Stage 3: Processing).`;
            break;
          case 'shipping':
            title = `Order ${order.orderNumber} Dispatched`;
            message = `Your order has been shipped! En route via carbon-neutral express courier (Stage 4: Shipping). Tracking ID: ${order.trackingNumber || 'GL-TRK-78491'}.`;
            break;
          case 'delivered':
            title = `Order ${order.orderNumber} Delivered`;
            message = `Delivered! Your parcel has been received and verified (Stage 5: Delivered). We hope you enjoy your premium acquisitions.`;
            break;
          case 'cancelled':
            title = `Order ${order.orderNumber} Cancelled`;
            message = `Your order has been cancelled. A full refund of $${order.total.toFixed(2)} has been credited back to your original payment method.`;
            break;
          default:
            title = `Order ${order.orderNumber} Status Updated`;
            message = `Your order status has transitioned to ${order.status}. View live 5-stage pipeline tracking details.`;
            break;
        }

        const transitionNotif: StoreNotification = {
          id: `notif-status-${order.id}-${order.status}-${Date.now()}`,
          title,
          message,
          timestamp: Date.now(),
          read: false,
          type: 'order',
          linkTarget: order.orderNumber,
        };

        // Prepend the transition notification
        setNotifications((prev) => [transitionNotif, ...prev]);

        // Trigger real-time email notifications to the logged in customer's email
        if (user && user.email) {
          dispatchOrderStatusEmail(user.email, order.orderNumber, order.status.toUpperCase(), message);
        }

        // Trigger native system banner (drops from device header, stays in background)
        triggerSystemNotification(title, {
          body: message,
          tag: `order-${order.id}`,
        });

        // Pop up the real-time top notification toast
        setActiveToast({
          id: transitionNotif.id,
          title: transitionNotif.title,
          message: transitionNotif.message,
          orderNumber: order.orderNumber,
        });
      }

      // Record the new status in ref
      lastKnownStatusesRef.current[order.id] = order.status;
    });
  }, [orders]);

  // Ref to track products already alerted for low stock to avoid duplicate spam
  const lowStockAlertedRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    products.forEach((product) => {
      const stock = product.stockLevel !== undefined ? product.stockLevel : 10;
      const isLow = stock < 5;
      const alreadyAlerted = lowStockAlertedRef.current[product.id];

      if (isLow && !alreadyAlerted) {
        lowStockAlertedRef.current[product.id] = true;

        const title = `Low Stock Alert: ${product.name}`;
        const message = `Inventory for "${product.name}" has fallen below the 5-item threshold (Current: ${stock} units remaining). Immediate restock recommended.`;

        const stockNotif: StoreNotification = {
          id: `notif-stock-${product.id}-${Date.now()}`,
          title,
          message,
          timestamp: Date.now(),
          read: false,
          type: 'restock',
          linkTarget: product.id,
        };

        setNotifications((prev) => [stockNotif, ...prev]);
        playPremiumChime();
        triggerSystemNotification(title, {
          body: message,
          tag: `stock-${product.id}`,
        });
      } else if (!isLow && alreadyAlerted) {
        lowStockAlertedRef.current[product.id] = false;
      }
    });
  }, [products]);

  // Dedicated Pages: Orders Page & Patron Profile Page & Section Sliding Hero Pages
  const [isOrdersPageOpen, setIsOrdersPageOpen] = useState(false);
  const [isProfilePageOpen, setIsProfilePageOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<'profile' | 'addresses' | 'loyalty'>('profile');
  const [activeSectionPage, setActiveSectionPage] = useState<SectionType | null>(null);
  const [sectionPageCategory, setSectionPageCategory] = useState<string>('all');
  const [isCategoriesPageOpen, setIsCategoriesPageOpen] = useState(false);
  const [isBrandPageOpen, setIsBrandPageOpen] = useState(false);
  const [isAboutUsPageOpen, setIsAboutUsPageOpen] = useState(false);
  const [isTermsPageOpen, setIsTermsPageOpen] = useState(false);
  const [isRefundPolicyPageOpen, setIsRefundPolicyPageOpen] = useState(false);
  const [isStoreLocatorPageOpen, setIsStoreLocatorPageOpen] = useState(false);
  const [isCollectionsPageOpen, setIsCollectionsPageOpen] = useState(false);
  const [isAdminPageOpen, setIsAdminPageOpen] = useState(false);
  const [isCartPageOpen, setIsCartPageOpen] = useState(false);
  const [isWishlistPageOpen, setIsWishlistPageOpen] = useState(false);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Mobile Navigation Sidebar State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Wishlist State with Cloud / Supabase persistence
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const isWishlistInitRef = useRef(false);

  useEffect(() => {
    const currentUid = user?.id || 'usr-guest';
    fetchRealtimeWishlist(currentUid).then((loadedIds) => {
      if (Array.isArray(loadedIds)) {
        setWishlistIds(loadedIds);
      }
      isWishlistInitRef.current = true;
    });
  }, [user?.id]);

  useEffect(() => {
    if (!isWishlistInitRef.current) return;
    const currentUid = user?.id || 'usr-guest';
    saveRealtimeWishlist(currentUid, wishlistIds);
  }, [wishlistIds, user?.id]);

  // Cart State with Cloud / Supabase persistence
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const isCartInitRef = useRef(false);

  useEffect(() => {
    const currentUid = user?.id || 'usr-guest';
    fetchRealtimeCart(currentUid).then((loadedCart) => {
      if (Array.isArray(loadedCart)) {
        setCartItems(loadedCart);
      }
      isCartInitRef.current = true;
    });
  }, [user?.id]);

  useEffect(() => {
    if (!isCartInitRef.current) return;
    const currentUid = user?.id || 'usr-guest';
    saveRealtimeCart(currentUid, cartItems);
  }, [cartItems, user?.id]);

  const [initialInvoiceNumber, setInitialInvoiceNumber] = useState<string | null>(null);
  const [activeToast, setActiveToast] = useState<{ id: string; title: string; message: string; orderNumber: string } | null>(null);

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => setActiveToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  const syncStateFromPath = useCallback(() => {
    const rawHash = window.location.pathname.replace(/^\/+/, '');
    if (!rawHash || rawHash === 'home') {
      closeAllMainViews();
      return;
    }

    if (rawHash === 'about-us') {
      closeAllMainViews();
      setIsAboutUsPageOpen(true);
    } else if (rawHash === 'admin') {
      closeAllMainViews();
      setIsAdminPageOpen(true);
    } else if (rawHash === 'terms') {
      closeAllMainViews();
      setIsTermsPageOpen(true);
    } else if (rawHash === 'refund' || rawHash === 'refund-policy' || rawHash === 'returns') {
      closeAllMainViews();
      setIsRefundPolicyPageOpen(true);
    } else if (rawHash === 'find-us' || rawHash === 'store-locator') {
      closeAllMainViews();
      setIsStoreLocatorPageOpen(true);
    } else if (rawHash === 'brand') {
      closeAllMainViews();
      setIsBrandPageOpen(true);
    } else if (rawHash === 'categories') {
      closeAllMainViews();
      setIsCategoriesPageOpen(true);
    } else if (rawHash === 'collections') {
      closeAllMainViews();
      setIsCollectionsPageOpen(true);
    } else if (rawHash === 'orders') {
      closeAllMainViews();
      setIsOrdersPageOpen(true);
    } else if (rawHash === 'cart') {
      closeAllMainViews();
      setIsCartPageOpen(true);
    } else if (rawHash === 'wishlist') {
      closeAllMainViews();
      setIsWishlistPageOpen(true);
    } else if (rawHash.startsWith('profile')) {
      const parts = rawHash.split('/');
      const tab = (parts[1] as any) || 'profile';
      closeAllMainViews();
      setProfileTab(tab);
      setIsProfilePageOpen(true);
    } else if (rawHash.startsWith('product/')) {
      const prodId = rawHash.replace('product/', '');
      const p = products.find((prod) => prod.id === prodId);
      if (p) {
        closeAllMainViews();
        setSelectedProduct(p);
      }
    } else if (rawHash.startsWith('section/')) {
      const secName = rawHash.replace('section/', '') as SectionType;
      closeAllMainViews();
      setActiveSectionPage(secName);
    } else if (rawHash.startsWith('category/')) {
      const catName = rawHash.replace('category/', '');
      closeAllMainViews();
      setSelectedCategory(catName);
    }
  }, [products]);

  useEffect(() => {
    syncStateFromPath();
    window.addEventListener('popstate', syncStateFromPath);
    return () => window.removeEventListener('popstate', syncStateFromPath);
  }, [syncStateFromPath]);

  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      const targetProduct = products.find((p) => p.id === productId);
      const productName = targetProduct ? targetProduct.name : 'Piece';
      const notif: StoreNotification = {
        id: `notif-fav-${exists ? 'rem' : 'add'}-${Date.now()}`,
        title: exists ? 'Removed from Favorites' : 'Saved to Favorites',
        message: `${productName} was ${exists ? 'removed from' : 'added to'} your personal archive.`,
        timestamp: Date.now(),
        read: false,
        type: 'wishlist',
      };
      setNotifications((n) => [notif, ...n]);
      return exists ? prev.filter((id) => id !== productId) : [...prev, productId];
    });
  };

  const handleClearWishlist = () => setWishlistIds([]);

  const handleMoveAllWishlistToBag = () => {
    const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));
    wishlistedProducts.forEach((product) => {
      const defaultColor = product.colors[0];
      const defaultSize = product.sizes.find((s) => s.inStock);
      if (defaultSize) handleAddToCart(product, defaultColor, defaultSize, 1);
    });
    if (wishlistedProducts.length > 0) handleOpenCartPage();
  };

  const handleAddToCart = (product: Product, variant: any, size: any, quantity: number, openDrawer: boolean = false) => {
    const itemId = `${product.id}-${variant.id}-${size.name}`;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) return prev.map((item) => item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item);
      return [...prev, { id: itemId, product, selectedColor: variant, selectedSize: size, quantity, addedAt: Date.now() }];
    });
    if (openDrawer) handleOpenCartPage();
  };

  const handleQuickAdd = (product: Product, variant: any) => {
    const defaultSize = product.sizes.find((s) => s.inStock) || product.sizes[0];
    handleAddToCart(product, variant, defaultSize, 1, false);
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return handleRemoveItem(itemId);
    setCartItems((prev) => prev.map((item) => item.id === itemId ? { ...item, quantity: newQuantity } : item));
  };

  const handleRemoveItem = (itemId: string) => setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  const handleMarkAllNotificationsRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const handleMarkNotificationRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const handleDeleteNotification = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));
  const handleClearAllNotifications = () => setNotifications([]);
  const handleNavigateToProductFromNotification = (productId: string) => {
    const targetProduct = products.find((p) => p.id === productId);
    if (targetProduct) {
      setSelectedProduct(targetProduct);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setCartItems([]);
    const placedOrder: Order = { ...newOrder, status: 'placed' };
    setOrders((prev) => [placedOrder, ...prev]);
    addRealtimeOrder(placedOrder);

    if (user) {
      const earned = Math.round(newOrder.total);
      const updatedUser = { ...user, loyaltyPoints: user.loyaltyPoints + earned };
      setUser(updatedUser);
      updateRealtimeUserProfile(updatedUser);
    }
    const orderNotification: StoreNotification = {
      id: `notif-${Date.now()}`,
      title: `Order ${newOrder.orderNumber} Placed`,
      message: `Payment authorized. Fulfillment has commenced.`,
      timestamp: Date.now(),
      read: false,
      type: 'order',
      linkTarget: newOrder.orderNumber,
    };
    setNotifications((prev) => [orderNotification, ...prev]);
    addRealtimeNotification(orderNotification);
    setActiveToast({ id: orderNotification.id, title: orderNotification.title, message: orderNotification.message, orderNumber: newOrder.orderNumber });
    setInitialInvoiceNumber(newOrder.orderNumber);
    if (user?.email) dispatchOrderStatusEmail(user.email, newOrder.orderNumber, 'PLACED', `Order for $${newOrder.total.toFixed(2)} received.`);
    setIsOrdersPageOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders((prev) => prev.map((ord) => ord.id === orderId ? { ...ord, status: newStatus } : ord));
    updateRealtimeOrderStatus(orderId, newStatus);
  };

  const handleCancelOrder = (orderId: string, reason: string) => {
    setOrders((prev) => prev.map((ord) => ord.id === orderId ? { ...ord, status: 'cancelled', cancelledAt: new Date().toLocaleDateString(), cancelReason: reason } : ord));
    updateRealtimeOrderStatus(orderId, 'cancelled');
    const cancelNotif: StoreNotification = { id: `notif-cancel-${Date.now()}`, title: `Order Cancelled`, message: `Order successfully cancelled. Refund processed.`, timestamp: Date.now(), read: false, type: 'order' };
    setNotifications((prev) => [cancelNotif, ...prev]);
    addRealtimeNotification(cancelNotif);
  };

  const handleRequestReturn = (orderId: string) => {
    setOrders((prev) => prev.map((ord) => ord.id === orderId ? { ...ord, returnRequested: true } : ord));
    const returnNotif: StoreNotification = { id: `notif-return-${Date.now()}`, title: 'Return Label Dispatched', message: `Prepaid return authorization sent to your email.`, timestamp: Date.now(), read: false, type: 'order' };
    setNotifications((prev) => [returnNotif, ...prev]);
    addRealtimeNotification(returnNotif);
  };

  const closeAllMainViews = () => {
    setIsCategoriesPageOpen(false); setIsBrandPageOpen(false); setIsAboutUsPageOpen(false);
    setIsTermsPageOpen(false); setIsRefundPolicyPageOpen(false); setIsStoreLocatorPageOpen(false); setIsCollectionsPageOpen(false);
    setIsOrdersPageOpen(false); setIsProfilePageOpen(false); setIsAdminPageOpen(false);
    setIsCartPageOpen(false); setIsWishlistPageOpen(false); setActiveSectionPage(null); setSelectedProduct(null);
  };

  const handleReorder = (items: CartItem[]) => { setCartItems((prev) => [...prev, ...items]); handleOpenCartPage(); };
  const handleSelectProduct = (product: Product | null) => { if (product) { navigate(`/product/${product.id}`); } else { navigate('/home'); } };
  const handleSelectCategory = (cat: string) => { if (cat === 'all') { navigate('/home'); } else { navigate(`/category/${cat}`); } };
  const handleOpenSectionPage = (section: any, category: string = 'all') => { navigate(`/section/${section}`); setSectionPageCategory(category); };
  const handleOpenCategoriesPage = () => navigate('/categories');
  const handleOpenBrandPage = () => navigate('/brand');
  const handleOpenAboutUsPage = () => navigate('/about-us');
  const handleOpenTermsPage = () => navigate('/terms');
  const handleOpenRefundPolicyPage = () => navigate('/refund-policy');
  const handleOpenStoreLocatorPage = () => navigate('/find-us');
  const handleOpenCollectionsPage = () => navigate('/collections');
  const handleOpenOrders = (orderNumber?: string) => { if (orderNumber) setInitialInvoiceNumber(orderNumber); navigate('/orders'); };
  const handleOpenProfile = (tab: any = 'profile') => { const safeTab = tab === 'preferences' ? 'profile' : tab; setProfileTab(safeTab); navigate(`/profile/${safeTab}`); };
  const handleBackToShop = () => navigate('/home');
  const handleOpenCartPage = () => navigate('/cart');
  const handleOpenWishlistPage = () => navigate('/wishlist');
  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => { setAuthModalMode(mode); setIsAuthModalOpen(true); };
  const handleOpenAdmin = () => window.open(window.location.origin + '/admin', '_blank');

  const handleLoginSuccess = (newUser: UserProfile) => {
    setUser(newUser);
    setNotifications([{ id: `notif-auth-${Date.now()}`, title: `Welcome, ${newUser.firstName}`, message: `Account synchronized.`, timestamp: Date.now(), read: false, type: 'promo' }]);
  };

  const handleLogout = async () => {
    await authLogout(); setUser(null); setCartItems([]); setWishlistIds([]);
    try { localStorage.removeItem('gladyns_cart_items'); localStorage.removeItem('gladyns_wishlist_ids'); localStorage.removeItem('gladyns_current_user'); } catch (e) {}
    closeAllMainViews();
  };

  const customerNotifications = notifications.filter(n => ['drop', 'promo', 'wishlist'].includes(n.type));
  const unreadNotificationCount = customerNotifications.filter((n) => !n.read).length;
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistIds.length;

  const handleProceedToCheckout = () => { if (!authUser) { authLogin(); return; } setIsCheckoutOpen(true); };

  return (
    <>
      {isInitialBootLoading && (
        <FastLoadingScreen
          onFinish={() => setIsInitialBootLoading(false)}
        />
      )}

      {isAdminPageOpen ? (
        <AdminView 
          products={products}
          setProducts={setProducts}
          categories={categories}
          setCategories={setCategories}
          brands={brands}
          setBrands={setBrands}
          users={users}
          setUsers={setUsers}
          orders={orders}
          setOrders={setOrders}
          notifications={notifications}
          setNotifications={setNotifications}
          storeSettings={storeSettings}
          setStoreSettings={setStoreSettings}
          onBackToStore={() => {
            navigate('/home');
            setIsAdminPageOpen(false);
          }}
        />
      ) : (
        <StorefrontView
          {...{
            user, products, orders, notifications: customerNotifications, cartItems, wishlistIds, searchQuery,
            selectedCategory, sortBy, isCategoriesPageOpen, isAboutUsPageOpen, isTermsPageOpen,
            isRefundPolicyPageOpen,
            isStoreLocatorPageOpen, isBrandPageOpen, isCollectionsPageOpen, isOrdersPageOpen,
            isProfilePageOpen, isCartPageOpen, isWishlistPageOpen, activeSectionPage,
            sectionPageCategory, selectedProduct, isNotificationsOpen, isCheckoutOpen,
            isAuthModalOpen, authModalMode, isMobileSidebarOpen,
            initialInvoiceNumber, activeToast, unreadNotificationCount, cartItemCount,
            wishlistCount, profileTab, authUser, storeSettings,
            handleOpenCartPage,
            setSearchQuery, setSelectedCategory, setSortBy, setSelectedProduct,
            setIsNotificationsOpen, setIsCheckoutOpen, setIsAuthModalOpen, setIsMobileSidebarOpen,
            setInitialInvoiceNumber, setActiveToast, setUser, requestNotificationPermission,
            handleBackToShop, handleOpenSectionPage, handleOpenCategoriesPage, handleOpenBrandPage,
            handleOpenAboutUsPage, handleOpenTermsPage, handleOpenRefundPolicyPage, handleOpenStoreLocatorPage,
            handleOpenCollectionsPage, handleOpenOrders, handleOpenProfile, handleSelectCategory,
            handleOpenWishlistPage, handleOpenAuth, handleOpenAdmin, handleLogout, handleSelectProduct,
            handleToggleWishlist, handleQuickAdd, handleCancelOrder, handleRequestReturn,
            handleReorder, handleAddToCart, handleUpdateOrderStatus, handleUpdateQuantity,
            handleRemoveItem, handleProceedToCheckout,
            handleClearWishlist, handleMoveAllWishlistToBag, handleMarkAllNotificationsRead,
            handleMarkNotificationRead, handleDeleteNotification, handleClearAllNotifications,
            handleNavigateToProductFromNotification, handleOrderSuccess, handleLoginSuccess
          }}
        />
      )}
      <ScrollToTopButton />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}


