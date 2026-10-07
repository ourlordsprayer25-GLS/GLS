import React, { useState, useEffect, useRef } from 'react';
import { 
  Product, 
  UserProfile, 
  CartItem, 
  Order, 
  StoreNotification,
  StoreSettings 
} from '../types/store';
import { SectionType } from './SectionPage';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';

import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { CategorySection } from './CategorySection';
import { HotDealsSection } from './HotDealsSection';
import { NewArrivalsSection } from './NewArrivalsSection';
import { ProductCard } from './ProductCard';
import { ProductPage } from './ProductPage';
import { ProfilePage } from './ProfilePage';
import { OrdersPage } from './OrdersPage';
import { SectionPage } from './SectionPage';
import { CategoriesPage } from './CategoriesPage';
import { BrandPage } from './BrandPage';
import { CollectionsPage } from './CollectionsPage';
import { AboutUsPage } from './AboutUsPage';
import { TermsPage } from './TermsPage';
import { RefundPolicyPage } from './RefundPolicyPage';
import { StoreLocatorPage } from './StoreLocatorPage';
import { AuthModal } from './AuthModal';
import { MobileSidebar } from './MobileSidebar';
import { BottomNav } from './BottomNav';
import { CartPage } from './CartPage';
import { WishlistPage } from './WishlistPage';
import { NotificationDrawer } from './NotificationDrawer';
import { CheckoutModal } from './CheckoutModal';
import { LanguageCurrencyModal } from './LanguageCurrencyModal';
import { Footer } from './Footer';
import { FloatingWhatsAppConcierge } from './WhatsAppWidget';
import { FloatingCartWidget } from './FloatingCartWidget';
import { DesktopSidebar } from './DesktopSidebar';
import { OfflineIndicator } from './OfflineIndicator';
import { NotificationPermissionBanner } from './NotificationPermissionBanner';
import { ArrowRight, SlidersHorizontal, X } from 'lucide-react';

interface StorefrontViewProps {
  user: UserProfile | null;
  products: Product[];
  orders: Order[];
  categories: any[];
  notifications: StoreNotification[];
  cartItems: CartItem[];
  wishlistIds: string[];
  searchQuery: string;
  selectedCategory: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating';
  isCategoriesPageOpen: boolean;
  isAboutUsPageOpen: boolean;
  isTermsPageOpen: boolean;
  isRefundPolicyPageOpen: boolean;
  isStoreLocatorPageOpen: boolean;
  isBrandPageOpen: boolean;
  isCollectionsPageOpen: boolean;
  isOrdersPageOpen: boolean;
  isProfilePageOpen: boolean;
  isCartPageOpen: boolean;
  isWishlistPageOpen: boolean;
  activeSectionPage: SectionType | null;
  sectionPageCategory: string;
  selectedProduct: Product | null;
  isNotificationsOpen: boolean;
  isCheckoutOpen: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  isMobileSidebarOpen: boolean;
  initialInvoiceNumber: string | null;
  activeToast: { id: string; title: string; message: string; orderNumber?: string; image?: string } | null;
  unreadNotificationCount: number;
  cartItemCount: number;
  wishlistCount: number;
  profileTab: string;
  authUser: any;
  storeSettings: StoreSettings;
  handleOpenCartPage: () => void;

  setSearchQuery: (q: string) => void;
  setSelectedCategory: (c: string) => void;
  setSortBy: (s: any) => void;
  setSelectedProduct: (p: Product | null) => void;
  setIsNotificationsOpen: (o: boolean) => void;
  setIsCheckoutOpen: (o: boolean) => void;
  setIsAuthModalOpen: (o: boolean) => void;
  setIsMobileSidebarOpen: (o: boolean) => void;
  setInitialInvoiceNumber: (n: string | null) => void;
  setActiveToast: (t: any) => void;
  setUser: (u: UserProfile | null) => void;

