import React, { useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Instagram,
  Twitter,
  Youtube,
  Music,
  Facebook,
  Share2,
} from 'lucide-react';
import { WhatsAppIcon, getWhatsAppLink } from './WhatsAppWidget';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';
import { StoreSettings } from '../types/store';

interface FooterProps {
  onSelectCategory: (category: string) => void;
  onOpenSection?: (section: 'hot-deals' | 'new-arrivals' | 'categories' | 'collection', category?: string) => void;
  onOpenCategoriesPage?: () => void;
  onOpenBrandPage?: () => void;
  onOpenAboutUsPage?: () => void;
  onOpenTermsPage?: () => void;
  onOpenRefundPolicyPage?: () => void;
  onOpenStoreLocatorPage?: () => void;
  onOpenCollectionsPage?: () => void;
  onOpenOrders?: () => void;
  onOpenProfile?: (tab?: 'profile' | 'addresses' | 'loyalty') => void;
  onOpenAuth?: () => void;
  onOpenShareModal?: () => void;
  storeSettings?: StoreSettings;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAboutUsPage,
  onOpenTermsPage,
  onOpenRefundPolicyPage,
  onOpenStoreLocatorPage,
  onOpenBrandPage,
  storeSettings,
}) => {
  const { language } = useLanguageCurrency();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [copiedStoreLink, setCopiedStoreLink] = useState(false);

  const handleShareStore = async () => {
    let storeUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.gladyns.store';
    if (storeUrl.includes('gladyns.store') && !storeUrl.includes('www.gladyns.store')) {
      storeUrl = storeUrl.replace('://gladyns.store', '://www.gladyns.store');
    }

    const shareTitle = storeSettings?.storeName || 'GLADYNS ALL ACROSS';
    const shareText = language === 'fr'
      ? 'Découvrez GLADYNS ALL ACROSS — Instruments de musique, électronique haute fidélité, électroménager et standards d\'excellence.'
      : 'Discover GLADYNS ALL ACROSS — Musical instruments, precision audio electronics, autonomous smart home appliances, and living standards.';

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: storeUrl,
        });
        return;
      } catch (err) {
        // User dismissed native share sheet
      }
    }

    // Fallback: copy link to clipboard with confirmation
    try {
      await navigator.clipboard?.writeText(storeUrl);
      setCopiedStoreLink(true);
      setTimeout(() => setCopiedStoreLink(false), 2500);
    } catch (_) {}
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 3000);
  };

  return (
    <footer className="bg-zinc-950 text-zinc-400 text-xs border-t border-zinc-900 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Minimalist Grid */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-zinc-900">
          
          {/* Brand Info */}
          <div className="space-y-2 max-w-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm shrink-0">
                <img src="/assets/logo-icon.png" alt="GLADYNS Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-lg font-display font-bold tracking-tight text-white block uppercase">
                {storeSettings?.storeName || 'GLADYNS'}
              </span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              {storeSettings?.storeDescription || (language === 'fr'
                ? 'Une curation rigoureuse unissant design d\'exception et technologie.'
                : 'Rigorous curation uniting exceptional design and precision technology.')}
            </p>
            {storeSettings?.contactAddress && (
              <p className="text-[11px] text-zinc-500 font-sans">
                {storeSettings.contactAddress}
              </p>
            )}
          </div>

          {/* Minimalist Newsletter Form */}
          <div className="space-y-2 max-w-xs w-full">
            <span className="text-white font-semibold tracking-wider text-[10px] uppercase block">
              {language === 'fr' ? 'Lettre d\'Information' : 'Newsletter Dispatch'}
            </span>
            <form onSubmit={handleSubscribe} className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={language === 'fr' ? 'Votre adresse email' : 'Enter your email'}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="absolute right-1 top-1 bottom-1 px-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs flex items-center justify-center transition-colors cursor-pointer"
              >
                {subscribed ? <Check className="w-3 h-3 text-white" /> : <ArrowUpRight className="w-3 h-3" />}
              </button>
            </form>
            {subscribed ? (
              <p className="text-[10px] text-blue-400">
                {language === 'fr' ? 'Inscription confirmée.' : 'Subscription confirmed.'}
              </p>
            ) : (
              <p className="text-[9px] text-zinc-500">
                {language === 'fr' 
                  ? 'Désabonnement en 1 clic. Données protégées sans spam (CAN-SPAM & RGPD).' 
                  : '1-click unsubscribe anytime. Zero spam policy (CAN-SPAM & GDPR compliant).'}
              </p>
            )}
          </div>
        </div>

        {/* Middle Navigation Row & Social Icons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-6">
          
          {/* Flat Horizontal Menu */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-medium text-zinc-300">
            <button
              onClick={() => onOpenAboutUsPage?.()}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              {language === 'fr' ? 'À propos' : 'About Us'}
            </button>
            <button
              onClick={() => onOpenBrandPage?.()}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              {language === 'fr' ? 'Notre Marque' : 'Our Brand'}
            </button>
            <button
              onClick={() => onOpenStoreLocatorPage?.()}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              {language === 'fr' ? 'Nous trouver' : 'Store Locator'}
            </button>
            <button
              onClick={() => onOpenTermsPage?.()}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              {language === 'fr' ? 'Conditions Générales' : 'Terms & Conditions'}
            </button>
            <button
              onClick={() => onOpenRefundPolicyPage?.()}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              {language === 'fr' ? 'Politique de Remboursement' : 'Refund Policy'}
            </button>
          </div>

          {/* Social Icons Bar & Share Boutique */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Share Boutique / Website Link (Native Share) */}
            <button
              type="button"
              onClick={handleShareStore}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-blue-600 text-zinc-300 hover:text-white border border-zinc-800 hover:border-blue-500 transition-all font-semibold text-xs cursor-pointer shadow-xs group"
              title={language === 'fr' ? 'Partager le site GLADYNS' : 'Share GLADYNS Website'}
            >
              {copiedStoreLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">{language === 'fr' ? 'Lien copié !' : 'Link copied!'}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-blue-400 group-hover:text-white group-hover:scale-110 transition-transform" />
                  <span>{language === 'fr' ? 'Partager la Maison' : 'Share Store'}</span>
                </>
              )}
            </button>

            {/* Direct WhatsApp Store Share Button */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                (language === 'fr' ? 'Découvrez la boutique GLADYNS ALL ACROSS : ' : 'Discover GLADYNS ALL ACROSS: ') +
                (typeof window !== 'undefined' && window.location.origin.includes('gladyns.store')
                  ? 'https://www.gladyns.store'
                  : typeof window !== 'undefined'
                  ? window.location.origin
                  : 'https://www.gladyns.store')
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share store on WhatsApp"
              title={language === 'fr' ? 'Partager la boutique sur WhatsApp' : 'Share store on WhatsApp'}
              className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all cursor-pointer border border-emerald-500 shadow-2xs"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
            </a>
            {storeSettings?.socialLinks.instagram && (
              <a
                href={storeSettings.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-blue-600 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-zinc-800"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
            )}
            {storeSettings?.socialLinks.twitter && (
              <a
                href={storeSettings.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-blue-600 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-zinc-800"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
            )}
            {storeSettings?.socialLinks.facebook && (
              <a
                href={storeSettings.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-blue-600 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-zinc-800"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
            )}
            <a
              href={getWhatsAppLink(language === 'fr' ? 'Bonjour GLADYNS, j\'ai une question.' : 'Hello GLADYNS, I have a question.', storeSettings?.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all cursor-pointer border border-emerald-500"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Quiet Bottom Copyright Row */}
        <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-zinc-500">
          <p>© {new Date().getFullYear()} {storeSettings?.storeName || 'GLADYNS'}. {language === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}</p>
          <div className="flex items-center gap-4">
            <button 
              type="button" 
              onClick={() => onOpenTermsPage?.()} 
              className="hover:text-blue-400 cursor-pointer transition-colors"
            >
              {language === 'fr' ? 'Confidentialité' : 'Privacy Policy'}
            </button>
            <button 
              type="button" 
              onClick={() => onOpenTermsPage?.()} 
              className="hover:text-blue-400 cursor-pointer transition-colors"
            >
              {language === 'fr' ? 'Mentions Légales' : 'Legal Notices'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
