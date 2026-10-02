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

// Build slides from real products
const buildProductSlides = (
  products: Product[],
  onSelectProduct: (p: Product) => void,
  onExploreCollection: () => void,
  onOpenSection?: (s: any, cat?: string) => void
) => {
  // Pick up to 5 priority products: featured first, then new arrivals, then any
  const featured = products.filter(p => p.featured);
  const newArrivals = products.filter(p => p.isNewArrival && !p.featured);
  const rest = products.filter(p => !p.featured && !p.isNewArrival);
  const pool = [...featured, ...newArrivals, ...rest].slice(0, 5);

  return pool.map(product => ({
    id: product.id,
    image: product.primaryImage || (product.images?.[0]?.url) || '',
    badge: product.tag || product.categoryLabel || 'New Arrival',
    title: product.name,
    subtitle: product.subtitle || product.tagline || product.description?.slice(0, 120) || '',
    price: product.price,
    originalPrice: product.originalPrice,
    primaryCtaText: 'View Product',
    onPrimaryClick: () => onSelectProduct(product),
    secondaryCtaText: 'Shop All',
    onSecondaryClick: () => onOpenSection?.('categories') ?? onExploreCollection(),
  }));
};

// Fallback slides when no products exist yet
const buildFallbackSlides = (
  storeSettings: StoreSettings | undefined,
  onExploreCollection: () => void,
  onOpenSection?: (s: any, cat?: string) => void
) => {
  const heroImg = storeSettings?.heroContent?.image || '';

  return [{
    id: 'fallback-hero',
    image: heroImg,
    badge: 'Welcome',
    title: storeSettings?.storeName || 'GLADYNS Department Store',
    subtitle: storeSettings?.storeDescription || 'Curated electronics, music, home appliances & fashion.',
    price: null,
    originalPrice: null,
    primaryCtaText: 'Browse Catalog',
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
  const { formatPrice } = useLanguageCurrency();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPausedHover, setIsPausedHover] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const slides = products.length > 0
    ? buildProductSlides(products, onSelectProduct || onShopFeatured, onExploreCollection, onOpenSection)
    : buildFallbackSlides(storeSettings, onExploreCollection, onOpenSection);

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
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center"
            />
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/50 to-zinc-950/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-950/40 to-transparent" />
          </div>
        ))}

        {/* Content Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-10 lg:p-14 w-full pointer-events-none">
          <div className="max-w-2xl pointer-events-auto space-y-3 sm:space-y-4">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-zinc-100 tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{current.badge}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-medium text-white tracking-tight leading-[1.15]">
              {current.title}
            </h1>

            {/* Price if product */}
            {current.price !== null && current.price !== undefined && (
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-white">
                  {formatPrice(current.price)}
                </span>
                {current.originalPrice && current.originalPrice > current.price && (
                  <span className="text-base text-zinc-400 line-through">
                    {formatPrice(current.originalPrice)}
                  </span>
                )}
              </div>
            )}

            {/* Subtitle */}
            {current.subtitle && (
              <p className="text-sm sm:text-base text-zinc-200 max-w-xl font-light leading-relaxed line-clamp-2 sm:line-clamp-3">
                {current.subtitle}
              </p>
            )}

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={current.onPrimaryClick}
                className="group inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-slate-950 bg-white hover:bg-blue-50 rounded-full transition-all cursor-pointer shadow-lg hover:shadow-xl hover:text-blue-600"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{current.primaryCtaText}</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              {current.secondaryCtaText && current.onSecondaryClick && (
                <button
                  onClick={current.onSecondaryClick}
                  className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:text-white bg-blue-600/80 hover:bg-blue-600 backdrop-blur-md border border-blue-400/40 rounded-full transition-colors cursor-pointer shadow-md"
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
              <button onClick={goToPrev} aria-label="Previous slide" className="pointer-events-auto p-2 sm:p-2.5 rounded-full bg-zinc-950/40 hover:bg-zinc-950/80 text-white backdrop-blur-md border border-white/15 transition-all cursor-pointer hover:scale-105">
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-3 sm:right-6 flex items-center z-30 pointer-events-none">
              <button onClick={goToNext} aria-label="Next slide" className="pointer-events-auto p-2 sm:p-2.5 rounded-full bg-zinc-950/40 hover:bg-zinc-950/80 text-white backdrop-blur-md border border-white/15 transition-all cursor-pointer hover:scale-105">
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
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
              className="p-1.5 rounded-full bg-zinc-950/50 hover:bg-zinc-950/80 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          )}

          {slides.length > 1 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-zinc-950/50 backdrop-blur-md border border-white/10">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`transition-all rounded-full cursor-pointer ${
                    idx === currentSlide ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}

          {slides.length > 1 && (
            <div className="hidden sm:flex items-center px-2 py-1 rounded-full bg-zinc-950/50 backdrop-blur-md border border-white/10 text-[11px] font-mono text-white/80 tabular-nums">
              0{currentSlide + 1} / 0{slides.length}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
