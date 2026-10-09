import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  Settings,
  ArrowLeft,
  Bell,
  Search,
  LogOut,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Box,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Layers,
  Menu,
  X,
  ArrowUpRight,
  Filter,
  Check,
  Activity,
  Globe,
  ShieldCheck,
  UploadCloud,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Product, UserProfile, Order, StoreSettings, StoreNotification } from '../../types/store';
import { getLiveSyncMode, setLiveSyncMode, pushLocalCatalogToLive, pullLiveCatalogToLocal } from '../../services/supabaseService';
import { AdminCustomers } from './AdminCustomers';
import { AdminCustomerTracker } from './AdminCustomerTracker';
import { AdminOrders } from './AdminOrders';
import { AdminProducts } from './AdminProducts';
import { AdminInventory } from './AdminInventory';
import { AdminCategories } from './AdminCategories';
import { AdminBrands } from './AdminBrands';
import { AdminReviews } from './AdminReviews';
import { AdminReceipts } from './AdminReceipts';
import { AdminSettings } from './AdminSettings';
import { AdminSections } from './AdminSections';
import { AdminDashboardCharts } from './AdminDashboardCharts';
import { AdminInventoryForecasting } from './AdminInventoryForecasting';
import { NotificationDrawer } from '../NotificationDrawer';
import { PWAInstallButton } from '../PWAInstallButton';
import { useLanguageCurrency } from '../../context/LanguageCurrencyContext';
import { Plus, FileText } from 'lucide-react';
import { AdminLogin } from './AdminLogin';
import { AdminPinLock } from './AdminPinLock';
import { 
  getAdminActiveSession, 
  clearAdminSession, 
  isSessionPinLocked, 
  setSessionPinLocked, 
  ADMIN_SESSION_KEY 
} from '../../services/adminAuthService';
import { INITIAL_ORDERS, INITIAL_CUSTOMERS, INITIAL_BRANDS } from '../../data/user';

