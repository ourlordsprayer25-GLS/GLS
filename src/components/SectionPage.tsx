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
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';


export type SectionType = 'hot-deals' | 'new-arrivals' | 'bestsellers' | 'categories' | 'collection';

interface Slide {
  id: string;
  image: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  filterAction?: () => void;
  product?: Product;
}

const LUXURY_FALLBACKS: Record<SectionType, string[]> = {
  'new-arrivals': [
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1600&auto=format&fit=crop',
  ],
  'hot-deals': [
    'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1600&auto=format&fit=crop',
  ],
  'bestsellers': [
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1600&auto=format&fit=crop',
  ],
  'categories': [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1600&auto=format&fit=crop',
  ],
  'collection': [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1600&auto=format&fit=crop',
  ],
};

const hasValidImage = (p: Product) => {
  const img = p.primaryImage || p.images?.[0]?.url;
  return typeof img === 'string' && img.trim().length > 15 && !img.includes('/src/assets/images/');
};

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
  const { language } = useLanguageCurrency();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [isPausedHover, setIsPausedHover] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Filter products matching this section
  const sectionBaseProducts = useMemo(() => {
    if (sectionType === 'hot-deals') {
      return allProducts.filter(
        (p) => p.isHotDeal || (p.originalPrice && p.originalPrice > p.price)
      );
    }
    if (sectionType === 'new-arrivals') {
      const getTimestamp = (p: Product): number => {
        if ((p as any).created_at) {
          const parsed = Date.parse((p as any).created_at);
          if (!isNaN(parsed)) return parsed;
        }
        const match = p.id.match(/\d{10,}/);
        return match ? parseInt(match[0], 10) : 0;
      };

      const tagged = allProducts.filter(
        (p) => p.isNewArrival || p.tag === 'New Season Drop' || p.tag === 'New Arrival'
      );
      const list = tagged.length > 0 ? tagged : allProducts;
      return [...list].sort((a, b) => getTimestamp(b) - getTimestamp(a));
    }
    if (sectionType === 'bestsellers') {
      return allProducts.filter(
        (p) => p.tag === 'Bestseller' || p.rating >= 4.8 || p.reviewCount > 10
      );
    }
    return allProducts;
  }, [allProducts, sectionType]);

  // Configuration for each section's title, breadcrumbs, and slides
  const sectionConfig = useMemo(() => {
    switch (sectionType) {
      case 'hot-deals':
        return {
          title: language === 'fr' ? 'Offres Exclusives' : 'Hot Deals',
          breadcrumb: language === 'fr' ? 'Offres Exclusives' : 'Hot Deals',
          description: language === 'fr'
            ? 'Tarifs archives et réductions saisonnières sur nos pièces intemporelles.'
            : 'Archive pricing & seasonal reductions on permanent wardrobe objects.',
          slides: [
            {
              id: 'deal-slide-1',
              image: LUXURY_FALLBACKS['hot-deals'][0],
              badge: language === 'fr' ? 'Réductions Archives' : 'Archive Reductions',
              title: language === 'fr' ? 'Sélection Archives Saisonnières' : 'Seasonal Archive Vault',
              subtitle: language === 'fr'
                ? 'Tarifs micro-séries limités sur manteaux structurés, sergé selvedge et mailles nobles.'
                : 'Limited micro-batch pricing on tailored overcoats, raw selvedge twill, and knitwear.',
              ctaText: language === 'fr' ? 'Explorer la Sélection' : 'Shop Vault',
            },
            {
              id: 'deal-slide-2',
              image: LUXURY_FALLBACKS['hot-deals'][1],
              badge: language === 'fr' ? 'Laine Double Face Italienne' : 'Italian Double-Faced Wool',
              title: language === 'fr' ? 'Manteaux & Trenchs Architecturaux' : 'Architectural Trench & Overcoats',
              subtitle: language === 'fr'
                ? 'Coutures fendues non doublées confectionnées avec les filatures historiques de Biella, Italie.'
                : 'Precision unlined split seams crafted with heritage wool mills in Biella, Italy.',
              ctaText: language === 'fr' ? 'Voir les Manteaux' : 'Explore Outerwear Deals',
            },
            {
              id: 'deal-slide-3',
              image: LUXURY_FALLBACKS['hot-deals'][2],
              badge: language === 'fr' ? 'Cuir Toscan de Voyage' : 'Tuscan Leather Carry',
              title: language === 'fr' ? 'Sacs Week-End Brunis à la Main' : 'Hand-Burnished Cabin Weekenders',
              subtitle: language === 'fr'
                ? 'Cuir pleine fleur au tannage végétal certifié, conçu pour se patiner avec le temps.'
                : 'Full-grain certified vegetable-tanned leather designed to patinate with age.',
              ctaText: language === 'fr' ? 'Voir la Maroquinerie' : 'View Leather Carry',
            },
          ] as Slide[],
        };

      case 'new-arrivals':
        return {
          title: language === 'fr' ? 'Nouveautés' : 'New Arrivals',
          breadcrumb: language === 'fr' ? 'Nouveautés' : 'New Arrivals',
          description: language === 'fr'
            ? 'Dernières sorties capsules, nouvelles matières et nouveautés saisonnières.'
            : 'Latest capsule drops, new fabrications, and seasonal additions.',
          slides: [
            {
              id: 'new-slide-1',
              image: LUXURY_FALLBACKS['new-arrivals'][0],
              badge: language === 'fr' ? 'Collection Automne / Hiver' : 'Autumn / Winter Release',
              title: language === 'fr' ? 'Nouveautés de Saison' : 'New Season Additions',
              subtitle: language === 'fr'
                ? 'Discipline architecturale : pantalons en laine vierge, manteaux en sergé lourd et cachemire.'
                : 'Architectural discipline in virgin wool trousers, heavy twill coats, and cashmere.',
              ctaText: language === 'fr' ? 'Découvrir la Sortie' : 'Explore New Drop',
            },
            {
              id: 'new-slide-2',
              image: LUXURY_FALLBACKS['new-arrivals'][1],
              badge: language === 'fr' ? 'Collection Vedette' : 'Featured Collection',
              title: language === 'fr' ? 'Bases Structurées du Quotidien' : 'Structured Everyday Foundations',
              subtitle: language === 'fr'
                ? 'Sergé selvedge japonais avec finitions gansées et boutons en corozo naturel.'
                : 'Japanese selvedge twill with clean-finished bound seams and corozo hardware.',
              ctaText: language === 'fr' ? 'Explorer les Essentiels' : 'Discover Foundations',
            },
            {
              id: 'new-slide-3',
              image: LUXURY_FALLBACKS['new-arrivals'][2],
              badge: language === 'fr' ? 'Maille Fine de Précision' : 'Fine Gauge Knitwear',
              title: language === 'fr' ? 'Mailles Côtelées en Mérinos' : 'Tasmanian Merino Ribbed Knits',
              subtitle: language === 'fr'
                ? 'Côtes anglaises jauge 7 conçues pour la thermorégulation et une silhouette impeccable.'
                : '7-gauge fisherman rib engineered for thermoregulation and enduring shape.',
              ctaText: language === 'fr' ? 'Voir la Maille' : 'Shop Knitwear',
            },
          ] as Slide[],
        };

      case 'bestsellers':
        return {
          title: language === 'fr' ? 'Meilleures Ventes' : 'Best Sellers',
          breadcrumb: language === 'fr' ? 'Meilleures Ventes' : 'Best Sellers',
          description: language === 'fr'
            ? 'Les pièces les plus prisées de notre catalogue, plébiscitées par la communauté GLADYNS.'
            : 'The most coveted objects from our archive, as curated by the GLADYNS community.',
          slides: [
            {
              id: 'best-slide-1',
              image: LUXURY_FALLBACKS['bestsellers'][0],
              badge: language === 'fr' ? 'Les Mieux Notés' : 'Highest Rated',
              title: language === 'fr' ? 'Favoris de la Communauté' : 'Community Favorites',
              subtitle: language === 'fr'
                ? 'La sélection définitive des créations emblématiques de la signature GLADYNS.'
                : 'The definitive selection of pieces that have defined the GLADYNS aesthetic.',
              ctaText: language === 'fr' ? 'Voir les Bestsellers' : 'Shop Bestsellers',
            },
            {
              id: 'best-slide-2',
              image: LUXURY_FALLBACKS['bestsellers'][1],
              badge: language === 'fr' ? 'Grand Classique' : 'Perennial Classic',
              title: language === 'fr' ? 'Le Trench en Laine Noble' : 'The Wool Trench Coat',
              subtitle: language === 'fr'
                ? 'Notre manteau le plus recherché, taillé pour une longévité absolue et une silhouette pure.'
                : 'Our most sought-after outerwear piece, crafted for longevity and silhouette.',
              ctaText: language === 'fr' ? 'Découvrir le Classique' : 'View Classic',
            },
            {
              id: 'best-slide-3',
              image: LUXURY_FALLBACKS['bestsellers'][2],
              badge: language === 'fr' ? 'Coup de Cœur Boutique' : 'Boutique Favorite',
              title: language === 'fr' ? 'Veste de Travail en Sergé Lourd' : 'Structured Twill Chore Jacket',
              subtitle: language === 'fr'
                ? 'Une pièce de base polyvalente et durable qui figure au sommet de nos commandes.'
                : 'A versatile foundation piece that continues to lead our seasonal requests.',
              ctaText: language === 'fr' ? 'Commander Maintenant' : 'Shop Now',
            },
          ] as Slide[],
        };

      case 'categories':
        return {
          title: language === 'fr' ? 'Acheter par Rayon' : 'Shop by Department',
          breadcrumb: language === 'fr' ? 'Rayons' : 'Departments',
          description: language === 'fr'
            ? 'Explorez nos univers : Instruments de Musique, Électronique & Audio, Électroménager et Mode.'
            : 'Explore our collections categorized by department: Musical Instruments, Electronics, Home Appliances, and Apparel.',
          slides: [
            {
              id: 'cat-slide-1',
              image: LUXURY_FALLBACKS['categories'][0],
              badge: language === 'fr' ? 'Vitrine Multi-Rayons' : 'Multi-Department Showcase',
              title: language === 'fr' ? 'Tous les Rayons du Magasin' : 'All Store Departments',
              subtitle: language === 'fr'
                ? 'Collections indépendantes : Instruments de musique, Hi-Fi & Studio, Maison connectée et Mode.'
                : 'Independent collections across Musical Instruments, Electronics & Audio, Home Appliances, and Apparel.',
              ctaText: language === 'fr' ? 'Parcourir les Rayons' : 'Browse All Departments',
            },
            {
              id: 'cat-slide-2',
              image: LUXURY_FALLBACKS['categories'][1],
              badge: language === 'fr' ? 'Instruments & Studio' : 'Musical Instruments & Studio',
              title: language === 'fr' ? 'Synthétiseurs & Platines Vinyles Hi-Fi' : 'Polyphonic Synthesizers & Vinyl Hi-Fi',
              subtitle: language === 'fr'
                ? 'Oscillateurs analogiques discrets, platines à entraînement direct et écoutes de studio ruban.'
                : 'Discrete analog oscillators, direct-drive turntables, and ribbon nearfield monitors.',
              ctaText: language === 'fr' ? 'Voir les Instruments' : 'View Musical Gear',
            },
            {
              id: 'cat-slide-3',
              image: LUXURY_FALLBACKS['categories'][2],
              badge: language === 'fr' ? 'Électroménager & Maison' : 'Home Appliances & Living',
              title: language === 'fr' ? 'Maison Connectée & Art de Vivre' : 'Smart Home Automation & Appliances',
              subtitle: language === 'fr'
                ? 'Aspirateurs robots avec guidage LiDAR et machines à espresso professionnelles double chaudière.'
                : 'LiDAR auto-empty robot vacuum stations and dual-boiler commercial-grade espresso machines.',
              ctaText: language === 'fr' ? 'Voir l’Électroménager' : 'View Appliances',
            },
            {
              id: 'cat-slide-4',
              image: LUXURY_FALLBACKS['categories'][3],
              badge: language === 'fr' ? 'Électronique & Son' : 'Electronics & Audio',
              title: language === 'fr' ? 'Casques Magnétiques & Son Studio' : 'Planar Magnetic & Studio Tech',
              subtitle: language === 'fr'
                ? 'Casques de monitoring, convertisseurs audio haute résolution et enceintes acoustiques.'
                : 'Studio headphones, high-resolution audio processing, and acoustic monitors.',
              ctaText: language === 'fr' ? 'Voir l’Électronique' : 'View Electronics',
            },
          ] as Slide[],
        };

      case 'collection':
      default:
        return {
          title: language === 'fr' ? 'Collection Sélective' : 'Curated Collection',
          breadcrumb: language === 'fr' ? 'Toutes les Pièces' : 'All Pieces',
          description: language === 'fr'
            ? 'L’inventaire complet de pièces d’exception, vestiaire architectural et maroquinerie.'
            : 'The complete seasonal inventory of architectural garments and travel carry.',
          slides: [
            {
              id: 'col-slide-1',
              image: LUXURY_FALLBACKS['collection'][0],
              badge: language === 'fr' ? 'Les Archives Complètes' : 'The Complete Archive',
              title: language === 'fr' ? 'Vestiaire Architectural Intemporel' : 'Enduring Wardrobe Architecture',
              subtitle: language === 'fr'
                ? 'Chaque création est confectionnée dans des matières pérennes, à l’épreuve du temps.'
                : 'Every object is designed with permanent materials, zero trends, and lifetime repairs.',
              ctaText: language === 'fr' ? 'Toute la Collection' : 'Browse Full Collection',
            },
            {
              id: 'col-slide-2',
              image: LUXURY_FALLBACKS['collection'][1],
              badge: language === 'fr' ? 'Réseau d’Ateliers' : 'Exclusive Network',
              title: language === 'fr' ? 'Savoir-Faire Artisanal Européen' : 'Artisanal Portuguese & Italian Craft',
              subtitle: language === 'fr'
                ? 'Chaînes d’approvisionnement transparentes et distribution directe sans intermédiaires.'
                : 'Transparent supply chains and carbon-neutral direct distribution.',
              ctaText: language === 'fr' ? 'Voir les Essentiels' : 'Shop Essentials',
            },
            {
              id: 'col-slide-3',
              image: LUXURY_FALLBACKS['collection'][2],
              badge: language === 'fr' ? 'Pièce Iconique' : 'Iconic Pieces',
              title: language === 'fr' ? 'Veste en Sergé Japonais' : 'Japanese Twill Chore Jacket',
              subtitle: language === 'fr'
                ? 'Sergé lourd selvedge 14,5 oz avec poches intérieures fonctionnelles cousues à la main.'
                : 'Custom-milled 14.5oz selvedge twill with functional internal pockets.',
              ctaText: language === 'fr' ? 'Découvrir la Pièce' : 'View Piece',
            },
          ] as Slide[],
        };
    }
  }, [sectionType, language]);

  // Dynamically assemble slides prioritizing real new products with valid images
  const slides = useMemo(() => {
    const validProducts = sectionBaseProducts.filter(hasValidImage);
    const fallbacks = LUXURY_FALLBACKS[sectionType] || LUXURY_FALLBACKS['collection'];

    const productSlides: Slide[] = validProducts.slice(0, 5).map((prod, idx) => ({
      id: `prod-slide-${prod.id}`,
      image: prod.primaryImage || prod.images?.[0]?.url || fallbacks[idx % fallbacks.length],
      badge: prod.tag || prod.categoryLabel || (sectionType === 'new-arrivals' ? (language === 'fr' ? 'Nouveauté' : 'New Arrival') : sectionType === 'hot-deals' ? (language === 'fr' ? 'Offre Spéciale' : 'Special Deal') : (language === 'fr' ? 'Pièce Vedette' : 'Featured Piece')),
      title: prod.name,
      subtitle: prod.subtitle || prod.tagline || (prod.description ? prod.description.slice(0, 120) : ''),
      ctaText: language === 'fr' ? 'Voir le Produit' : 'View Product',
      product: prod,
    }));

    if (productSlides.length >= 3) {
      return productSlides;
    }

    if (productSlides.length > 0) {
      return [...productSlides, ...sectionConfig.slides].slice(0, 4);
    }

    return sectionConfig.slides;
  }, [sectionBaseProducts, sectionConfig.slides, sectionType, language]);

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
            <span>{language === 'fr' ? "Retour à l'accueil" : 'Back to Home'}</span>
          </button>

          <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <button
              onClick={onBackToHome}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              {language === 'fr' ? 'Accueil' : 'Home'}
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
            const defaultFallback = LUXURY_FALLBACKS[sectionType]?.[idx % (LUXURY_FALLBACKS[sectionType]?.length || 1)] || LUXURY_FALLBACKS['collection'][0];
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Luminous Ambient Luxury Base */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950 pointer-events-none" />

                {/* Background Image with Zoom Effect */}
                <img
                  src={slide.image || defaultFallback}
                  alt={slide.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== defaultFallback) {
                      target.src = defaultFallback;
                    }
                  }}
                  className={`w-full h-full object-cover object-center transition-transform duration-7000 ease-out brightness-[1.14] contrast-[1.05] saturate-[1.08] ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                />

                {/* Dark Editorial Gradient Overlays (gentle scrim for maximum brightness) */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/65 via-transparent to-transparent hidden sm:block" />

                {/* Slide Text Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:p-14 z-20 max-w-2xl">
                  {/* Subtle Badge */}
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white bg-blue-600/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-blue-400/30 shadow-xs">
                      {slide.badge}
                    </span>
                    <span className="text-[11px] font-mono text-blue-200">
                      0{idx + 1} / 0{slides.length}
                    </span>
                  </div>

                  {/* Slide Title */}
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight sm:leading-none drop-shadow-sm">
                    {slide.title}
                  </h1>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-sm text-slate-200 mt-2 sm:mt-3 line-clamp-2 sm:line-clamp-none max-w-lg leading-relaxed drop-shadow-xs">
                    {slide.subtitle}
                  </p>

                  {/* Action CTA */}
                  <div className="mt-4 sm:mt-6 flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (slide.product) {
                          onSelectProduct(slide.product);
                          return;
                        }
                        const el = document.getElementById('section-grid');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                    >
                      {slide.ctaText || (language === 'fr' ? 'Découvrir' : 'Shop Pieces')}
                    </button>
                    <button
                      onClick={onBackToHome}
                      className="px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-xs text-white rounded-xl text-xs font-medium border border-white/25 transition-colors cursor-pointer"
                    >
                      {language === 'fr' ? "Retour à l'accueil" : 'Back to Home'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Previous / Next Slide Buttons */}
          <button
            onClick={handlePrevSlide}
            aria-label={language === 'fr' ? 'Diapositive précédente' : 'Previous Slide'}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-950/40 hover:bg-slate-950/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 cursor-pointer shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNextSlide}
            aria-label={language === 'fr' ? 'Diapositive suivante' : 'Next Slide'}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-950/40 hover:bg-slate-950/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 cursor-pointer shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Bottom Indicators & Play/Pause Controls */}
          <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-10 z-30 flex items-center gap-2 bg-slate-950/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {/* Play/Pause Toggle */}
            <button
              onClick={() => setIsAutoPlaying((prev) => !prev)}
              aria-label={isAutoPlaying ? (language === 'fr' ? 'Mettre en pause' : 'Pause Slideshow') : (language === 'fr' ? 'Lancer le diaporama' : 'Play Slideshow')}
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
                  <span>{language === 'fr' ? 'Vente Flash Active' : 'Flash Deals Active'}</span>
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {filteredProducts.length} {language === 'fr' ? (filteredProducts.length === 1 ? 'pièce sélectionnée' : 'pièces sélectionnées') : (filteredProducts.length === 1 ? 'piece curated' : 'pieces curated')}
              {sectionType === 'hot-deals' && (language === 'fr' ? ' · Jusqu’à 35% de réduction saisonnière' : ' · Up to 35% seasonal reduction')}
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
                <option value="featured">{language === 'fr' ? 'En vedette' : 'Featured'}</option>
                <option value="price-asc">{language === 'fr' ? 'Prix : Croissant' : 'Price: Low to High'}</option>
                <option value="price-desc">{language === 'fr' ? 'Prix : Décroissant' : 'Price: High to Low'}</option>
                <option value="rating">{language === 'fr' ? 'Mieux notés' : 'Highest Rated'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* PRODUCTS GRID */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-900">
              {language === 'fr' ? 'Aucune pièce trouvée dans cette catégorie' : 'No pieces found in this category'}
            </p>
            <p className="text-xs text-slate-500">
              {language === 'fr'
                ? `Essayez de choisir "Toutes les Collections" pour voir chaque article de ${sectionConfig.title}.`
                : `Try choosing "All Collections" to see every piece in ${sectionConfig.title}.`}
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {language === 'fr' ? 'Réinitialiser les filtres' : 'Reset Filters'}
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
