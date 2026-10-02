import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowRight,
  Clock,
  Flame,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Sparkles,
} from 'lucide-react';
import { Product, ProductVariant } from '../types/store';
import { HotDealCard } from './HotDealCard';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';

interface HotDealsSectionProps {
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, variant: ProductVariant) => void;
  onViewAllDeals: () => void;
}

export const HotDealsSection: React.FC<HotDealsSectionProps> = ({
  products,
  wishlistIds,
  onToggleWishlist,
  onSelectProduct,
  onQuickAdd,
  onViewAllDeals,
}) => {
  const { t, language } = useLanguageCurrency();
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 36,
    seconds: 42,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5); // 2 on mobile, 3 on sm, 4 on md/small desktop, 5 on lg/desktop

  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);

  // Filter deal products
  const dealProducts = products.filter(
    (p) => p.isHotDeal || (p.originalPrice && p.originalPrice > p.price)
  );

  if (dealProducts.length === 0) return null;

  // Responsive items count detector
  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width < 640) {
        // Mobile: 2 products in 1 line
        setVisibleCount(2);
      } else if (width < 768) {
        // Small screen: 3 products in 1 line
        setVisibleCount(3);
      } else if (width < 1100) {
        // Small screen / Tablet: 4 products instead of 5
        setVisibleCount(4);
      } else {
        // Desktop: 5 products in 1 line
        setVisibleCount(5);
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  // Max sliding index
  const maxIndex = Math.max(0, dealProducts.length - visibleCount);

  // Synchronized countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto sliding interval (every 3.5s)
  useEffect(() => {
    if (!isAutoPlaying || isHovered || maxIndex <= 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3500);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovered, maxIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current !== null) {
      touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    }
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > 40) {
      if (touchDeltaX.current < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  if (dealProducts.length === 0) return null;

  return (
    <section
      className="bg-gradient-to-b from-blue-50/60 via-slate-50 to-white border-y border-blue-200/80 py-7 sm:py-10 relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1500px] mx-auto px-3.5 sm:px-6 lg:px-8 relative z-10">
        {/* Header with Title, Live Timer and Carousel Nav Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-blue-200/70">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>GLADYNS {t('flashSaleBanner')}</span>
              </span>
              <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-md border border-blue-200">
                <Clock className="w-3 h-3 text-blue-700 animate-pulse" />
                <span>
                  {language === 'fr' ? 'Fin dans ' : 'Ends in '}
                  {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-slate-950 tracking-tight">
              {t('hotDeals')}
            </h2>
          </div>

          {/* Right Action Bar: Auto-play toggle, carousel arrows, View All button */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5">
            {/* Auto slide pause/play toggle */}
            <button
              onClick={() => setIsAutoPlaying((prev) => !prev)}
              aria-label={isAutoPlaying ? 'Pause automatic sliding' : 'Start automatic sliding'}
              title={isAutoPlaying ? 'Pause auto-slide' : 'Resume auto-slide'}
              className="p-2 rounded-xl bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                aria-label="Previous deal items"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white hover:bg-blue-600 text-slate-800 hover:text-white border border-slate-200 hover:border-blue-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs group"
              >
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next deal items"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white hover:bg-blue-600 text-slate-800 hover:text-white border border-slate-200 hover:border-blue-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs group"
              >
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* View All Deals Button */}
            <button
              onClick={onViewAllDeals}
              className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-sm hover:shadow-md"
            >
              <span>{t('viewAll')}</span>
            </button>
          </div>
        </div>

        {/* 1 HORIZONTAL AUTO-SLIDING ROW OF PRODUCTS */}
        {/* On mobile: shows exactly 2 products in 1 horizontal line. On tablet: 3. On desktop: 4. */}
        <div
          className="relative pt-4 sm:pt-6 overflow-hidden select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Sliding Track Container */}
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{
              // Shift by percentage equal to currentIndex * item width
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
            }}
          >
            {dealProducts.map((product) => (
              <div
                key={product.id}
                className="shrink-0 px-1.5 sm:px-2.5"
                style={{
                  // Mobile: 50% width (exactly 2 in a single line); Tablet: 33.333%; Desktop: 25%
                  width: `${100 / visibleCount}%`,
                }}
              >
                <HotDealCard
                  product={product}
                  isWishlisted={wishlistIds.includes(product.id)}
                  onToggleWishlist={onToggleWishlist}
                  onSelect={onSelectProduct}
                  onQuickAdd={onQuickAdd}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Carousel Pagination Indicator Dots */}
        {maxIndex > 0 && (
          <div className="flex items-center justify-center gap-1.5 pt-4 sm:pt-5">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx
                    ? 'w-6 bg-blue-600'
                    : 'w-2 bg-blue-200 hover:bg-blue-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
