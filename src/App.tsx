import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Product, ProductVariant, ProductSize, CartItem, StoreNotification, Order, UserProfile, StoreSettings } from './types/store';
import { INITIAL_PRODUCTS, CATEGORIES } from './data/products';
import { INITIAL_ORDERS, INITIAL_CUSTOMERS, DEFAULT_USER_PROFILE, INITIAL_BRANDS } from './data/user';
import { INITIAL_NOTIFICATIONS } from './data/notifications';
import { StorefrontView } from './components/StorefrontView';
import { AdminView } from './components/admin/AdminView';
import { FastLoadingScreen } from './components/FastLoadingScreen';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { GoogleOneTap } from './components/GoogleOneTap';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useLanguageCurrency } from './context/LanguageCurrencyContext';
import { SectionType } from './components/SectionPage';
import { playNotificationSound } from './services/soundService';
import {
  subscribeToProducts,
  subscribeToCategories,
  subscribeToBrands,
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
  deleteRealtimeNotification,
  updateRealtimeUserProfile,
  fetchRealtimeCart,
  saveRealtimeCart,
  fetchRealtimeWishlist,
  saveRealtimeWishlist,
  fetchRealtimeUserProfile,
} from './services/supabaseService';
import { supabase, isSupabaseConfigured } from './lib/supabase';
const getGuestId = () => {
  let gid = localStorage.getItem('guest_id');
  if (!gid) {
    gid = `guest-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;
    localStorage.setItem('guest_id', gid);
  }
  return gid;
};

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'GLADYNS DEPARTMENT STORE',
  storeDescription: 'Curated Department House redefining modern living through audio precision, musical instruments, smart home appliances, and artisanal fashion.',
  contactEmail: 'concierge@gladyns.com',
  contactPhone: '+225 05 00 61 99 23',
  contactAddress: 'Rua Miguel Bombarda 142, 4050-377 Porto, Portugal',
  whatsappNumber: '+225 05 00 61 99 23',
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
    image: '',
    secondaryImage: '',
    foundedYear: '2018',
    atelierLocation: 'Porto, Portugal & Florence, Italy',
    missionStatement: 'Pure Engineering, Acoustic Precision, and Enduring Quality Across Every Department.',
  },
  terms: {
    title: 'Terms & Conditions of Sale',
    lastUpdated: 'September 2025',
    content: 'These terms and conditions apply to all purchases placed through the official GLADYNS boutique. By completing an order, the customer agrees unconditionally to all service terms and warranty protocols.',
    warrantyTitle: '2. Warranty & Quality Guarantee',
    warrantyPolicy: 'All curated items, studio equipment, and appliances come with our warranty and quality guarantee. In the event of functional, material, or hardware issues, we repair or replace your item in accordance with our guarantee policy.',
    returnTitle: '3. Return & Refund Policy',
    returnPolicy: 'You have a dedicated return period from delivery to return any unworn item with original tags. Prepaid return labels can be generated directly from your live Order Pipeline dashboard.',
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
    image: '',
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
  const { formatPrice } = useLanguageCurrency();
  
  const navigate = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  }, []);

  const [isInitialBootLoading, setIsInitialBootLoading] = useState(true);
  const [isReady, setIsReady] = useState(true);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('gls_cache_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_PRODUCTS;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const cached = localStorage.getItem('gls_cache_orders');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_ORDERS;
  });
  const [notifications, setNotifications] = useState<StoreNotification[]>([]);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('gls_dismissed_notification_ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch (e) {}
    return new Set<string>();
  });

  const recordDismissedNotification = (id: string) => {
    setDismissedNotificationIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem('gls_dismissed_notification_ids', JSON.stringify(Array.from(next)));
      } catch (e) {}
      return next;
    });
  };
  const [users, setUsers] = useState<UserProfile[]>([]);

  const [categories, setCategories] = useState<{ id: string; label: string }[]>(() => {
    try {
      const cached = localStorage.getItem('gls_cache_categories');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return CATEGORIES as any;
  });
  const [brands, setBrands] = useState<{ name: string; origin: string }[]>(() => {
    try {
      const cached = localStorage.getItem('gls_cache_brands');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_BRANDS;
  });

  // Initialize and attach cross-device real-time sync listeners
  useEffect(() => {
    initServerSync({
      products: INITIAL_PRODUCTS,
      orders: INITIAL_ORDERS,
      users: INITIAL_CUSTOMERS,
      notifications: INITIAL_NOTIFICATIONS,
      settings: DEFAULT_STORE_SETTINGS,
      categories: CATEGORIES as any,
      brands: INITIAL_BRANDS,
    });

    const unsubProducts = subscribeToProducts(setProducts, () => setIsReady(true));
    const unsubCategories = subscribeToCategories(setCategories);
    const unsubBrands = subscribeToBrands(setBrands);
    const unsubOrders = subscribeToOrders(setOrders);
    const unsubNotifs = subscribeToNotifications(setNotifications);
    const unsubSettings = subscribeToSettings(DEFAULT_STORE_SETTINGS, setStoreSettings);
    const unsubUsers = subscribeToUsers(setUsers);

    return () => {
      unsubProducts();
      unsubCategories?.();
      unsubBrands?.();
      unsubOrders();
      unsubNotifs();
      unsubSettings();
      unsubUsers();
    };
  }, []);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => {
    if (typeof window === 'undefined') return null;
    const raw = window.location.pathname.replace(/^\/+/, '');
    if (raw.startsWith('product/')) {
      const prodId = decodeURIComponent(raw.replace(/^product\/?/, '').replace(/\/+$/, '').split('?')[0].trim());
      if (!prodId) return null;
      try {
        const cached = localStorage.getItem('gls_cache_products');
        if (cached) {
          const list = JSON.parse(cached);
          if (Array.isArray(list)) {
            const found = list.find((p: Product) => p.id === prodId || p.slug === prodId);
            if (found) return found;
          }
        }
      } catch (e) {}
      return INITIAL_PRODUCTS.find((p) => p.id === prodId || p.slug === prodId) || null;
    }
    return null;
  });
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
        const existingIdx = prevUsers.findIndex((u) => u.id === authUser.id || (u.email && authUser.email && u.email.toLowerCase() === authUser.email.toLowerCase()));
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
      if (user && user.id !== 'usr-guest' && !user.id.startsWith('guest-')) {
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

  // Premium elegant synthesizer chime using robust Web Audio API + fallback
  const playPremiumChime = () => {
    playNotificationSound();
  };

  // Trigger native system banner notifications (drops from top, stays in background)
  const triggerSystemNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const defaultOptions: any = {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [100, 50, 100],
      tag: 'gladyns-notif',
      data: { url: '/orders' },
      ...options,
    };

    const targetUrl = defaultOptions.data?.url || '/orders';

    const handleNotifClick = () => {
      window.focus();
      navigate(targetUrl);
    };

    // Use Promise.race with a 600ms timeout so we never hang if ServiceWorker isn't active
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error('timeout')), 600)),
      ])
        .then((registration: any) => {
          if (registration && registration.showNotification) {
            registration.showNotification(title, defaultOptions);
          } else {
            const notif = new Notification(title, defaultOptions);
            notif.onclick = handleNotifClick;
          }
        })
        .catch(() => {
          try {
            const notif = new Notification(title, defaultOptions);
            notif.onclick = handleNotifClick;
          } catch (_) {}
        });
    } else {
      try {
        const notif = new Notification(title, defaultOptions);
        notif.onclick = handleNotifClick;
      } catch (_) {}
    }
  }, [navigate]);

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
            message = `Your order has been cancelled. A full refund of ${formatPrice(order.total)} has been credited back to your original payment method.`;
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
          customerId: order.customerId,
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
          data: { url: '/orders' },
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

  // Ref & localStorage tracking for already alerted product IDs so page refresh NEVER re-triggers arrival alerts
  const alertedProductIdsRef = useRef<Set<string> | null>(null);
  const catalogHydratedRef = useRef<boolean>(false);

  // Ref to track products already alerted for low stock to avoid duplicate spam
  const lowStockAlertedRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!products || products.length === 0) return;

    if (alertedProductIdsRef.current === null) {
      alertedProductIdsRef.current = new Set();
      try {
        const saved = localStorage.getItem('gls_alerted_product_ids');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) parsed.forEach((id: string) => alertedProductIdsRef.current?.add(id));
        }
      } catch (e) {}
    }

    // While booting or before catalog is stably ready, absorb all existing items as baseline without firing toasts
    if (isInitialBootLoading || !isReady || !catalogHydratedRef.current) {
      products.forEach((p) => alertedProductIdsRef.current?.add(p.id));
      try {
        localStorage.setItem('gls_alerted_product_ids', JSON.stringify(Array.from(alertedProductIdsRef.current)));
      } catch (e) {}

      if (isReady && !isInitialBootLoading) {
        catalogHydratedRef.current = true;
      }
      return;
    }

    // Detect truly newly added products during active session
    products.forEach((product) => {
      if (!alertedProductIdsRef.current?.has(product.id)) {
        alertedProductIdsRef.current?.add(product.id);
        try {
          localStorage.setItem('gls_alerted_product_ids', JSON.stringify(Array.from(alertedProductIdsRef.current)));
        } catch (e) {}

          const title = `✨ New Arrival: ${product.name}`;
          const message = `Discover our newest addition: "${product.name}" is now available in store for ${formatPrice(product.price)}.`;

          const arrivalNotif: StoreNotification = {
            id: `notif-new-product-${product.id}`,
            title,
            message,
            timestamp: Date.now(),
            read: false,
            type: 'product',
            linkTarget: product.id,
          };

          setNotifications((prev) => [arrivalNotif, ...prev]);
          playPremiumChime();
          triggerSystemNotification(title, {
            body: `Now available in store for ${formatPrice(product.price)}. Tap to view!`,
            tag: `new-product-${product.id}`,
            icon: product.primaryImage || '/pwa-192x192.png',
            data: { url: `/product/${product.id}` },
          });
          setActiveToast({
            id: arrivalNotif.id,
            title: arrivalNotif.title,
            message: arrivalNotif.message,
          });
        }
      });

    // Check low stock
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
          data: { url: '/admin' },
        });
      } else if (!isLow && alreadyAlerted) {
        lowStockAlertedRef.current[product.id] = false;
      }
    });
  }, [products]);

  // Real-time incoming notification audio feedback & toast watcher
  const lastKnownNotifIdsRef = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    if (lastKnownNotifIdsRef.current === null) {
      lastKnownNotifIdsRef.current = new Set(notifications.map(n => n.id));
      return;
    }

    const newNotifs = notifications.filter(n => !lastKnownNotifIdsRef.current?.has(n.id) && !dismissedNotificationIds.has(n.id));
    if (newNotifs.length > 0) {
      newNotifs.forEach(n => lastKnownNotifIdsRef.current?.add(n.id));
      const latest = newNotifs[0];
      playNotificationSound();
      setActiveToast({
        id: latest.id,
        title: latest.title,
        message: latest.message,
      });
      triggerSystemNotification(latest.title, {
        body: latest.message,
        icon: '/pwa-192x192.png',
      });
    }
  }, [notifications, dismissedNotificationIds, triggerSystemNotification]);

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
    const currentUid = user?.id || getGuestId();
    fetchRealtimeWishlist(currentUid).then((loadedIds) => {
      if (Array.isArray(loadedIds)) {
        setWishlistIds(loadedIds);
      }
      isWishlistInitRef.current = true;
    });
  }, [user?.id]);

  useEffect(() => {
    if (!isWishlistInitRef.current) return;
    const currentUid = user?.id || getGuestId();
    saveRealtimeWishlist(currentUid, wishlistIds);
  }, [wishlistIds, user?.id]);

  // Cart State with Cloud / Supabase persistence
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const isCartInitRef = useRef(false);

  useEffect(() => {
    const currentUid = user?.id || getGuestId();
    fetchRealtimeCart(currentUid).then((loadedCart) => {
      if (Array.isArray(loadedCart)) {
        setCartItems(loadedCart);
      }
      isCartInitRef.current = true;
    });
  }, [user?.id]);

  useEffect(() => {
    if (!isCartInitRef.current) return;
    const currentUid = user?.id || getGuestId();
    saveRealtimeCart(currentUid, cartItems);
  }, [cartItems, user?.id]);

  const [initialInvoiceNumber, setInitialInvoiceNumber] = useState<string | null>(null);
  const [activeToast, setActiveToast] = useState<{ id: string; title: string; message: string; orderNumber?: string } | null>(null);

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => setActiveToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const closeAllMainViews = useCallback((exceptProduct = false) => {
    setIsCategoriesPageOpen(false); setIsBrandPageOpen(false); setIsAboutUsPageOpen(false);
    setIsTermsPageOpen(false); setIsRefundPolicyPageOpen(false); setIsStoreLocatorPageOpen(false); setIsCollectionsPageOpen(false);
    setIsOrdersPageOpen(false); setIsProfilePageOpen(false); setIsAdminPageOpen(false);
    setIsCartPageOpen(false); setIsWishlistPageOpen(false); setActiveSectionPage(null);
    setIsNotificationsOpen(false);
    if (!exceptProduct) setSelectedProduct(null);
  }, []);

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
      const prodId = decodeURIComponent(rawHash.replace(/^product\/?/, '').replace(/\/+$/, '').split('?')[0].trim());
      let p = products.find((prod) => prod.id === prodId || prod.slug === prodId);
      if (!p) {
        try {
          const cached = localStorage.getItem('gls_cache_products');
          if (cached) {
            const list = JSON.parse(cached);
            if (Array.isArray(list)) {
              p = list.find((prod: Product) => prod.id === prodId || prod.slug === prodId);
            }
          }
        } catch (e) {}
      }
      if (!p) {
        p = INITIAL_PRODUCTS.find((prod) => prod.id === prodId || prod.slug === prodId);
      }
      if (p) {
        closeAllMainViews(true);
        setSelectedProduct(p);
      } else if (isSupabaseConfigured) {
        // Fallback: fetch from Supabase if newly created cloud product
        Promise.resolve(
          supabase
            .from('products')
            .select('*')
            .or(`id.eq.${prodId},slug.eq.${prodId}`)
            .maybeSingle()
        )
          .then(({ data, error }) => {
            if (data && !error) {
              const mapped: Product = {
                ...data,
                images: Array.isArray(data.images) ? data.images : (data.image ? [data.image] : []),
                colors: Array.isArray(data.colors) ? data.colors : [],
                sizes: Array.isArray(data.sizes) ? data.sizes : [],
                tags: Array.isArray(data.tags) ? data.tags : [],
              };
              closeAllMainViews(true);
              setSelectedProduct(mapped);
            }
          })
          .catch(() => {});
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
  }, [products, closeAllMainViews]);

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
      const defaultColor = (product.colors && product.colors.length > 0) ? product.colors[0] : { id: 'default', name: 'Standard', colorHex: '#000000', inStock: true };
      const defaultSize = (product.sizes && product.sizes.length > 0) ? (product.sizes.find((s) => s.inStock) || product.sizes[0]) : { name: 'One Size', inStock: true };
      handleAddToCart(product, defaultColor, defaultSize, 1);
    });
    if (wishlistedProducts.length > 0) handleOpenCartPage();
  };

  const handleAddToCart = (product: Product, variant: any, size: any, quantity: number, openDrawer: boolean = false) => {
    const safeVariant = variant || (product.colors && product.colors.length > 0 ? product.colors[0] : { id: 'default', name: 'Standard', colorHex: '#000000', inStock: true });
    const safeSize = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : { name: 'One Size', inStock: true });
    const variantKey = safeVariant?.id || safeVariant?.name || 'default';
    const sizeKey = typeof safeSize === 'object' ? (safeSize?.name || 'standard') : safeSize;
    const itemId = `${product.id}-${variantKey}-${sizeKey}`;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) return prev.map((item) => item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item);
      return [...prev, { id: itemId, product, selectedColor: safeVariant, selectedSize: safeSize, quantity, addedAt: Date.now() }];
    });
    if (openDrawer) handleOpenCartPage();
  };

  const handleQuickAdd = (product: Product, variant: any) => {
    const defaultColor = variant || (product.colors && product.colors.length > 0 ? product.colors[0] : { id: 'default', name: 'Standard', colorHex: '#000000', inStock: true });
    const defaultSize = (product.sizes && product.sizes.length > 0) ? (product.sizes.find((s) => s.inStock) || product.sizes[0]) : { name: 'One Size', inStock: true };
    handleAddToCart(product, defaultColor, defaultSize, 1, false);
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return handleRemoveItem(itemId);
    setCartItems((prev) => prev.map((item) => item.id === itemId ? { ...item, quantity: newQuantity } : item));
  };

  const handleRemoveItem = (itemId: string) => setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    customerNotifications.forEach((n) => markRealtimeNotificationRead(n.id));
  };
  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    markRealtimeNotificationRead(id);
  };
  const handleDeleteNotification = (id: string) => {
    recordDismissedNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    deleteRealtimeNotification(id);
  };
  const handleClearAllNotifications = () => {
    customerNotifications.forEach((n) => {
      recordDismissedNotification(n.id);
      deleteRealtimeNotification(n.id);
    });
    setNotifications([]);
  };
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
    const customerNotification: StoreNotification = {
      id: `notif-${Date.now()}-c`,
      title: `Order ${newOrder.orderNumber} Placed`,
      message: `Payment authorized. Fulfillment has commenced.`,
      timestamp: Date.now(),
      read: false,
      type: 'order',
      linkTarget: newOrder.orderNumber,
      customerId: user?.id || newOrder.customerId || getGuestId(),
    };
    const adminNotification: StoreNotification = {
      id: `notif-${Date.now()}-a`,
      title: `New Order Received: ${newOrder.orderNumber}`,
      message: `A new order has been placed for ${newOrder.items.length} item(s) totaling ${formatPrice(newOrder.total)}.`,
      timestamp: Date.now(),
      read: false,
      type: 'order',
      linkTarget: newOrder.orderNumber,
      isAdminOnly: true,
    };
    setNotifications((prev) => [customerNotification, adminNotification, ...prev]);
    addRealtimeNotification(customerNotification);
    addRealtimeNotification(adminNotification);
    setActiveToast({ id: customerNotification.id, title: customerNotification.title, message: customerNotification.message, orderNumber: newOrder.orderNumber });
    setInitialInvoiceNumber(newOrder.orderNumber);
    if (user?.email) dispatchOrderStatusEmail(user.email, newOrder.orderNumber, 'PLACED', `Order for ${formatPrice(newOrder.total)} received.`);
    setIsOrdersPageOpen(true);
    // Fire real device push notification + chime sound for customer when order placed
    playPremiumChime();
    triggerSystemNotification('\u2705 Order ' + newOrder.orderNumber + ' Confirmed!', {
      body: 'Your order for ' + formatPrice(newOrder.total) + ' has been placed. We are on it!',
      tag: 'order-placed-' + newOrder.id,
      icon: '/pwa-192x192.png',
      data: { url: '/orders' },
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders((prev) => prev.map((ord) => ord.id === orderId ? { ...ord, status: newStatus } : ord));
    updateRealtimeOrderStatus(orderId, newStatus);
  };

  const handleCancelOrder = (orderId: string, reason: string) => {
    const targetOrder = orders.find((ord) => ord.id === orderId);
    setOrders((prev) => prev.map((ord) => ord.id === orderId ? { ...ord, status: 'cancelled', cancelledAt: new Date().toLocaleDateString(), cancelReason: reason } : ord));
    updateRealtimeOrderStatus(orderId, 'cancelled');
    const cancelNotif: StoreNotification = {
      id: `notif-cancel-${Date.now()}`,
      title: `Order Cancelled`,
      message: `Order successfully cancelled. Refund processed.`,
      timestamp: Date.now(),
      read: false,
      type: 'order',
      linkTarget: targetOrder?.orderNumber,
      customerId: targetOrder?.customerId,
    };
    setNotifications((prev) => [cancelNotif, ...prev]);
    addRealtimeNotification(cancelNotif);
  };

  const handleRequestReturn = (orderId: string) => {
    const targetOrder = orders.find((ord) => ord.id === orderId);
    setOrders((prev) => prev.map((ord) => ord.id === orderId ? { ...ord, returnRequested: true } : ord));
    const returnNotif: StoreNotification = {
      id: `notif-return-${Date.now()}`,
      title: 'Return Label Dispatched',
      message: `Prepaid return authorization sent to your email.`,
      timestamp: Date.now(),
      read: false,
      type: 'order',
      linkTarget: targetOrder?.orderNumber,
      customerId: targetOrder?.customerId,
    };
    setNotifications((prev) => [returnNotif, ...prev]);
    addRealtimeNotification(returnNotif);
  };


  const handleReorder = (items: CartItem[]) => { setCartItems((prev) => [...prev, ...items]); handleOpenCartPage(); };
  const handleSelectProduct = (product: Product | null) => {
    setIsNotificationsOpen(false);
    if (product) { navigate(`/product/${product.id}`); } else { navigate('/home'); }
  };
  const handleSelectCategory = (cat: string) => {
    setIsNotificationsOpen(false);
    if (cat === 'all') { navigate('/home'); } else { navigate(`/category/${cat}`); }
  };
  const handleOpenSectionPage = (section: any, category: string = 'all') => {
    setIsNotificationsOpen(false);
    navigate(`/section/${section}`);
    setSectionPageCategory(category);
  };
  const handleOpenCategoriesPage = () => { setIsNotificationsOpen(false); navigate('/categories'); };
  const handleOpenBrandPage = () => { setIsNotificationsOpen(false); navigate('/brand'); };
  const handleOpenAboutUsPage = () => { setIsNotificationsOpen(false); navigate('/about-us'); };
  const handleOpenTermsPage = () => { setIsNotificationsOpen(false); navigate('/terms'); };
  const handleOpenRefundPolicyPage = () => { setIsNotificationsOpen(false); navigate('/refund-policy'); };
  const handleOpenStoreLocatorPage = () => { setIsNotificationsOpen(false); navigate('/find-us'); };
  const handleOpenCollectionsPage = () => { setIsNotificationsOpen(false); navigate('/collections'); };
  const handleOpenOrders = (orderNumber?: string) => { setIsNotificationsOpen(false); if (orderNumber) setInitialInvoiceNumber(orderNumber); navigate('/orders'); };
  const handleOpenProfile = (tab: any = 'profile') => { setIsNotificationsOpen(false); const safeTab = tab === 'preferences' ? 'profile' : tab; setProfileTab(safeTab); navigate(`/profile/${safeTab}`); };
  const handleBackToShop = () => {
    setIsNotificationsOpen(false);
    setIsMobileSidebarOpen(false);
    closeAllMainViews();
    navigate('/home');
  };
  const handleOpenCartPage = () => { setIsNotificationsOpen(false); navigate('/cart'); };
  const handleOpenWishlistPage = () => { setIsNotificationsOpen(false); navigate('/wishlist'); };
  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => { setAuthModalMode(mode); setIsAuthModalOpen(true); };

  const handleLoginSuccess = (newUser: UserProfile) => {
    setUser(newUser);
    setNotifications([{ id: `notif-auth-${Date.now()}`, title: `Welcome, ${newUser.firstName}`, message: `Account synchronized.`, timestamp: Date.now(), read: false, type: 'promo' }]);
  };

  const handleLogout = async () => {
    await authLogout(); setUser(null); setCartItems([]); setWishlistIds([]);
    try { localStorage.removeItem('gladyns_cart_items'); localStorage.removeItem('gladyns_wishlist_ids'); localStorage.removeItem('gladyns_current_user'); } catch (e) {}
    closeAllMainViews();
  };

  const customerNotifications = useMemo(() => {
    const map = new Map<string, StoreNotification>();
    const currentUserId = user?.id || getGuestId();

    notifications.forEach((n) => {
      if (n.isAdminOnly) return;

      // Filter out dismissed notifications
      if (dismissedNotificationIds.has(n.id)) return;

      // Order notifications are strictly private to the customer who placed the order
      if (n.type === 'order') {
        if (!n.customerId || n.customerId !== currentUserId) {
          return;
        }
      }

      if (!['drop', 'promo', 'wishlist', 'order', 'product', 'restock'].includes(n.type)) return;

      // Filter out notifications for products that have been deleted or no longer exist in catalog
      if ((n.type === 'product' || n.type === 'restock' || n.type === 'drop') && n.linkTarget && products.length > 0) {
        const productExists = products.some(p => p.id === n.linkTarget || p.slug === n.linkTarget);
        if (!productExists) return;
      }

      // Filter out stale broadcast alerts older than 7 days so visitors don't see ancient notifications from weeks ago
      if (['drop', 'promo', 'product', 'restock'].includes(n.type) && n.timestamp) {
        const timeMs = typeof n.timestamp === 'number' ? n.timestamp : new Date(n.timestamp).getTime();
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (!isNaN(timeMs) && timeMs < sevenDaysAgo) return;
      }

      // Filter out redundant raw Postgres DB trigger logs (e.g. "Order GL-4741 Status Updated to SHIPPING")
      // because rich, styled customer transition notifications ("Order GL-4741 Dispatched") are already sent.
      const titleLower = (n.title || '').toLowerCase();
      const isRawDbTrigger = titleLower.includes('status updated to');
      if (isRawDbTrigger) return;

      // Extract status keyword to merge DB trigger & client transition notifications for the same status change
      const statusKey = titleLower.includes('processing') ? 'processing'
        : titleLower.includes('confirmed') ? 'confirmed'
        : titleLower.includes('dispatched') || titleLower.includes('shipping') ? 'shipping'
        : titleLower.includes('delivered') ? 'delivered'
        : titleLower.includes('cancelled') ? 'cancelled'
        : n.title || n.id;

      // Deduplicate arrival/drop/promo notices for the same product to prevent double entries
      const dedupeKey = (n.type === 'product' || n.type === 'restock' || n.type === 'drop') && n.linkTarget
        ? `product-notice-${n.linkTarget}`
        : n.type === 'order' && n.linkTarget
        ? `order-${n.linkTarget}-${statusKey}`
        : n.id;

      if (dismissedNotificationIds.has(dedupeKey)) return;

      if (!map.has(dedupeKey)) {
        map.set(dedupeKey, n);
      }
    });
    return Array.from(map.values());
  }, [notifications, user, products, dismissedNotificationIds]);
  const adminNotifications = notifications.filter(n => n.isAdminOnly || n.type !== 'order' || !n.customerId);
  const unreadNotificationCount = customerNotifications.filter((n) => !n.read).length;
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistIds.length;

  // Real-time Audio Chime & Active Toast alert when new customer notifications arrive
  const alertedCustomerNotifIdsRef = useRef<Set<string>>(new Set());
  const initialNotifsAbsorbedRef = useRef(false);

  useEffect(() => {
    if (!customerNotifications || customerNotifications.length === 0) return;
    
    // On initial boot, absorb existing baseline without firing chime
    if (!initialNotifsAbsorbedRef.current || isInitialBootLoading) {
      customerNotifications.forEach(n => alertedCustomerNotifIdsRef.current.add(n.id));
      if (!isInitialBootLoading) initialNotifsAbsorbedRef.current = true;
      return;
    }

    // Fire audio chime and toast whenever a newly arrived notification reaches the customer
    customerNotifications.forEach((n) => {
      if (!n.read && !alertedCustomerNotifIdsRef.current.has(n.id)) {
        alertedCustomerNotifIdsRef.current.add(n.id);
        playNotificationSound();
        setActiveToast({
          id: n.id,
          title: n.title,
          message: n.message,
        });
        triggerSystemNotification(n.title, {
          body: n.message,
          tag: n.id,
          data: { url: n.linkTarget ? (n.type === 'order' ? '/orders' : `/product/${n.linkTarget}`) : '/orders' },
        });
      }
    });
  }, [customerNotifications, isInitialBootLoading, triggerSystemNotification]);

  const handleProceedToCheckout = () => { if (!authUser) { authLogin(); return; } setIsCheckoutOpen(true); };

  return (
    <>
      {isInitialBootLoading && (
        <FastLoadingScreen
          isReady={isReady}
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
          notifications={adminNotifications}
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
            user, products, orders, categories, notifications: customerNotifications, cartItems, wishlistIds, searchQuery,
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
            handleOpenWishlistPage, handleOpenAuth, handleLogout, handleSelectProduct,
            handleToggleWishlist, handleQuickAdd, handleCancelOrder, handleRequestReturn,
            handleReorder, handleAddToCart, handleUpdateOrderStatus, handleUpdateQuantity,
            handleRemoveItem, handleProceedToCheckout,
            handleClearWishlist, handleMoveAllWishlistToBag, handleMarkAllNotificationsRead,
            handleMarkNotificationRead, handleDeleteNotification, handleClearAllNotifications,
            handleNavigateToProductFromNotification, handleOrderSuccess, handleLoginSuccess
          }}
        />
      )}

      {!isAdminPageOpen && (
        <>
          <GoogleOneTap />
          <CookieConsentBanner onOpenTerms={handleOpenTermsPage} />
          <ScrollToTopButton />
        </>
      )}
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





