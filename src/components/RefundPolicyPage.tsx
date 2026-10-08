import React from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  ShieldCheck, 
  Clock, 
  Truck, 
  CreditCard, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  FileText
} from 'lucide-react';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';
import { getWhatsAppLink, WhatsAppIcon } from './WhatsAppWidget';
import { StoreSettings } from '../types/store';

interface RefundPolicyPageProps {
  onBackToShop: () => void;
  onOpenOrders?: (orderNumber?: string) => void;
  onOpenTermsPage?: () => void;
  storeSettings?: StoreSettings;
}

export const RefundPolicyPage: React.FC<RefundPolicyPageProps> = ({
  onBackToShop,
  onOpenOrders,
  onOpenTermsPage,
  storeSettings,
}) => {
  const { language } = useLanguageCurrency();
  const isFr = language === 'fr';

  const storeName = storeSettings?.storeName || 'GLADYNS';
  const policy = storeSettings?.refundPolicy;

  const returnDays = policy?.returnWindowDays || '30';

  const returnSteps = [
    {
      step: '01',
      title: isFr ? 'Initiez votre retour' : 'Initiate in Order Pipeline',
      description: isFr
        ? 'Rendez-vous sur votre espace "Suivi de Commande", sélectionnez votre commande et cliquez sur "Demander un retour" pour générer votre bordereau prépayé.'
        : 'Go to your live "Order Pipeline", select your order, and click "Request Return" to generate your prepaid carbon-neutral courier label.',
      icon: Package,
    },
    {
      step: '02',
      title: isFr ? 'Préparez votre colis' : 'Pack in Original Box',
      description: isFr
        ? `Replacez l'article non porté avec ses étiquettes de sécurité ${storeName} intactes dans son emballage d'origine.`
        : `Place the unworn piece with all original ${storeName} security tags intact into its original protective packaging.`,
      icon: RotateCcw,
    },
    {
      step: '03',
      title: isFr ? 'Expédition gratuite' : 'Complimentary Drop-off',
      description: isFr
        ? `Déposez votre colis au point relais ou convenez d'un enlèvement à domicile. Tous les frais d'expédition sont 100% pris en charge par ${storeName}.`
        : `Drop off your package at an authorized depot or schedule courier pickup. All return shipping expenses are 100% covered by ${storeName}.`,
      icon: Truck,
    },
    {
      step: '04',
      title: isFr ? `Remboursement ${storeName}` : `Swift ${storeName} Refund`,
      description: isFr
        ? 'Dès réception et vérification par notre équipe (sous 24-48h), votre remboursement est crédité directement sur votre moyen de paiement d\'origine.'
        : 'Upon reception and quality inspection (within 24-48h), your refund is immediately issued to your original payment method.',
      icon: CreditCard,
    },
  ];

  const highlights = [
    {
      icon: RotateCcw,
      title: isFr ? `${returnDays} Jours pour Décider` : `${returnDays}-Day Return Window`,
      desc: isFr ? 'Délai étendu à compter de la réception' : 'Extended grace period from delivery date',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Truck,
      title: isFr ? 'Retours 100% Gratuits' : '100% Free Return Courier',
      desc: isFr ? 'Bordereaux neutres en carbone prépayés' : 'Carbon-neutral prepaid shipping labels',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: CreditCard,
      title: isFr ? 'Remboursement Sous 48h' : '48h Swift Refund Release',
      desc: isFr ? 'Directement sur votre compte bancaire' : 'Direct credit to original payment method',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: ShieldCheck,
      title: isFr ? `Garantie ${storeName} 2 Ans` : `2-Year ${storeName} Warranty`,
      desc: isFr ? 'Protection totale contre les vices de fabrication' : 'Full structural and material protection',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24">
      {/* Top Header & Breadcrumb */}
      <div className="bg-slate-900 text-white relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-radial-[at_top_right] from-blue-900/30 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <button
              onClick={onBackToShop}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl transition-all cursor-pointer backdrop-blur-sm shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isFr ? 'Retour à la boutique' : 'Back to Shop'}</span>
            </button>

            {onOpenOrders && (
              <button
                onClick={() => onOpenOrders()}
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <Package className="w-4 h-4" />
                <span>{isFr ? 'Gérer Mes Retours / Commandes' : 'Manage Returns / Order Pipeline'}</span>
              </button>
            )}
          </div>

          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-[10px] font-mono uppercase tracking-widest font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isFr ? 'Politique Officielle de Retour & Remboursement' : 'Official Returns & Refund Policy'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white">
              {policy?.title || (isFr ? 'Politique de Remboursement' : 'Refund & Return Policy')}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed pt-1">
              {policy?.overview || (isFr
                ? `Chez GLADYNS, votre satisfaction est absolue. Si votre acquisition ne vous apporte pas entière satisfaction, vous disposez de ${returnDays} jours pour nous la retourner gratuitement.`
                : `At GLADYNS, we stand behind the exceptional quality and artisanal construction of every piece. If your acquisition does not fully meet your expectations, we provide a seamless ${returnDays}-day return window with 100% complimentary return shipping.`)}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-slate-400 font-mono">
              <span>{isFr ? 'Version officielle' : 'Official Version'} · {policy?.lastUpdated || (isFr ? 'Septembre 2025' : 'September 2025')}</span>
              <span>·</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isFr ? 'Retours offerts dans le monde entier' : 'Worldwide Free Returns'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 -mt-6 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights.map((h, i) => {
            const Icon = h.icon;
            return (
              <div 
                key={i} 
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-md flex items-center gap-4 hover:border-blue-300 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${h.bg} ${h.color} flex items-center justify-center shrink-0 shadow-2xs`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">
                    {h.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-2">
                    {h.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-12 space-y-12">

        {/* 4-Step How It Works Guide */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-8">
          <div className="max-w-2xl space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/80">
              {isFr ? 'PROCESSUS SIMPLE & TRANSPARENT' : 'SIMPLE & TRANSPARENT PROCESS'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-950">
              {isFr ? 'Comment effectuer un retour en 4 étapes' : 'How To Return Your Item in 4 Steps'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {policy?.stepByStepProcess || (isFr 
                ? 'Notre procédure est entièrement automatisée depuis votre espace membre. Suivez ces étapes simples pour un remboursement sans attente.'
                : 'Our procedure is fully automated directly inside your customer dashboard. Follow these clear steps for an immediate and hassle-free refund.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {returnSteps.map((stepItem, idx) => {
              const StepIcon = stepItem.icon;
              return (
                <div 
                  key={idx} 
                  className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 relative flex flex-col justify-between space-y-4 hover:bg-blue-50/30 hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-display font-black text-slate-300 group-hover:text-blue-600 transition-colors">
                      {stepItem.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 text-blue-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                      <StepIcon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {stepItem.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                      {stepItem.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isFr ? 'Garanti sans frais' : 'Guaranteed zero fee'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {onOpenOrders && (
            <div className="pt-4 flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {isFr ? 'Vous avez une commande à retourner ?' : 'Ready to request a return on an active order?'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {isFr ? 'Ouvrez votre Suivi de Commande et cliquez sur le bouton "Demander un retour".' : 'Access your Order Pipeline and click the "Request Return" button on any eligible delivery.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenOrders()}
                className="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-2"
              >
                <span>{isFr ? 'Accéder au Suivi de Commande' : 'Open Order Pipeline'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Detailed Clauses & Rules */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Eligibility & Exceptions */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Eligibility */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {isFr ? 'Conditions d\'Éligibilité au Retour' : 'Return Eligibility & Guidelines'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isFr ? `Critères d'acceptation par ${storeName}` : `Acceptance criteria verified by ${storeName}`}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                {policy?.eligibility || (isFr
                  ? `Pour que votre retour soit validé avec remboursement intégral, les articles doivent nous être retournés dans un délai de ${returnDays} jours calendaires à compter de la date de livraison. Chaque pièce doit être strictement non portée, non lavée, sans odeur ni trace d'usure, et comporter l'ensemble de ses étiquettes d'origine scellées ainsi que son emballage d'origine.`
                  : `To qualify for an immediate 100% full refund, items must be initiated within ${returnDays} calendar days from delivery date. Each piece must be in unworn, unwashed, and pristine condition, with all official ${storeName} tags, security seals, dust bags, and presentation packaging intact.`)}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  isFr ? 'Étiquettes d\'origine intactes' : 'Original security tags intact',
                  isFr ? 'Écrin & pochon protecteur inclus' : 'Original boutique packaging & dustbag included',
                  isFr ? 'Aucune altération ni retouche' : 'No tailoring or custom alterations',
                  isFr ? 'Bordereau de retour prépayé inclus' : 'Prepaid dispatch barcode attached',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Refunds Timeline & Method */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {isFr ? 'Modalités et Délais de Remboursement' : 'Refund Methods & Timelines'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isFr ? 'Crédit direct sur votre instrument de paiement' : 'Direct credit to your original payment vehicle'}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                {policy?.processingTime || (isFr
                  ? `Une fois votre colis réceptionné par nos équipes ${storeName}, notre contrôle qualité est réalisé sous 24 à 48 heures ouvrées. Dès approbation, le remboursement intégral (incluant les frais de livraison standard initiaux) est déclenché instantanément.`
                  : `Once your parcel is received by our ${storeName} inspection team, quality verification is finalized within 24 to 48 business hours. Upon approval, full refund release is triggered instantly to your original payment card or account.`)}
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    {isFr ? 'Délai bancaire estimé :' : 'Estimated bank clearance:'}{' '}
                    <strong>{isFr ? '2 à 5 jours ouvrés' : '2 to 5 business days'}</strong>
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Visa · Mastercard · Amex · Apple Pay · PayPal
                </span>
              </div>
            </div>

            {/* Exceptions */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {isFr ? 'Articles Non Éligibles au Retour' : 'Non-Returnable Exceptions'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isFr ? 'Exceptions légales et hygiène' : 'Tailored crafts and hygiene restrictions'}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                {policy?.exceptions || (isFr
                  ? `Conformément aux normes, les articles personnalisés (gravures spécifiques) et les logiciels ou consommables déballés ne peuvent pas faire l'objet d'un retour, sauf en cas de défaut de fabrication avéré couvert par notre garantie de 2 ans ${storeName}.`
                  : `In accordance with trade regulations, customized items, personalized engravings, and unsealed software or consumable media cannot be returned, except in case of a verified defect covered by our 2-Year ${storeName} Warranty.`)}
              </p>
            </div>
          </div>

          {/* Right Column: Concierge Help & Policy Links */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Concierge Contact Card */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white space-y-5 shadow-lg border border-slate-800">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <HelpCircle className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-display font-bold">
                  {isFr ? 'Besoin d\'aide pour un retour ?' : 'Need Assistance With a Return?'}
                </h3>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {isFr
                    ? `Notre Conciergerie ${storeName} est disponible 6j/7 pour vous aider à imprimer votre étiquette, organiser un enlèvement ou remplacer un article.`
                    : `Our ${storeName} Concierge is available 6 days a week to help generate labels, schedule courier pickups, or process replacements.`}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href={getWhatsAppLink(
                    isFr
                      ? `Bonjour, j'ai une question concernant un retour ou un remboursement sur ma commande ${storeName}.`
                      : `Hello, I have a question regarding a return or refund for my ${storeName} order.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>{isFr ? 'Contacter via WhatsApp' : 'Contact on WhatsApp'}</span>
                </a>

                {storeSettings?.contactEmail && (
                  <a
                    href={`mailto:${storeSettings.contactEmail}?subject=Return Inquiry`}
                    className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>{storeSettings.contactEmail}</span>
                  </a>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
                {storeSettings?.operatingHours || (isFr ? 'Lun – Sam : 10h00 – 19h00 CET' : 'Mon – Sat: 10:00 AM – 7:00 PM CET')}
              </div>
            </div>

            {/* Quick Links / Related Policies */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
                {isFr ? 'DOCUMENTS ASSOCIÉS' : 'RELATED POLICIES'}
              </h4>

              <div className="space-y-2">
                {onOpenTermsPage && (
                  <button
                    onClick={onOpenTermsPage}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {isFr ? 'Conditions Générales de Vente' : 'Terms & Conditions of Sale'}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                )}

                <button
                  onClick={onBackToShop}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {isFr ? 'Explorer la Collection' : 'Explore Collections'}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
