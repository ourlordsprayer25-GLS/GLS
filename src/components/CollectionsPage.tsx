import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Layers,
  ChevronRight,
  Search,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { Product, ProductVariant } from '../types/store';
import { ProductCard } from './ProductCard';

interface CollectionsPageProps {
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, variant: ProductVariant) => void;
  onBackToHome: () => void;
  onOpenCategories: () => void;
  onOpenBrand: () => void;
}

interface CollectionCapsule {
  id: string;
  capsuleNumber: string;
  title: string;
  theme: string;
  season: string;
  description: string;
  image: string;
  categoryKeys: string[]; // matches category or categoryLabel
}

const CAPSULES: CollectionCapsule[] = [
  {
    id: 'capsule-electronics',
    capsuleNumber: 'Capsule 01',
    title: 'Acoustique Studio & Audiophile Tech',
    theme: 'Planar Magnetic & Lossless Hi-Fi',
    season: 'Precision Sound & Gear',
    description:
      'CNC-machined aerospace aluminum, American walnut acoustic chambers, and ultra-thin planar diaphragms engineered in Stockholm.',
    image: '',
    categoryKeys: ['electronics', 'Electronics & Audio'],
  },
  {
    id: 'capsule-appliances',
    capsuleNumber: 'Capsule 02',
    title: 'Officina & Culinary Living Engineering',
    theme: 'Commercial Dual-Boilers & Pure Air',
    season: 'Smart Modern Living',
    description:
      'Micro-metered PID espresso machines from Milan, medical-grade H14 Scandinavian air purifiers, and Japanese induction gooseneck kettles.',
    image: '',
    categoryKeys: ['appliances', 'Home Appliances'],
  },
  {
    id: 'capsule-outerwear',
    capsuleNumber: 'Capsule 03',
    title: 'The Architecture of Outerwear',
    theme: 'Split Bound Seams & Raw Twill',
    season: 'Autumn / Winter Archive',
    description:
      'Unlined Japanese selvedge twill and double-faced Biella virgin wool engineered for seamless shoulder movement without synthetic stiffeners.',
    image: '',
    categoryKeys: ['outerwear', 'Coats', 'Apparel'],
  },
  {
    id: 'capsule-knitwear',
    capsuleNumber: 'Capsule 04',
    title: 'Biella Wool Guild & Porto Knits',
    theme: 'Tasmanian Merino & Cashmere',
    season: 'Permanent Heritage',
    description:
      'Spun from 19.5-micron fine merino fleece in Northern Italy, then knitted on 7-gauge Shima Seiki machines in our Porto workshop.',
    image: '',
    categoryKeys: ['knitwear'],
  },
  {
    id: 'capsule-leather',
    capsuleNumber: 'Capsule 05',
    title: 'Tuscan Vachetta & Leathercraft',
    theme: 'Vegetable-Tanned Cowhide',
    season: 'Artisanal Carry Goods',
    description:
      'Consortium-certified full-grain leather burnished by hand with organic beeswax and solid brass hardware in Florence.',
    image: '',
    categoryKeys: ['leather-goods', 'Bags'],
  },
  {
    id: 'capsule-court',
    capsuleNumber: 'Capsule 06',
    title: 'Consortium Court & Performance',
    theme: 'Archival Sportswear & Canvas',
    season: 'Limited Consortium',
    description:
      'Technical court trainers in buttery nappa calfskin, heavy double-knit studio track jackets, and Millerain staywax caps.',
    image: '',
    categoryKeys: ['Activewear', 'Accessories', 'essentials'],
  },
];

