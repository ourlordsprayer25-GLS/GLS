import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { VISUAL_CATEGORIES, CategoryCardData } from '../data/products';
import { Product } from '../types/store';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';

interface CategorySectionProps {
  products?: Product[];
  categories: any[];
  onSelectCategory: (category: string) => void;
  onViewAllCategories?: () => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  products = [],
  categories,
  onSelectCategory,
  onViewAllCategories,
}) => {
  const { language } = useLanguageCurrency();
  const isFr = language === 'fr';

  const handleClick = (category: string) => {
    onSelectCategory(category);
  };

  // Detect mobile viewport (< 640px)
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeCategories = useMemo(() => {
    return categories
      .filter(cat => cat.id !== 'all')
      .map(cat => {
        const categoryProducts = products.filter(p => 
          p.category === cat.id || 
          p.category.toLowerCase() === cat.id.toLowerCase() || 
          (p.categoryLabel && p.categoryLabel.toLowerCase().includes(cat.id.toLowerCase()))
        );
        
        const visualCat = VISUAL_CATEGORIES.find(v => v.id === cat.id);
        
        return {
          cat: {
            id: cat.id,
            title: cat.label,
            subtitle: cat.description || visualCat?.subtitle || 'Explore our curated collection',
            count: cat.badge || visualCat?.count || 'Curated Items',
            image: cat.image || visualCat?.image || '',
            tag: cat.badge || visualCat?.tag || 'Discover'
          },
          categoryProducts
        };
      })
      .filter(c => c.categoryProducts.length > 0);
  }, [categories, products]);

  // 24-Hour Mobile Rotation:
  // On mobile screens, only show 6 categories. Every 24 hours (epoch day),
  // rotate to the next unseen 6 categories in a round-robin cycle.
  const mobileRotatedCategories = useMemo(() => {
    if (activeCategories.length <= 6) return activeCategories;

    const DAY_MS = 24 * 60 * 60 * 1000;
    // Current 24-hour day index (increments every midnight UTC)
    const dayIndex = Math.floor(Date.now() / DAY_MS);
    
    // Starting offset for today's 6-item batch
    const startIndex = (dayIndex * 6) % activeCategories.length;
    
    // Pick 6 items with circular wrap-around
    const batch: typeof activeCategories = [];
    for (let i = 0; i < 6; i++) {
      batch.push(activeCategories[(startIndex + i) % activeCategories.length]);
    }
    return batch;
  }, [activeCategories]);

  if (activeCategories.length === 0) return null;

  // On mobile show the rotated 6-category batch; on tablet/desktop show all active categories
  const displayList = isMobile ? mobileRotatedCategories : activeCategories;

  return (
    <section className="w-full border-b border-zinc-200/80">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Streamlined Section Header: Title + View All */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-display font-medium text-zinc-950 tracking-tight">
              {isFr ? 'Rayons et Catégories' : 'Shop by Department'}
            </h2>
            {isMobile && activeCategories.length > 6 && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                {isFr ? 'Sélection du jour' : "Today's 6"}
              </span>
            )}
          </div>

          {onViewAllCategories && (
            <button
              onClick={onViewAllCategories}
              className="text-xs font-semibold text-zinc-950 hover:text-zinc-600 transition-colors flex items-center gap-1 cursor-pointer group"
            >
              <span>{isFr ? 'Voir tout' : 'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>

        {/* Categories Grid with Dynamic First Product Image & Count */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5 pt-5">
          {displayList.map(({ cat, categoryProducts }) => {
            const firstProduct = categoryProducts[0];

            // Display image: prioritize the first product's primary image, falling back to static visual category image
            const displayImage = firstProduct && firstProduct.primaryImage
              ? firstProduct.primaryImage
              : cat.image;

            const displayCount = categoryProducts.length > 0
              ? `${categoryProducts.length} ${isFr ? (categoryProducts.length === 1 ? 'article' : 'articles') : (categoryProducts.length === 1 ? 'Piece' : 'Pieces')}`
              : cat.count;

            return (
              <div
                key={cat.id}
                onClick={() => handleClick(cat.id)}
                className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-200/70 cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300"
              >
                {/* Background Image Container */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-800">
                  <img
                    src={displayImage}
                    alt={cat.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108 opacity-85 group-hover:opacity-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                </div>

                {/* Top pill badge */}
                <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 flex items-center justify-between">
                  <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-zinc-950 px-1.5 sm:px-2 py-0.5 rounded shadow-xs max-w-[90px] sm:max-w-none truncate">
                    {cat.tag}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-mono text-white/80 bg-zinc-950/60 backdrop-blur-xs px-1.5 sm:px-2 py-0.5 rounded">
                    {displayCount}
                  </span>
                </div>

                {/* Bottom Content Overlay */}
                <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 text-white">
                  <h3 className="text-sm sm:text-base font-semibold tracking-tight group-hover:underline">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] text-zinc-300 line-clamp-1 mt-0.5 hidden sm:block">
                    {firstProduct ? firstProduct.name : cat.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile View All Footer Action */}
        {isMobile && activeCategories.length > 6 && onViewAllCategories && (
          <div className="pt-4 flex justify-center">
            <button
              onClick={onViewAllCategories}
              className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 active:scale-[0.99] text-zinc-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-zinc-200 cursor-pointer"
            >
              <span>{isFr ? `Explorer les ${activeCategories.length} catégories` : `Explore All ${activeCategories.length} Categories`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
