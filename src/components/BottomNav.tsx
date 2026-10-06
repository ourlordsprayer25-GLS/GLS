import React from 'react';
import { Home, Heart, ShoppingCart, User, Store } from 'lucide-react';
import { UserProfile } from '../types/store';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';

interface BottomNavProps {
  user: UserProfile | null;
  cartItemCount: number;
  wishlistCount: number;
  isProfileActive: boolean;
  isOrdersActive: boolean;
  onOpenSidebar?: () => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
  onOpenProfile: () => void;
  onOpenHome: () => void;
  onOpenAuth: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  user,
  cartItemCount,
  wishlistCount,
  isProfileActive,
  isOrdersActive,
  onOpenSidebar,
  onOpenCart,
  onOpenWishlist,
  onOpenOrders,
  onOpenProfile,
  onOpenHome,
  onOpenAuth,
}) => {
  const { language } = useLanguageCurrency();
  const isShopActive = !isProfileActive && !isOrdersActive;

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[max(env(safe-area-inset-bottom),0.35rem)] pt-1 transition-transform duration-200"
    >
      <div className="grid grid-cols-5 items-stretch w-full h-13">
        {/* 1. MY STORE */}
        <button
          onClick={() => onOpenSidebar && onOpenSidebar()}
          className="flex flex-col items-center justify-center py-1 px-1 transition-colors cursor-pointer group text-slate-600 hover:text-blue-600"
          aria-label="My Store navigation menu"
        >
          <div className="relative">
            <Store className="w-5 h-5 stroke-[1.8] transition-transform group-active:scale-90 text-slate-700 group-hover:text-blue-600" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-tight uppercase mt-1">
            {language === 'fr' ? 'BOUTIQUE' : 'STORE'}
          </span>
        </button>

        {/* 2. PANIER */}
        <button
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center py-1 px-1 transition-colors cursor-pointer group text-slate-600 hover:text-blue-600"
          aria-label={`Panier cart with ${cartItemCount} items`}
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 stroke-[1.8] transition-transform group-active:scale-90 text-slate-700 group-hover:text-blue-600" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white font-mono shadow-xs">
                {cartItemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-tight uppercase mt-1">
            {language === 'fr' ? 'PANIER' : 'CART'}
          </span>
        </button>

        {/* 3. ACCUEIL (Center - highlighted active box) */}
        <button
          onClick={onOpenHome}
          className={`flex flex-col items-center justify-center py-1 px-1 transition-all cursor-pointer group ${
            isShopActive
              ? 'bg-blue-50/90 text-blue-600 font-extrabold border-x border-blue-100/80'
              : 'text-slate-600 hover:text-blue-600'
          }`}
          aria-label="Home page"
        >
          <div className="relative">
            <Home
              className={`w-5 h-5 transition-transform group-active:scale-90 ${
                isShopActive ? 'stroke-[2.5] text-blue-600' : 'stroke-[1.8] text-slate-700'
              }`}
            />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-tight uppercase mt-1">
            {language === 'fr' ? 'ACCUEIL' : 'HOME'}
          </span>
        </button>

        {/* 4. FAVORIS */}
        <button
          onClick={onOpenWishlist}
          className="flex flex-col items-center justify-center py-1 px-1 transition-colors cursor-pointer group text-slate-600 hover:text-rose-600"
          aria-label={`Favoris with ${wishlistCount} saved items`}
        >
          <div className="relative">
            <Heart
              className={`w-5 h-5 transition-transform group-active:scale-90 ${
                wishlistCount > 0
                  ? 'fill-rose-500 text-rose-500 stroke-[1.8]'
                  : 'stroke-[1.8] text-slate-700 group-hover:text-rose-600'
              }`}
            />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white font-mono shadow-xs">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-tight uppercase mt-1">
            {language === 'fr' ? 'FAVORIS' : 'WISHLIST'}
          </span>
        </button>

        {/* 5. PROFIL */}
        <button
          onClick={() => {
            if (user) {
              onOpenProfile();
            } else {
              onOpenAuth();
            }
          }}
          className={`flex flex-col items-center justify-center py-1 px-1 transition-colors cursor-pointer group ${
            isProfileActive ? 'text-blue-600 font-extrabold' : 'text-slate-600 hover:text-blue-600'
          }`}
          aria-label="User Profile"
        >
          <div className="relative">
            <User
              className={`w-5 h-5 transition-transform group-active:scale-90 ${
                isProfileActive ? 'stroke-[2.5] text-blue-600' : 'stroke-[1.8] text-slate-700'
              }`}
            />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-tight uppercase mt-1">
            {language === 'fr' ? 'PROFIL' : 'ACCOUNT'}
          </span>
        </button>
      </div>
    </nav>
  );
};
