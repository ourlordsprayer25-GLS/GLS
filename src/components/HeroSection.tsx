import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight, Sparkles, Flame, Layers, Pause, Play, Music, Radio, Cpu, Home } from 'lucide-react';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';
import { StoreSettings } from '../types/store';

// Image assets
import heroBannerImg from '../assets/images/general_department_hero_banner_1790694250421.jpg';
import synthImg from '../assets/images/musical_analog_synthesizer_1790694264160.jpg';
import turntableImg from '../assets/images/musical_vinyl_turntable_1790694276533.jpg';
import robotVacuumImg from '../assets/images/smart_robot_vacuum_station_1790694287531.jpg';
import studioMonitorsImg from '../assets/images/studio_monitor_speakers_1790694302203.jpg';
import smartEspressoImg from '../assets/images/smart_espresso_machine_1790153803517.jpg';
import choreCoatImg from '../assets/images/product_chore_coat_1790116559808.jpg';
import audiophileHeadphonesImg from '../assets/images/audiophile_headphones_1790153788692.jpg';

interface HeroSectionProps {
  onShopFeatured: () => void;
  onExploreCollection: () => void;
  onOpenSection?: (section: 'hot-deals' | 'new-arrivals' | 'bestsellers' | 'categories' | 'collection', category?: string) => void;
  storeSettings?: StoreSettings;
}

interface HeroSlide {
  id: string;
  image: string;
  badge: string;
  badgeIcon?: 'sparkles' | 'flame' | 'layers' | 'music' | 'cpu';
  title: string;
  subtitle: string;
  primaryCtaText: string;
  onPrimaryClick: () => void;
  secondaryCtaText?: string;
  onSecondaryClick?: () => void;
}