export const CollectionsPage: React.FC<CollectionsPageProps> = ({
  products,
  wishlistIds,
  onToggleWishlist,
  onSelectProduct,
  onQuickAdd,
  onBackToHome,
  onOpenCategories,
  onOpenBrand,
}) => {
  const [selectedCapsuleId, setSelectedCapsuleId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Group products into capsules
  const capsuleData = useMemo(() => {
    return CAPSULES.map((capsule) => {
      const matchedProducts = products.filter((p) => {
        const catKey = p.category.toLowerCase();
        const catLabel = (p.categoryLabel || '').toLowerCase();
        return capsule.categoryKeys.some((k) => {
          const lk = k.toLowerCase();
          return catKey === lk || catLabel.includes(lk);
        });
      });

      // Apply search query if present
      const filtered = searchQuery.trim()
        ? matchedProducts.filter(
            (p) =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        : matchedProducts;

      return {
        ...capsule,
        products: filtered,
      };
    });
  }, [products, searchQuery]);

  const activeCapsules = useMemo(() => {
    if (selectedCapsuleId === 'all') return capsuleData;
    return capsuleData.filter((c) => c.id === selectedCapsuleId);
  }, [capsuleData, selectedCapsuleId]);

  const totalCuratedPieces = useMemo(() => {
    return activeCapsules.reduce((acc, c) => acc + c.products.length, 0);
  }, [activeCapsules]);

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
            <span>Back to Home</span>
          </button>

          <nav className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
            <button onClick={onBackToHome} className="hover:text-zinc-900 transition-colors cursor-pointer">
              Home
            </button>
            <span>/</span>
            <span className="text-zinc-900 font-semibold">Curated Collections & Capsules</span>
          </nav>
        </div>
      </div>

      {/* EDITORIAL HERO BANNER */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-6">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-950 text-white p-8 sm:p-12 md:p-16 shadow-lg">
          <div className="absolute inset-0 z-0 opacity-35">
            <img
              src=""
              alt="GLADYNS Workshop"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent z-10" />

          <div className="relative z-20 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Curated GLADYNS Archive</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium tracking-tight text-white leading-tight">
              Curated Collections & Seasonal Capsules
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300/90 leading-relaxed font-light">
              Explore thematic capsules curated by our category experts. Each collection pairs functional aesthetics, heritage craftsmanship, and premium electronics into cohesive, enduring lifestyle aesthetics.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  const el = document.getElementById('capsules-container');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 bg-white text-zinc-950 hover:bg-zinc-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                Browse All Capsules
              </button>
              <button
                onClick={onOpenCategories}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium border border-white/20 transition-colors cursor-pointer"
              >
                Shop by Category
              </button>
              <button
                onClick={onOpenBrand}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium border border-white/20 transition-colors cursor-pointer"
              >
                Brand Archive
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <section id="capsules-container" className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200/80 shadow-xs mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Capsule Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              <button
                onClick={() => setSelectedCapsuleId('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCapsuleId === 'all'
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                All Capsules ({capsuleData.length})
              </button>
              {capsuleData.map((capsule) => {
                const isSelected = selectedCapsuleId === capsule.id;
                return (
                  <button
                    key={capsule.id}
                    onClick={() => setSelectedCapsuleId(capsule.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-950 text-white shadow-xs'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    <span>{capsule.capsuleNumber}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collection pieces..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 focus:bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-950 font-medium placeholder-zinc-400 transition-all"
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

        {/* CAPSULES LISTING */}
        {activeCapsules.length === 0 || totalCuratedPieces === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200">
            <p className="text-sm font-semibold text-zinc-900">No collection pieces found for "{searchQuery}"</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCapsuleId('all');
              }}
              className="mt-4 px-4 py-2 bg-zinc-950 text-white rounded-xl text-xs font-medium cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-14 sm:space-y-20">
            {activeCapsules.map((capsule) => {
              if (capsule.products.length === 0) return null;

              return (
                <div key={capsule.id} className="space-y-6">
                  {/* Capsule Header Card */}
                  <div className="relative rounded-2xl overflow-hidden bg-zinc-900 text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-zinc-800 shadow-sm">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                          {capsule.capsuleNumber}
                        </span>
                        <span className="text-zinc-400">·</span>
                        <span className="text-xs text-zinc-300 font-medium">{capsule.season}</span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-display font-medium text-white tracking-tight">
                        {capsule.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                        {capsule.description}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-mono font-bold text-white tabular-nums">
                          {capsule.products.length}
                        </p>
                        <p className="text-[11px] text-zinc-400">Curated Pieces</p>
                      </div>
                    </div>
                  </div>

                  {/* Products Grid for this capsule */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {capsule.products.map((product) => (
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
