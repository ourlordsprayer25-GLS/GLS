import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Product, ProductVariant } from '../types/store';
import { ProductCard } from './ProductCard';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';

interface NewArrivalsSectionProps {
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, variant: ProductVariant) => void;
  onViewAllNew: () => void;
}

export const NewArrivalsSection: React.FC<NewArrivalsSectionProps> = ({
  products,
  wishlistIds,
  onToggleWishlist,
  onSelectProduct,
  onQuickAdd,
  onViewAllNew,
}) => {
  const { language } = useLanguageCurrency();
  const isFr = language === 'fr';
  const getProductTimestamp = (p: Product): number => {
    if ((p as any).created_at) {
      const parsed = Date.parse((p as any).created_at);
      if (!isNaN(parsed)) return parsed;
    }
    const match = p.id.match(/\d{10,}/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (!isNaN(num)) return num;
    }
    return 0;
  };

  const newArrivals = React.useMemo(() => {
    // 1. Check for products explicitly tagged as new arrival
    const taggedNew = products.filter(
      (p) => p.isNewArrival || p.tag === 'New Season Drop' || p.tag === 'New Arrival'
    );

    if (taggedNew.length > 0) {
      // Sort newest added piece first
      return [...taggedNew].sort((a, b) => getProductTimestamp(b) - getProductTimestamp(a));
    }

    // 2. Fallback: if no products explicitly tagged, showcase the latest additions to the store
    return [...products].sort((a, b) => getProductTimestamp(b) - getProductTimestamp(a));
  }, [products]);

  if (newArrivals.length === 0) return null;

  return (
    <section className="w-full border-b border-zinc-200/80">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Streamlined Section Header: Title + View All */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
        <h2 className="text-xl sm:text-2xl font-display font-medium text-zinc-950 tracking-tight">
          {isFr ? 'Nouveautés' : 'New Arrivals'}
        </h2>

        <button
          onClick={onViewAllNew}
          className="text-xs font-semibold text-zinc-950 hover:text-zinc-600 transition-colors flex items-center gap-1 cursor-pointer group"
        >
          <span>{isFr ? 'Voir tout' : 'View All'}</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Grid of New Arrivals (Shows latest additions, up to 8 pieces) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 pt-5">
        {newArrivals.slice(0, 8).map((product) => (
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
  </section>
  );
};
