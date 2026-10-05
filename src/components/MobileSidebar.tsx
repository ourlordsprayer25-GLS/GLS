import React, { useMemo } from 'react';
import {
  X,
  Search,
  Heart,
  User,
  Home,
  LayoutGrid,
  Tag,
  TrendingUp,
  ThumbsUp,
  Box,
  Layers,
  FileText,
  Info,
  Shield,
  HelpCircle,
  Globe,
  Flame,
  ChevronRight,
  ArrowUpRight,
  Compass,
  MapPin,
  LogOut,
  LogIn,
  RotateCcw,
} from 'lucide-react';
import { Product, UserProfile } from '../types/store';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';

interface MobileSidebarProps {
  products?: Product[];
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  wishlistCount: number;
  unreadNotificationCount: number;
  cartItemCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenNotifications: () => void;
  onOpenOrders: () => void;
  onOpenProfile: (tab?: 'profile' | 'addresses' | 'loyalty') => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onSelectCategory: (category: string) => void;
  onSelectProduct: (product: Product | null) => void;
  onOpenSection?: (section: 'hot-deals' | 'new-arrivals' | 'bestsellers' | 'categories' | 'collection', category?: string) => void;
  onOpenCategoriesPage?: () => void;
  onOpenBrandPage?: () => void;
  onOpenAboutUsPage?: () => void;
  onOpenTermsPage?: () => void;
  onOpenRefundPolicyPage?: () => void;
  onOpenStoreLocatorPage?: () => void;
  onOpenCollectionsPage?: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  onBackToHome?: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  products = [],
  isOpen,
  onClose,
  user,
  wishlistCount,
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
  onOpenAboutUsPage,
  onOpenTermsPage,
  onOpenRefundPolicyPage,
  onOpenStoreLocatorPage,
  onOpenCollectionsPage,
  onSearch,
  searchQuery,
  onBackToHome,
}) => {
  const { language, setLanguage, currency, country, t, setIsSelectorModalOpen } = useLanguageCurrency();

  const matchingProducts = useMemo(() => {
    if (!products || !searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q) ||
          p.materials.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [products, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 top-[56px] sm:top-[68px] z-40 overflow-hidden pointer-events-none lg:hidden animate-in fade-in duration-200">
      {/* Transparent Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/20 backdrop-blur-2xs transition-opacity cursor-pointer pointer-events-auto"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="absolute top-0 bottom-0 left-0 max-w-[88vw] w-88 sm:w-96 bg-white shadow-2xl flex flex-col z-10 border-r border-slate-200 animate-in slide-in-from-left duration-300 pointer-events-auto text-slate-800">
        
        {/* Drawer Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs shrink-0 border border-blue-500/30 bg-slate-900 shadow-blue-900/10">
              <img src="/assets/logo-icon.png" alt="GLADYNS Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-sm font-display font-bold text-slate-950 block leading-tight">
                {language === 'fr' ? 'Menu & Navigation' : 'Navigation & Catalog'}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {language === 'fr' ? 'Explorez la boutique' : 'Explore store collections'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="w-8 h-8 text-slate-400 hover:text-slate-950 rounded-xl hover:bg-slate-200/80 flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-slate-200"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 text-xs font-semibold">
          
          {/* User Profile or Sign In Card */}
          <div className="p-4 bg-white border-b border-slate-100">
            {user && user.id !== 'usr-guest' && !user.id.startsWith('guest-') && (user.firstName || user.email) ? (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-800 group transition-all duration-300 hover:shadow-[0_8px_30px_rgba(59,130,246,0.3)] cursor-pointer"
                onClick={() => {
                  onClose();
                  onOpenProfile?.('profile');
                }}>
                {/* Decorative background blur */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-150"></div>
                <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-150"></div>
                
                <div className="relative flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 text-white flex items-center justify-center font-bold text-lg shadow-lg border border-white/20 ring-2 ring-transparent group-hover:ring-blue-400/50 transition-all duration-300">
                        {user.firstName ? user.firstName[0] : 'P'}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white tracking-wide">
                        {user.firstName} {user.lastName}
                      </h4>
                      <p className="text-[10px] text-blue-200/80 font-mono truncate max-w-[120px] font-medium">{user.email}</p>
                      <span className="inline-flex mt-1 text-[9px] font-bold text-white bg-white/10 border border-white/20 px-2 py-0.5 rounded-full backdrop-blur-md shadow-sm">
                        {user.tier}
                      </span>
                    </div>
                  </div>
                  <button
                    className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all duration-300 backdrop-blur-md group-hover:scale-105 active:scale-95"
                    aria-label="Open Profile"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="relative w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-xs shadow-xl shadow-slate-900/20 transition-all duration-300 cursor-pointer overflow-hidden group"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <LogIn className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{language === 'fr' ? "Se Connecter / S'inscrire" : 'Sign In / Register'}</span>
              </button>
            )}
          </div>

          {/* Quick Search */}
          <div className="p-4 space-y-2 bg-slate-50/50">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                placeholder={t('searchPlaceholder') || 'Search archive, coats, electronics...'}
                className="w-full pl-9 pr-8 py-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearch('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Instant Search Results */}
            {searchQuery.trim() && (
              <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 pt-0.5">
                  Matching Pieces ({matchingProducts.length})
                </p>
                {matchingProducts.length > 0 ? (
                  <div className="space-y-1.5">
                    {matchingProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectProduct(p);
                          onClose();
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer group border border-transparent hover:border-slate-200 transition-all"
                      >
                        <img
                          src={p.primaryImage}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-950 truncate group-hover:text-blue-600">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                            <span className="font-bold text-slate-900">${p.price}</span>
                            <span>·</span>
                            <span className="truncate">{p.categoryLabel}</span>
                          </div>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 transition-colors" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 px-2 py-1">
                    No matching pieces found.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Primary Navigation Menu */}
          <div className="p-3 space-y-1">
            {/* Home */}
            <button
              onClick={() => {
                if (onBackToHome) {
                  onBackToHome();
                } else {
                  onSelectProduct(null);
                  onSelectCategory('all');
                }
                onClose();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-blue-700 bg-blue-50/90 font-bold relative transition-colors cursor-pointer"
            >
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 rounded-r-full" />
              <Home className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{language === 'fr' ? 'Accueil' : 'Home'}</span>
            </button>

            {/* Categories */}
            <button
              onClick={() => {
                onClose();
                onOpenCategoriesPage?.();
              }}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4 text-slate-500 shrink-0" />
              <span>{language === 'fr' ? 'Catégories' : 'Categories'}</span>
            </button>

            {/* Deals (HOT) */}
            <button
              onClick={() => {
                onClose();
                onOpenSection?.('hot-deals');
              }}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <Tag className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="truncate">{language === 'fr' ? 'Offres' : 'Deals'}</span>
              <span className="ml-auto text-[10px] font-extrabold bg-gradient-to-r from-red-500 to-amber-500 text-white px-2 py-0.5 rounded-full shrink-0 shadow-2xs flex items-center gap-1">
                <Flame className="w-2.5 h-2.5" /> HOT
              </span>
            </button>

            {/* New Arrivals */}
            <button
              onClick={() => {
                onClose();
                onOpenSection?.('new-arrivals');
              }}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-slate-500 shrink-0" />
              <span>{language === 'fr' ? 'Nouveautés' : 'New Arrivals'}</span>
            </button>

            {/* Best Sellers */}
            <button
              onClick={() => {
                onClose();
                onOpenSection?.('bestsellers');
              }}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <ThumbsUp className="w-4 h-4 text-slate-500 shrink-0" />
              <span>{language === 'fr' ? 'Meilleures Ventes' : 'Best Sellers'}</span>
            </button>

            {/* Brands */}
            <button
              onClick={() => {
                onClose();
                onOpenBrandPage?.();
              }}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <Box className="w-4 h-4 text-slate-500 shrink-0" />
              <span>{language === 'fr' ? 'Nos Marques' : 'Brands'}</span>
            </button>
          </div>

          {/* Secondary Navigation Menu */}
          <div className="p-3 space-y-1">
            {/* My Orders */}
            <button
              onClick={() => {
                onClose();
                onOpenOrders();
              }}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-500 shrink-0" />
              <span>{language === 'fr' ? 'Mes Commandes' : 'My Orders'}</span>
            </button>

            {/* Wishlist */}
            <button
              onClick={() => {
                onClose();
                onOpenWishlist();
              }}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <Heart className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="flex items-center justify-between flex-1">
                <span>{language === 'fr' ? 'Favoris' : 'Wishlist'}</span>
                {wishlistCount > 0 && (
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {wishlistCount}
                  </span>
                )}
              </div>
            </button>

            {/* About Us */}
            <button
              onClick={() => {
                onClose();
                if (onOpenAboutUsPage) onOpenAboutUsPage();
                else onOpenBrandPage?.();
              }}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <Info className="w-4.5 h-4.5 text-blue-600 shrink-0" />
              <span className="font-medium text-xs sm:text-sm">{language === 'fr' ? 'À propos de nous' : 'About Us'}</span>
            </button>

            {/* Conditions générales (Terms & Conditions) */}
            <button
              onClick={() => {
                onClose();
                if (onOpenTermsPage) onOpenTermsPage();
              }}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <FileText className="w-4.5 h-4.5 text-blue-600 shrink-0" />
              <span className="font-medium text-xs sm:text-sm">{language === 'fr' ? 'Conditions générales' : 'Terms & Conditions'}</span>
            </button>

            {/* Politique de remboursement (Refund Policy) */}
            <button
              onClick={() => {
                onClose();
                if (onOpenRefundPolicyPage) onOpenRefundPolicyPage();
              }}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4.5 h-4.5 text-blue-600 shrink-0" />
              <span className="font-medium text-xs sm:text-sm">{language === 'fr' ? 'Remboursement & Retours' : 'Refund & Returns'}</span>
            </button>

            {/* Nous trouver (Store Locator) */}
            <button
              onClick={() => {
                onClose();
                if (onOpenStoreLocatorPage) onOpenStoreLocatorPage();
              }}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <MapPin className="w-4.5 h-4.5 text-blue-600 shrink-0" />
              <span className="font-medium text-xs sm:text-sm">{language === 'fr' ? 'Nous trouver' : 'Store Locator'}</span>
            </button>

            {user && user.id !== 'usr-guest' && !user.id.startsWith('guest-') && (user.firstName || user.email) && (
              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{language === 'fr' ? 'Se Déconnecter' : 'Sign Out'}</span>
              </button>
            )}

            {/* SPECIAL OFFER Button */}
            <div className="pt-3 pb-1 px-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenSection?.('hot-deals');
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold uppercase text-xs rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer text-center tracking-wider"
              >
                SPECIAL OFFER
              </button>
            </div>

            {/* Support & Country/Currency Section (Inside Scrollable List) */}
            <div className="pt-4 border-t border-slate-200/90 space-y-3">
              {/* Need Help? 24/7 Support Center */}
              <button
                onClick={() => {
                  onClose();
                  onOpenBrandPage?.();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 transition-colors cursor-pointer group text-left shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {language === 'fr' ? 'Besoin d\'aide ?' : 'Need Help?'}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {language === 'fr' ? 'Support Client 24/7' : '24/7 Support Center'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
              </button>

              {/* Language & Currency Switcher */}
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setIsSelectorModalOpen(true);
                  }}
                  className="flex-1 flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-bold text-slate-900 transition-colors cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="truncate">{country.flag} {currency.code} ({currency.symbol})</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                {/* Quick EN / FR Toggle */}
                <div className="flex items-center bg-slate-200/80 rounded-xl p-0.5 text-[11px] font-bold shrink-0">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                      language === 'en' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('fr')}
                    className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                      language === 'fr' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    FR
                  </button>
                </div>
              </div>
            </div>

            {/* Round Circle Profile Button (Down at the bottom) */}
            <div className="pt-4 pb-2 border-t border-slate-200/90 flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (user) onOpenProfile('profile');
                  else onOpenAuth('login');
                }}
                title={user ? `${user.firstName} ${user.lastName || ''} - ${language === 'fr' ? 'Mon Compte' : 'Profile'}` : (language === 'fr' ? 'Se Connecter' : 'Sign In')}
                className="group relative w-14 h-14 rounded-full transition-all duration-300 cursor-pointer shadow-[0_4px_20px_-5px_rgba(0,0,0,0.15)] flex items-center justify-center ring-2 hover:scale-105 active:scale-95 shrink-0 overflow-hidden ring-indigo-500/30 bg-white"
                aria-label="User Profile"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className={`relative w-11 h-11 rounded-full flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300 ${
                  user 
                    ? 'bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white font-black text-[17px] uppercase ring-2 ring-white/50' 
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                }`}>
                  {user ? (
                    <>
                      <span>{user.firstName ? user.firstName[0] : 'U'}</span>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full shadow-sm" />
                    </>
                  ) : (
                    <User className="w-5 h-5 stroke-[2.2]" />
                  )}
                </div>
              </button>
              <span className="text-xs font-bold text-slate-800 mt-2 truncate max-w-[140px] text-center">
                {user ? user.firstName : (language === 'fr' ? 'Se Connecter' : 'Sign In')}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {user ? (user.tier || 'Member') : (language === 'fr' ? 'Mon Compte' : 'Profile')}
              </span>
            </div>

            {/* Bottom Padding for Safe Scrolling Above Bottom Navigation Bar */}
            <div className="h-16 lg:h-4" />
          </div>
        </div>

      </div>
    </div>
  );
};