  requestNotificationPermission: () => Promise<boolean>;
  handleBackToShop: () => void;
  handleOpenSectionPage: (s: SectionType, cat?: string) => void;
  handleOpenCategoriesPage: () => void;
  handleOpenBrandPage: () => void;
  handleOpenAboutUsPage: () => void;
  handleOpenTermsPage: () => void;
  handleOpenRefundPolicyPage: () => void;
  handleOpenStoreLocatorPage: () => void;
  handleOpenCollectionsPage: () => void;
  handleOpenOrders: (orderNumber?: string) => void;
  handleOpenProfile: (tab?: any) => void;
  handleSelectCategory: (cat: string) => void;
  handleOpenWishlistPage: () => void;
  handleOpenAuth: (mode?: 'login' | 'register') => void;
  handleLogout: () => void;
  handleSelectProduct: (p: Product | null) => void;
  handleToggleWishlist: (id: string) => void;
  handleQuickAdd: (p: Product, v: any) => void;
  handleCancelOrder: (id: string, r: string) => void;
  handleRequestReturn: (id: string) => void;
  handleReorder: (items: CartItem[]) => void;
  handleAddToCart: (p: Product, v: any, s: any, q: number, open?: boolean) => void;
  handleUpdateOrderStatus: (id: string, s: any) => void;
  handleUpdateQuantity: (id: string, q: number) => void;
  handleRemoveItem: (id: string) => void;
  handleProceedToCheckout: () => void;
  handleClearWishlist: () => void;
  handleMoveAllWishlistToBag: () => void;
  handleMarkAllNotificationsRead: () => void;
  handleMarkNotificationRead: (id: string) => void;
  handleDeleteNotification?: (id: string) => void;
  handleClearAllNotifications: () => void;
  handleNavigateToProductFromNotification: (id: string) => void;
  handleOrderSuccess: (o: Order) => void;
  handleLoginSuccess: (u: UserProfile) => void;
}

