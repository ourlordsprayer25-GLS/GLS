import React, { useState, useEffect } from 'react';
import { 
  X, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Store, 
  ShoppingBag, 
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Product, StoreSettings } from '../types/store';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';
import { generateShareCard, downloadShareCard } from '../utils/shareCardGenerator';
import { WhatsAppIcon } from './WhatsAppWidget';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  storeSettings?: StoreSettings;
  initialMode?: 'store' | 'product';
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  product = null,
  storeSettings,
  initialMode = 'store',
}) => {
  const [mode, setMode] = useState<'store' | 'product'>(product ? initialMode : 'store');
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [cardBlob, setCardBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { formatPrice, language } = useLanguageCurrency();

  // Reset mode when product changes
  useEffect(() => {
    if (product && initialMode === 'product') {
      setMode('product');
    } else {
      setMode('store');
    }
  }, [product, initialMode, isOpen]);

  // Generate the card whenever mode or product changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsGenerating(true);

    const generate = async () => {
      try {
        const result = await generateShareCard({
          mode,
          product: mode === 'product' ? product : null,
          formattedPrice: product ? formatPrice(product.price) : undefined,
          storeName: storeSettings?.storeName || 'GLADYNS ALL ACROSS',
          storeTagline: storeSettings?.storeDescription || 'Curated studio audio, smart home technology, electronics & timeless atelier.',
          websiteUrl: window.location.origin,
        });

        if (isMounted) {
          setCardImage(result.dataUrl);
          setCardBlob(result.blob);
        }
      } catch (err) {
        console.error('Failed to generate share card:', err);
      } finally {
        if (isMounted) {
          setIsGenerating(false);
        }
      }
    };

    generate();

    return () => {
      isMounted = false;
    };
  }, [isOpen, mode, product, formatPrice, storeSettings]);

  if (!isOpen) return null;

  const rawOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://www.gladyns.store';
  const cleanOrigin = (rawOrigin.includes('gladyns.store') && !rawOrigin.includes('www.gladyns.store'))
    ? rawOrigin.replace('://gladyns.store', '://www.gladyns.store')
    : rawOrigin;

  const currentUrl = mode === 'product' && product
    ? `${cleanOrigin}/product/${product.id}`
    : cleanOrigin;

  const shareText = mode === 'product' && product
    ? (language === 'fr'
      ? `Découvrez "${product.name}" chez GLADYNS — ${formatPrice(product.price)}. Qualité supérieure et garantie officielle.\n${currentUrl}`
      : `Discover "${product.name}" at GLADYNS Maison — ${formatPrice(product.price)}. Curated quality with complimentary warranty.\n${currentUrl}`)
    : (language === 'fr'
      ? `Découvrez GLADYNS — Électronique haut de gamme, systèmes audio, électroménager intelligent et mode intemporelle.\n${currentUrl}`
      : `Explore GLADYNS Maison — Haute electronics, studio audio, smart home technology, and timeless apparel.\n${currentUrl}`);

  // 1. Copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // 2. Download Image
  const handleDownload = () => {
    if (!cardImage) return;
    const fileName = mode === 'product' && product
      ? `gladyns-${product.slug || 'piece'}-card.png`
      : 'gladyns-maison-official-card.png';
    downloadShareCard(cardImage, fileName);
  };

  // 3. Web Share API (native mobile share sheet with image file!)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        const shareData: ShareData = {
          title: mode === 'product' && product ? product.name : (storeSettings?.storeName || 'GLADYNS'),
          text: shareText,
          url: currentUrl,
        };

        // Attach image file if supported
        if (cardBlob && navigator.canShare) {
          const file = new File(
            [cardBlob], 
            mode === 'product' ? 'gladyns-piece.png' : 'gladyns-maison.png', 
            { type: 'image/png' }
          );
          if (navigator.canShare({ files: [file] })) {
            shareData.files = [file];
          }
        }

        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or aborted
      }
    } else {
      handleCopyLink();
    }
  };

  // 4. WhatsApp Share
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  // 5. Facebook Share
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;

  // 6. X (Twitter) Share
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col my-auto">
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-white tracking-tight">
                {language === 'fr' ? 'Partager l\'Atelier' : 'Share GLADYNS Maison'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'fr' ? 'Carte graphique haute définition pour réseaux sociaux' : 'Generate luxury branded card for WhatsApp Status & Stories'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs (if product is present) */}
        {product && (
          <div className="px-5 sm:px-6 pt-4 pb-1">
            <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => setMode('product')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mode === 'product'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{language === 'fr' ? 'Cette Pièce' : 'This Product'}</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('store')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mode === 'store'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>{language === 'fr' ? 'Tout le Site' : 'Entire Boutique'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Card Preview Canvas Area */}
        <div className="p-5 sm:p-6 flex flex-col items-center">
          <div className="relative w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-slate-950 flex items-center justify-center group">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                <span className="text-xs font-mono">{language === 'fr' ? 'Génération de la carte HD...' : 'Generating HD Card...'}</span>
              </div>
            ) : cardImage ? (
              <>
                <img
                  src={cardImage}
                  alt="GLADYNS Share Card"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="text-[11px] font-mono text-white bg-slate-900/90 px-3 py-1.5 rounded-full border border-white/20">
                    1080×1080 HD Preview
                  </span>
                </div>
              </>
            ) : (
              <span className="text-xs text-slate-500">{language === 'fr' ? 'Échec de la génération du visuel' : 'Failed to generate graphic'}</span>
            )}
          </div>

          <p className="text-[11px] text-slate-400 text-center mt-3 font-light">
            {mode === 'product'
              ? (language === 'fr'
                ? `Comprend la photo de ${product?.name}, les spécifications vérifiées et le prix en CFA.`
                : `Includes ${product?.name} photo, certified specs, and active CFA pricing.`)
              : (language === 'fr'
                ? 'Comprend le logo officiel GLADYNS, les détails de la boutique et le lien certifié.'
                : 'Includes official GLADYNS crest, boutique details, and verified website link.')}
          </p>
        </div>

        {/* Actions & Sharing Channels */}
        <div className="p-5 sm:p-6 bg-slate-950/60 border-t border-white/10 space-y-3.5">
          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* WhatsApp Direct Share */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer active:scale-[0.98]"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white" />
              <span>{language === 'fr' ? 'Partager sur WhatsApp' : 'Share to WhatsApp'}</span>
            </a>

            {/* Native Mobile Share / System Apps */}
            <button
              type="button"
              onClick={handleNativeShare}
              className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Share2 className="w-4 h-4" />
              <span>{language === 'fr' ? 'Partager via applications...' : 'Share via Apps...'}</span>
            </button>
          </div>

          {/* Secondary Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {/* Download Graphic (PNG) */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating || !cardImage}
              className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title={language === 'fr' ? 'Télécharger dans la galerie' : 'Download image to phone/computer gallery'}
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'fr' ? "Télécharger" : 'Save Image'}</span>
            </button>

            {/* Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title={language === 'fr' ? 'Copier le lien du site' : 'Copy direct website link'}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">{language === 'fr' ? 'Copié !' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'fr' ? 'Copier le lien' : 'Copy Link'}</span>
                </>
              )}
            </button>

            {/* Social Outlets (X & Facebook) */}
            <div className="col-span-2 sm:col-span-1 flex items-center gap-2">
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                title="Share on X (Twitter)"
              >
                <span>{language === 'fr' ? 'Sur X' : 'Post on X'}</span>
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                title="Share on Facebook"
              >
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
