import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight, Sparkles, Flame, ShoppingBag, Pause, Play, Tag } from 'lucide-react';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';
import { Product, StoreSettings } from '../types/store';

interface HeroSectionProps {
  onShopFeatured: () => void;
  onExploreCollection: () => void;
  onOpenSection?: (section: 'hot-deals' | 'new-arrivals' | 'bestsellers' | 'categories' | 'collection', category?: string) => void;
  onSelectProduct?: (product: Product) => void;
  storeSettings?: StoreSettings;
  products?: Product[];
}

// Luxury fallback image so banner is never empty
const LUXURY_HERO_FALLBACK = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop';

// Build slides from real products
const buildProductSlides = (
  products: Product[],
  onSelectProduct: (p: Product) => void,
  onExploreCollection: () => void,
  onOpenSection?: (s: any, cat?: string) => void,
  language: string = 'en'
) => {
  const isFr = language === 'fr';
  // Check if a product has a real, working image (filters out non-existent /src/assets paths)
  const hasValidImage = (p: Product) => {
    const img = p.primaryImage || p.images?.[0]?.url;
    return typeof img === 'string' && img.trim().length > 15 && !img.includes('/src/assets/images/');
  };

  const validProducts = products.filter(hasValidImage);
  const candidates = validProducts.length > 0 ? validProducts : products;

  // Sort newest added piece first
  const sorted = [...candidates].sort((a, b) => {
    const getTime = (p: Product) => {
      const match = p.id.match(/\d{10,}/);
      return match ? parseInt(match[0], 10) : 0;
    };
    return getTime(b) - getTime(a);
  });

  const pool = sorted.slice(0, 5);

  return pool.map(product => {
    const rawImg = product.primaryImage || (product.images?.[0]?.url) || '';
    const image = (rawImg && !rawImg.includes('/src/assets/images/')) ? rawImg : LUXURY_HERO_FALLBACK;

    let badge = product.tag || product.categoryLabel || (isFr ? 'Nouveauté' : 'New Arrival');
    if (isFr) {
      if (badge.toLowerCase() === 'new arrival' || badge.toLowerCase() === 'new') badge = 'Nouveauté';
      else if (badge.toLowerCase() === 'hot deal') badge = 'Offre Chaude';
      else if (badge.toLowerCase() === 'best seller') badge = 'Meilleure Vente';
    }

    return {
      id: product.id,
      image,
      badge,
      title: product.name,
      subtitle: product.subtitle || product.tagline || product.description?.slice(0, 120) || '',
      price: product.price,
      originalPrice: product.originalPrice,
      primaryCtaText: isFr ? 'Voir le produit' : 'View Product',
      onPrimaryClick: () => onSelectProduct(product),
      secondaryCtaText: isFr ? 'Tout voir' : 'Shop All',
      onSecondaryClick: () => onOpenSection?.('categories') ?? onExploreCollection(),
    };
  });
};

