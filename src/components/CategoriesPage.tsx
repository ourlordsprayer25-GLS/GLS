import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Search,
} from 'lucide-react';
import { Product, ProductVariant } from '../types/store';
import { ProductCard } from './ProductCard';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';

interface CategoriesPageProps {
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, variant: ProductVariant) => void;
  onBackToHome: () => void;
  onOpenBrand: () => void;
}

interface Slide {
  id: string;
  image: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  products,
  wishlistIds,
  onToggleWishlist,
  onSelectProduct,
  onQuickAdd,
  onBackToHome,
  onOpenBrand,
}) => {
  const { language } = useLanguageCurrency();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPausedHover, setIsPausedHover] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);

  const CATEGORY_HERO_FALLBACK = '/assets/gladyns_store_preview.png';

  // Dynamic slides generated from real store products
  const heroSlides: Slide[] = useMemo(() => {
    // Helper to find a product image by category or fallback to store preview
    const findProductImg = (catKeywords: string[], defaultFallback = CATEGORY_HERO_FALLBACK) => {
      const match = products.find((p) => {
        const cat = (p.categoryLabel || p.category || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        return catKeywords.some((k) => cat.includes(k) || name.includes(k)) && p.primaryImage;
      });
      return match?.primaryImage || defaultFallback;
    };

    const audioImg = findProductImg(['audio', 'sound', 'bose', 'marshall', 'jbl']);
    const laptopImg = findProductImg(['laptop', 'computer', 'hp', 'elitebook']);
    const chargerImg = findProductImg(['charger', 'type-c', '120w', 'phone']);
    const watchBagImg = findProductImg(['watch', 'bag', 'baggy', 'smart-watch']);
    const hardwareImg = findProductImg(['ram', 'access', 'mouse', 'usb']);

    return [
      {
        id: 'cat-slide-audio',
        image: audioImg,
        badge: language === 'fr' ? 'Électronique & Audio' : 'Audio & Electronics',
        title: language === 'fr' ? 'Casques Bose, Marshall & Audio Hi-Fi' : 'Bose, Marshall & Hi-Fi Audio',
        subtitle: language === 'fr'
          ? 'Casques antibruit Bose Ultra, enceintes Marshall, audio JBL et accessoires haute fidélité certifiés.'
          : 'Bose Ultra noise-cancelling headphones, Marshall Bluetooth speakers, and verified acoustic gear.',
        ctaText: language === 'fr' ? 'Explorer l\'Audio' : 'View Audio Gear',
      },
      {
        id: 'cat-slide-laptops',
        image: laptopImg,
        badge: language === 'fr' ? 'Informatique & Ordinateurs' : 'Computing & Laptops',
        title: language === 'fr' ? 'PC Portables HP EliteBook & Bureautique' : 'HP EliteBook Laptops & Tech',
        subtitle: language === 'fr'
          ? 'Ordinateurs portables professionnels HP équipés de processeurs Intel Core i5 et stockage SSD rapide.'
          : 'Professional HP EliteBook business laptops with Intel Core i5 processors and blazing SSD storage.',
        ctaText: language === 'fr' ? 'Voir les Ordinateurs' : 'View Laptops',
      },
      {
        id: 'cat-slide-chargers',
        image: chargerImg,
        badge: language === 'fr' ? 'Charge Rapide & Alimentation' : 'Fast Chargers & Power Tech',
        title: language === 'fr' ? 'Chargeurs Type-C 120W & Câbles' : 'Type-C 120W Fast Chargers',
        subtitle: language === 'fr'
          ? 'Blocs de recharge ultra-rapide 120W et câbles renforcés haute intensité compatibles tous appareils.'
          : 'High-wattage 120W fast charging adapters and heavy-duty cables for all your smart devices.',
        ctaText: language === 'fr' ? 'Voir les Chargeurs' : 'View Chargers',
      },
      {
        id: 'cat-slide-wearables',
        image: watchBagImg,
        badge: language === 'fr' ? 'Montres Connectées & Sacs' : 'Smartwatches & Carry',
        title: language === 'fr' ? 'Montres S10 & Sacs Lifestyle GLADYNS' : 'S10 Smartwatches & Signature Bags',
        subtitle: language === 'fr'
          ? 'Montres intelligentes avec suivi d\'activité complet et sacs de transport exclusifs de la boutique.'
          : 'S10 feature-rich smartwatches and exclusive GLADYNS lifestyle bags built for mobility.',
        ctaText: language === 'fr' ? 'Voir la Collection' : 'View Lifestyle',
      },
      {
        id: 'cat-slide-hardware',
        image: hardwareImg,
        badge: language === 'fr' ? 'Hardware & Périphériques' : 'Hardware & Peripherals',
        title: language === 'fr' ? 'Mémoires RAM DDR4 & Accessoires PC' : 'DDR4 RAM Modules & PC Accessories',
        subtitle: language === 'fr'
          ? 'Barrettes RAM 8Go / 16Go, boîtiers pour disques externes, souris sans fil et hubs USB.'
          : 'High-speed DDR4 8GB / 16GB RAM modules, external drive enclosures, and wireless mice.',
        ctaText: language === 'fr' ? 'Voir les Accessoires' : 'View Peripherals',
      },
    ];
  }, [products, language]);

  // Auto slideshow
  useEffect(() => {
    if (!isAutoPlaying || isPausedHover) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isPausedHover, heroSlides.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) handleNextSlide();
    else if (diff < -50) handlePrevSlide();
    touchStartX.current = null;
  };

  // Group products by Category in strict alphabetical order
  const alphabetizedCategories = useMemo(() => {
    const categoryMap = new Map<string, Product[]>();

    products.forEach((p) => {
      const catName = p.categoryLabel || p.category;
      if (!categoryMap.has(catName)) {
        categoryMap.set(catName, []);
      }
      categoryMap.get(catName)!.push(p);
    });

    const categoryList: {
      categoryName: string;
      letter: string;
      products: Product[];
    }[] = [];

    categoryMap.forEach((prods, catName) => {
      const sortedProds = [...prods].sort((a, b) => a.name.localeCompare(b.name));
      const firstLetter = catName.trim().charAt(0).toUpperCase();

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCat = catName.toLowerCase().includes(q);
        const matchedProds = sortedProds.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            (p.brand && p.brand.toLowerCase().includes(q))
        );

        if (matchesCat) {
          categoryList.push({
            categoryName: catName,
            letter: firstLetter,
            products: sortedProds,
          });
        } else if (matchedProds.length > 0) {
          categoryList.push({
            categoryName: catName,
            letter: firstLetter,
            products: matchedProds,
          });
        }
      } else {
        categoryList.push({
          categoryName: catName,
          letter: firstLetter,
          products: sortedProds,
        });
      }
    });

    // Sort categories alphabetically (e.g. Accessories, Activewear, Apparel, Bags, Coats, Essentials, Knitwear)
    categoryList.sort((a, b) => a.categoryName.localeCompare(b.categoryName));

    return categoryList;
  }, [products, searchQuery]);

  // Set of letters populated by categories
  const populatedLetters = useMemo(() => {
    return new Set(alphabetizedCategories.map((c) => c.letter));
  }, [alphabetizedCategories]);

  // Map each letter to the first category starting with it
  const letterToCategoryId = useMemo(() => {
    const map = new Map<string, string>();
    alphabetizedCategories.forEach((cat) => {
      if (!map.has(cat.letter)) {
        const anchorId = `category-${cat.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        map.set(cat.letter, anchorId);
      }
    });
    return map;
  }, [alphabetizedCategories]);

  const scrollToLetter = (letter: string) => {
    setActiveLetter(letter);
    const targetId = letterToCategoryId.get(letter);
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-zinc-950">
      {/* Top Breadcrumb Navigation */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 border-b border-zinc-200/70">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>{language === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}</span>
          </button>

          <nav className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
            <button onClick={onBackToHome} className="hover:text-zinc-900 transition-colors cursor-pointer">
              {language === 'fr' ? 'Accueil' : 'Home'}
            </button>
            <span>/</span>
            <span className="text-zinc-900 font-semibold">
              {language === 'fr' ? 'Toutes les catégories' : 'Shop by Category'}
            </span>
          </nav>
        </div>
      </div>

      {/* LUXURY EDITORIAL CAROUSEL BANNER */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-6">
        <div
          className="relative h-[320px] sm:h-[400px] md:h-[440px] rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-950 shadow-md group select-none"
          onMouseEnter={() => setIsPausedHover(true)}
          onMouseLeave={() => setIsPausedHover(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {heroSlides.map((slide, idx) => {
            const isActive = idx === currentSlide;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Luminous Ambient Luxury Base */}
                <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-blue-950 pointer-events-none" />

                <img
                  src={slide.image || CATEGORY_HERO_FALLBACK}
                  alt={slide.title}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== CATEGORY_HERO_FALLBACK) {
                      target.src = CATEGORY_HERO_FALLBACK;
                    }
                  }}
                  className={`w-full h-full object-cover object-center transition-transform duration-7000 ease-out brightness-[1.12] contrast-[1.05] saturate-[1.08] ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/35 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/65 via-transparent to-transparent hidden sm:block" />

                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:p-14 z-20 max-w-2xl">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/90 bg-white/15 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                      {slide.badge}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-300">
                      0{idx + 1} / 0{heroSlides.length}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-medium text-white tracking-tight leading-tight">
                    {slide.title}
                  </h1>

                  <p className="text-xs sm:text-sm text-zinc-200/90 mt-2 sm:mt-3 line-clamp-2 sm:line-clamp-none max-w-lg leading-relaxed font-light">
                    {slide.subtitle}
                  </p>

                  <div className="mt-4 sm:mt-6 flex items-center gap-3">
                    <button
                      onClick={() => {
                        const el = document.getElementById('categories-directory-list');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-4 sm:px-5 py-2 sm:py-2.5 bg-white text-zinc-950 rounded-xl text-xs font-semibold hover:bg-zinc-100 transition-colors shadow-sm cursor-pointer"
                    >
                      {slide.ctaText}
                    </button>
                    <button
                      onClick={onOpenBrand}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-xs text-white rounded-xl text-xs font-medium border border-white/20 transition-colors cursor-pointer"
                    >
                      {language === 'fr' ? 'Voir les marques' : 'View Brands'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Carousel Arrows */}
          <button
            onClick={handlePrevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-zinc-950/40 hover:bg-zinc-950/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 cursor-pointer shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextSlide}
            aria-label="Next Slide"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-zinc-950/40 hover:bg-zinc-950/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 cursor-pointer shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicators & Play/Pause */}
          <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-10 z-30 flex items-center gap-2 bg-zinc-950/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <button
              onClick={() => setIsAutoPlaying((prev) => !prev)}
              aria-label={isAutoPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
              className="text-white/80 hover:text-white transition-colors cursor-pointer mr-1"
            >
              {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
            </button>
            <div className="flex items-center gap-1.5">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* STICKY A-Z ALPHABET BAR & SEARCH */}
      <section id="categories-directory-list" className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-12">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200/80 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Direct A-Z Jump Bar */}
            <div className="overflow-x-auto pb-1 sm:pb-0">
              <div className="flex items-center gap-1 min-w-max">
                {ALPHABET.map((char) => {
                  const hasItems = populatedLetters.has(char);
                  const isSelected = activeLetter === char;
                  return (
                    <button
                      key={char}
                      disabled={!hasItems}
                      onClick={() => scrollToLetter(char)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-zinc-950 text-white shadow-xs'
                          : hasItems
                          ? 'bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-900 cursor-pointer shadow-2xs'
                          : 'bg-zinc-50 text-zinc-300 cursor-not-allowed'
                      }`}
                      title={hasItems ? `Jump to ${char}` : `No categories starting with ${char}`}
                    >
                      {char}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Filter Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'fr' ? 'Rechercher une catégorie ou un article...' : 'Filter categories or pieces...'}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-zinc-50 focus:bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-950 font-medium placeholder-zinc-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-900 cursor-pointer font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ALPHABETICAL CATEGORIES WITH NO VERBOSE EXPLANATION */}
        {alphabetizedCategories.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200">
            <p className="text-sm font-semibold text-zinc-900">
              {language === 'fr' ? `Aucune catégorie ne correspond à « ${searchQuery} »` : `No categories matching "${searchQuery}"`}
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-medium cursor-pointer"
            >
              {language === 'fr' ? 'Réinitialiser le filtre' : 'Reset Filter'}
            </button>
          </div>
        ) : (
          <div className="space-y-12 sm:space-y-16">
            {alphabetizedCategories.map((cat) => {
              const anchorId = `category-${cat.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
              return (
                <div
                  key={cat.categoryName}
                  id={anchorId}
                  className="scroll-mt-24 space-y-4"
                >
                  {/* Clean Category Header: No explanation, simply the category name */}
                  <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-950">
                    <h2 className="text-xl sm:text-2xl font-display font-medium text-zinc-950 tracking-tight">
                      {cat.categoryName}
                    </h2>
                    <span className="text-xs font-medium text-zinc-500">
                      {cat.products.length} {language === 'fr' ? (cat.products.length === 1 ? 'Article' : 'Articles') : (cat.products.length === 1 ? 'Piece' : 'Pieces')}
                    </span>
                  </div>

                  {/* Grid of products under this category */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 pt-1">
                    {cat.products.map((product) => (
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
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