export const StorefrontView: React.FC<StorefrontViewProps> = (props) => {
  const {
    user, products, orders, categories, notifications, cartItems, wishlistIds, searchQuery,
    selectedCategory, sortBy, isCategoriesPageOpen, isAboutUsPageOpen, isTermsPageOpen,
    isRefundPolicyPageOpen,
    isStoreLocatorPageOpen, isBrandPageOpen, isCollectionsPageOpen, isOrdersPageOpen,
    isProfilePageOpen, isCartPageOpen, isWishlistPageOpen, activeSectionPage,
    sectionPageCategory, selectedProduct, isNotificationsOpen, isCheckoutOpen,
    isAuthModalOpen, authModalMode, isMobileSidebarOpen,
    initialInvoiceNumber, activeToast, unreadNotificationCount, cartItemCount,
    wishlistCount, profileTab, authUser, storeSettings, handleOpenCartPage,
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
  } = props;

  const { formatPrice, language } = useLanguageCurrency();

  const formatCurrencyInText = (text?: string): string => {
    if (!text) return '';
    return text.replace(/\$(\d+(?:\.\d+)?)/g, (_, val) => {
      const num = parseFloat(val);
      return isNaN(num) ? _ : formatPrice(num);
    });
  };

  const handleOpenShareStore = async () => {
    let storeUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.gladyns.store';
    if (storeUrl.includes('gladyns.store') && !storeUrl.includes('www.gladyns.store')) {
      storeUrl = storeUrl.replace('://gladyns.store', '://www.gladyns.store');
    }

    const shareTitle = storeSettings?.storeName || 'GLADYNS ALL ACROSS';
    const shareText = language === 'fr'
      ? 'Découvrez GLADYNS ALL ACROSS — Instruments de musique, électronique haute fidélité, électroménager et mode intemporelle.'
      : 'Discover GLADYNS ALL ACROSS — Musical instruments, precision audio electronics, home appliances, and timeless apparel.';

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: storeUrl,
        });
        return;
      } catch (err) {}
    }

    try {
      await navigator.clipboard?.writeText(storeUrl);
      setActiveToast({
        title: language === 'fr' ? 'Lien copié !' : 'Link copied!',
        description: language === 'fr' ? 'Le lien de la boutique a été copié dans le presse-papier.' : 'Store link copied to clipboard.',
        type: 'success',
      });
    } catch (_) {}
  };

  const lastViewKeyRef = useRef<string>('');

  useEffect(() => {
    const currentViewKey = [
      selectedProduct?.id || '',
      activeSectionPage || '',
      isCartPageOpen ? 'cart' : '',
      isProfilePageOpen ? 'profile' : '',
      isOrdersPageOpen ? 'orders' : '',
      isCategoriesPageOpen ? 'categories' : '',
      isAboutUsPageOpen ? 'about' : '',
      isTermsPageOpen ? 'terms' : '',
      isRefundPolicyPageOpen ? 'refund' : '',
      isStoreLocatorPageOpen ? 'store' : '',
      isBrandPageOpen ? 'brand' : '',
      isCollectionsPageOpen ? 'collections' : '',
      isWishlistPageOpen ? 'wishlist' : '',
    ].join('|');

    if (currentViewKey !== lastViewKeyRef.current) {
      lastViewKeyRef.current = currentViewKey;
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [
    selectedProduct?.id,
    activeSectionPage,
    isCartPageOpen,
    isProfilePageOpen,
    isOrdersPageOpen,
    isCategoriesPageOpen,
    isAboutUsPageOpen,
    isTermsPageOpen,
    isRefundPolicyPageOpen,
    isStoreLocatorPageOpen,
    isBrandPageOpen,
    isCollectionsPageOpen,
    isWishlistPageOpen
  ]);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    if (!searchQuery.trim()) return matchesCategory;

    const q = searchQuery.toLowerCase().trim();
    const specsMatch = Array.isArray(p.specs) && p.specs.some(
      s => s.label.toLowerCase().includes(q) || s.value.toLowerCase().includes(q)
    );

    const matchesSearch =
      Boolean(p.name && p.name.toLowerCase().includes(q)) ||
      Boolean(p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
      Boolean(p.brand && p.brand.toLowerCase().includes(q)) ||
      Boolean(p.categoryLabel && p.categoryLabel.toLowerCase().includes(q)) ||
      Boolean(p.materials && p.materials.toLowerCase().includes(q)) ||
      Boolean(p.condition && p.condition.toLowerCase().includes(q)) ||
      Boolean(p.description && p.description.toLowerCase().includes(q)) ||
      specsMatch;

    return matchesCategory && matchesSearch;
  });

  if (sortBy === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  } else {
    filteredProducts.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] pb-16 lg:pb-0">
      <OfflineIndicator />
      <NotificationPermissionBanner onRequestPermission={requestNotificationPermission} />

      <DesktopSidebar
        user={user}
        onBackToHome={() => {
          setIsNotificationsOpen(false);
          handleBackToShop();
        }}
        onOpenSection={handleOpenSectionPage}
        onOpenCategoriesPage={handleOpenCategoriesPage}
        onOpenBrandPage={handleOpenBrandPage}
        onOpenAboutUsPage={handleOpenAboutUsPage}
        onOpenTermsPage={handleOpenTermsPage}
        onOpenRefundPolicyPage={handleOpenRefundPolicyPage}
        onOpenStoreLocatorPage={handleOpenStoreLocatorPage}
        onOpenCollectionsPage={handleOpenCollectionsPage}
        onOpenOrders={handleOpenOrders}
        onOpenProfile={handleOpenProfile}
        onSelectCategory={handleSelectCategory}
        isHomeActive={!isCategoriesPageOpen && !isBrandPageOpen && !isCollectionsPageOpen && !isOrdersPageOpen && !isProfilePageOpen && !activeSectionPage && !selectedProduct && selectedCategory === 'all' && !isCartPageOpen && !isWishlistPageOpen}
        isBrandActive={isBrandPageOpen}
        isCollectionsActive={isCollectionsPageOpen}
        isCategoriesActive={isCategoriesPageOpen}
        isOrdersActive={isOrdersPageOpen}
        isProfileActive={isProfilePageOpen}
        onOpenWishlist={handleOpenWishlistPage}
        onOpenAuth={(mode) => handleOpenAuth(mode || 'login')}
      />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Header
          products={products}
          categories={categories}
          user={user}
          cartItemCount={cartItemCount}
          unreadNotificationCount={unreadNotificationCount}
          wishlistCount={wishlistCount}
          storeSettings={storeSettings}
          onBackToHome={() => {
            setIsNotificationsOpen(false);
            handleBackToShop();
          }}
          onOpenShareModal={handleOpenShareStore}
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenCart={handleOpenCartPage}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenWishlist={handleOpenWishlistPage}
          onOpenOrders={handleOpenOrders}
          onOpenProfile={handleOpenProfile}
          onOpenAuth={() => handleOpenAuth('login')}
          onLogout={handleLogout}
          onOpenSection={handleOpenSectionPage}
          onOpenCategoriesPage={handleOpenCategoriesPage}
          onOpenBrandPage={handleOpenBrandPage}
          onOpenCollectionsPage={handleOpenCollectionsPage}
          onSelectCategory={handleSelectCategory}
          onSelectProduct={handleSelectProduct}
          onSearch={(query) => {
            setSearchQuery(query);
            if (query.trim()) {
              handleBackToShop();
            }
          }}
          searchQuery={searchQuery}
          isProfileActive={isProfilePageOpen}
          isOrdersActive={isOrdersPageOpen}
        />

        <main className="flex-1">
          {selectedProduct ? (
            <ProductPage
              product={selectedProduct}
              allProducts={products}
              wishlistIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
              onBack={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  handleBackToShop();
                }
                setSelectedProduct(null);
              }}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              onBuyItNow={(p, v, s, q) => {
                handleAddToCart(p, v, s, q);
                handleProceedToCheckout();
              }}
              onOpenCollections={handleOpenCollectionsPage}
              storeSettings={storeSettings}
            />
          ) : isCategoriesPageOpen ? (
            <CategoriesPage
              products={products}
              wishlistIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
              onSelectProduct={handleSelectProduct}
              onQuickAdd={handleQuickAdd}
              onBackToHome={handleBackToShop}
              onOpenBrand={handleOpenBrandPage}
            />
          ) : isAboutUsPageOpen ? (
            <AboutUsPage
              onBackToShop={handleBackToShop}
              onOpenCollectionsPage={handleOpenCollectionsPage}
              onOpenBrandPage={handleOpenBrandPage}
              storeSettings={storeSettings}
            />
          ) : isTermsPageOpen ? (
            <TermsPage
              onBackToShop={handleBackToShop}
              onOpenAboutUsPage={handleOpenAboutUsPage}
              onOpenRefundPolicyPage={handleOpenRefundPolicyPage}
              storeSettings={storeSettings}
            />
          ) : isRefundPolicyPageOpen ? (
            <RefundPolicyPage
              onBackToShop={handleBackToShop}
              onOpenOrders={handleOpenOrders}
              onOpenTermsPage={handleOpenTermsPage}
              storeSettings={storeSettings}
            />
          ) : isStoreLocatorPageOpen ? (
            <StoreLocatorPage
              onBackToShop={handleBackToShop}
              onOpenAboutUsPage={handleOpenAboutUsPage}
              storeSettings={storeSettings}
            />
          ) : isBrandPageOpen ? (
            <BrandPage
              products={products}
              wishlistIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
              onSelectProduct={handleSelectProduct}
              onQuickAdd={handleQuickAdd}
              onBackToHome={handleBackToShop}
              onOpenCategories={handleOpenCategoriesPage}
              onExploreCollection={handleOpenCollectionsPage}
            />
          ) : isCollectionsPageOpen ? (
            <CollectionsPage
              products={products}
              wishlistIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
              onSelectProduct={handleSelectProduct}
              onQuickAdd={handleQuickAdd}
              onBackToHome={handleBackToShop}
              onOpenCategories={handleOpenCategoriesPage}
              onOpenBrand={handleOpenBrandPage}
            />
          ) : isOrdersPageOpen ? (
            <OrdersPage
              user={user}
              orders={user ? orders.filter(o => o.customerId === user.id) : []}
              products={products}
              wishlistIds={wishlistIds}
              onCancelOrder={handleCancelOrder}
              onRequestReturn={handleRequestReturn}
              onReorder={handleReorder}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              onBackToShop={handleBackToShop}
              onOpenProfile={() => handleOpenProfile('profile')}
              onOpenAuth={() => handleOpenAuth('login')}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              initialInvoiceNumber={initialInvoiceNumber}
              onClearInitialInvoiceNumber={() => setInitialInvoiceNumber(null)}
              storeSettings={storeSettings}
            />
          ) : isProfilePageOpen ? (
            <ProfilePage
              user={user}
              orders={user ? orders.filter(o => o.customerId === user.id) : []}
              products={products}
              wishlistIds={wishlistIds}
              initialTab={profileTab as any}
              onUpdateUser={setUser}
              onLogout={handleLogout}
              onOpenAuth={() => handleOpenAuth('login')}
              onBackToShop={handleBackToShop}
              onOpenOrders={handleOpenOrders}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
            />
          ) : isCartPageOpen ? (
            <CartPage
              items={cartItems}
              products={products}
              wishlistIds={wishlistIds}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onProceedToCheckout={handleProceedToCheckout}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              onBackToShop={handleBackToShop}
              storeSettings={storeSettings}
            />
          ) : isWishlistPageOpen ? (
            <WishlistPage
              wishlistProducts={products.filter((p) => wishlistIds.includes(p.id))}
              products={products}
              onRemoveFromWishlist={handleToggleWishlist}
              onClearWishlist={handleClearWishlist}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              onMoveAllToBag={handleMoveAllWishlistToBag}
              onBackToShop={handleBackToShop}
            />
          ) : activeSectionPage ? (
            <SectionPage
              sectionType={activeSectionPage}
              initialCategory={sectionPageCategory}
              allProducts={products}
              categories={categories}
              wishlistIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
              onSelectProduct={handleSelectProduct}
              onQuickAdd={handleQuickAdd}
              onBackToHome={handleBackToShop}
            />
          ) : (
            <div>
              <HeroSection
                products={products}
                onSelectProduct={handleSelectProduct}
                storeSettings={storeSettings}
                onShopFeatured={() => {
                  const featured = products.find((p) => p.featured) || products[0];
                  handleSelectProduct(featured);
                }}
                onExploreCollection={() => {
                  const el = document.getElementById('catalog-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                onOpenSection={handleOpenSectionPage}
              />

              <div id="categories-section">
                <CategorySection
                  products={products}
                  categories={categories}
                  onSelectCategory={(cat) => handleOpenSectionPage('categories', cat)}
                  onViewAllCategories={() => handleOpenSectionPage('categories')}
                />
              </div>

              <div id="hot-deals-section">
                <HotDealsSection
                  products={products}
                  wishlistIds={wishlistIds}
                  onToggleWishlist={handleToggleWishlist}
                  onSelectProduct={handleSelectProduct}
                  onQuickAdd={handleQuickAdd}
                  onViewAllDeals={() => handleOpenSectionPage('hot-deals')}
                />
              </div>

              <div id="new-arrivals-section">
                <NewArrivalsSection
                  products={products}
                  wishlistIds={wishlistIds}
                  onToggleWishlist={handleToggleWishlist}
                  onSelectProduct={handleSelectProduct}
                  onQuickAdd={handleQuickAdd}
                  onViewAllNew={() => handleOpenSectionPage('new-arrivals')}
                />
              </div>

              <section id="catalog-section" className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl sm:text-2xl font-display font-medium text-zinc-950 tracking-tight">
                      {language === 'fr' ? 'Rayons Sélectionnés & Catalogue' : 'Curated Departments & Catalog'}
                    </h2>
                    <button
                      onClick={() => handleOpenSectionPage('collection')}
                      className="text-xs font-semibold text-zinc-950 hover:text-zinc-600 transition-colors flex items-center gap-1 cursor-pointer group"
                    >
                      <span>{language === 'fr' ? 'Tout voir' : 'View All'}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex items-center p-1 bg-zinc-200/60 rounded-xl overflow-x-auto max-w-full">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                            selectedCategory === cat.id
                              ? 'bg-white text-zinc-950 shadow-xs font-semibold'
                              : 'text-zinc-600 hover:text-zinc-950'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-xl px-2.5 py-1 text-xs text-zinc-700 shadow-xs">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-transparent focus:outline-none font-medium cursor-pointer"
                      >
                        <option value="featured">{language === 'fr' ? 'En vedette' : 'Featured First'}</option>
                        <option value="price-asc">{language === 'fr' ? 'Prix : Croissant' : 'Price: Low to High'}</option>
                        <option value="price-desc">{language === 'fr' ? 'Prix : Décroissant' : 'Price: High to Low'}</option>
                        <option value="rating">{language === 'fr' ? 'Mieux notés' : 'Highest Rated'}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {searchQuery && (
                  <div className="flex items-center gap-2 py-4 text-xs text-zinc-600">
                    <span>{language === 'fr' ? 'Recherche de' : 'Searching for'} <strong>"{searchQuery}"</strong></span>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-zinc-900 underline hover:text-zinc-600 cursor-pointer"
                    >
                      {language === 'fr' ? 'Effacer le filtre' : 'Clear filter'}
                    </button>
                  </div>
                )}

                {filteredProducts.length === 0 ? (
                  <div className="py-24 text-center space-y-3">
                    <p className="text-base font-semibold text-zinc-900">
                      {language === 'fr' ? 'Aucun article ne correspond à votre recherche' : 'No pieces match your search'}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {language === 'fr'
                        ? 'Essayez de parcourir toutes les collections ou de modifier vos termes de recherche.'
                        : 'Try browsing all collections or checking your search terms.'}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 bg-zinc-950 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      {language === 'fr' ? 'Voir tous les articles' : 'View All Pieces'}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5 lg:gap-6 pt-6 sm:pt-8">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isWishlisted={wishlistIds.includes(product.id)}
                        onToggleWishlist={handleToggleWishlist}
                        onSelect={handleSelectProduct}
                        onQuickAdd={handleQuickAdd}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </main>

        <NotificationDrawer
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllNotificationsRead}
          onMarkAsRead={handleMarkNotificationRead}
          onDeleteNotification={handleDeleteNotification}
          onClearAll={handleClearAllNotifications}
          onNavigateToProduct={handleNavigateToProductFromNotification}
          onOpenOrders={handleOpenOrders}
          products={products}
        />

        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cartItems}
          onOrderSuccess={handleOrderSuccess}
          onOpenOrders={handleOpenOrders}
          user={user}
          onUpdateUser={setUser}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          initialMode={authModalMode}
        />

        <LanguageCurrencyModal />

        <Footer
          onOpenSection={handleOpenSectionPage}
          onOpenCategoriesPage={handleOpenCategoriesPage}
          onOpenBrandPage={handleOpenBrandPage}
          onOpenAboutUsPage={handleOpenAboutUsPage}
          onOpenTermsPage={handleOpenTermsPage}
          onOpenRefundPolicyPage={handleOpenRefundPolicyPage}
          onOpenStoreLocatorPage={handleOpenStoreLocatorPage}
          onOpenCollectionsPage={handleOpenCollectionsPage}
          onSelectCategory={handleSelectCategory}
          onOpenOrders={handleOpenOrders}
          onOpenProfile={handleOpenProfile}
          onOpenAuth={() => handleOpenAuth('login')}
          onOpenShareModal={handleOpenShareStore}
          storeSettings={storeSettings}
        />

        <MobileSidebar
          products={products}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          user={user}
          wishlistCount={wishlistCount}
          unreadNotificationCount={unreadNotificationCount}
          cartItemCount={cartItemCount}
          onOpenCart={handleOpenCartPage}
          onOpenWishlist={handleOpenWishlistPage}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenOrders={handleOpenOrders}
          onOpenProfile={handleOpenProfile}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          onOpenSection={handleOpenSectionPage}
          onOpenCategoriesPage={handleOpenCategoriesPage}
          onOpenBrandPage={handleOpenBrandPage}
          onOpenAboutUsPage={handleOpenAboutUsPage}
          onOpenTermsPage={handleOpenTermsPage}
          onOpenRefundPolicyPage={handleOpenRefundPolicyPage}
          onOpenStoreLocatorPage={handleOpenStoreLocatorPage}
          onOpenCollectionsPage={handleOpenCollectionsPage}
          onSelectCategory={handleSelectCategory}
          onSelectProduct={handleSelectProduct}
          onBackToHome={() => {
            setIsNotificationsOpen(false);
            handleBackToShop();
          }}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
        />

        <BottomNav
          user={user}
          cartItemCount={cartItemCount}
          wishlistCount={wishlistCount}
          isProfileActive={isProfilePageOpen}
          isOrdersActive={isOrdersPageOpen}
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenCart={handleOpenCartPage}
          onOpenWishlist={handleOpenWishlistPage}
          onOpenOrders={handleOpenOrders}
          onOpenProfile={handleOpenProfile}
          onOpenHome={() => {
            setIsNotificationsOpen(false);
            handleBackToShop();
          }}
          onOpenAuth={() => handleOpenAuth('login')}
        />

        <FloatingWhatsAppConcierge storeSettings={storeSettings} />

        <FloatingCartWidget
          cartItemCount={cartItemCount}
          onOpenCart={handleOpenCartPage}
          isCartOpen={isCartPageOpen}
        />

        {activeToast && (
          <div 
            onClick={() => {
              handleOpenOrders(activeToast.orderNumber);
              setActiveToast(null);
            }}
            className="fixed top-20 sm:top-24 right-4 md:right-8 z-[250] max-w-sm w-full bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/60 p-4 overflow-hidden animate-in slide-in-from-top-6 duration-300 cursor-pointer hover:border-emerald-400 transition-all group pointer-events-auto"
          >
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 overflow-hidden flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/10">
                {activeToast.image ? (
                  <img
                    src={activeToast.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-600 flex items-center justify-center">
                    <span className="text-sm font-bold">✓</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    {language === 'fr' ? 'Nouvelle Commande Enregistrée' : 'New Order Placed'}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveToast(null);
                    }}
                    className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs font-semibold text-white mt-1">
                  {formatCurrencyInText(activeToast.title)}
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  {formatCurrencyInText(activeToast.message)}
                </p>
                <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">
                  <span>{language === 'fr' ? 'Suivre en Direct (5 étapes)' : 'View Live 5-Stage Tracking'}</span>
                  <span>➔</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
              <div 
                className="h-full bg-emerald-500" 
                style={{
                  animation: 'toast-shrink 5s linear forwards'
                }}
              />
            </div>
          </div>
        )}

        <style>{`
          @keyframes toast-shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>
      </div>
    </div>
  );
};
