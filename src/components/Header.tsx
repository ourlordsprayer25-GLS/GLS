import {
  ShoppingBag,
  Bell,
  Search,
  X,
  Heart,
  Flame,
  User,
  Package,
  LogOut,
  MapPin,
  Menu,
  TrendingUp,
  ArrowUpRight,
  Compass,
  Globe,
  DollarSign,
  Award,
  Camera,
  Mic,
  ChevronDown,
  LogIn,
  Star,
  CheckCircle2,
  Sparkles,
  Tag,
} from 'lucide-react';
import { Product, UserProfile, StoreSettings } from '../types/store';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';
import React, { useState, useMemo, useRef, useEffect } from 'react';

import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  products?: Product[];
  categories: any[];
  user: UserProfile | null;
  cartItemCount: number;
  unreadNotificationCount: number;
  wishlistCount: number;
  storeSettings?: StoreSettings;
  onOpenSidebar: () => void;
  onOpenCart: () => void;
  onOpenNotifications: () => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
  onOpenProfile: (tab?: 'profile' | 'addresses' | 'loyalty') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onSelectCategory: (category: string) => void;
  onSelectProduct: (product: Product | null) => void;
  onOpenSection?: (section: 'hot-deals' | 'new-arrivals' | 'categories' | 'collection', category?: string) => void;
  onOpenCategoriesPage?: () => void;
  onOpenBrandPage?: () => void;
  onOpenCollectionsPage?: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  isProfileActive?: boolean;
  isOrdersActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  products = [],
  categories = [],
  user,
  cartItemCount,
  unreadNotificationCount,
  wishlistCount,
  storeSettings,
  onOpenSidebar,
  onOpenCart,
  onOpenNotifications,
  onOpenWishlist,
  onOpenOrders,
  onOpenProfile,
  onOpenAuth,
  onLogout,
  onSelectCategory,
  onSelectProduct,
  onOpenSection,
  onOpenCategoriesPage,
  onOpenBrandPage,
  onOpenCollectionsPage,
  onSearch,
  searchQuery,
  isProfileActive = false,
  isOrdersActive = false,
}) => {
  const {
    language,
    setLanguage,
    currency,
    country,
    t,
    formatPrice,
    setIsSelectorModalOpen,
  } = useLanguageCurrency();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startVoiceSearch = () => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      alert(language === 'fr' ? 'La recherche vocale n\'est pas prise en charge sur ce navigateur.' : 'Voice search is not supported on this browser.');
      return;
    }
    const recognition = new SpeechRecognitionClass();
    recognition.lang = language === 'fr' ? 'fr-FR' : 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        onSearch(transcript);
      }
    };
    recognition.start();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      alert('Image search functionality coming soon!');
      console.log('Image selected:', file);
    }
  };

  const trendingSearches = language === 'fr'
    ? [
        'Casque Planaire',
        'Machine Expresso',
        'Purificateur d\'Air',
        'Bouilloire Induction',
        'Veste de Travail',
        'Pull Mérinos',
        'Sac Week-end Cuir',
      ]
    : [
        'Planar Headphones',
        'Espresso Machine',
        'Smart Air Purifier',
        'Induction Kettle',
        'Chore Coat',
        'Merino Knitwear',
        'Leather Weekender',
      ];

  const matchingProducts = useMemo(() => {
    if (!products || !searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q) ||
          p.materials.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [products, searchQuery]);

  const matchingCategories = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const categoriesList = [
      { id: 'electronics', label: language === 'fr' ? 'Électronique & Audio' : 'Electronics & Audio' },
      { id: 'musical', label: language === 'fr' ? 'Instruments de Musique & Studio' : 'Musical Instruments & Gear' },
      { id: 'appliances', label: language === 'fr' ? 'Électroménager & Maison' : 'Home Appliances & Living' },
      { id: 'apparel', label: language === 'fr' ? 'Mode & Prêt-à-porter' : 'Fashion & Apparel' },
      { id: 'leather-goods', label: language === 'fr' ? 'Maroquinerie & Bagagerie' : 'Leather Goods & Accessories' },
    ];
    return categoriesList.filter(
      (c) => c.label.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    );
  }, [searchQuery, language]);

  const featuredPreview = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => p.featured).slice(0, 3);
  }, [products]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(event.target as Node)) {
        setIsCategoriesDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setIsCategoriesDropdownOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNavClick = (cat: string) => {
    onSelectProduct(null);
    onSelectCategory(cat);
  };

  const handleScrollToSection = (sectionId: string) => {
    onSelectProduct(null);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const storeNameParts = (storeSettings?.storeName || 'GLADYNS BOUTIQUE').split(' ');
  const mainName = storeNameParts[0];
  const subName = storeNameParts.slice(1).join(' ');

  return (
    <>
      {/* Top Bar Banner with Language & Currency Quick Switcher (Hidden on Mobile) */}
      <div className="hidden md:block bg-slate-900 text-blue-100 text-xs py-2 px-4 border-b border-blue-900/40">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-2">
          {/* Promo Text */}
          <div className="flex-1 text-center sm:text-left flex items-center justify-center sm:justify-start gap-2 tracking-wide font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
              <span>{storeSettings?.announcementBar.enabled ? storeSettings.announcementBar.text : t('topBannerShipping')}</span>
            </span>
          </div>

          {/* Quick Language & Currency Switcher Bar (Desktop/lg only - mobile & tablet access via sidebar) */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {/* Quick EN / FR Toggle */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700/80 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('fr')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  language === 'fr'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Passer en Français"
              >
                FR
              </button>
            </div>

            {/* Country & Currency Trigger */}
            <button
              type="button"
              onClick={() => setIsSelectorModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-blue-100 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700/80 text-[11px] font-semibold transition-colors cursor-pointer"
              title={t('changeLanguageCurrency')}
            >
              <span>{country.flag}</span>
              <span className="font-mono">{currency.code} ({currency.symbol})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Desktop & Mobile Header strictly styled according to user design reference */}
      <header className="sticky top-0 z-[60] bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-2xs">
        <div className="max-w-[1500px] mx-auto px-2.5 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 lg:gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                onSelectProduct(null);
                onSelectCategory('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer text-left"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition-transform shrink-0 border border-blue-500/30 bg-slate-900 shadow-blue-900/10">
                <img src="/assets/logo-icon.png" alt="GLADYNS Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-base sm:text-xl font-display font-extrabold tracking-tight text-blue-950 group-hover:text-blue-600 transition-colors">
                  {mainName}
                </span>
                <span className="text-[8px] sm:text-[9px] uppercase font-extrabold tracking-widest text-blue-600 bg-blue-50 px-1.5 sm:px-2 py-0.5 rounded-md border border-blue-200/80 hidden sm:inline-block">
                  {subName || 'BOUTIQUE OFFICIELLE'}
                </span>
              </div>
            </button>
          </div>

          {/* Unified Search Input Bar with Category Filter & Search Button */}
          <div className="flex-1 min-w-0 max-w-2xl mx-1 sm:mx-3 relative">
            <div className="flex items-center bg-slate-100/90 hover:bg-slate-100 focus-within:bg-white rounded-full border border-slate-200/80 p-1 pl-3 sm:pl-4 transition-all shadow-2xs focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent">
              
              {/* Left Category Dropdown (Desktop only) */}
              <div className="relative shrink-0 pr-2 sm:pr-3 border-r border-slate-300/80 hidden sm:block" ref={categoriesDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-blue-600 cursor-pointer"
                >
                  <span>{language === 'fr' ? 'Tout' : 'All'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {isCategoriesDropdownOpen && (
                  <div className="absolute left-0 mt-3 w-60 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 z-50 text-xs animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-100 font-bold text-slate-900">
                      {language === 'fr' ? 'Catégories' : 'Departments'}
                    </div>
                    <div className="py-1 space-y-0.5">
                      {[
                        { id: 'electronics', label: language === 'fr' ? 'Électronique & Audio' : 'Electronics & Audio' },
                        { id: 'musical', label: language === 'fr' ? 'Musique & Studio' : 'Musical Instruments' },
                        { id: 'appliances', label: language === 'fr' ? 'Électroménager & Maison' : 'Home Appliances' },
                        { id: 'apparel', label: language === 'fr' ? 'Mode & Prêt-à-porter' : 'Fashion & Apparel' },
                        { id: 'leather-goods', label: language === 'fr' ? 'Maroquinerie' : 'Leather Goods' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setIsCategoriesDropdownOpen(false);
                            onSelectProduct(null);
                            onSelectCategory(cat.id);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-700 font-medium text-slate-800 cursor-pointer transition-colors"
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Text Field */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
                className="w-full min-w-0 px-1.5 sm:px-3 py-1 sm:py-2 bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-sans truncate"
              />

              {/* Camera & Microphone icons (Desktop only) */}
              <div className="hidden xl:flex items-center gap-1.5 text-slate-400 px-1 shrink-0">
                <button type="button" aria-label="Visual Search" className="hover:text-blue-600 cursor-pointer p-1 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
                <button type="button" aria-label="Voice Search" className="hover:text-blue-600 cursor-pointer p-1 transition-colors">
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              {/* Clear search query button if text entered */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearch('')}
                  aria-label="Clear search"
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer mr-0.5 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Search Pill Button */}
              <button
                type="button"
                onClick={() => {
                  if (searchQuery.trim()) onSearch(searchQuery);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 sm:px-4 sm:py-2 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{language === 'fr' ? 'Rechercher' : 'Search'}</span>
              </button>
            </div>
          </div>

          {/* Right Action Pill Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* 1. Notification Button */}
            <button
              onClick={onOpenNotifications}
              aria-label="Notifications"
              className="relative flex items-center justify-center p-2 sm:px-3.5 sm:py-2 bg-slate-100/90 hover:bg-blue-50 text-slate-800 hover:text-blue-600 rounded-full font-bold text-xs transition-colors cursor-pointer shrink-0 border border-slate-200/60"
            >
              <Bell className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="hidden xl:inline ml-1">{language === 'fr' ? 'Notifications' : 'Notifications'}</span>
              {unreadNotificationCount > 0 && (
                <span className="bg-blue-600 text-white rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ml-0.5">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Desktop Action Buttons (Wishlist, Cart, Language, User Sign In) - Visible on lg screens */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              {/* 2. Wishlist / Favoris Button */}
              <button
                onClick={onOpenWishlist}
                aria-label="Favoris"
                className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-rose-50 text-slate-800 hover:text-rose-600 rounded-full font-bold text-xs transition-colors cursor-pointer shrink-0 border border-slate-200/90 shadow-2xs"
              >
                <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-700'}`} />
                <span>{language === 'fr' ? 'Favoris' : 'Wishlist'}</span>
                {wishlistCount > 0 && (
                  <span className="bg-rose-100 text-rose-700 rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* 3. Cart / Panier Button */}
              <button
                onClick={onOpenCart}
                aria-label="Panier"
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-100/90 hover:bg-blue-100 text-slate-800 rounded-full font-bold text-xs transition-colors cursor-pointer shrink-0 border border-slate-200/60"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-[11px] shadow-2xs">
                  {cartItemCount}
                </div>
                <span>{language === 'fr' ? 'Panier' : 'Cart'}</span>
              </button>

              {/* PWA App Install Action */}
              <div className="hidden sm:block">
                <PWAInstallButton />
              </div>

              {/* 4. Language / EN Selector */}
              <button
                onClick={() => setIsSelectorModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100/90 hover:bg-slate-200 text-slate-800 rounded-full font-bold text-xs transition-colors cursor-pointer shrink-0 border border-slate-200/60"
              >
                <Globe className="w-4 h-4 text-cyan-600" />
                <span className="uppercase">{language}</span>
              </button>

            {/* 5. Connexion / S'inscrire or User Profile */}
            <div className="hidden sm:block relative" ref={userMenuRef}>
              {user && user.id !== 'usr-guest' && !user.id.startsWith('guest-') && (user.firstName || user.email) ? (
                <>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="group relative flex items-center gap-2 pl-1.5 pr-4 py-1.5 bg-white/80 hover:bg-white backdrop-blur-md text-slate-800 hover:text-indigo-900 rounded-full font-bold text-xs transition-all duration-300 cursor-pointer shrink-0 border border-slate-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_25px_-5px_rgba(79,70,229,0.15)] overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300 ring-2 ring-white/50">
                      {user.firstName ? (
                        <span className="text-white text-[10px] font-black uppercase tracking-wider">{user.firstName[0]}</span>
                      ) : (
                        <User className="w-3.5 h-3.5 text-white/90" />
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full shadow-sm" />
                    </div>
                    <span className="relative truncate max-w-[120px] tracking-wide group-hover:tracking-wider transition-all duration-300">
                      {user.firstName || user.email?.split('@')[0] || 'Patron'}
                    </span>
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 z-50 text-xs animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2.5 border-b border-slate-100">
                        <p className="font-semibold text-slate-900 truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          {user.tier}
                        </span>
                      </div>

                      <div className="py-1 space-y-0.5">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenOrders();
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 text-slate-800 font-medium cursor-pointer"
                        >
                          <Package className="w-4 h-4 text-blue-600" />
                          <span>{t('ordersTracking')}</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenProfile('loyalty');
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 text-slate-800 font-medium cursor-pointer"
                        >
                          <Award className="w-4 h-4 text-blue-600" />
                          <span>{language === 'fr' ? 'Niveau de Fidélité' : 'Loyalty Tier'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenProfile('profile');
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 text-slate-800 font-medium cursor-pointer"
                        >
                          <User className="w-4 h-4 text-blue-600" />
                          <span>{t('patronProfile')}</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2 text-rose-600 font-medium cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t('signOut')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-600 rounded-full font-bold text-xs transition-colors cursor-pointer shrink-0 border border-slate-300 shadow-2xs"
                >
                  <LogIn className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate max-w-[140px]">
                    {language === 'fr' ? "Connexion / S'inscrire" : 'Sign In / Register'}
                  </span>
                </button>
              )}
            </div>
          </div>

          </div>
        </div>
      </header>

        {/* Collapsible search bar with suggestions */}
        {isSearchOpen && (
          <div ref={searchContainerRef} className="border-t border-slate-200/80 bg-white/98 px-4 py-4 sm:px-6 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Input field */}
              <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-2.5 border border-slate-200 focus-within:border-blue-600 focus-within:bg-white transition-all">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  autoFocus
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                <button onClick={startVoiceSearch} className={`p-1 rounded-full ${isListening ? 'bg-red-100 text-red-600' : 'text-slate-400 hover:text-blue-600'}`}>
                  <Mic className="w-4 h-4" />
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-blue-600">
                  <Camera className="w-4 h-4" />
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
                </button>
                {searchQuery && (
                  <button
                    onClick={() => onSearch('')}
                    className="text-xs text-slate-400 hover:text-slate-700 px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setIsSearchOpen(false)}
                  aria-label="Close search"
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer hover:bg-slate-200/50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Suggestions Panel */}
              {!searchQuery.trim() ? (
                /* Empty state: Trending searches & Disciplines & Featured preview */
                <div className="space-y-4 pt-1">
                  {/* Trending Searches */}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                      <span>{language === 'fr' ? 'Recherches populaires' : 'Popular Searches'}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => onSearch(term)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-xs text-slate-800 font-medium transition-colors cursor-pointer"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Explore Disciplines */}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                      <Compass className="w-3.5 h-3.5 text-blue-600" />
                      <span>{language === 'fr' ? 'Parcourir par rayon' : 'Browse by Department'}</span>
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'electronics', label: language === 'fr' ? 'Électronique & Audio' : 'Electronics & Audio' },
                        { id: 'musical', label: language === 'fr' ? 'Instruments de Musique' : 'Musical Instruments' },
                        { id: 'appliances', label: language === 'fr' ? 'Électroménager & Maison' : 'Home Appliances' },
                        { id: 'apparel', label: language === 'fr' ? 'Mode & Prêt-à-porter' : 'Fashion & Apparel' },
                        { id: 'leather-goods', label: language === 'fr' ? 'Maroquinerie & Bagagerie' : 'Leather Goods' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            onSelectCategory(cat.id);
                            setIsSearchOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200/70 text-xs font-semibold text-slate-900 text-left transition-colors cursor-pointer"
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Active query suggestions: Matching Products & Matching Categories */
                <div className="space-y-3 pt-1">
                  {matchingCategories.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {t('allCategories')}:
                      </span>
                      {matchingCategories.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            onSelectCategory(c.id);
                            setIsSearchOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 text-xs font-semibold hover:bg-blue-100 cursor-pointer transition-colors"
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {matchingProducts.length > 0 ? (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        {language === 'fr' ? 'Articles correspondants' : 'Matching Items'} ({matchingProducts.length})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {matchingProducts.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              onSelectProduct(p);
                              setIsSearchOpen(false);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-blue-600 transition-all cursor-pointer group shadow-2xs"
                          >
                            <img
                              src={p.primaryImage}
                              alt={p.name}
                              className="w-12 h-12 object-cover rounded-lg bg-slate-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                {p.categoryLabel}
                              </span>
                              <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-600">
                                {p.name}
                              </p>
                              <p className="text-[11px] font-mono font-semibold text-blue-600">
                                {p.price ? `$${p.price}` : ''}
                              </p>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-500">
                      {language === 'fr'
                        ? `Aucun article trouvé pour "${searchQuery}".`
                        : `No exact item found for "${searchQuery}".`}
                    </div>
                  )}

                  {/* Submit All Results action */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setIsSearchOpen(false);
                        const el = document.getElementById('catalog-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>
                        {language === 'fr'
                          ? `Afficher tous les résultats pour "${searchQuery}"`
                          : `Show all catalog results for "${searchQuery}"`}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSearch('')}
                      className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
    </>
  );
};
