import React from 'react';
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  Truck,
  ShieldCheck,
  ArrowLeft,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { CartItem, Product, ProductVariant, ProductSize, StoreSettings } from '../types/store';

import { useLanguageCurrency } from '../context/LanguageCurrencyContext';
import { ProductCard } from './ProductCard';
import { getWhatsAppLink } from './WhatsAppWidget';

interface CartPageProps {
  items: CartItem[];
  products: Product[];
  wishlistIds: string[];
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onProceedToCheckout: () => void;
  onSelectProduct?: (product: Product) => void;
  onAddToCart?: (
    product: Product,
    variant: ProductVariant,
    size: ProductSize,
    quantity: number
  ) => void;
  onToggleWishlist?: (productId: string) => void;
  onBackToShop: () => void;
  storeSettings?: StoreSettings;
}

export const CartPage: React.FC<CartPageProps> = ({
  items,
  products,
  wishlistIds,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
  onBackToShop,
  storeSettings,
}) => {
  const { formatPrice, t, language } = useLanguageCurrency();

  const FREE_SHIPPING_THRESHOLD = 150;
  
  // Valid items only (guards against corrupted cache)
  const validItems = items.filter((item) => item && item.product && typeof item.product.price === 'number');
  const subtotal = validItems.reduce((sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1), 0);
  const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || validItems.length === 0;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  // Curated recommendations (pieces not yet in the bag, fallback to full catalog)
  const cartProductIds = new Set(validItems.map((i) => i.product.id));
  const allCatalog = products;
  const unselected = allCatalog.filter((p) => !cartProductIds.has(p.id));
  const recommendations = (unselected.length > 0 ? unselected : allCatalog).slice(0, 8);

  const handleQuickAddRecommendation = (prod: Product) => {
    if (onAddToCart) {
      const defaultVariant = prod.colors[0];
      const defaultSize = prod.sizes.find((s) => s.inStock) || prod.sizes[0];
      onAddToCart(prod, defaultVariant, defaultSize, 1);
    }
  };

  const handleFillSampleItems = () => {
    if (onAddToCart && products.length > 0) {
      products.slice(0, 2).forEach((prod) => {
        const defaultVariant = prod.colors[0];
        const defaultSize = prod.sizes.find((s) => s.inStock) || prod.sizes[0];
        onAddToCart(prod, defaultVariant, defaultSize, 1);
      });
    }
  };

  const STANDARD_DELIVERY_FEE_USD = 2000 / 605;
  const shippingCost = qualifiesForFreeShipping ? 0 : STANDARD_DELIVERY_FEE_USD;
  const estimatedTotal = subtotal + shippingCost;

  const handleWhatsAppCheckout = () => {
    const itemSummary = validItems.map(i => {
      const color = i.selectedColor?.name && !['standard', 'default'].includes(i.selectedColor.name.toLowerCase()) ? i.selectedColor.name : '';
      const sizeVal = typeof i.selectedSize === 'object' ? i.selectedSize?.name : i.selectedSize;
      const size = sizeVal && !['standard', 'default', 'one size', 'taille unique'].includes(String(sizeVal).toLowerCase()) ? String(sizeVal) : '';
      const spec = [color, size].filter(Boolean).join(', ');
      return `${i.quantity}x ${i.product.name}${spec ? ` (${spec})` : ''}`;
    }).join(', ');
    const text = language === 'fr'
      ? `Bonjour GLADYNS Boutique, je souhaite commander : ${itemSummary}. Sous-total : ${formatPrice(subtotal)}. Merci de m'indiquer les modalités de règlement et d'expédition.`
      : `Hello GLADYNS Boutique, I would like to order: ${itemSummary}. Subtotal: ${formatPrice(subtotal)}. Please guide me with payment and dispatch.`;
    window.open(getWhatsAppLink(text, storeSettings?.whatsappNumber), '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-6 pb-28 lg:pt-12 lg:pb-16">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb / Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToShop}
              className="p-2 hover:bg-zinc-100 rounded-full transition-colors group cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-600 transition-transform group-hover:-translate-x-0.5" />
            </button>
            <div>
              <h1 className="text-3xl font-display font-medium text-zinc-950 tracking-tight">
                {t('shoppingBag')}
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                {language === 'fr'
                  ? `${validItems.length} ${validItems.length === 1 ? 'article réservé' : 'articles réservés'} dans votre panier`
                  : `${validItems.length} ${validItems.length === 1 ? 'Acquisition' : 'Acquisitions'} reserved in your curation bag`}
              </p>
            </div>
          </div>
          
          <button
            onClick={onBackToShop}
            className="text-xs font-semibold text-zinc-950 hover:text-zinc-600 transition-colors underline cursor-pointer hidden sm:block"
          >
            {language === 'fr' ? 'Continuer vos achats' : 'Continue Browsing'}
          </button>
        </div>

        {validItems.length === 0 ? (
          <div className="py-20 lg:py-32 text-center space-y-6 bg-white rounded-3xl border border-zinc-200/80 shadow-xs max-w-2xl mx-auto px-6">
            <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
              <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-display font-medium text-zinc-950">
                {language === 'fr' ? 'Votre panier est vide' : 'Your Shopping Bag is Empty'}
              </h2>
              <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                {language === 'fr'
                  ? 'Explorez notre collection exclusive de pièces en série limitée et d\'artisanat durable.'
                  : 'Explore our micro-batch collections and exceptional sustainable artisanal garments.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={onBackToShop}
                className="px-6 py-3 bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-zinc-800 transition-all cursor-pointer shadow-sm"
              >
                {language === 'fr' ? 'Découvrir la collection' : 'Explore Collections'}
              </button>
              <button
                onClick={handleFillSampleItems}
                className="px-6 py-3 bg-zinc-100 text-zinc-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-zinc-200 transition-all cursor-pointer"
              >
                {language === 'fr' ? 'Remplir avec des articles' : 'Load Sample Items'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Left Column: Cart Items & Free Shipping Progress */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Free Shipping Banner */}
              <div className="bg-zinc-900 text-white p-5 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-semibold">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    {qualifiesForFreeShipping ? (
                      <span className="text-emerald-400 font-bold uppercase">
                        {language === 'fr' ? 'Vous bénéficiez de la livraison offerte !' : 'You have unlocked free carbon-neutral shipping!'}
                      </span>
                    ) : (
                      <span>
                        {language === 'fr' ? 'Ajoutez' : 'Add'} <strong className="text-white font-mono">{formatPrice(amountToFreeShipping)}</strong> {language === 'fr' ? 'de plus pour la livraison offerte' : 'more for free worldwide delivery'}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Cart Items List */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/80 shadow-xs divide-y divide-zinc-100 overflow-hidden">
                {validItems.map((item) => {
                  const isApparelCategory = ['apparel', 'clothing', 'fashion', 'shoes', 'footwear', 'men', 'women'].includes((item.product?.category || '').toLowerCase()) || ['apparel', 'clothing', 'fashion', 'shoes', 'footwear', 'men', 'women'].includes((item.product?.categoryLabel || '').toLowerCase());
                  const hasExplicitSizes = Boolean(item.product?.sizes && item.product.sizes.length > 0);
                  const shouldShowSize = (isApparelCategory || hasExplicitSizes) && item.selectedSize && !['standard', 'default', 'one size', 'taille unique', ''].includes(String(typeof item.selectedSize === 'object' ? item.selectedSize?.name : item.selectedSize).toLowerCase());
                  const hasColor = Boolean(item.selectedColor?.name && !['standard', 'default', ''].includes(item.selectedColor.name.toLowerCase()));

                  return (
                    <div key={item.id} className="p-3 sm:p-5 flex flex-row items-center gap-3 sm:gap-5 group hover:bg-zinc-50/60 transition-colors">
                      {/* Product Thumbnail (Compact & fixed ratio on mobile) */}
                      <div 
                        onClick={() => onSelectProduct && onSelectProduct(item.product)}
                        className="w-20 h-24 sm:w-28 sm:h-32 rounded-xl sm:rounded-2xl overflow-hidden bg-zinc-100 shrink-0 cursor-pointer border border-zinc-200/90 relative"
                      >
                        <img 
                          src={item.selectedColor?.image || item.product.primaryImage} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      </div>

                      {/* Product Details & Actions */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                        {/* Top: Category + Delete Button */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-blue-600 block truncate">
                              {item.product.categoryLabel || item.product.category || 'Maison'}
                            </span>
                            <h3 
                              onClick={() => onSelectProduct && onSelectProduct(item.product)}
                              className="text-xs sm:text-sm font-display font-bold text-zinc-950 truncate cursor-pointer hover:text-blue-900 transition-colors mt-0.5"
                              title={item.product.name}
                            >
                              {item.product.name}
                            </h3>
                          </div>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1 sm:p-1.5 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer rounded-lg hover:bg-rose-50 shrink-0"
                            title="Remove item"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>

                        {/* Middle: Color / Size if genuinely applicable */}
                        {(hasColor || shouldShowSize) && (
                          <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-zinc-500 font-medium py-1">
                            {hasColor && (
                              <span>{language === 'fr' ? 'Couleur :' : 'Color:'} <strong className="text-zinc-800">{item.selectedColor.name}</strong></span>
                            )}
                            {hasColor && shouldShowSize && <span>•</span>}
                            {shouldShowSize && (
                              <span>{language === 'fr' ? 'Taille :' : 'Size:'} <strong className="text-zinc-800 uppercase">{typeof item.selectedSize === 'object' ? item.selectedSize?.name : item.selectedSize}</strong></span>
                            )}
                          </div>
                        )}

                        {/* Bottom Row: Quantity Stepper (left) & Price (right) */}
                        <div className="flex items-center justify-between gap-2 pt-1.5 mt-auto">
                          {/* Quantity Controls Pill */}
                          <div className="flex items-center border border-zinc-200 rounded-lg sm:rounded-xl overflow-hidden bg-zinc-50/80 shadow-2xs">
                            <button
                              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors cursor-pointer text-xs font-bold"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="w-8 sm:w-10 text-center text-xs font-mono font-bold text-zinc-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors cursor-pointer text-xs font-bold"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          {/* Line Total Price */}
                          <span className="text-xs sm:text-sm font-mono font-bold text-zinc-950 text-right whitespace-nowrap">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Summary Card & Checkout */}
            <div className="space-y-6">
              
              {/* Order Summary Card */}
              <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-xs space-y-6">
                <h3 className="text-base font-display font-bold text-slate-950 pb-3 border-b border-zinc-100">
                  {language === 'fr' ? 'Résumé de la commande' : 'Order Summary'}
                </h3>

                <div className="space-y-3 text-xs text-slate-600 font-medium">
                  <div className="flex justify-between">
                    <span>{language === 'fr' ? 'Sous-total' : 'Subtotal'}</span>
                    <span className="font-mono text-slate-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'fr' ? 'Livraison' : 'Fulfillment & Shipping'}</span>
                    <span className="font-mono text-slate-900">
                      {shippingCost === 0 ? (
                        <span className="text-emerald-700 font-bold uppercase text-[10px]">
                          {language === 'fr' ? 'OFFERTE' : 'FREE'}
                        </span>
                      ) : (
                        formatPrice(shippingCost)
                      )}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-900">{language === 'fr' ? 'Total estimé' : 'Estimated Total'}</span>
                    <span className="text-lg font-mono font-extrabold text-blue-600">{formatPrice(estimatedTotal)}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={onProceedToCheckout}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{language === 'fr' ? 'Passer à la caisse' : 'Secure Checkout'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* WhatsApp Order & Inquiry Button */}
                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>{language === 'fr' ? 'Commander via WhatsApp' : 'Order via WhatsApp'}</span>
                  </button>
                </div>
              </div>

              {/* Secure Checkout Trust Section */}
              <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-zinc-200/60 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-zinc-950">
                    {language === 'fr' ? 'Paiement 100% Sécurisé' : '100% Encrypted Checkout'}
                  </h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    {language === 'fr'
                      ? 'Transactions protégées par cryptage SSL et normes bancaires.'
                      : 'SSL protection ensuring your secure banking details remain private.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* More to Discover Section (Always visible on Cart page) */}
        {recommendations.length > 0 && (
          <div className="space-y-8 pt-16 border-t border-zinc-200/80">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block">
                    {language === 'fr' ? 'RECOMMANDATIONS' : 'RECOMMENDED ADDITIONS'}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-medium text-slate-950">
                  {language === 'fr' ? 'Complétez votre commande' : 'Complete Your Setup & Order'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                  {language === 'fr'
                    ? 'Découvrez des périphériques, accessoires et équipements complémentaires à ajouter à votre panier.'
                    : 'Explore compatible peripherals, upgrades, and complementary hardware to pair with your order.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {recommendations.slice(0, 4).map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  isWishlisted={wishlistIds.includes(prod.id)}
                  onToggleWishlist={onToggleWishlist || (() => {})}
                  onSelect={onSelectProduct || (() => {})}
                  onQuickAdd={handleQuickAddRecommendation}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
