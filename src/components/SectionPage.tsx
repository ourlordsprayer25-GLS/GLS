import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowLeft,
  Flame,
  Sparkles,
  Layers,
  ShoppingBag,
  Check,
  Pause,
  Play,
  Clock,
} from 'lucide-react';
import { Product, ProductVariant } from '../types/store';
import { ProductCard } from './ProductCard';
import { HotDealCard } from './HotDealCard';


export type SectionType = 'hot-deals' | 'new-arrivals' | 'bestsellers' | 'categories' | 'collection';

interface Slide {
  id: string;
  image: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  filterAction?: () => void;
}

interface SectionPageProps {
  sectionType: SectionType;
  initialCategory?: string;
  allProducts: Product[];
  categories: any[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, variant: ProductVariant) => void;
  onBackToHome: () => void;
}

export const SectionPage: React.FC<SectionPageProps> = ({
  sectionType,
  initialCategory = 'all',
  allProducts,
  categories,
  wishlistIds,
  onToggleWishlist,
  onSelectProduct,
  onQuickAdd,
  onBackToHome,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [isPausedHover, setIsPausedHover] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Configuration for each section's title, breadcrumbs, and slides
  const sectionConfig = useMemo(() => {
    switch (sectionType) {
      case 'hot-deals':
        return {
          title: 'Hot Deals',
          breadcrumb: 'Hot Deals',
          description: 'Archive pricing & seasonal reductions on permanent wardrobe objects.',
          slides: [
            {
              id: 'deal-slide-1',
              image: '',
              badge: 'Archive Reductions',
              title: 'Seasonal Archive Vault',
              subtitle: 'Limited micro-batch pricing on tailored overcoats, raw selvedge twill, and knitwear.',
              ctaText: 'Shop Vault',
            },
            {
              id: 'deal-slide-2',
              image: '',
              badge: 'Italian Double-Faced Wool',
              title: 'Architectural Trench & Overcoats',
              subtitle: 'Precision unlined split seams crafted with heritage wool mills in Biella, Italy.',
              ctaText: 'Explore Outerwear Deals',
            },
            {
              id: 'deal-slide-3',
              image: '',
              badge: 'Tuscan Leather Carry',
              title: 'Hand-Burnished Cabin Weekenders',
              subtitle: 'Full-grain certified vegetable-tanned leather designed to patinate with age.',
              ctaText: 'View Leather Carry',
            },
          ] as Slide[],
        };

      case 'new-arrivals':
        return {
          title: 'New Arrivals',
          breadcrumb: 'New Arrivals',
          description: 'Latest capsule drops, new fabrications, and seasonal additions.',
          slides: [
            {
              id: 'new-slide-1',
              image: '',
              badge: 'Autumn / Winter Release',
              title: 'New Season Additions',
              subtitle: 'Architectural discipline in virgin wool trousers, heavy twill coats, and cashmere.',
              ctaText: 'Explore New Drop',
            },
            {
              id: 'new-slide-2',
              image: '',
              badge: 'Featured Collection',
              title: 'Structured Everyday Foundations',
              subtitle: 'Japanese selvedge twill with clean-finished bound seams and corozo hardware.',
              ctaText: 'Discover Foundations',
            },
            {
              id: 'new-slide-3',
              image: '',
              badge: 'Fine Gauge Knitwear',
              title: 'Tasmanian Merino Ribbed Knits',
              subtitle: '7-gauge fisherman rib engineered for thermoregulation and enduring shape.',
              ctaText: 'Shop Knitwear',
            },
          ] as Slide[],
        };

      case 'bestsellers':
        return {
          title: 'Best Sellers',
          breadcrumb: 'Best Sellers',
          description: 'The most coveted objects from our archive, as curated by the GLADYNS community.',
          slides: [
            {
              id: 'best-slide-1',
              image: '',
              badge: 'Highest Rated',
              title: 'Community Favorites',
              subtitle: 'The definitive selection of pieces that have defined the GLADYNS aesthetic.',
              ctaText: 'Shop Bestsellers',
            },
            {
              id: 'best-slide-2',
              image: '',
              badge: 'Perennial Classic',
              title: 'The Wool Trench Coat',
              subtitle: 'Our most sought-after outerwear piece, crafted for longevity and silhouette.',
              ctaText: 'View Classic',
            },
            {
              id: 'best-slide-3',
              image: '',
              badge: 'Boutique Favorite',
              title: 'Structured Twill Chore Jacket',
              subtitle: 'A versatile foundation piece that continues to lead our seasonal requests.',
              ctaText: 'Shop Now',
            },
          ] as Slide[],
        };

      case 'categories':
        return {
          title: 'Shop by Department',
          breadcrumb: 'Departments',
          description: 'Explore our collections categorized by department: Musical Instruments, Electronics, Home Appliances, and Apparel.',
          slides: [
            {
              id: 'cat-slide-1',
              image: '',
              badge: 'Multi-Department Showcase',
              title: 'All Store Departments',
              subtitle: 'Independent collections across Musical Instruments, Electronics & Audio, Home Appliances, and Apparel.',
              ctaText: 'Browse All Departments',
            },
            {
              id: 'cat-slide-2',
              image: '',
              badge: 'Musical Instruments & Studio',
              title: 'Polyphonic Synthesizers & Vinyl Hi-Fi',
              subtitle: 'Discrete analog oscillators, direct-drive turntables, and ribbon nearfield monitors.',
              ctaText: 'View Musical Gear',
            },
            {
              id: 'cat-slide-3',
              image: '',
              badge: 'Home Appliances & Living',
              title: 'Smart Home Automation & Appliances',
              subtitle: 'LiDAR auto-empty robot vacuum stations and dual-boiler commercial-grade espresso machines.',
              ctaText: 'View Appliances',
            },
            {
              id: 'cat-slide-4',
              image: '',
              badge: 'Electronics & Audio',
              title: 'Planar Magnetic & Studio Tech',
              subtitle: 'Studio headphones, high-resolution audio processing, and acoustic monitors.',
              ctaText: 'View Electronics',
            },
          ] as Slide[],
        };

      case 'collection':
      default:
        return {
          title: 'Curated Collection',
          breadcrumb: 'All Pieces',
          description: 'The complete seasonal inventory of architectural garments and travel carry.',
          slides: [
            {
              id: 'col-slide-1',
              image: '',
              badge: 'The Complete Archive',
              title: 'Enduring Wardrobe Architecture',
              subtitle: 'Every object is designed with permanent materials, zero trends, and lifetime repairs.',
              ctaText: 'Browse Full Collection',
            },
            {
              id: 'col-slide-2',
              image: '',
              badge: 'Exclusive Network',
              title: 'Artisanal Portuguese & Italian Craft',
              subtitle: 'Transparent supply chains and carbon-neutral direct distribution.',
              ctaText: 'Shop Essentials',
            },
            {
              id: 'col-slide-3',
              image: '',
              badge: 'Iconic Pieces',
              title: 'Japanese Twill Chore Jacket',
              subtitle: 'Custom-milled 14.5oz selvedge twill with functional internal pockets.',
              ctaText: 'View Piece',
            },
          ] as Slide[],
        };
    }
  }, [sectionType]);

  const slides = sectionConfig.slides;

  // Auto-slide effect
  useEffect(() => {
    if (!isAutoPlaying || isPausedHover || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isPausedHover, slides.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Touch Swipe for mobile carousel
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (diff > 50) {
      handleNextSlide();
    } else if (diff < -50) {
      handlePrevSlide();
    }
    touchStartX.current = null;
  };

  // Filter products matching this section
  const sectionBaseProducts = useMemo(() => {
    if (sectionType === 'hot-deals') {
      return allProducts.filter(
        (p) => p.isHotDeal || (p.originalPrice && p.originalPrice > p.price)
      );
    }
    if (sectionType === 'new-arrivals') {
      return allProducts.filter(
        (p) => p.isNewArrival || p.tag === 'New Season Drop' || p.tag === 'New Arrival'
      );
    }
    if (sectionType === 'bestsellers') {
      return allProducts.filter(
        (p) => p.tag === 'Bestseller' || p.rating >= 4.8 || p.reviewCount > 10
      );
    }
    return allProducts;
  }, [allProducts, sectionType]);

  // Apply Category & Sort filters
  const filteredProducts = useMemo(() => {
    let result = [...sectionBaseProducts];

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return result;
  }, [sectionBaseProducts, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Top Breadcrumbs & Back Navigation */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </button>

          <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <button
              onClick={onBackToHome}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-slate-900 font-semibold">{sectionConfig.breadcrumb}</span>
          </nav>
        </div>
      </div>

      {/* LUXURY HERO BANNER WITH SLIDING IMAGES */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div
          className="relative h-[340px] sm:h-[420px] md:h-[480px] lg:h-[520px] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 shadow-md group select-none"
          onMouseEnter={() => setIsPausedHover(true)}
          onMouseLeave={() => setIsPausedHover(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slides Carousel */}
          {slides.map((slide, idx) => {
            const isActive = idx === currentSlide;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Background Image with Zoom Effect */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover object-center transition-transform duration-7000 ease-out ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                />

                {/* Dark Editorial Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/15" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-transparent hidden sm:block" />

                {/* Slide Text Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:p-14 z-20 max-w-2xl">
                  {/* Subtle Badge */}
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white bg-blue-600/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-blue-400/30">
                      {slide.badge}
                    </span>
                    <span className="text-[11px] font-mono text-blue-200">
                      0{idx + 1} / 0{slides.length}
                    </span>
                  </div>

                  {/* Slide Title */}
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight sm:leading-none">
                    {slide.title}
                  </h1>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-sm text-slate-200 mt-2 sm:mt-3 line-clamp-2 sm:line-clamp-none max-w-lg leading-relaxed">
                    {slide.subtitle}
                  </p>

                  {/* Action CTA */}
                  <div className="mt-4 sm:mt-6 flex items-center gap-3">
                    <button
                      onClick={() => {
                        const el = document.getElementById('section-grid');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                    >
                      {slide.ctaText || 'Shop Pieces'}
                    </button>
                    <button
                      onClick={onBackToHome}
                      className="px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-xs text-white rounded-xl text-xs font-medium border border-white/25 transition-colors cursor-pointer"
                    >
                      Explore All
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Previous / Next Slide Buttons */}
          <button
            onClick={handlePrevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-950/40 hover:bg-slate-950/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 cursor-pointer shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNextSlide}
            aria-label="Next Slide"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-950/40 hover:bg-slate-950/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 cursor-pointer shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Bottom Indicators & Play/Pause Controls */}
          <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-10 z-30 flex items-center gap-2 bg-slate-950/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {/* Play/Pause Toggle */}
            <button
              onClick={() => setIsAutoPlaying((prev) => !prev)}
              aria-label={isAutoPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
              className="text-white/80 hover:text-white transition-colors cursor-pointer mr-1"
            >
              {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
            </button>

            {/* Slide Indicator Bars */}
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === currentSlide ? 'w-6 bg-blue-400' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & SORT CONTROLS BAR */}
      <div id="section-grid" className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-950 tracking-tight">
                {sectionConfig.title}
              </h2>
              {sectionType === 'hot-deals' && (
                <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                  <Flame className="w-3 h-3 fill-current" />
                  <span>Flash Deals Active</span>
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'} curated
              {sectionType === 'hot-deals' && ' · Up to 35% seasonal reduction'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter Tabs */}
            <div className="flex items-center p-1 bg-slate-200/70 rounded-xl overflow-x-auto max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-700 shadow-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-none font-medium cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* PRODUCTS GRID */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-900">No pieces found in this category</p>
            <p className="text-xs text-slate-500">Try choosing "All Collections" to see every piece in {sectionConfig.title}.</p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : sectionType === 'hot-deals' ? (
          /* BESPOKE HOT DEALS GRID: Distinctive Blue Flash Style with Live Timers & Meters */
          <div className="space-y-6 pt-6">
            {/* Spotlight Card for the Top Deal if browsing all */}
            {selectedCategory === 'all' && filteredProducts.length > 0 && (
              <HotDealCard
                product={filteredProducts[0]}
                isWishlisted={wishlistIds.includes(filteredProducts[0].id)}
                onToggleWishlist={onToggleWishlist}
                onSelect={onSelectProduct}
                onQuickAdd={onQuickAdd}
                isFeaturedSpotlight={true}
              />
            )}

            {/* Hot Deals Grid Cards with Blue Borders & Countdowns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {(selectedCategory === 'all' && filteredProducts.length > 1
                ? filteredProducts.slice(1)
                : filteredProducts
              ).map((product) => (
                <HotDealCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlistIds.includes(product.id)}
                  onToggleWishlist={onToggleWishlist}
                  onSelect={onSelectProduct}
                  onQuickAdd={onQuickAdd}
                />
              ))}
            </div>
          </div>
        ) : (
          /* STANDARD CLEAN EDITORIAL GRID */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 pt-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
                onSelect={onSelectProduct}
                onQuickAdd={onQuickAdd}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