// Fallback slides when no products exist yet
const buildFallbackSlides = (
  storeSettings: StoreSettings | undefined,
  onExploreCollection: () => void,
  onOpenSection?: (s: any, cat?: string) => void,
  language: string = 'en'
) => {
  const isFr = language === 'fr';
  const heroImg = storeSettings?.heroContent?.image || LUXURY_HERO_FALLBACK;

  return [{
    id: 'fallback-hero',
    image: heroImg,
    badge: isFr ? 'Bienvenue' : 'Welcome',
    title: storeSettings?.storeName || (isFr ? 'Grand Magasin GLADYNS' : 'GLADYNS Department Store'),
    subtitle: storeSettings?.storeDescription || (isFr ? 'Électronique, équipement audio, électroménager et standards d\'excellence.' : 'Curated electronics, music, smart home appliances & living standards.'),
    price: null,
    originalPrice: null,
    primaryCtaText: isFr ? 'Découvrir le catalogue' : 'Browse Catalog',
    onPrimaryClick: () => onExploreCollection(),
    secondaryCtaText: undefined,
    onSecondaryClick: undefined,
  }];
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  onShopFeatured,
  onExploreCollection,
  onOpenSection,
  onSelectProduct,
  storeSettings,
  products = [],
}) => {
  const { formatPrice, language } = useLanguageCurrency();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPausedHover, setIsPausedHover] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const slides = products.length > 0
    ? buildProductSlides(products, onSelectProduct || onShopFeatured, onExploreCollection, onOpenSection, language)
    : buildFallbackSlides(storeSettings, onExploreCollection, onOpenSection, language);

  // Reset to first slide when products change
  useEffect(() => {
    setCurrentSlide(0);
  }, [products.length]);

  // Auto-advance every 5.5 seconds
  useEffect(() => {
    if (!isAutoPlaying || isPausedHover || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isPausedHover, slides.length]);

  const goToPrev = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  const goToNext = () => setCurrentSlide(prev => (prev + 1) % slides.length);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? goToNext() : goToPrev();
    touchStartX.current = null;
  };

  const current = slides[Math.min(currentSlide, slides.length - 1)];

  if (!current) return null;

  return (
    <section
      className="relative bg-zinc-950 overflow-hidden text-white select-none"
      onMouseEnter={() => setIsPausedHover(true)}
      onMouseLeave={() => setIsPausedHover(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Store Hero Banner"
    >
      {/* Sliding Images */}
      <div className="relative h-[380px] sm:h-[460px] md:h-[520px] lg:h-[560px] w-full overflow-hidden">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              idx === currentSlide
                ? 'opacity-100 scale-100 z-10'
                : 'opacity-0 scale-105 pointer-events-none z-0'
            }`}
          >
            {/* Luminous Ambient Luxury Base */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950 pointer-events-none" />

            <img
              src={slide.image || LUXURY_HERO_FALLBACK}
              alt={slide.title}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== LUXURY_HERO_FALLBACK) {
                  target.src = LUXURY_HERO_FALLBACK;
                }
              }}
              className="w-full h-full object-cover object-center md:object-right transition-transform duration-700 ease-out brightness-[1.14] contrast-[1.05] saturate-[1.08]"
            />
            {/* Ultra-soft feathering: Keeps product 100% luminous, vivid & bright */}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/65 via-zinc-950/20 to-transparent w-full md:w-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-zinc-950/50 to-transparent pointer-events-none" />
          </div>
        ))}

        {/* Content Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-4 sm:p-8 lg:p-12 w-full pointer-events-none">
          <div className="max-w-xl pointer-events-auto space-y-3 sm:space-y-4 p-5 sm:p-7 rounded-3xl bg-zinc-950/45 backdrop-blur-md border border-white/10 shadow-2xl shadow-black/40">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 backdrop-blur-md border border-amber-400/40 text-xs font-bold text-amber-300 shadow-lg tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{current.badge}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-white tracking-tight leading-[1.1] drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]">
              {current.title}
            </h1>

            {/* Price if product */}
            {current.price !== null && current.price !== undefined && (
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-4xl font-extrabold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  {formatPrice(current.price)}
                </span>
                {current.originalPrice && current.originalPrice > current.price && (
                  <span className="text-base sm:text-lg text-zinc-300 line-through font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                    {formatPrice(current.originalPrice)}
                  </span>
                )}
              </div>
            )}

            {/* Subtitle */}
            {current.subtitle && (
              <p className="text-sm sm:text-base text-zinc-100 max-w-xl font-normal leading-relaxed line-clamp-2 sm:line-clamp-3 drop-shadow-[0_1px_6px_rgba(0,0,0,0.95)]">
                {current.subtitle}
              </p>
            )}

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={current.onPrimaryClick}
                className="group inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 text-xs sm:text-sm font-bold text-zinc-950 bg-white hover:bg-zinc-100 rounded-full transition-all cursor-pointer shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShoppingBag className="w-4 h-4 text-zinc-950" />
                <span>{current.primaryCtaText}</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              {current.secondaryCtaText && current.onSecondaryClick && (
                <button
                  onClick={current.onSecondaryClick}
                  className="inline-flex items-center justify-center px-5 sm:px-6 py-3 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-full transition-all cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] border border-blue-400/40"
                >
                  {current.secondaryCtaText}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Nav Arrows */}
        {slides.length > 1 && (
          <>
            <div className="absolute inset-y-0 left-3 sm:left-6 flex items-center z-30 pointer-events-none">
              <button onClick={goToPrev} aria-label="Previous slide" className="pointer-events-auto p-2.5 sm:p-3 rounded-full bg-zinc-950/80 hover:bg-zinc-900 text-white backdrop-blur-md border border-white/20 shadow-xl transition-all cursor-pointer hover:scale-110 active:scale-95">
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-3 sm:right-6 flex items-center z-30 pointer-events-none">
              <button onClick={goToNext} aria-label="Next slide" className="pointer-events-auto p-2.5 sm:p-3 rounded-full bg-zinc-950/80 hover:bg-zinc-900 text-white backdrop-blur-md border border-white/20 shadow-xl transition-all cursor-pointer hover:scale-110 active:scale-95">
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>
          </>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-5 right-5 sm:right-10 z-30 flex items-center gap-2 pointer-events-auto">
          {slides.length > 1 && (
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              aria-label={isAutoPlaying ? 'Pause' : 'Play'}
              className="p-1.5 rounded-full bg-zinc-950/80 hover:bg-zinc-900 text-white backdrop-blur-md border border-white/20 shadow-md transition-colors cursor-pointer"
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          )}

          {slides.length > 1 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950/80 backdrop-blur-md border border-white/20 shadow-md">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`transition-all rounded-full cursor-pointer ${
                    idx === currentSlide ? 'w-6 h-1.5 bg-white shadow-sm' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}

          {slides.length > 1 && (
            <div className="hidden sm:flex items-center px-2.5 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md border border-white/20 text-[11px] font-mono text-white/90 tabular-nums shadow-md">
              0{currentSlide + 1} / 0{slides.length}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