interface AdminViewProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: { id: string; label: string }[];
  setCategories: React.Dispatch<React.SetStateAction<{ id: string; label: string }[]>>;
  brands: { name: string; origin: string }[];
  setBrands: React.Dispatch<React.SetStateAction<{ name: string; origin: string }[]>>;
  users: UserProfile[];
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  notifications: StoreNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<StoreNotification[]>>;
  storeSettings: StoreSettings;
  setStoreSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
  onBackToStore: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  products,
  setProducts,
  categories,
  setCategories,
  brands,
  setBrands,
  users,
  setUsers,
  orders,
  setOrders,
  notifications,
  setNotifications,
  storeSettings,
  setStoreSettings,
  onBackToStore,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'tracker' | 'orders' | 'products' | 'inventory' | 'categories' | 'brands' | 'reviews' | 'sections' | 'receipts' | 'settings'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Tab-level authentication: closing the tab completely destroys session
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return getAdminActiveSession() !== null;
  });

  const [adminEmail, setAdminEmail] = useState<string>(() => {
    const session = getAdminActiveSession();
    return session?.email || '';
  });

  // 4-Digit PIN Lock: Automatically locks whenever page is refreshed
  const [isPinLocked, setIsPinLocked] = useState<boolean>(() => {
    const session = getAdminActiveSession();
    if (!session) return false;
    // If active session exists on mount, it's a page reload or existing tab
    return true;
  });

  // Mark session as PIN-locked before any page reload
  useEffect(() => {
    const handleBeforeUnload = () => {
      setSessionPinLocked(true);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleAdminLogout = () => {
    clearAdminSession();
    setIsAdminAuthenticated(false);
    setIsPinLocked(false);
  };

  const handleSeedDemoData = () => {
    setOrders(INITIAL_ORDERS);
    setUsers(INITIAL_CUSTOMERS);
    setBrands(INITIAL_BRANDS);
    setNoticeToast({
      message: 'Luxury demo orders, customer profiles, and brands loaded successfully.',
      type: 'info',
    });
  };

  const { formatPrice, currency, setCurrency, language, setLanguage } = useLanguageCurrency();

  useEffect(() => {
    // Administrator preferences: Currency Franc CFA (XOF) and Language English (en)
    if (language !== 'en') {
      setLanguage('en');
    }
    if (currency.code !== 'XOF') {
      setCurrency('XOF');
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  // Global Admin Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState<'all' | 'products' | 'orders' | 'customers'>('all');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [noticeToast, setNoticeToast] = useState<{ message: string; type?: 'info' | 'warning' } | null>(null);

  // Local Sandbox Mode State & Handlers
  const [liveSyncMode, setLiveSyncModeState] = useState<'isolated' | 'live'>(() => getLiveSyncMode());
  const [isPushingToLive, setIsPushingToLive] = useState(false);
  const [isPullingFromLive, setIsPullingFromLive] = useState(false);

  const handleToggleLiveSyncMode = () => {
    const nextMode = liveSyncMode === 'isolated' ? 'live' : 'isolated';
    if (nextMode === 'live') {
      const confirmLive = window.confirm(
        '⚠️ Warning: Switching to Direct Live Sync means changes made locally will immediately update your live production website and Supabase database. Are you sure?'
      );
      if (!confirmLive) return;
    }
    setLiveSyncMode(nextMode);
    setLiveSyncModeState(nextMode);
    setNoticeToast({
      message: nextMode === 'isolated'
        ? '🛡️ Local Sandbox Mode Active: Local changes are isolated from the live store.'
        : '⚡ Live Cloud Sync Active: Local changes will sync directly to Supabase.',
      type: 'info',
    });
  };

  const handlePushToLive = async () => {
    const confirmPush = window.confirm(
      `Are you sure you want to push all ${products.length} local products directly to the live Supabase store?`
    );
    if (!confirmPush) return;

    setIsPushingToLive(true);
    const result = await pushLocalCatalogToLive();
    setIsPushingToLive(false);

    if (result.success) {
      setNoticeToast({
        message: `✨ Successfully pushed ${result.count} products to the live Supabase database!`,
        type: 'info',
      });
    } else {
      setNoticeToast({
        message: `Failed to push products to Supabase: ${result.error}`,
        type: 'warning',
      });
    }
  };

  const handlePullFromLive = async () => {
    setIsPullingFromLive(true);
    const result = await pullLiveCatalogToLocal();
    setIsPullingFromLive(false);

    if (result.success) {
      setNoticeToast({
        message: `✨ Successfully pulled ${result.count} live products from Supabase!`,
        type: 'info',
      });
    } else {
      setNoticeToast({
        message: `Failed to pull products from Supabase: ${result.error}`,
        type: 'warning',
      });
    }
  };

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const totalSales = orders.reduce((acc, o) => acc + o.total, 0);
  const pendingOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNewProductAdded = (newProduct: Product) => {
    const newNotif: StoreNotification = {
      id: `notif-${Date.now()}`,
      title: 'New Drop Available',
      message: `New piece "${newProduct.name}" has just been added to our collection.`,
      timestamp: Date.now(),
      read: false,
      type: 'drop',
      linkTarget: newProduct.id,
      image: newProduct.primaryImage || newProduct.images?.[0],
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  useEffect(() => {
    if (noticeToast) {
      const timer = setTimeout(() => setNoticeToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [noticeToast]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key?.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    setIsNotificationsOpen(false);
  };

  const handleNavigateToProduct = (productId: string) => {
    const targetProduct = products.find(p => p.id === productId || p.slug === productId || p.name?.toLowerCase() === productId?.toLowerCase());
    setActiveTab('products');
    setIsNotificationsOpen(false);
    if (targetProduct) {
      setProductSearchQuery(targetProduct.name);
    } else {
      setNoticeToast({
        message: `Product reference "${productId}" was not found in active inventory.`,
        type: 'warning'
      });
      setProductSearchQuery('');
    }
  };

  const handleOpenOrdersFromNotif = (orderNumber?: string) => {
    setActiveTab('orders');
    setIsNotificationsOpen(false);
    if (orderNumber) {
      const targetOrder = orders.find(o => o.orderNumber?.toLowerCase() === orderNumber?.toLowerCase() || o.id === orderNumber);
      if (targetOrder) {
        setOrderSearchQuery(targetOrder.orderNumber);
      } else {
        setNoticeToast({
          message: `Order #${orderNumber} does not exist in the current logistics ledger.`,
          type: 'warning'
        });
        setOrderSearchQuery(orderNumber);
      }
    }
  };

  // Real-time Global Search matching
  const cleanQ = searchQuery?.toLowerCase().trim();

  const matchingProducts = useMemo(() => {
    if (!cleanQ) return [];
    return products.filter(p =>
      p.name?.toLowerCase().includes(cleanQ) ||
      p.id?.toLowerCase().includes(cleanQ) ||
      (p.sku && p.sku?.toLowerCase().includes(cleanQ)) ||
      p.categoryLabel?.toLowerCase().includes(cleanQ) ||
      (p.brand && p.brand?.toLowerCase().includes(cleanQ))
    );
  }, [products, cleanQ]);

  const matchingOrders = useMemo(() => {
    if (!cleanQ) return [];
    return orders.filter(o =>
      o.orderNumber?.toLowerCase().includes(cleanQ) ||
      o.id?.toLowerCase().includes(cleanQ) ||
      (o.trackingNumber && o.trackingNumber?.toLowerCase().includes(cleanQ)) ||
      o.shippingAddress.firstName?.toLowerCase().includes(cleanQ) ||
      o.shippingAddress.lastName?.toLowerCase().includes(cleanQ) ||
      `${o.shippingAddress.firstName} ${o.shippingAddress.lastName}`?.toLowerCase().includes(cleanQ) ||
      o.shippingAddress.email?.toLowerCase().includes(cleanQ)
    );
  }, [orders, cleanQ]);

  const matchingCustomers = useMemo(() => {
    if (!cleanQ) return [];
    return users.filter(u =>
      `${u.firstName} ${u.lastName}`?.toLowerCase().includes(cleanQ) ||
      u.email?.toLowerCase().includes(cleanQ) ||
      u.id?.toLowerCase().includes(cleanQ) ||
      (u.phone && u.phone?.toLowerCase().includes(cleanQ))
    );
  }, [users, cleanQ]);

  const totalResultsCount = matchingProducts.length + matchingOrders.length + matchingCustomers.length;

  const handleSelectProductResult = (p: Product) => {
    setProductSearchQuery(p.name);
    setActiveTab('products');
    setIsSearchOpen(false);
    setIsMobileSearchOpen(false);
  };

  const handleSelectOrderResult = (o: Order) => {
    setOrderSearchQuery(o.orderNumber);
    setActiveTab('orders');
    setIsSearchOpen(false);
    setIsMobileSearchOpen(false);
  };

  const handleSelectCustomerResult = (u: UserProfile) => {
    setCustomerSearchQuery(`${u.firstName} ${u.lastName}`.trim() || u.email);
    setActiveTab('customers');
    setIsSearchOpen(false);
    setIsMobileSearchOpen(false);
  };

  const lowStockCount = products.filter(p => (p.stockLevel !== undefined ? p.stockLevel : 10) < 5).length;

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Order Logistics', icon: ShoppingBag, count: pendingOrders },
    { id: 'receipts', label: 'Receipt Ledger', icon: FileText },
    { id: 'products', label: 'Product Management', icon: Box },
    { id: 'inventory', label: 'Inventory Management', icon: Package, count: lowStockCount > 0 ? lowStockCount : undefined },
    { id: 'categories', label: 'Taxonomy', icon: Layers },
    { id: 'brands', label: 'Partners', icon: Sparkles },
    { id: 'sections', label: 'Sections Management', icon: LayoutDashboard },
    { id: 'customers', label: 'Client Directory', icon: Users },
    { id: 'tracker', label: 'Live Activity Tracker', icon: Activity, count: users.filter(u => u.sessionStatus === 'online').length },
    { id: 'reviews', label: 'Review Management', icon: Bell },
    { id: 'settings', label: 'Store CMS & Policies', icon: Settings },
  ];

  const handleTabChange = (id: any) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  if (!isAdminAuthenticated) {
    return (
      <AdminLogin
        onLoginSuccess={(email) => {
          setAdminEmail(email);
          setIsAdminAuthenticated(true);
          setIsPinLocked(false);
          setSessionPinLocked(false);
        }}
        onBackToStore={onBackToStore}
        storeName={storeSettings?.storeName}
      />
    );
  }

  if (isPinLocked) {
    return (
      <AdminPinLock
        adminEmail={adminEmail}
        onUnlock={() => {
          setIsPinLocked(false);
          setSessionPinLocked(false);
        }}
        onLogout={handleAdminLogout}
        onBackToStore={onBackToStore}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row relative">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-zinc-950 text-white flex flex-col shrink-0 
        transform transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:translate-x-0 lg:w-64
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">G</div>
            <div>
              <h2 className="font-display font-bold text-sm tracking-tight">GLADYNS ADMIN</h2>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Control Panel</p>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-zinc-500 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id as any)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                activeTab === item.id
                  ? 'bg-zinc-800 text-white shadow-lg'
                  : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-4.5 h-4.5 ${activeTab === item.id ? 'text-blue-500' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800 space-y-1">
          <button
            onClick={onBackToStore}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-zinc-500" />
            <span>Return to Store</span>
          </button>
          <button
            onClick={handleAdminLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-all cursor-pointer"
            title="Log out of admin session"
          >
            <LogOut className="w-4.5 h-4.5 text-rose-500" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-zinc-200 h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-zinc-500 hover:text-zinc-950 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xs sm:text-sm font-bold text-zinc-900 uppercase tracking-wider">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Global Search Bar (Desktop & Tablet) */}
            <div ref={searchContainerRef} className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Global search products, orders, customers..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!isSearchOpen) setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  className="bg-zinc-100/90 hover:bg-zinc-100 border border-zinc-200/60 focus:border-zinc-300 focus:bg-white rounded-full pl-9.5 pr-14 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-950/5 w-48 sm:w-72 md:w-80 lg:w-96 transition-all outline-none"
                />
                <div className="absolute right-3 flex items-center gap-1.5">
                  {searchQuery ? (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        searchInputRef.current?.focus();
                      }}
                      className="p-0.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-200 transition-colors cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono text-zinc-400 bg-white border border-zinc-200 rounded shadow-2xs">
                      ⌘K
                    </kbd>
                  )}
                </div>
              </div>

              {/* Floating Live Search Dropdown */}
              {isSearchOpen && searchQuery.trim().length > 0 && (
                <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[480px] md:w-[540px] bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Results Filter Tabs */}
                  <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between gap-2 overflow-x-auto">
                    <div className="flex items-center gap-1.5 shrink-0">
                      {[
                        { id: 'all', label: 'All', count: totalResultsCount },
                        { id: 'products', label: 'Products', count: matchingProducts.length },
                        { id: 'orders', label: 'Orders', count: matchingOrders.length },
                        { id: 'customers', label: 'Customers', count: matchingCustomers.length },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setSearchFilter(tab.id as any)}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                            searchFilter === tab.id
                              ? 'bg-zinc-900 text-white shadow-xs'
                              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60'
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            searchFilter === tab.id ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200/80 text-zinc-600'
                          }`}>
                            {tab.count}
                          </span>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setIsSearchOpen(false)}
                      className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-md transition-colors cursor-pointer"
                      title="Close search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Results List */}
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-100 p-2">
                    {totalResultsCount === 0 ? (
                      <div className="p-8 text-center space-y-2">
                        <Search className="w-8 h-8 text-zinc-300 mx-auto" />
                        <p className="text-xs font-bold text-zinc-800">No matching records found</p>
                        <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                          No products, orders, or customers match "{searchQuery}". Try searching by SKU, Order #, customer name, or ID.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Products Results */}
                        {(searchFilter === 'all' || searchFilter === 'products') && matchingProducts.length > 0 && (
                          <div className="p-2 space-y-1">
                            <div className="flex items-center justify-between px-2 py-1">
                              <span className="text-[10px] font-black tracking-wider uppercase text-zinc-400 flex items-center gap-1.5">
                                <Box className="w-3 h-3 text-blue-500" />
                                Products ({matchingProducts.length})
                              </span>
                              {matchingProducts.length > 3 && (
                                <button
                                  onClick={() => {
                                    setProductSearchQuery(cleanQ);
                                    setActiveTab('products');
                                    setIsSearchOpen(false);
                                  }}
                                  className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                                >
                                  <span>View all</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            {matchingProducts.slice(0, 3).map(p => (
                              <div
                                key={p.id}
                                onClick={() => handleSelectProductResult(p)}
                                className="p-2.5 rounded-xl hover:bg-zinc-50 transition-colors flex items-center justify-between cursor-pointer group"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <img
                                    src={p.primaryImage}
                                    alt={p.name}
                                    className="w-10 h-10 rounded-lg object-cover bg-zinc-100 border border-zinc-200 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-zinc-900 truncate group-hover:text-blue-600 transition-colors">
                                      {p.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] font-mono text-zinc-400">ID: {p.id}</span>
                                      {p.sku && (
                                        <span className="text-[9px] font-mono font-bold bg-zinc-100 text-zinc-600 px-1.5 py-0.2 rounded">
                                          {p.sku}
                                        </span>
                                      )}
                                      <span className="text-[10px] text-zinc-400">· {p.categoryLabel}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right shrink-0 pl-3">
                                  <span className="text-xs font-bold text-zinc-900 font-mono">{formatPrice(p.price)}</span>
                                  <span className="block text-[9px] font-semibold text-emerald-600">Inventory</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Orders Results */}
                        {(searchFilter === 'all' || searchFilter === 'orders') && matchingOrders.length > 0 && (
                          <div className="p-2 space-y-1">
                            <div className="flex items-center justify-between px-2 py-1">
                              <span className="text-[10px] font-black tracking-wider uppercase text-zinc-400 flex items-center gap-1.5">
                                <ShoppingBag className="w-3 h-3 text-emerald-500" />
                                Orders ({matchingOrders.length})
                              </span>
                              {matchingOrders.length > 3 && (
                                <button
                                  onClick={() => {
                                    setOrderSearchQuery(cleanQ);
                                    setActiveTab('orders');
                                    setIsSearchOpen(false);
                                  }}
                                  className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                                >
                                  <span>View all</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            {matchingOrders.slice(0, 3).map(o => (
                              <div
                                key={o.id}
                                onClick={() => handleSelectOrderResult(o)}
                                className="p-2.5 rounded-xl hover:bg-zinc-50 transition-colors flex items-center justify-between cursor-pointer group"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center font-mono font-bold text-xs text-zinc-700 shrink-0">
                                    #{o.orderNumber.slice(-4)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-zinc-900 truncate group-hover:text-blue-600 transition-colors">
                                      Order {o.orderNumber}
                                    </p>
                                    <p className="text-[10px] text-zinc-500 truncate">
                                      {o.shippingAddress?.firstName || 'Customer'} {o.shippingAddress?.lastName || ''} · {o.shippingAddress?.email || ''}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0 pl-3">
                                  <span className="text-xs font-bold text-zinc-900 font-mono">{formatPrice(o.total)}</span>
                                  <span className={`block text-[9px] font-black uppercase ${
                                    o.status === 'delivered' ? 'text-emerald-600' : 'text-blue-600'
                                  }`}>
                                    {o.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Customers Results */}
                        {(searchFilter === 'all' || searchFilter === 'customers') && matchingCustomers.length > 0 && (
                          <div className="p-2 space-y-1">
                            <div className="flex items-center justify-between px-2 py-1">
                              <span className="text-[10px] font-black tracking-wider uppercase text-zinc-400 flex items-center gap-1.5">
                                <Users className="w-3 h-3 text-blue-500" />
                                Customers ({matchingCustomers.length})
                              </span>
                              {matchingCustomers.length > 3 && (
                                <button
                                  onClick={() => {
                                    setCustomerSearchQuery(cleanQ);
                                    setActiveTab('customers');
                                    setIsSearchOpen(false);
                                  }}
                                  className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                                >
                                  <span>View all</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            {matchingCustomers.slice(0, 3).map(u => (
                              <div
                                key={u.id}
                                onClick={() => handleSelectCustomerResult(u)}
                                className="p-2.5 rounded-xl hover:bg-zinc-50 transition-colors flex items-center justify-between cursor-pointer group"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                                    {(u.firstName?.[0] || 'C') + (u.lastName?.[0] || '')}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-zinc-900 truncate group-hover:text-blue-600 transition-colors">
                                      {u.firstName} {u.lastName}
                                    </p>
                                    <p className="text-[10px] text-zinc-500 truncate">
                                      {u.email} · ID: {u.id}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0 pl-3">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                    {u.tier}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  {totalResultsCount > 0 && (
                    <div className="p-2.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                      <span>Found {totalResultsCount} items matching "{searchQuery}"</span>
                      <span className="text-[10px] text-zinc-400">Click item to open in tab</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2 text-zinc-500 hover:text-zinc-950 transition-colors rounded-lg ${isNotificationsOpen ? 'bg-zinc-100' : ''}`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
                )}
              </button>
            </div>

            {/* PWA Install Action */}
            <PWAInstallButton />

            {/* Admin Currency & Language Switcher Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
              <button
                onClick={() => setCurrency('XOF')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  currency.code === 'XOF' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
                }`}
                title="Franc CFA (XOF)"
              >
                <span>🇨🇮 CFA</span>
              </button>
              <button
                onClick={() => setCurrency('EUR')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currency.code === 'EUR' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
                }`}
                title="Euro (EUR)"
              >
                <span>€ EUR</span>
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currency.code === 'USD' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
                }`}
                title="US Dollar (USD)"
              >
                <span>$ USD</span>
              </button>
              <div className="w-[1px] h-3.5 bg-zinc-300 mx-0.5"></div>
              <button
                onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
                className="px-2 py-1 rounded-lg text-xs font-bold text-zinc-700 hover:text-zinc-900 flex items-center gap-1 cursor-pointer"
                title="Admin Language Toggle"
              >
                <span>{language === 'en' ? '🇺🇸 EN' : '🇫🇷 FR'}</span>
              </button>
            </div>

            <div className="h-8 w-[1px] bg-zinc-200 mx-1 sm:mx-2"></div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-zinc-900 leading-none truncate max-w-[140px]">{adminEmail || 'Super Admin'}</p>
                <p className="text-[10px] text-zinc-500 mt-1">Admin Access · {currency.symbol} ({currency.code})</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                {adminEmail?.[0]?.toUpperCase() || 'A'}
              </div>
              <button
                onClick={handleAdminLogout}
                className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                title="Sign out of admin session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Local Dev Sandbox Mode Banner (Never appears in Production) */}
        {!import.meta.env.PROD && (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-b border-emerald-200/80 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2 text-emerald-950 font-medium">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                liveSyncMode === 'isolated'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-amber-600 text-white shadow-xs'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {liveSyncMode === 'isolated' ? 'Local Sandbox (Safe)' : 'Direct Cloud Sync'}
              </span>
              <span className="hidden sm:inline text-zinc-600 text-[11px]">
                {liveSyncMode === 'isolated'
                  ? 'Edits stay 100% on this computer and will NOT touch your live customer website.'
                  : 'Live Sync Active: Edits will update Supabase and your live store immediately.'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleLiveSyncMode}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                  liveSyncMode === 'isolated'
                    ? 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-100/50 shadow-2xs'
                    : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-100/50 shadow-2xs'
                }`}
                title="Toggle between isolated local development and direct live database syncing"
              >
                {liveSyncMode === 'isolated' ? 'Switch to Live Sync' : 'Switch to Isolated Sandbox'}
              </button>

              <button
                onClick={handlePushToLive}
                disabled={isPushingToLive}
                className="px-3 py-1 rounded-lg text-[11px] font-bold bg-zinc-950 text-white hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Push all current local products to the live Supabase cloud database"
              >
                {isPushingToLive ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3 text-blue-400" />}
                <span>Push to Live ({products.length})</span>
              </button>

              <button
                onClick={handlePullFromLive}
                disabled={isPullingFromLive}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Download latest products from the live Supabase cloud database into this computer"
              >
                {isPullingFromLive ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3 text-zinc-500" />}
                <span>Pull Live</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Empty Data Banner if no transactions exist yet */}
              {orders.length === 0 && (
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900">Admin Ledger Initialized</h4>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        The store ledger has 0 orders because no checkout transactions have been completed yet. Click below to load realistic boutique demo transactions, VIP clients, and partner brands.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSeedDemoData}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 cursor-pointer flex items-center gap-2"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Load Demo Data</span>
                  </button>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Revenue', value: formatPrice(totalSales), trend: '+12.5%', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Active Orders', value: orders.length, trend: '+4 today', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Customer Base', value: users.length, trend: '+8.2%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Avg Order Value', value: formatPrice(orders.length ? totalSales / orders.length : 0), trend: '-2%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {stat.trend}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                      <h3 className="text-2xl font-display font-bold text-zinc-900 mt-1">{stat.value}</h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Visualization Trends */}
              <AdminDashboardCharts orders={orders} />

              <AdminInventoryForecasting products={products} orders={orders} />

              {/* Lower Section: Recent Orders & Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders List */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                    <h3 className="font-bold text-zinc-900 text-sm">RECENT LOGISTICS</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline transition-all">View All Orders</button>
                  </div>
                  <div className="flex-1 overflow-y-auto max-h-[400px]">
                    <div className="divide-y divide-zinc-50">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="p-4 hover:bg-zinc-50 transition-colors flex items-center justify-between group cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 font-mono text-xs font-bold">#{order.orderNumber.slice(-4)}</div>
                            <div>
                              <p className="text-xs font-bold text-zinc-900">{order.shippingAddress?.firstName || 'Customer'} {order.shippingAddress?.lastName || ''}</p>
                              <p className="text-[10px] text-zinc-400">{(order.items || []).length} pieces · {order.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-zinc-900 font-mono">{formatPrice(order.total)}</p>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* System Health / Quick Actions */}
                <div className="space-y-6">
                  <div className="bg-zinc-900 rounded-2xl p-8 text-white relative overflow-hidden group">
                    <div className="relative z-10 space-y-4">
                      <h3 className="text-lg font-display font-bold">Admin Quick Actions</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <button 
                          onClick={() => setActiveTab('products')}
                          className="p-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-left space-y-1.5 cursor-pointer"
                        >
                          <Plus className="w-4.5 h-4.5 text-blue-400" />
                          <p className="text-xs font-bold">New Product</p>
                        </button>
                        <button 
                          onClick={() => setActiveTab('orders')}
                          className="p-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-left space-y-1.5 cursor-pointer"
                        >
                          <ShoppingBag className="w-4.5 h-4.5 text-amber-400" />
                          <p className="text-xs font-bold">Logistics</p>
                        </button>
                        <button 
                          onClick={() => setActiveTab('customers')}
                          className="p-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-left space-y-1.5 cursor-pointer"
                        >
                          <Users className="w-4.5 h-4.5 text-indigo-400" />
                          <p className="text-xs font-bold">Clients</p>
                        </button>
                        <button 
                          onClick={() => setIsNotificationsOpen(true)}
                          className="p-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-left space-y-1.5 cursor-pointer"
                        >
                          <Bell className="w-4.5 h-4.5 text-blue-400" />
                          <p className="text-xs font-bold">Broadcast</p>
                        </button>
                        <button 
                          onClick={handleSeedDemoData}
                          className="p-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-left space-y-1.5 cursor-pointer"
                          title="Restore sample boutique orders & VIP clients"
                        >
                          <Package className="w-4.5 h-4.5 text-emerald-400" />
                          <p className="text-xs font-bold">Seed Data</p>
                        </button>
                        <button 
                          onClick={() => setActiveTab('settings')}
                          className="p-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-left space-y-1.5 cursor-pointer"
                        >
                          <Settings className="w-4.5 h-4.5 text-zinc-400" />
                          <p className="text-xs font-bold">Settings</p>
                        </button>
                      </div>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                  </div>

                  <div className="bg-white rounded-2xl border border-zinc-200 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900">System Status: Operational</h4>
                        <p className="text-xs text-zinc-500">All services performing normally.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-300" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <AdminCustomers users={users} setUsers={setUsers} orders={orders} />
          )}

          {activeTab === 'tracker' && (
            <AdminCustomerTracker users={users} setUsers={setUsers} orders={orders} />
          )}

          {activeTab === 'orders' && (
            <AdminOrders orders={orders} setOrders={setOrders} />
          )}

          {activeTab === 'products' && (
            <AdminProducts 
              products={products} 
              setProducts={setProducts} 
              categories={categories}
              brands={brands}
              onNewProductAdded={handleNewProductAdded}
            />
          )}

          {activeTab === 'inventory' && (
            <AdminInventory 
              products={products} 
              setProducts={setProducts} 
            />
          )}

          {activeTab === 'categories' && (
            <AdminCategories categories={categories} setCategories={setCategories} products={products} />
          )}

          {activeTab === 'brands' && (
            <AdminBrands brands={brands} setBrands={setBrands} />
          )}

          {activeTab === 'sections' && (
            <AdminSections storeSettings={storeSettings} setStoreSettings={setStoreSettings} />
          )}

          {activeTab === 'reviews' && (
            <AdminReviews products={products} setProducts={setProducts} />
          )}

          {activeTab === 'receipts' && (
            <AdminReceipts orders={orders} storeSettings={storeSettings} />
          )}

          {activeTab === 'settings' && (
            <AdminSettings storeSettings={storeSettings} setStoreSettings={setStoreSettings} />
          )}
        </div>
      </main>

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllAsRead}
        onMarkAsRead={handleMarkAsRead}
        onClearAll={handleClearNotifications}
        onNavigateToProduct={handleNavigateToProduct}
        onOpenOrders={handleOpenOrdersFromNotif}
        topClass="top-16"
        products={products}
      />

      {/* Floating Notice Toast */}
      {noticeToast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 ${
          noticeToast.type === 'warning'
            ? 'bg-rose-950 text-rose-100 border-rose-800'
            : 'bg-zinc-900 text-white border-zinc-800'
        }`}>
          <span>{noticeToast.message}</span>
          <button onClick={() => setNoticeToast(null)} className="p-1 hover:text-zinc-400 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

