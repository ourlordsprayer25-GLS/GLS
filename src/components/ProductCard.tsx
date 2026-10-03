import React, { useState } from 'react';
import { Star, ShoppingBag, Check, Heart } from 'lucide-react';
import { Product, ProductVariant } from '../types/store';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
  onSelect: (product: Product) => void;
  onQuickAdd: (product: Product, variant: ProductVariant) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted = false,
  onToggleWishlist,
  onSelect,
  onQuickAdd,
}) => {
  const { formatPrice, t, language } = useLanguageCurrency();
  const [selectedColor, setSelectedColor] = useState<ProductVariant>(product.colors[0]);
  const [isAdded, setIsAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isOutOfStock = !product.sizes.some((s) => s.inStock);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    onQuickAdd(product, selectedColor);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product.id);
    }
  };

  const discountSavings = product.originalPrice ? product.originalPrice - product.price : 0;
  const imageSrc = !imageError && (selectedColor?.image || product.primaryImage);

  return (
    <article
      onClick={() => onSelect(product)}
      className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 relative"
    >
      {/* Product Image Area */}
      <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt=""
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 text-slate-400 p-4 text-center select-none">
            <ShoppingBag className="w-8 h-8 mb-2 opacity-35 stroke-[1.5]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate max-w-[85%]">{product.name}</span>
          </div>
        )}

        {/* Top Badges Area */}
        <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-3 sm:left-3 sm:right-3 flex items-start justify-between pointer-events-none z-10">
          {/* Subtle Tag & Discount Badges */}
          <div className="flex flex-col gap-1.5 pointer-events-auto">
            {product.tag && (
              <span className="bg-white/95 backdrop-blur-xs text-slate-900 text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide border border-slate-200 shadow-2xs max-w-[110px] truncate">
                {product.tag}
              </span>
            )}
            {discountSavings > 0 && (
              <span className="bg-blue-600 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs w-fit">
                {language === 'fr' ? `Économie ${formatPrice(discountSavings)}` : `Save ${formatPrice(discountSavings)}`}
              </span>
            )}
          </div>

          {/* Wishlist Heart Button */}
          <button
            type="button"
            onClick={handleHeartClick}
            aria-label={isWishlisted ? `Remove ${product.name} from favorites` : `Save ${product.name} to favorites`}
            title={isWishlisted ? 'Saved in favorites' : 'Add to favorites'}
            className={`p-1.5 sm:p-2 rounded-full backdrop-blur-md shadow-xs transition-all pointer-events-auto cursor-pointer ${
              isWishlisted
                ? 'bg-white text-rose-600 ring-2 ring-rose-200 scale-105'
                : 'bg-white/85 hover:bg-white text-slate-600 hover:text-rose-600 hover:scale-105'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${
                isWishlisted ? 'fill-rose-500 text-rose-500 scale-110' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Metadata and Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Brand & Category Header */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 mb-1">
            <span className="font-semibold text-slate-800 uppercase tracking-wider truncate max-w-[130px]">
              {product.brand || 'GLADYNS'}
            </span>
            <span className="text-slate-400 truncate">{product.categoryLabel}</span>
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-[14px] font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
            {product.name}
          </h3>

          {/* Subtitle */}
          <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 mt-0.5">
            {product.subtitle}
          </p>
        </div>

        {/* Swatches & Price Row */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          {/* Color Swatches */}
          <div className="flex items-center gap-1 sm:gap-1.5" onClick={(e) => e.stopPropagation()}>
            {product.colors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => setSelectedColor(color)}
                title={color.name}
                aria-label={color.name}
                className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full border transition-all cursor-pointer ${
                  selectedColor.id === color.id
                    ? 'ring-2 ring-blue-600 ring-offset-1 scale-110'
                    : 'border-slate-300 hover:scale-105'
                }`}
                style={{ backgroundColor: color.colorHex }}
              />
            ))}
          </div>

          {/* Price & Rating */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <div className="hidden xs:flex sm:flex items-center gap-0.5 text-[10px] sm:text-xs text-slate-600">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-mono tabular-nums">{product.rating.toFixed(1)}</span>
            </div>

            <div className="text-right">
              {product.originalPrice && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through mr-1 font-mono tabular-nums">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              <span className="text-xs sm:text-sm font-bold text-slate-950 font-mono tabular-nums">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>
        </div>

        {/* Downside "Add to Cart" Action Button */}
        <div className="pt-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer shadow-xs select-none active:scale-[0.98] ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : isAdded
                ? 'bg-emerald-600 text-white shadow-emerald-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            {isOutOfStock ? (
              <span>{t('soldOut')}</span>
            ) : isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t('addedToCart')}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" />
                <span>{t('addToCart')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