// Only use the saved hero image if it's a real hosted URL (not a local src/ path)
const getHeroImage = (saved?: string, fallback?: string): string => {
  if (saved && (saved.startsWith('http://') || saved.startsWith('https://'))) {
    return saved;
  }
  return fallback || '';
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  onShopFeatured,
  onExploreCollection,
  onOpenSection,
  storeSettings,
}) => {
  const { language } = useLanguageCurrency();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPausedHover, setIsPausedHover] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const slides: HeroSlide[] = language === 'fr' ? [
    {
      id: 'slide-multi-department',
      image: getHeroImage(storeSettings?.heroContent?.image, heroBannerImg),
      badge: 'Boutique Multi-Rayons · Électronique, Musique, Maison & Mode',
      badgeIcon: 'sparkles',
      title: storeSettings?.storeName ? `${storeSettings.storeName} — Grands Magasins & Curation` : 'Électronique, Musique, Électroménager & Mode',
      subtitle: 'Découvrez notre sélection de pointe : synthétiseurs analogiques, platines vinyles, son haute fidélité, électroménager intelligent et pièces de créateurs.',
      primaryCtaText: 'Explorer tous les rayons',
      onPrimaryClick: () => onOpenSection?.('categories') ?? onExploreCollection(),
      secondaryCtaText: 'Voir les nouveautés',
      onSecondaryClick: () => onOpenSection?.('new-arrivals') ?? onExploreCollection(),
    },
    {
      id: 'slide-musical-instruments',
      image: synthImg,
      badge: 'Instruments de Musique & Studio · Son Pur',
      badgeIcon: 'music',
      title: 'Synthétiseurs Analogiques & Platines Vinyles Hi-Fi',
      subtitle: 'Synthétiseurs polyphoniques 8 voix en noyer massif, platines audiophiles à entraînement direct et enceintes de monitoring à ruban.',
      primaryCtaText: 'Découvrir les instruments',
      onPrimaryClick: () => onOpenSection?.('categories', 'musical') ?? onExploreCollection(),
      secondaryCtaText: 'Voir la collection audio',
      onSecondaryClick: onExploreCollection,
    },
    {
      id: 'slide-home-appliances',
      image: robotVacuumImg,
      badge: 'Électroménager Intelligent & Confort Moderne',
      badgeIcon: 'layers',
      title: 'Maison Connectée & Électroménager Premium',
      subtitle: 'Aspirateurs robots laveurs LiDAR avec station d\'auto-nettoyage, machines à expresso italiennes double chaudière et purificateurs d\'air HEPA.',
      primaryCtaText: 'Explorer l\'électroménager',
      onPrimaryClick: () => onOpenSection?.('categories', 'appliances') ?? onExploreCollection(),
      secondaryCtaText: 'Voir les offres',
      onSecondaryClick: () => onOpenSection?.('hot-deals') ?? onExploreCollection(),
    },
    {
      id: 'slide-electronics-audio',
      image: audiophileHeadphonesImg,
      badge: 'Électronique & Son Haute Définition',
      badgeIcon: 'cpu',
      title: 'Casques Acoustiques & Technologies de Précision',
      subtitle: 'Transducteurs magnétiques planaires 100mm, convertisseurs DAC haute résolution et équipements acoustiques professionnels.',
      primaryCtaText: 'Voir l\'électronique',
      onPrimaryClick: () => onOpenSection?.('categories', 'electronics') ?? onExploreCollection(),
      secondaryCtaText: 'Catalogue complet',
      onSecondaryClick: onExploreCollection,
    },
    {
      id: 'slide-fashion-lifestyle',
      image: choreCoatImg,
      badge: 'Mode & Maroquinerie · Matériaux Nobles',
      badgeIcon: 'sparkles',
      title: 'Vêtements Intemporels & Maroquinerie Toscane',
      subtitle: 'Vestes de travail en denim selvedge japonais, manteaux en laine vierge et sacs de voyage en cuir pleine fleur tanné au végétal.',
      primaryCtaText: 'Découvrir la mode',
      onPrimaryClick: () => onOpenSection?.('categories', 'apparel') ?? onExploreCollection(),
      secondaryCtaText: 'Maroquinerie & Accessoires',
      onSecondaryClick: () => onOpenSection?.('categories', 'leather-goods') ?? onExploreCollection(),
    },
  ] : [
    {
      id: 'slide-multi-department',
      image: getHeroImage(storeSettings?.heroContent?.image, heroBannerImg),
      badge: 'Multi-Department Store · Electronics, Music, Home & Style',
      badgeIcon: 'sparkles',
      title: storeSettings?.storeName ? `${storeSettings.storeName} — Curated Storefront` : 'Electronics, Musical Gear, Home Appliances & Apparel',
      subtitle: 'A curated department house bringing together polyphonic synthesizers, audiophile sound, smart home appliances, and enduring fashion pieces.',
      primaryCtaText: 'Shop All Departments',
      onPrimaryClick: () => onOpenSection?.('categories') ?? onExploreCollection(),
      secondaryCtaText: 'Explore New Arrivals',
      onSecondaryClick: () => onOpenSection?.('new-arrivals') ?? onExploreCollection(),
    },
    {
      id: 'slide-musical-instruments',
      image: synthImg,
      badge: 'Musical Instruments & Studio Gear',
      badgeIcon: 'music',
      title: 'Analog Synthesizers & Audiophile Vinyl Decks',
      subtitle: '8-voice discrete polyphonic synthesizers with solid walnut end cheeks, precision direct-drive turntables, and ribbon studio monitors.',
      primaryCtaText: 'Shop Musical Instruments',
      onPrimaryClick: () => onOpenSection?.('categories', 'musical') ?? onExploreCollection(),
      secondaryCtaText: 'View Studio Gear',
      onSecondaryClick: onExploreCollection,
    },
    {
      id: 'slide-home-appliances',
      image: robotVacuumImg,
      badge: 'Smart Home Living & Appliances',
      badgeIcon: 'layers',
      title: 'Next-Gen Home Appliances & Smart Living',
      subtitle: 'Self-washing LiDAR robot vacuum stations, dual-boiler Italian espresso machines, and medical-grade HEPA 13 smart air purifiers.',
      primaryCtaText: 'Explore Appliances',
      onPrimaryClick: () => onOpenSection?.('categories', 'appliances') ?? onExploreCollection(),
      secondaryCtaText: 'View Deals',
      onSecondaryClick: () => onOpenSection?.('hot-deals') ?? onExploreCollection(),
    },
    {
      id: 'slide-electronics-audio',
      image: audiophileHeadphonesImg,
      badge: 'Precision Electronics & Audio',
      badgeIcon: 'cpu',
      title: 'Planar Magnetic Acoustics & Studio Tech',
      subtitle: '100mm planar acoustic transducers, reference ribbon monitors, and audiophile-grade sound engineering.',
      primaryCtaText: 'Shop Electronics',
      onPrimaryClick: () => onOpenSection?.('categories', 'electronics') ?? onExploreCollection(),
      secondaryCtaText: 'View Collection',
      onSecondaryClick: onExploreCollection,
    },
    {
      id: 'slide-fashion-lifestyle',
      image: choreCoatImg,
      badge: 'Apparel & Leathercraft · Handcrafted Carry',
      badgeIcon: 'sparkles',
      title: 'Timeless Apparel & Full-Grain Tuscan Leather',
      subtitle: 'Japanese selvedge twill chore jackets, double-faced virgin wool overcoats, and consortium-certified vegetable-tanned weekender bags.',
      primaryCtaText: 'Shop Apparel',
      onPrimaryClick: () => onOpenSection?.('categories', 'apparel') ?? onExploreCollection(),
      secondaryCtaText: 'Leather & Bags',
      onSecondaryClick: () => onOpenSection?.('categories', 'leather-goods') ?? onExploreCollection(),
    },
  ];

  // Auto-advance sliding banner every 5.5 seconds
  useEffect(() => {
    if (!isAutoPlaying || isPausedHover) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isPausedHover, slides.length]);

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
    touchStartX.current = null;
  };

  const current = slides[currentSlide];

  return (
    <section
      className="relative bg-zinc-950 overflow-hidden text-white select-none"
      onMouseEnter={() => setIsPausedHover(true)}
      onMouseLeave={() => setIsPausedHover(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Multi-Department Storefront Banner"
    >
      {/* Sliding Images Container */}
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
            {/* Cinematic Gradient Overlays for contrast and legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/50 to-zinc-950/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-950/40 to-transparent" />
          </div>
        ))}

        {/* Content Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-10 lg:p-14 w-full pointer-events-none">
          <div className="max-w-2xl pointer-events-auto space-y-3 sm:space-y-4">
            {/* Badge Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-zinc-100 tracking-wide">
              {current.badgeIcon === 'flame' && <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
              {current.badgeIcon === 'sparkles' && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
              {current.badgeIcon === 'layers' && <Layers className="w-3.5 h-3.5 text-zinc-200" />}
              {current.badgeIcon === 'music' && <Music className="w-3.5 h-3.5 text-cyan-300" />}
              {current.badgeIcon === 'cpu' && <Cpu className="w-3.5 h-3.5 text-emerald-300" />}
              <span>{current.badge}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-medium text-white tracking-tight leading-[1.15]">
              {current.title}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-zinc-200 max-w-xl font-light leading-relaxed line-clamp-2 sm:line-clamp-none">
              {current.subtitle}
            </p>

            {/* CTA Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={current.onPrimaryClick}
                className="group inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-slate-950 bg-white hover:bg-blue-50 rounded-full transition-all cursor-pointer shadow-lg hover:shadow-xl hover:text-blue-600"
              >
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

        {/* Carousel Navigation Arrows */}
        <div className="absolute inset-y-0 left-3 sm:left-6 flex items-center z-30 pointer-events-none">
          <button
            onClick={goToPrev}
            aria-label="Previous campaign slide"
            className="pointer-events-auto p-2 sm:p-2.5 rounded-full bg-zinc-950/40 hover:bg-zinc-950/80 text-white backdrop-blur-md border border-white/15 transition-all cursor-pointer hover:scale-105"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="absolute inset-y-0 right-3 sm:right-6 flex items-center z-30 pointer-events-none">
          <button
            onClick={goToNext}
            aria-label="Next campaign slide"
            className="pointer-events-auto p-2 sm:p-2.5 rounded-full bg-zinc-950/40 hover:bg-zinc-950/80 text-white backdrop-blur-md border border-white/15 transition-all cursor-pointer hover:scale-105"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Slide Counter & Play/Pause Controls (Bottom Right) */}
        <div className="absolute bottom-5 right-5 sm:right-10 z-30 flex items-center gap-2 pointer-events-auto">
          {/* Play/Pause Toggle */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            aria-label={isAutoPlaying ? 'Pause slide rotation' : 'Play slide rotation'}
            className="p-1.5 rounded-full bg-zinc-950/50 hover:bg-zinc-950/80 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-colors cursor-pointer text-xs"
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-zinc-950/50 backdrop-blur-md border border-white/10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Jump to slide ${idx + 1}`}
                className={`transition-all rounded-full cursor-pointer ${
                  idx === currentSlide
                    ? 'w-6 h-1.5 bg-white'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          {/* Index Counter */}
          <div className="hidden sm:flex items-center px-2 py-1 rounded-full bg-zinc-950/50 backdrop-blur-md border border-white/10 text-[11px] font-mono text-white/80 tabular-nums">
            0{currentSlide + 1} / 0{slides.length}
          </div>
        </div>
      </div>
    </section>
  );
};
