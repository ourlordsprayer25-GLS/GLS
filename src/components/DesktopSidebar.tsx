import React, { useState } from 'react';
import {
  Home,
  LayoutGrid,
  Tag,
  TrendingUp,
  ThumbsUp,
  Box,
  Layers,
  FileText,
  Heart,
  Info,
  User,
  Shield,
  HelpCircle,
  Sun,
  ChevronLeft,
  ChevronRight,
  Flame,
  Globe,
  MapPin,
  RotateCcw,
} from 'lucide-react';
import { UserProfile } from '../types/store';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';

interface DesktopSidebarProps {
  user: UserProfile | null;
  onBackToHome: () => void;
  onOpenSection: (section: 'hot-deals' | 'new-arrivals' | 'bestsellers' | 'categories' | 'collection', category?: string) => void;
  onOpenCategoriesPage: () => void;
  onOpenBrandPage: () => void;
  onOpenAboutUsPage?: () => void;
  onOpenTermsPage?: () => void;
  onOpenRefundPolicyPage?: () => void;
  onOpenStoreLocatorPage?: () => void;
  onOpenCollectionsPage?: () => void;
  onOpenOrders: () => void;
  onOpenProfile: (tab?: 'profile' | 'addresses' | 'loyalty') => void;
  onSelectCategory: (category: string) => void;
  isHomeActive: boolean;
  isBrandActive: boolean;
  isCollectionsActive?: boolean;
  isCategoriesActive: boolean;
  isOrdersActive: boolean;
  isProfileActive: boolean;
  onOpenWishlist?: () => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  user,
  onBackToHome,
  onOpenSection,
  onOpenCategoriesPage,
  onOpenBrandPage,
  onOpenAboutUsPage,
  onOpenTermsPage,
  onOpenRefundPolicyPage,
  onOpenStoreLocatorPage,
  onOpenCollectionsPage,
  onOpenOrders,
  onOpenProfile,
  onSelectCategory,
  isHomeActive,
  isBrandActive,
  isCollectionsActive,
  isCategoriesActive,
  isOrdersActive,
  isProfileActive,
  onOpenWishlist,
  onOpenAuth,
}) => {
  const { language, currency, country, setIsSelectorModalOpen } = useLanguageCurrency();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`hidden lg:flex flex-col shrink-0 bg-white text-slate-800 border-r border-slate-200/90 lg:sticky lg:top-0 lg:h-screen select-none overflow-y-auto z-30 transition-all duration-300 shadow-2xs ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          {!isCollapsed ? (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-3 text-left group cursor-pointer min-w-0"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform shrink-0 border border-blue-500/30 bg-slate-900 shadow-blue-900/10">
                <img src="/assets/logo-icon.png" alt="GLADYNS Logo" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <span className="font-display font-extrabold tracking-tight text-blue-900 text-base block truncate leading-none">
                  GLADYNS
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider text-blue-600 block truncate mt-1 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">
                  Boutique Officielle
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={onBackToHome}
              className="mx-auto w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-serif font-bold text-xl shadow-sm hover:scale-105 transition-transform cursor-pointer"
              title="GLADYNS"
            >
              G
            </button>
          )}
        </div>

        {/* COLLAPSE MENU Button Pill */}
        {!isCollapsed ? (
          <button
            onClick={() => setIsCollapsed(true)}
            className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl text-[11px] font-extrabold tracking-wider uppercase flex items-center justify-between transition-colors cursor-pointer shadow-2xs"
          >
            <span>COLLAPSE MENU</span>
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>
        ) : (
          <button
            onClick={() => setIsCollapsed(false)}
            className="mx-auto p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Expand Menu"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <div className="p-3 space-y-6 flex-1 text-xs font-semibold">
        {/* Primary Links */}
        <div className="space-y-1">
          {/* Home */}
          <button
            onClick={onBackToHome}
            title={language === 'fr' ? 'Accueil' : 'Home'}
            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer relative ${
              isHomeActive
                ? 'bg-blue-50/90 text-blue-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            } ${isCollapsed ? 'justify-center px-2' : ''}`}
          >
            {isHomeActive && !isCollapsed && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 rounded-r-full" />
            )}
            <Home className={`w-4 h-4 shrink-0 ${isHomeActive ? 'text-blue-600' : 'text-slate-500'}`} />
            {!isCollapsed && <span>{language === 'fr' ? 'Accueil' : 'Home'}</span>}
          </button>

          {/* Categories */}
          <button
            onClick={onOpenCategoriesPage}
            title={language === 'fr' ? 'Catégories' : 'Categories'}
            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer relative ${
              isCategoriesActive
                ? 'bg-blue-50/90 text-blue-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            } ${isCollapsed ? 'justify-center px-2' : ''}`}
          >
            {isCategoriesActive && !isCollapsed && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 rounded-r-full" />
            )}
            <LayoutGrid className={`w-4 h-4 shrink-0 ${isCategoriesActive ? 'text-blue-600' : 'text-slate-500'}`} />
            {!isCollapsed && <span>{language === 'fr' ? 'Catégories' : 'Categories'}</span>}
          </button>

          {/* Deals (HOT) */}
          <button
            onClick={() => onOpenSection('hot-deals')}
            title={language === 'fr' ? 'Offres & Promotions' : 'Deals'}
            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all cursor-pointer ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
          >
            <Tag className="w-4 h-4 text-slate-500 shrink-0" />
            {!isCollapsed && (
              <>
                <span className="truncate">{language === 'fr' ? 'Offres' : 'Deals'}</span>
                <span className="ml-auto text-[10px] font-extrabold bg-gradient-to-r from-red-500 to-amber-500 text-white px-2 py-0.5 rounded-full shrink-0 shadow-2xs flex items-center gap-1">
                  <Flame className="w-2.5 h-2.5" /> HOT
                </span>
              </>
            )}
          </button>

          {/* New Arrivals */}
          <button
            onClick={() => onOpenSection('new-arrivals')}
            title={language === 'fr' ? 'Nouveautés' : 'New Arrivals'}
            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all cursor-pointer ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
          >
            <TrendingUp className="w-4 h-4 text-slate-500 shrink-0" />
            {!isCollapsed && <span>{language === 'fr' ? 'Nouveautés' : 'New Arrivals'}</span>}
          </button>

          {/* Best Sellers */}
          <button
            onClick={() => onOpenSection('bestsellers')}
            title={language === 'fr' ? 'Meilleures Ventes' : 'Best Sellers'}
            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all cursor-pointer ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
          >
            <ThumbsUp className="w-4 h-4 text-slate-500 shrink-0" />
            {!isCollapsed && <span>{language === 'fr' ? 'Meilleures Ventes' : 'Best Sellers'}</span>}
          </button>

          {/* Brands */}
          <button
            onClick={onOpenBrandPage}
            title={language === 'fr' ? 'Nos Marques' : 'Brands'}
            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer relative ${
              isBrandActive
                ? 'bg-blue-50/90 text-blue-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            } ${isCollapsed ? 'justify-center px-2' : ''}`}
          >
            {isBrandActive && !isCollapsed && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 rounded-r-full" />
            )}
            <Box className={`w-4 h-4 shrink-0 ${isBrandActive ? 'text-blue-600' : 'text-slate-500'}`} />
            {!isCollapsed && <span>{language === 'fr' ? 'Nos Marques' : 'Brands'}</span>}
          </button>
        </div>

        {/* Divider */}
        <hr className="border-slate-100 my-2" />

        {/* Secondary Links */}
        <div className="space-y-1">
          {/* My Orders */}
          <button
            onClick={onOpenOrders}
            title={language === 'fr' ? 'Mes Commandes' : 'My Orders'}
            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer relative ${
              isOrdersActive
                ? 'bg-blue-50/90 text-blue-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            } ${isCollapsed ? 'justify-center px-2' : ''}`}
          >
            {isOrdersActive && !isCollapsed && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 rounded-r-full" />
            )}
            <FileText className={`w-4 h-4 shrink-0 ${isOrdersActive ? 'text-blue-600' : 'text-slate-500'}`} />
            {!isCollapsed && <span>{language === 'fr' ? 'Mes Commandes' : 'My Orders'}</span>}
          </button>

          {/* Wishlist */}
          <button
            onClick={() => {
              if (onOpenWishlist) onOpenWishlist();
              else onOpenProfile('profile');
            }}
            title={language === 'fr' ? 'Liste de Souhaits' : 'Wishlist'}
            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all cursor-pointer ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
          >
            <Heart className="w-4 h-4 text-slate-500 shrink-0" />
            {!isCollapsed && <span>{language === 'fr' ? 'Favoris / Souhaits' : 'Wishlist'}</span>}
          </button>

          {/* About Us */}
          <button
            onClick={() => {
              if (onOpenAboutUsPage) onOpenAboutUsPage();
              else onOpenBrandPage();
            }}
            title={language === 'fr' ? 'À propos de nous' : 'About Us'}
            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 transition-all cursor-pointer ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
          >
            <Info className="w-4.5 h-4.5 text-blue-600 shrink-0" />
            {!isCollapsed && <span className="font-medium text-xs sm:text-sm">{language === 'fr' ? 'À propos de nous' : 'About Us'}</span>}
          </button>

          {/* Conditions générales (Terms & Conditions) */}
          <button
            onClick={() => {
              if (onOpenTermsPage) onOpenTermsPage();
            }}
            title={language === 'fr' ? 'Conditions générales' : 'Terms & Conditions'}
            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 transition-all cursor-pointer ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
          >
            <FileText className="w-4.5 h-4.5 text-blue-600 shrink-0" />
            {!isCollapsed && <span className="font-medium text-xs sm:text-sm">{language === 'fr' ? 'Conditions générales' : 'Terms & Conditions'}</span>}
          </button>

          {/* Politique de remboursement (Refund Policy) */}
          <button
            onClick={() => {
              if (onOpenRefundPolicyPage) onOpenRefundPolicyPage();
            }}
            title={language === 'fr' ? 'Politique de remboursement' : 'Refund Policy'}
            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 transition-all cursor-pointer ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
          >
            <RotateCcw className="w-4.5 h-4.5 text-blue-600 shrink-0" />
            {!isCollapsed && <span className="font-medium text-xs sm:text-sm">{language === 'fr' ? 'Remboursement & Retours' : 'Refund & Returns'}</span>}
          </button>

          {/* Nous trouver (Store Locator) */}
          <button
            onClick={() => {
              if (onOpenStoreLocatorPage) onOpenStoreLocatorPage();
            }}
            title={language === 'fr' ? 'Nous trouver' : 'Store Locator'}
            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 transition-all cursor-pointer ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
          >
            <MapPin className="w-4.5 h-4.5 text-blue-600 shrink-0" />
            {!isCollapsed && <span className="font-medium text-xs sm:text-sm">{language === 'fr' ? 'Nous trouver' : 'Store Locator'}</span>}
          </button>
        </div>

        {/* Special Offer Pill Button */}
        {!isCollapsed && (
          <div className="pt-2">
            <button
              onClick={() => onOpenSection('hot-deals')}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-extrabold uppercase text-xs rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer text-center tracking-wider"
            >
              SPECIAL OFFER
            </button>
          </div>
        )}

        {/* Support & Settings Section (Inside Scrollable Menu Container) */}
        <div className="pt-4 border-t border-slate-200/80 space-y-3">
          {!isCollapsed ? (
            <>
              {/* Need Help? 24/7 Support Center */}
              <button
                onClick={onOpenBrandPage}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-blue-50/80 rounded-xl border border-slate-200/80 text-left group cursor-pointer transition-colors shadow-2xs"
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

              {/* Language & Currency Selector */}
              <button
                onClick={() => setIsSelectorModalOpen(true)}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:border-blue-300 rounded-xl border border-slate-200/80 text-xs font-bold text-slate-900 transition-colors cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">{country.flag} {currency.code} ({currency.symbol})</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsSelectorModalOpen(true)}
              className="mx-auto flex items-center justify-center p-2 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
              title="Support & Settings"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Round Circle Profile Button (Down at the bottom) */}
        <div className="pt-3 pb-1 border-t border-slate-200/80 flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={() => {
              if (user) onOpenProfile('profile');
              else if (onOpenAuth) onOpenAuth('login');
              else onOpenProfile('profile');
            }}
            title={user ? `${user.firstName} ${user.lastName || ''} - ${language === 'fr' ? 'Mon Compte' : 'Profile'}` : (language === 'fr' ? 'Se Connecter' : 'Sign In')}
            className={`group relative w-12 h-12 rounded-full transition-all duration-300 cursor-pointer shadow-[0_2px_15px_-3px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_-5px_rgba(79,70,229,0.25)] flex items-center justify-center ring-2 hover:scale-105 active:scale-95 shrink-0 overflow-hidden ${
              isProfileActive
                ? 'ring-indigo-500 ring-offset-2 bg-indigo-50'
                : 'ring-indigo-500/20 hover:ring-indigo-500/50 bg-white'
            }`}
            aria-label="User Profile"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className={`relative w-10 h-10 rounded-full flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300 ${
              user 
                ? 'bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white font-black text-sm uppercase ring-2 ring-white/50' 
                : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
            }`}>
              {user ? (
                <>
                  <span>{user.firstName ? user.firstName[0] : 'U'}</span>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full shadow-sm" />
                </>
              ) : (
                <User className="w-5 h-5 stroke-[2.2]" />
              )}
            </div>
          </button>
          {!isCollapsed && (
            <span className="text-[11px] font-bold text-slate-800 mt-1.5 truncate max-w-[120px] text-center">
              {user ? user.firstName : (language === 'fr' ? 'Mon Compte' : 'Account')}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
};
