import React, { useState, useEffect } from 'react';
import { Star, Flame, Clock, Check, Heart, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Product, ProductVariant } from '../types/store';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';

interface HotDealCardProps {
  product: Product;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
  onSelect: (product: Product) => void;
  onQuickAdd: (product: Product, variant: ProductVariant) => void;
  isFeaturedSpotlight?: boolean;
}

export const HotDealCard: React.FC<HotDealCardProps> = ({
  product,
  isWishlisted = false,
  onToggleWishlist,
  onSelect,
  onQuickAdd,
  isFeaturedSpotlight = false,
}) => {
  const { t, formatPrice, language } = useLanguageCurrency();
  const [selectedColor, setSelectedColor] = useState<ProductVariant>(
    product.colors && product.colors.length > 0
      ? product.colors[0]
      : { id: 'default', name: 'Standard', colorHex: '#000000', inStock: true }
  );
  const [isAdded, setIsAdded] = useState(false);

  // Pseudo countdown timer per product for live atmosphere
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    // Generate slight offset based on product id
    const seed = product.id.charCodeAt(product.id.length - 1) % 12;
    setTimeLeft({
      hours: 10 + (seed % 8),
      minutes: 15 + (seed * 3) % 45,
      seconds: 30 + (seed * 2) % 30,
    });

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 18, minutes: 30, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [product.id]);

  const isOutOfStock =
    (product.stockLevel !== undefined && product.stockLevel === 0) ||
    Boolean(product.sizes && product.sizes.length > 0 && !product.sizes.some((s) => s.inStock));
  const originalPrice = product.originalPrice || Math.round(product.price * 1.18);
  const savings = originalPrice - product.price;
  const discountPercent = Math.round((savings / originalPrice) * 100);

  // Claim percentage calculation
  const claimPercent = 75 + (product.id.charCodeAt(product.id.length - 1) % 20);

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

  if (isFeaturedSpotlight) {
    return (
      <article
        onClick={() => onSelect(product)}
        className="group relative bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/50 rounded-3xl p-5 sm:p-8 text-white border border-blue-500/30 shadow-2xl hover:border-blue-400/60 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col lg:flex-row gap-6 lg:gap-8 items-center"
      >
        {/* Glow ambient circle */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Image side */}
        <div className="relative w-full lg:w-1/2 aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shrink-0">
          <img
            src={selectedColor.image || product.primaryImage}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Flash Savings Badge */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <span className="bg-blue-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>-{discountPercent}% · {language === 'fr' ? 'Offre Flash' : 'Flash Deal'}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleHeartClick}
            aria-label={isWishlisted ? 'Remove from favorites' : 'Add to favorites'}
            className="absolute top-3 right-3 p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white backdrop-blur-md transition-all border border-white/20"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Content Side */}
        <div className="flex flex-col justify-between w-full lg:w-1/2 space-y-4">
          <div>
            {/* Live countdown pill */}
            <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/30 text-blue-300 px-3 py-1 rounded-full text-xs font-mono font-medium mb-3">
              <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>
                {language === 'fr' ? 'Fin dans ' : 'Deal expires in '}
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-blue-300 font-semibold tracking-wider uppercase mb-1">
              <span>{product.brand || 'GLADYNS Studio'}</span>
              <span>{product.categoryLabel}</span>
            </div>

            <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-white group-hover:text-blue-200 transition-colors leading-tight">
              {product.name}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 mt-2 leading-relaxed">
              {product.tagline || product.subtitle}
            </p>
          </div>

          {/* Allocation progress bar */}
          <div className="space-y-1.5 bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">{language === 'fr' ? 'Quota attribué' : 'Batch Allocation'}</span>
              <span className="text-blue-300 font-semibold font-mono">{claimPercent}% {t('claimed')}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000"
                style={{ width: `${claimPercent}%` }}
              />
            </div>
          </div>

          {/* Color swatches & Price */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            {product.colors && product.colors.length > 1 ? (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <span className="text-[11px] text-slate-400">Finish:</span>
                {product.colors.map((c) => (
                  <button
                    key={c.id || c.name}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`w-4 h-4 rounded-full border transition-all ${
                      selectedColor?.id === c.id
                        ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900 scale-110'
                        : 'border-white/30 opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.colorHex }}
                    title={c.name}
                  />
                ))}
              </div>
            ) : <div />}

            <div className="text-right">
              <span className="text-xs text-slate-400 line-through mr-2 font-mono">{formatPrice(originalPrice)}</span>
              <span className="text-xl sm:text-2xl font-extrabold text-blue-400 font-mono">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>

          {/* CTA Action Bar */}
          <div className="pt-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className={`w-full py-3 px-5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                isOutOfStock
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : isAdded
                  ? 'bg-emerald-600 text-white shadow-emerald-900/50'
                  : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/25 active:scale-[0.98]'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{language === 'fr' ? 'Offre réservée & ajoutée au panier' : 'Deal Claimed & Added to Bag'}</span>
                </>
              ) : isOutOfStock ? (
                <span>{t('soldOut')}</span>
              ) : (
                <>
                  <Flame className="w-4 h-4 fill-white text-white" />
                  <span>
                    {language === 'fr'
                      ? `Profiter de l'offre · Économie ${formatPrice(savings)}`
                      : `Claim Flash Deal — Save ${formatPrice(savings)}`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </article>
    );
  }

  // Standard Hot Deal Grid Card
  return (
    <article
      onClick={() => onSelect(product)}
      className="group relative flex flex-col bg-white rounded-2xl border-2 border-blue-200/90 hover:border-blue-600 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-blue-950/10 hover:-translate-y-1.5"
    >
      {/* Top Flash Deal Banner Ribbon */}
      <div className="bg-slate-900 text-white px-3 py-1.5 flex items-center justify-between text-[10px] font-mono border-b border-blue-900">
        <span className="flex items-center gap-1 font-bold text-blue-300 uppercase tracking-wider">
          <Flame className="w-3 h-3 fill-blue-400 text-blue-400 animate-pulse" />
          <span>{t('hotDeals')}</span>
        </span>
        <span className="text-slate-300 flex items-center gap-1 font-medium">
          <Clock className="w-3 h-3 text-blue-400" />
          <span>
            {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </span>
      </div>

      {/* Image Container */}
      <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden">
        <img
          src={selectedColor.image || product.primaryImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-600 ease-out"
        />

        {/* Savings Pill */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
            <span>-{discountPercent}%</span>
          </span>
          <span className="bg-slate-950 text-blue-300 text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs w-fit">
            {language === 'fr' ? `Éco ${formatPrice(savings)}` : `Save ${formatPrice(savings)}`}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleHeartClick}
          aria-label={isWishlisted ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md transition-all shadow-xs ${
            isWishlisted
              ? 'bg-white text-rose-600 ring-2 ring-rose-300 scale-105'
              : 'bg-white/85 hover:bg-white text-slate-700 hover:text-rose-600'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Low inventory allocation strip over image */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-2 pt-4">
          <div className="flex items-center justify-between text-[9px] text-slate-200 font-mono font-medium mb-1">
            <span>{language === 'fr' ? 'Réservé' : 'Batch Reserve'}</span>
            <span className="text-blue-300 font-bold">{claimPercent}%</span>
          </div>
          <div className="h-1 w-full bg-slate-700/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-300 rounded-full"
              style={{ width: `${claimPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Details & Action */}
      <div className="p-2.5 sm:p-3.5 flex flex-col flex-1 justify-between gap-2 bg-white">
        <div>
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-500 mb-0.5 sm:mb-1">
            <span className="font-semibold text-slate-800 uppercase tracking-wider truncate max-w-[80px] sm:max-w-[120px]">
              {product.brand || 'GLADYNS'}
            </span>
            <span className="text-blue-600 font-semibold truncate max-w-[70px] sm:max-w-none">{product.categoryLabel}</span>
          </div>

          <h3 className="text-xs sm:text-sm font-semibold text-slate-950 group-hover:text-blue-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1 mt-0.5 hidden xs:block sm:block">
            {product.subtitle}
          </p>
        </div>

        {/* Swatches & Price */}
        <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {product.colors && product.colors.length > 1 && product.colors.slice(0, 3).map((c) => (
              <button
                key={c.id || c.name}
                type="button"
                onClick={() => setSelectedColor(c)}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border transition-all ${
                  selectedColor?.id === c.id
                    ? 'ring-2 ring-blue-600 ring-offset-1 scale-110'
                    : 'border-slate-300 hover:scale-105'
                }`}
                style={{ backgroundColor: c.colorHex }}
                title={c.name}
              />
            ))}
          </div>

          <div className="text-right">
            <span className="text-[9px] sm:text-xs text-slate-400 line-through mr-1 font-mono">
              {formatPrice(originalPrice)}
            </span>
            <span className="text-xs sm:text-sm font-bold text-blue-700 font-mono">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>

        {/* Claim Deal Button */}
        <div className="pt-0.5 sm:pt-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`w-full flex items-center justify-center gap-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.98] ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : isAdded
                ? 'bg-emerald-600 text-white shadow-emerald-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-blue-200'
            }`}
          >
            {isOutOfStock ? (
              <span>{t('soldOut')}</span>
            ) : isAdded ? (
              <>
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
                <span>{t('addedToCart')}</span>
              </>
            ) : (
              <>
                <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current text-white" />
                <span className="truncate">
                  {language === 'fr' ? `Profiter · -${formatPrice(savings)}` : `Claim · Save ${formatPrice(savings)}`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
