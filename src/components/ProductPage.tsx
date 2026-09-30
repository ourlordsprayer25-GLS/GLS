import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Star,
  Truck,
  RotateCcw,
  Ruler,
  Shield,
  ShieldCheck,
  Check,
  ChevronRight,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Share2,
  Heart,
  Layers,
  FolderPlus,
  ShoppingCart,
} from 'lucide-react';
import { Product, ProductVariant, ProductSize, Review, StoreSettings } from '../types/store';
import { SizeChartModal } from './SizeChartModal';
import { ProductCard } from './ProductCard';
import { WhatsAppIcon, getWhatsAppLink } from './WhatsAppWidget';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';

interface ProductPageProps {
  product: Product;
  allProducts: Product[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, variant: ProductVariant, size: ProductSize, quantity: number) => void;
  onBuyItNow?: (product: Product, variant: ProductVariant, size: ProductSize, quantity: number) => void;
  onOpenCollections?: () => void;
  storeSettings?: StoreSettings;
}

export const ProductPage: React.FC<ProductPageProps> = ({
  product,
  allProducts,
  wishlistIds,
  onToggleWishlist,
  onBack,
  onSelectProduct,
  onAddToCart,
  onBuyItNow,
  onOpenCollections,
  storeSettings,
}) => {
  const { formatPrice, t, language } = useLanguageCurrency();
  const storeName = storeSettings?.storeName || 'GLADYNS';
  // Variant States
  const [selectedColor, setSelectedColor] = useState<ProductVariant>(
    product.colors?.[0] || { id: 'default', name: 'Standard', colorHex: '#000000', inStock: true }
  );
  const [selectedSize, setSelectedSize] = useState<ProductSize>(
    product.sizes?.find((s) => s.inStock) || product.sizes?.[0] || { name: 'One Size', inStock: true }
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const isWishlisted = wishlistIds.includes(product.id);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Active Details Tab
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'materials' | 'shipping'>('description');

  // Interactive Reviews State
  const [reviewsList, setReviewsList] = useState<Review[]>(product.reviews || []);
  const [helpfulMap, setHelpfulMap] = useState<Record<string, boolean>>({});
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Dynamic state reset when active product changes (prevents referencing stale colors/sizes from previous product)
  React.useEffect(() => {
    if (product) {
      setSelectedColor(product.colors?.[0] || { id: 'default', name: 'Standard', colorHex: '#000000', inStock: true });
      setSelectedSize(product.sizes?.find((s) => s.inStock) || product.sizes?.[0] || { name: 'One Size', inStock: true });
      setSelectedImageIndex(0);
      setQuantity(1);
      setReviewsList(product.reviews || []);
    }
  }, [product]);

  // Review Form Input State
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewFit, setNewReviewFit] = useState<'True to Size' | 'Runs Small' | 'Runs Large'>('True to Size');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Handle image switching when color variant changes
  const handleColorChange = (color: ProductVariant) => {
    setSelectedColor(color);
    if (color.image) {
      setSelectedImageIndex(0);
    }
  };

  // Add to cart handler
  const handleAddToCart = () => {
    if (!selectedSize.inStock) return;
    onAddToCart(product, selectedColor, selectedSize, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2200);
  };

  const handleBuyItNowClick = () => {
    if (!selectedSize.inStock) return;
    if (onBuyItNow) {
      onBuyItNow(product, selectedColor, selectedSize, quantity);
    } else {
      onAddToCart(product, selectedColor, selectedSize, quantity);
    }
  };

  // Helpful vote handler
  const handleVoteHelpful = (reviewId: string) => {
    if (helpfulMap[reviewId]) return;
    setHelpfulMap((prev) => ({ ...prev, [reviewId]: true }));
    setReviewsList((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, helpfulVotes: (r.helpfulVotes || 0) + 1 } : r
      )
    );
  };

  // Review submit handler
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    const newRev: Review = {
      id: `rev-custom-${Date.now()}`,
      author: newReviewAuthor.trim(),
      rating: newReviewRating,
      date: language === 'fr' ? 'À l\'instant' : 'Just now',
      title: newReviewTitle.trim() || (language === 'fr' ? 'Qualité et finition irréprochables' : 'Exceptional craftsmanship'),
      comment: newReviewComment.trim(),
      verified: true,
      sizePurchased: selectedSize.name,
      variantPurchased: selectedColor.name,
      fitRating: newReviewFit,
      helpfulVotes: 0,
    };

    setReviewsList([newRev, ...reviewsList]);
    setReviewSubmitted(true);
    setNewReviewAuthor('');
    setNewReviewTitle('');
    setNewReviewComment('');
    setTimeout(() => {
      setShowReviewForm(false);
      setReviewSubmitted(false);
    }, 2000);
  };

  // Share handler
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = product.name;
    const shareText = `${product.name} - ${product.subtitle}\n\n${product.description.slice(0, 150)}...`;

    if (navigator.share) {
      try {
        const imageUrl = product.images[selectedImageIndex]?.url || product.primaryImage;
        let fileShared = false;

        if (imageUrl) {
          try {
            // Fetch the image as a blob
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            
            // Generate a proper filename and mime type
            const fileType = blob.type || 'image/jpeg';
            const fileExt = fileType.split('/')[1] || 'jpg';
            const file = new File([blob], `gladyns_product_${product.id}.${fileExt}`, { type: fileType });

            const shareData = {
              title: shareTitle,
              text: shareText,
              url: shareUrl,
              files: [file],
            };

            // Double check system compatibility with file sharing
            if (navigator.canShare && navigator.canShare(shareData)) {
              await navigator.share(shareData);
              fileShared = true;
            }
          } catch (fileError) {
            console.warn('Could not bundle image for native sharing, falling back to text sharing', fileError);
          }
        }

        if (!fileShared) {
          // Fallback to native text-only share
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl,
          });
        }
        
        // Show success checkmark in UI temporarily
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
        return;
      } catch (shareError) {
        console.warn('Native share failed or dismissed', shareError);
      }
    }

    // Traditional copy to clipboard fallback
    try {
      await navigator.clipboard?.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch (clipError) {
      console.error('Clipboard copy failed', clipError);
    }
  };

  // Filter related products (exclude current product)
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  // Active image url
  const currentImageUrl =
    product.images[selectedImageIndex]?.url || selectedColor.image || product.primaryImage;
  const currentImageAlt =
    product.images[selectedImageIndex]?.alt || product.name;

  return (
    <>
      <Helmet>
        <title>{product.name} | {storeName}</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={selectedColor.image || product.images[0].url} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.name} />
        <meta name="twitter:description" content={product.description} />
        <meta name="twitter:image" content={selectedColor.image || product.images[0].url} />
      </Helmet>
      
      <div className="bg-[#FDFDFD] min-h-screen pb-24">
      {/* Breadcrumb Navigation */}
      <nav className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={onBack}
            className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('shopCollection')}</span>
          </button>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="capitalize">{product.categoryLabel}</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-900 font-medium truncate max-w-xs">{product.name}</span>
        </div>
      </nav>

      {/* Main PDP Grid */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Large Image Viewport */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
              <img
                src={currentImageUrl}
                alt={currentImageAlt}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-all duration-300"
              />

              {product.tag && (
                <span className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-md shadow-xs">
                  {product.tag}
                </span>
              )}

              {/* Image Quick Favorite */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToggleWishlist(product.id)}
                  aria-label={isWishlisted ? 'Remove from favorites' : 'Save to favorites'}
                  title={isWishlisted ? 'Saved in favorites' : 'Save to favorites'}
                  className={`p-2.5 bg-white/90 hover:bg-white rounded-full shadow-xs transition-colors cursor-pointer ${
                    isWishlisted ? 'text-rose-600 ring-2 ring-rose-300' : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600 text-rose-600 scale-110' : ''}`} />
                </button>
              </div>

              {/* Caption overlay */}
              {product.images[selectedImageIndex]?.caption && (
                <div className="absolute bottom-3 left-3 bg-slate-950/70 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded font-medium">
                  {product.images[selectedImageIndex].caption}
                </div>
              )}
            </div>

            {/* Thumbnail Strip (Multiple product images) */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 bg-slate-100 transition-all cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-blue-600 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-400 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Model & Artisan specification notice */}
            {product.modelInfo && (
              <p className="text-xs text-slate-500 italic pt-1">
                {product.modelInfo}
              </p>
            )}
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 sticky top-24">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span className="uppercase tracking-wider font-semibold text-blue-600">{product.categoryLabel}</span>
                <span>{language === 'fr' ? `Conçu en ${product.madeIn}` : `Crafted in ${product.madeIn}`}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-display font-medium text-slate-950 tracking-tight">
                {product.name}
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                {product.subtitle}
              </p>

              {/* Price & Rating */}
              <div className="flex items-center justify-between mt-4 pb-4 border-b border-slate-100">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-slate-950 tabular-nums">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm font-mono text-slate-400 line-through tabular-nums">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="text-xs text-emerald-700 font-medium">
                      {language === 'fr'
                        ? `Économie ${formatPrice(product.originalPrice - product.price)}`
                        : `Save ${formatPrice(product.originalPrice - product.price)}`}
                    </span>
                  )}
                </div>

                <a
                  href="#reviews-section"
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-950 transition-colors"
                >
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="font-semibold text-slate-900 font-mono tabular-nums">
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="text-slate-400">({reviewsList.length})</span>
                </a>
              </div>
            </div>

            {/* Variant 1: Color Swatches */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">
                  {language === 'fr' ? 'Couleur' : 'Color'}: <span className="font-normal text-slate-600">{selectedColor.name}</span>
                </span>
                <span className="text-slate-400">{product.colors.length} {language === 'fr' ? 'options' : 'choices'}</span>
              </div>

              <div className="flex items-center gap-3">
                {product.colors.map((color) => {
                  const isSelected = selectedColor.id === color.id;
                  return (
                    <button
                      key={color.id}
                      onClick={() => handleColorChange(color)}
                      title={color.name}
                      className={`group relative p-0.5 rounded-full transition-all cursor-pointer ${
                        isSelected ? 'ring-2 ring-blue-600 ring-offset-2' : 'hover:ring-1 hover:ring-slate-400'
                      }`}
                    >
                      <span
                        className="block w-7 h-7 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: color.colorHex }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Variant 2: Size / Configuration Selector & Guide */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">
                  {['electronics', 'appliances', 'musical'].includes(product.category)
                    ? (language === 'fr' ? 'Modèle / Édition:' : 'Edition / Model:')
                    : (language === 'fr' ? 'Taille / Format:' : 'Size:')}{' '}
                  <span className="font-normal text-slate-600">{selectedSize.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsSizeChartOpen(true)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline underline-offset-4 cursor-pointer font-medium"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>
                    {['electronics', 'appliances', 'musical'].includes(product.category)
                      ? (language === 'fr' ? 'Guide des spécifications' : 'Dimensions & Specs Guide')
                      : (language === 'fr' ? 'Guide des tailles' : 'Size & Dimensions Guide')}
                  </span>
                </button>
              </div>

              <div
                className={
                  product.sizes.some((s) => s.name.length > 5)
                    ? 'grid grid-cols-1 sm:grid-cols-2 gap-2'
                    : 'grid grid-cols-5 gap-2'
                }
              >
                {product.sizes.map((size) => {
                  const isSelected = selectedSize.name === size.name;
                  const isOutOfStock = !size.inStock;

                  return (
                    <button
                      key={size.name}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(size)}
                      className={`relative px-3 py-2.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                        isOutOfStock
                          ? 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed line-through'
                          : isSelected
                          ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-800 hover:border-blue-600'
                      }`}
                    >
                      <span>{size.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Warranty / Certified Banner if present */}
              {product.warranty && (
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{product.warranty}</span>
                  </span>
                  <span className="text-[10px] text-blue-700 font-mono">100% Genuine Studio Certification</span>
                </div>
              )}

              {/* Stock Warning Indicator */}
              {selectedSize.stockCount !== undefined && selectedSize.stockCount > 0 && selectedSize.stockCount <= 4 && (
                <p className="text-xs text-amber-700 font-medium flex items-center gap-1 mt-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {language === 'fr'
                      ? `Stock limité: plus que ${selectedSize.stockCount} unités disponibles.`
                      : `Low stock: Only ${selectedSize.stockCount} units remaining in this configuration.`}
                  </span>
                </p>
              )}
            </div>

            {/* Quantity and Primary Buy CTA */}
            <div className="space-y-3.5 pt-3">
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                {/* Quantity Stepper (Pill shaped as in reference image) */}
                <div className="flex items-center justify-between border-2 border-slate-900 rounded-full px-4 bg-white w-full sm:w-[130px] h-[52px] shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="text-lg font-bold text-slate-800 hover:text-blue-600 transition-colors disabled:opacity-30 cursor-pointer select-none px-1"
                  >
                    -
                  </button>
                  <span className="text-sm font-sans font-extrabold text-slate-900 tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-lg font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer select-none px-1"
                  >
                    +
                  </button>
                </div>

                {/* Primary Add to Bag Button (Blue Pill shape with shopping cart icon underneath as in reference image) */}
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize.inStock}
                  className={`flex-1 rounded-full h-[52px] flex flex-col items-center justify-center px-4 shadow-md transition-all select-none cursor-pointer ${
                    !selectedSize.inStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
                  }`}
                >
                  <span className="text-xs font-black uppercase tracking-widest leading-none">
                    {isAdded ? (language === 'fr' ? 'AJOUTÉ' : 'ADDED') : !selectedSize.inStock ? (language === 'fr' ? 'ÉPUISÉ' : 'SOLD OUT') : (language === 'fr' ? 'AJOUTER AU PANIER' : 'ADD TO CART')}
                  </span>
                  <ShoppingCart className="w-3.5 h-3.5 mt-1 opacity-90 stroke-[2.2]" />
                </button>

                {/* Circular Action Buttons (Wishlist, Archive/Collection, Share as in reference image) */}
                <div className="flex items-center gap-2">
                  {/* Wishlist Circle */}
                  <button
                    type="button"
                    onClick={() => onToggleWishlist(product.id)}
                    className={`w-[52px] h-[52px] rounded-full border border-slate-900 hover:border-blue-600 flex items-center justify-center transition-all shrink-0 active:scale-95 cursor-pointer bg-white ${
                      isWishlisted ? 'text-rose-600' : 'text-slate-900'
                    }`}
                    title={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart className={`w-[18px] h-[18px] ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
                  </button>

                  {/* Archive / Collection Folder Circle */}
                  <button
                    type="button"
                    onClick={onOpenCollections}
                    className="w-[52px] h-[52px] rounded-full border border-slate-900 hover:border-blue-600 text-slate-900 hover:text-blue-600 flex items-center justify-center transition-all shrink-0 active:scale-95 cursor-pointer bg-white"
                    title="Explore thematic collections & capsules"
                  >
                    <FolderPlus className="w-[18px] h-[18px]" />
                  </button>

                  {/* Share Circle */}
                  <button
                    type="button"
                    onClick={handleShare}
                    className="w-[52px] h-[52px] rounded-full border border-slate-900 hover:border-blue-600 text-slate-900 hover:text-blue-600 flex items-center justify-center transition-all shrink-0 active:scale-95 cursor-pointer bg-white"
                    title="Share product link"
                  >
                    {copiedShare ? (
                      <Check className="w-[18px] h-[18px] text-emerald-600" />
                    ) : (
                      <Share2 className="w-[18px] h-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Buy It Now (Full-width outline pill button as in reference image) */}
              <button
                type="button"
                disabled={!selectedSize.inStock}
                onClick={handleBuyItNowClick}
                className={`w-full h-[52px] rounded-full border-2 border-blue-600 hover:bg-blue-50/50 active:bg-blue-100/80 flex items-center justify-center text-xs font-black uppercase tracking-widest transition-all cursor-pointer select-none ${
                  !selectedSize.inStock
                    ? 'border-slate-300 text-slate-400 cursor-not-allowed bg-slate-50'
                    : 'text-blue-600 bg-white shadow-xs'
                }`}
              >
                {language === 'fr' ? 'ACHETER MAINTENANT' : 'BUY IT NOW'}
              </button>
            </div>

              {/* WhatsApp Concierge Inquiry Button */}
              <div className="pt-1">
                <a
                  href={getWhatsAppLink(
                    `Hello GLADYNS Studio, I would like to inquire about the ${product.name} (Color: ${selectedColor.name}, Size: ${selectedSize.name}, Price: ${formatPrice(product.price)}).`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs font-semibold text-slate-800 hover:text-emerald-950 flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
                >
                  <span className="flex items-center gap-2">
                    <WhatsAppIcon className="w-4 h-4 text-[#25D366] group-hover:scale-110 transition-transform" />
                    <span>{language === 'fr' ? 'Conseiller VIP via WhatsApp' : 'Inquire via WhatsApp Support'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 group-hover:text-emerald-800 font-mono">
                    GLADYNS Desk · Online →
                  </span>
                </a>
              </div>

              {/* Instant purchase guarantee */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>{language === 'fr' ? 'Livraison gratuite dès 150$' : 'Free delivery over $150'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                  <span>{language === 'fr' ? 'Retours sous 30 jours' : '30-day global returns'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span>{language === 'fr' ? 'Garantie GLADYNS' : 'GLADYNS warranty'}</span>
                </span>
              </div>
            </div>
          </div>

        {/* Tabbed Product Details & Specification Section */}
        <section className="mt-16 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-xs">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 overflow-x-auto gap-6 sm:gap-8 pb-3">
            {[
              { id: 'description', label: language === 'fr' ? 'Description & Histoire' : 'Description & Story' },
              { id: 'details', label: language === 'fr' ? 'Détails de Fabrication' : 'Construction Details' },
              { id: 'materials', label: language === 'fr' ? 'Matières & Entretien' : 'Materials & Care' },
              { id: 'shipping', label: language === 'fr' ? 'Livraison & Retours Offerts' : 'Shipping & Complimentary Returns' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-sm font-semibold whitespace-nowrap transition-colors relative cursor-pointer pb-2 ${
                  activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content Panes */}
          <div className="pt-6">
            {activeTab === 'description' && (
              <div className="space-y-4 max-w-3xl">
                <p className="text-base text-slate-700 leading-relaxed font-light">
                  {product.description}
                </p>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
                    {language === 'fr' ? 'Philosophie de Conception' : 'Design Philosophy'}
                  </h4>
                  <p className="text-xs text-slate-600 leading-normal">
                    {product.tagline} {language === 'fr' ? 'Chaque détail est pensé sans artifices superflus pour garantir une longévité exceptionnelle.' : 'Each seam is engineered without extraneous hardware to ensure clean silhouettes that age gracefully with ongoing wear.'}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="max-w-3xl">
                <ul className="space-y-3">
                  {product.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'materials' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
                    {language === 'fr' ? 'Composition & Provenance' : 'Composition & Sourcing'}
                  </h4>
                  <p className="text-sm text-slate-700">{product.materials}</p>
                </div>
                <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
                    {language === 'fr' ? 'Conseils d\'Entretien' : 'Care Guidelines'}
                  </h4>
                  <p className="text-sm text-slate-700">{product.care}</p>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl text-sm text-slate-700">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
                  <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                    {language === 'fr' ? 'Livraison Neutre en Carbone' : 'Carbon-Neutral Shipping'}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {language === 'fr'
                      ? 'Livraison standard offerte pour toutes les commandes supérieures à 150$. Acheminement en 3 à 5 jours ouvrés avec suivi complet.'
                      : 'Complimentary standard worldwide shipping on orders exceeding $150. Delivery takes 3–5 business days via tracked carbon-neutral couriers.'}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
                  <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                    {language === 'fr' ? 'Livraison Express Prioritaire' : 'DHL Express Priority'}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {language === 'fr'
                      ? 'Besoin d\'une livraison urgente ? Choisissez l\'option Express pour recevoir votre commande en 24h à 48h avec créneau garanti.'
                      : 'Need it rapidly? Select Express checkout for 1–2 business day expedited transit with guaranteed morning delivery windows.'}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
                  <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                    {language === 'fr' ? 'Retours Sérénité 30 Jours' : '30-Day Hassle-Free Returns'}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {language === 'fr'
                      ? 'Étiquette prépayée incluse dans votre colis. Retournez les articles non portés sous 30 jours pour remboursement ou échange immédiat.'
                      : 'Pre-paid digital return labels provided in every package. Return unworn items within 30 days for full refund or immediate size exchange.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section id="reviews-section" className="mt-16 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-200">
            <div>
              <h2 className="text-2xl font-display font-medium text-slate-950">
                {language === 'fr' ? 'Avis Clients Vérifiés' : 'Customer Reviews'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'fr' ? 'Retours d\'expérience authentiques de nos clients à travers le monde.' : 'Real feedback from verified purchasers worldwide.'}
              </p>
            </div>

            {/* Scorecard */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <span className="text-4xl font-bold font-mono tabular-nums text-slate-950">
                  {product.rating.toFixed(1)}
                </span>
                <div className="flex text-amber-400 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-xs text-slate-400 mt-0.5 block font-mono">
                  {reviewsList.length} {language === 'fr' ? 'avis vérifiés' : 'verified reviews'}
                </span>
              </div>

              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-4 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{showReviewForm ? (language === 'fr' ? 'Fermer le formulaire' : 'Close Form') : (language === 'fr' ? 'Donner mon avis' : 'Write a Review')}</span>
              </button>
            </div>
          </div>

          {/* Interactive Review Form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="my-8 p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">
                {language === 'fr' ? `Partagez votre avis sur ${product.name}` : `Share your experience with the ${product.name}`}
              </h3>

              {reviewSubmitted ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg text-sm flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'fr' ? 'Merci ! Votre avis vérifié a été publié.' : 'Thank you! Your verified review has been published.'}</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">{language === 'fr' ? 'Votre Nom' : 'Your Name'}</label>
                      <input
                        type="text"
                        required
                        value={newReviewAuthor}
                        onChange={(e) => setNewReviewAuthor(e.target.value)}
                        placeholder="e.g. Alexandre D."
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">{language === 'fr' ? 'Note globale' : 'Rating'}</label>
                      <div className="flex items-center gap-1 pt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReviewRating(star)}
                            className="cursor-pointer text-amber-400 hover:scale-110 transition-transform"
                          >
                            <Star className={`w-5 h-5 ${star <= newReviewRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">{language === 'fr' ? 'Titre de l\'avis' : 'Headline / Title'}</label>
                      <input
                        type="text"
                        value={newReviewTitle}
                        onChange={(e) => setNewReviewTitle(e.target.value)}
                        placeholder="e.g. Coupe parfaite et finition d'exception"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">{language === 'fr' ? 'Comment taille la pièce ?' : 'How does it fit?'}</label>
                      <select
                        value={newReviewFit}
                        onChange={(e) => setNewReviewFit(e.target.value as any)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                      >
                        <option value="Runs Small">{language === 'fr' ? 'Taille petit' : 'Runs Small'}</option>
                        <option value="True to Size">{language === 'fr' ? 'Taille normalement' : 'True to Size'}</option>
                        <option value="Runs Large">{language === 'fr' ? 'Taille grand' : 'Runs Large'}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">{language === 'fr' ? 'Détails de votre commentaire' : 'Review Details'}</label>
                    <textarea
                      required
                      rows={3}
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      placeholder="Commentaires sur la matière, le confort, la taille et la durabilité..."
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    {language === 'fr' ? 'Publier mon avis' : 'Post Review'}
                  </button>
                </>
              )}
            </form>
          )}

          {/* Reviews List */}
          <div className="divide-y divide-slate-100 mt-6">
            {reviewsList.map((review) => (
              <div key={review.id} className="py-6 first:pt-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`}
                          />
                        ))}
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900">{review.title}</h4>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="font-medium text-slate-800">{review.author}</span>
                      {review.verified && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-700 font-medium flex items-center gap-0.5">
                            <Check className="w-3 h-3" />
                            {language === 'fr' ? 'Acheteur Vérifié' : 'Verified Buyer'}
                          </span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span>{review.date}</span>
                    </div>
                  </div>

                  {review.fitRating && (
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {review.fitRating}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 mt-3 leading-relaxed">
                  {review.comment}
                </p>

                {/* Helpful count */}
                <div className="flex items-center gap-3 mt-4 text-xs text-slate-500">
                  <span>{language === 'fr' ? 'Cet avis vous a-t-il été utile ?' : 'Was this helpful?'}</span>
                  <button
                    onClick={() => handleVoteHelpful(review.id)}
                    className={`flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer ${
                      helpfulMap[review.id] ? 'text-blue-600 font-semibold' : ''
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span className="font-mono tabular-nums">{review.helpfulVotes || 0}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Related Products Section (Curated Stylist Lookbook Cards) */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 border-t border-slate-200/60 pt-16">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block">{storeName.toUpperCase()} CURATION</span>
                <h2 className="text-2xl font-display font-medium text-slate-950">
                  {language === 'fr' ? 'Séléction de Tenue Complète' : 'Complete the Wardrobe'}
                </h2>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard
                  key={relProduct.id}
                  product={relProduct}
                  isWishlisted={wishlistIds.includes(relProduct.id)}
                  onToggleWishlist={onToggleWishlist}
                  onSelect={(p) => {
                    onSelectProduct(p);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onQuickAdd={(p, v) => {
                    const defaultSize = p.sizes.find(s => s.inStock) || p.sizes[0];
                    onAddToCart(p, v, defaultSize, 1);
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* More to Love Section (Highly Elegant Editorial Product Showcase) */}
        {(() => {
          const moreToLove = storeSettings?.moreToLoveSection || {
            enabled: true,
            title: 'More to Love',
            subtitle: 'Explore curated alternatives featuring pristine cuts and high-fashion engineering from our global archive.',
            tagLabel: 'ARCHIVAL DISCOVERIES',
            itemCount: 4,
          };
          if (moreToLove.enabled === false) return null;

          return (
            <section className="mt-16 border-t border-slate-200/80 pt-16">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block">
                      {moreToLove.tagLabel || 'ARCHIVAL DISCOVERIES'}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-medium text-slate-950">
                    {moreToLove.title || 'More to Love'}
                  </h2>
                  <p className="text-xs text-slate-500 max-w-xl">
                    {moreToLove.subtitle || 'Explore curated alternatives featuring pristine cuts and high-fashion engineering from our global archive.'}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    if (onOpenCollections) onOpenCollections();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest flex items-center gap-1.5 mt-4 md:mt-0 cursor-pointer"
                >
                  <span>{language === 'fr' ? 'Voir toute la collection' : 'Explore All Pieces'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {allProducts
                  .filter((p) => p.id !== product.id && !relatedProducts.some(r => r.id === p.id))
                  .slice(0, moreToLove.itemCount || 4)
                  .map((loveProduct) => (
                    <ProductCard
                      key={loveProduct.id}
                      product={loveProduct}
                      isWishlisted={wishlistIds.includes(loveProduct.id)}
                      onToggleWishlist={onToggleWishlist}
                      onSelect={(p) => {
                        onSelectProduct(p);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      onQuickAdd={(p, v) => {
                        const defaultSize = p.sizes.find(s => s.inStock) || p.sizes[0];
                        onAddToCart(p, v, defaultSize, 1);
                      }}
                    />
                  ))}
              </div>
            </section>
          );
        })()}
      </div>

      {/* Sizing Modal */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        productName={product.name}
        category={product.category}
      />
    </div>
    </>
  );
};
