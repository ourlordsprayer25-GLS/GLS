import React from 'react';
import { ArrowRight } from 'lucide-react';
import { VISUAL_CATEGORIES, CategoryCardData } from '../data/products';
import { Product } from '../types/store';

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
  const handleClick = (category: string) => {
    onSelectCategory(category);
  };

  const activeCategories = categories
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
          image: cat.image || visualCat?.image || 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=1000',
          tag: cat.badge || visualCat?.tag || 'Discover'
        },
        categoryProducts
      };
    });

  if (activeCategories.length === 0) return null;

  return (
    <section className="w-full border-b border-zinc-200/80">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Streamlined Section Header: Title + View All */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
          <h2 className="text-xl sm:text-2xl font-display font-medium text-zinc-950 tracking-tight">
            Shop by Department
          </h2>

          {onViewAllCategories && (
            <button
              onClick={onViewAllCategories}
              className="text-xs font-semibold text-zinc-950 hover:text-zinc-600 transition-colors flex items-center gap-1 cursor-pointer group"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>

        {/* Categories Grid with Dynamic First Product Image & Count */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5 pt-5">
          {activeCategories.map(({ cat, categoryProducts }) => {
            const firstProduct = categoryProducts[0];

            // Display image: prioritize the first product's primary image, falling back to static visual category image
            const displayImage = firstProduct && firstProduct.primaryImage
              ? firstProduct.primaryImage
              : cat.image;

            const displayCount = categoryProducts.length > 0
              ? \\ \\
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
      </div>
    </section>
  );
};
