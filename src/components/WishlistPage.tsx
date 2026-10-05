import React from 'react';
import { Trash2, Heart, ShoppingBag, ArrowLeft, Star, Sparkles } from 'lucide-react';
import { Product, ProductVariant, ProductSize } from '../types/store';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';
import { INITIAL_PRODUCTS } from '../data/products';
import { ProductCard } from './ProductCard';

interface WishlistPageProps {
  wishlistProducts: Product[];
  products: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onClearWishlist: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, variant: ProductVariant, size: ProductSize, quantity: number) => void;
  onMoveAllToBag: () => void;
  onBackToShop: () => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  wishlistProducts,
  products,
  onRemoveFromWishlist,
  onClearWishlist,
  onSelectProduct,
  onAddToCart,
  onMoveAllToBag,
  onBackToShop,
}) => {
  const { formatPrice, language } = useLanguageCurrency();

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const defaultColor = (product.colors && product.colors.length > 0) ? product.colors[0] : { id: 'default', name: 'Standard', colorHex: '#000000', inStock: true };
    const defaultSize = (product.sizes && product.sizes.length > 0) ? product.sizes.find((s) => s.inStock) || product.sizes[0] : { name: 'One Size', inStock: true };
    onAddToCart(product, defaultColor, defaultSize, 1);
  };

  const handleRemoveItem = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    onRemoveFromWishlist(productId);
  };

  // Get generic curated recommendations for empty state
  const wishlistProductIds = new Set(wishlistProducts.map((p) => p.id));
  const recommendations = products.filter((p) => !wishlistProductIds.has(p.id)).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-10 lg:py-16 animate-in fade-in duration-300">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-zinc-100 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToShop}
              className="p-2 hover:bg-zinc-100 rounded-full transition-colors group cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-600 transition-transform group-hover:-translate-x-0.5" />
            </button>
            <div>
              <h1 className="text-3xl font-display font-medium text-zinc-950 tracking-tight flex items-center gap-2">
                <span>{language === 'fr' ? 'Mes Favoris' : 'Saved Favorites'}</span>
                <span className="text-sm font-mono text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-full border border-zinc-200/50">
                  {wishlistProducts.length}
                </span>
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                {language === 'fr' ? 'Votre sélection personnelle d\'articles sauvegardés.' : 'Your personal device archive of saved pieces and acquisitions.'}
              </p>
            </div>
          </div>

          {wishlistProducts.length > 0 && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={onClearWishlist}
                className="px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:text-rose-600 hover:bg-rose-50 border border-zinc-200 hover:border-rose-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{language === 'fr' ? 'Tout effacer' : 'Clear all'}</span>
              </button>
              <button
                onClick={onMoveAllToBag}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{language === 'fr' ? 'Tout ajouter au panier' : 'Move All to Bag'}</span>
              </button>
            </div>
          )}
        </div>

        {wishlistProducts.length === 0 ? (
          /* Empty State */
          <div className="space-y-12">
            <div className="max-w-md mx-auto text-center space-y-4 py-12 bg-zinc-50/50 rounded-3xl border border-zinc-200 p-8">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-200 shadow-2xs mx-auto">
                <Heart className="w-7 h-7 fill-rose-500" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-zinc-900">
                  {language === 'fr' ? 'Votre liste est vide' : 'Your favorites is empty'}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {language === 'fr'
                    ? 'Appuyez sur le cœur d\'un article pour le conserver dans votre archive.'
                    : 'Tap the heart icon on any piece to save your favorite garments and accessories for later review.'}
                </p>
              </div>
              <button
                onClick={onBackToShop}
                className="px-5 py-2.5 bg-zinc-950 text-white text-xs font-semibold rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs inline-block"
              >
                {language === 'fr' ? 'Découvrir la collection' : 'Explore Collections'}
              </button>
            </div>
          </div>
        ) : (
          /* Active Grid */
          <div className="space-y-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {wishlistProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => onSelectProduct(prod)}
                  className="group relative bg-white border border-zinc-200/80 rounded-[1.75rem] p-4 flex flex-col justify-between hover:border-blue-600 hover:shadow-xl hover:shadow-zinc-100/80 transition-all duration-300 cursor-pointer"
                >
                  {/* Delete/Heart Overlay Button */}
                  <button
                    onClick={(e) => handleRemoveItem(e, prod.id)}
                    className="absolute top-6 right-6 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md hover:bg-rose-50 text-rose-500 border border-zinc-100 hover:border-rose-200 flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    {/* Image */}
                    <div className="relative rounded-2xl overflow-hidden bg-zinc-100 aspect-square mb-4 border border-zinc-100/50">
                      <img
                        src={prod.primaryImage}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                        {prod.categoryLabel}
                      </span>
                      <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 group-hover:text-blue-600 truncate transition-colors">
                        {prod.name}
                      </h3>
                      <p className="text-[11px] text-zinc-500 font-medium truncate">
                        {prod.subtitle}
                      </p>
                      
                      {/* Rating if present */}
                      <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold py-0.5">
                        <Star className="w-3 h-3 fill-amber-500" />
                        <span>{prod.rating.toFixed(1)}</span>
                        <span className="text-zinc-400">({prod.reviewCount})</span>
                      </div>

                      <p className="text-xs sm:text-sm font-mono font-bold text-blue-600 pt-1">
                        {formatPrice(prod.price)}
                      </p>
                    </div>
                  </div>

                  {/* Add to Bag CTA */}
                  <button
                    onClick={(e) => handleQuickAdd(e, prod)}
                    className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{language === 'fr' ? 'Ajouter' : 'Add to Bag'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* More to Love Section (Common for both states) */}
        <div className="space-y-12 pt-16 border-t border-zinc-100">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block">
                  {language === 'fr' ? 'POUR LES PATRONS LES PLUS EXIGEANTS' : 'ARCHIVAL DISCOVERIES'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-medium text-slate-950">
                {language === 'fr' ? 'Plus de modèles à aimer' : 'More to Love'}
              </h2>
              <p className="text-sm text-slate-500 max-w-xl">
                {language === 'fr' ? 'Détails impeccables et lignes contemporaines à explorer sans attendre.' : 'Explore curated alternatives featuring pristine cuts and high-fashion engineering from our global archive.'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {recommendations.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                isWishlisted={products.some(p => p.id === prod.id && wishlistProducts.some(wp => wp.id === p.id))}
                onToggleWishlist={onRemoveFromWishlist}
                onSelect={onSelectProduct}
                onQuickAdd={(p, v) => {
                  const defaultSize = p.sizes.find(s => s.inStock) || p.sizes[0];
                  onAddToCart(p, v, defaultSize, 1);
                }}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
