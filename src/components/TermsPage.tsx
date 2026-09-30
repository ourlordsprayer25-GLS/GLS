import React from 'react';
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  RotateCcw,
  Lock,
  Scale,
  CheckCircle2,
  HelpCircle,
  Truck,
} from 'lucide-react';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';
import { getWhatsAppLink, WhatsAppIcon } from './WhatsAppWidget';
import { StoreSettings } from '../types/store';

interface TermsPageProps {
  onBackToShop: () => void;
  onOpenAboutUsPage: () => void;
  onOpenRefundPolicyPage?: () => void;
  storeSettings?: StoreSettings;
}

export const TermsPage: React.FC<TermsPageProps> = ({
  onBackToShop,
  onOpenAboutUsPage,
  onOpenRefundPolicyPage,
  storeSettings,
}) => {
  const { language } = useLanguageCurrency();
  const isFr = language === 'fr';

  const sections = [
    {
      icon: Scale,
      title: isFr ? '1. Dispositions Générales & Mentions Légales' : '1. General Provisions & Legal Information',
      content: storeSettings?.terms?.content || (isFr
        ? 'Les présentes conditions générales de vente s\'appliquent à toutes les commandes passées sur la boutique officielle GLADYNS (Maison GLADYNS Europe). En effectuant un achat, le client accepte sans réserve les termes et garanties stipulés.'
        : 'These terms and conditions apply to all purchases placed through the official GLADYNS boutique. By completing an order, the customer agrees unconditionally to all service terms and warranty protocols.'),
    },
    {
      icon: ShieldCheck,
      title: isFr ? '2. Garantie GLADYNS 2 Ans & Qualité' : '2. 2-Year GLADYNS Warranty & Quality Standard',
      content: storeSettings?.terms?.warrantyPolicy || (isFr
        ? 'Toutes nos pièces bénéficient d\'une garantie gratuite de 2 ans. En cas de défaut de fabrication, matériel ou de fonctionnement, nous prenons en charge la réparation ou le remplacement intégral.'
        : 'All curated items and equipment come with a complimentary 2-year GLADYNS warranty. In the event of functional, material, or hardware issues, we repair or replace your item free of charge.'),
    },
    {
      icon: RotateCcw,
      title: isFr ? '3. Retours Gratuits sous 30 Jours & Remboursements' : '3. 30-Day Free Returns & Instant Refunds',
      content: storeSettings?.terms?.returnPolicy || (isFr
        ? 'Vous disposez d\'un délai de 30 jours à compter de la réception pour retourner tout article dans son état d\'origine avec étiquettes. Les étiquettes de retour prépayées neutres en carbone sont téléchargeables directement dans votre espace Suivi de Commande.'
        : 'You have 30 days from delivery to return any unworn item with original tags. Prepaid carbon-neutral return labels can be generated directly from your live Order Pipeline dashboard.'),
    },
    {
      icon: Lock,
      title: isFr ? '4. Confidentialité & Protection des Données (RGPD)' : '4. Privacy & Data Protection (GDPR Compliant)',
      content: storeSettings?.terms?.privacyPolicy || (isFr
        ? 'GLADYNS s\'engage à préserver la confidentialité absolue de vos données personnelles conformément au règlement européen (RGPD). Vos informations bancaires sont chiffrées en 256 bits via SSL/TLS et ne sont jamais conservées sur nos serveurs.'
        : 'GLADYNS is committed to absolute personal data privacy adhering strictly to EU GDPR standards. Payment processing is secured using 256-bit SSL encryption, and financial credentials are never stored on our servers.'),
    },
    {
      icon: Truck,
      title: isFr ? '5. Expédition Éco-Responsable & Livraisons' : '5. Eco-Friendly Shipping & Carbon Neutral Delivery',
      content: storeSettings?.terms?.shippingPolicy || (isFr
        ? 'Expédition express mondiale avec livraison neutre en carbone offerte sur toutes les commandes éligibles. Le suivi interactif en 5 étapes est disponible en temps réel pour tous nos membres.'
        : 'Global express dispatch with complimentary carbon-neutral courier delivery on all qualifying orders. Interactive 5-stage tracking is available in real time for all patrons.'),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 animate-in fade-in duration-200">
      {/* Top Navigation Header */}
      <div className="bg-white border-b border-slate-200/80 sticky top-[60px] sm:top-[68px] z-30 shadow-2xs">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={onBackToShop}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-xl border border-slate-200/80"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isFr ? 'Retour à la boutique' : 'Back to shop'}</span>
          </button>

          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/80">
            LEGAL & COMPLIANCE
          </span>
        </div>
      </div>

      {/* Main Banner */}
      <div className="bg-slate-950 text-white py-14 sm:py-20 border-b border-slate-800 relative overflow-hidden">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-bold">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>{isFr ? 'Cadre Juridique & Protection Client' : 'Legal Framework & Customer Rights'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight">
            {storeSettings?.terms.title || (isFr ? 'Conditions Générales de Vente' : 'Terms & Conditions of Sale')}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-sans leading-relaxed">
            {isFr
              ? `Dernière mise à jour : ${storeSettings?.terms?.lastUpdated || 'Septembre 2025'}. Informations légales, droits des consommateurs et engagements de la Maison GLADYNS.`
              : `Last updated: ${storeSettings?.terms?.lastUpdated || 'September 2025'}. Transparency, consumer rights, and workshop guarantees for all patrons.`}
          </p>
        </div>
      </div>

      {/* Terms Content */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="grid grid-cols-1 gap-6">
          {sections.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div
                key={idx}
                className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="text-base font-bold text-slate-950">{sec.title}</h2>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans pl-12">
                  {sec.content}
                </p>
                {idx === 2 && onOpenRefundPolicyPage && (
                  <div className="pl-12 pt-1">
                    <button
                      onClick={onOpenRefundPolicyPage}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isFr ? 'Consulter la page détaillée des retours et remboursements' : 'View full Returns & Refund Policy page'} &rarr;</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Live Support Box */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-950">
                {isFr ? 'Une question sur nos conditions ?' : 'Questions regarding our policies?'}
              </h3>
              <p className="text-xs text-slate-500">
                {isFr ? 'Notre support juridique et concierge vous répond directement.' : 'Contact our concierge support team anytime.'}
              </p>
            </div>
          </div>

          <a
            href={getWhatsAppLink(
              isFr
                ? 'Bonjour, je souhaiterais obtenir un renseignement concernant les Conditions Générales de GLADYNS.'
                : 'Hello, I have a query regarding GLADYNS Terms & Conditions.'
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-2"
          >
            <WhatsAppIcon className="w-4 h-4 text-slate-950" />
            <span>{isFr ? 'Contact Concierge' : 'Contact Support'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
