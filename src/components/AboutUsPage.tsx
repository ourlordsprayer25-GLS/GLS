import React from 'react';
import {
  ArrowLeft,
  Sparkles,
  Award,
  ShieldCheck,
  Globe,
  Heart,
  Users,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';
import { WHATSAPP_FORMATTED, getWhatsAppLink, WhatsAppIcon } from './WhatsAppWidget';
import { StoreSettings } from '../types/store';

interface AboutUsPageProps {
  onBackToShop: () => void;
  onOpenCollectionsPage: () => void;
  onOpenBrandPage: () => void;
  storeSettings?: StoreSettings;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({
  onBackToShop,
  onOpenCollectionsPage,
  onOpenBrandPage,
  storeSettings,
}) => {
  const { language } = useLanguageCurrency();

  const isFr = language === 'fr';
  const storeName = storeSettings?.storeName || 'GLADYNS';

  const milestones = [
    {
      year: isFr ? 'Avril 2026' : 'April 2026',
      title: isFr ? 'Le Premier Projet Web' : 'First Online Store Created',
      desc: isFr
        ? 'Lancement de notre toute première boutique numérique et début passionné de notre aventure e-commerce.'
        : 'Creation of our very first e-commerce store and catalog, marking the start of our digital journey.',
    },
    {
      year: isFr ? 'Mai – Juil. 2026' : 'May – July 2026',
      title: isFr ? '8+ Versions & Résilience' : '8+ Iterations & Technical Resilience',
      desc: isFr
        ? 'Conception et mise à l\'épreuve de plus de 8 plateformes web différentes. Chaque défi rencontré a forgé notre expertise.'
        : 'Building and testing over 8 different website architectures. Overcoming early setbacks to build an unshakeable technical foundation.',
    },
    {
      year: isFr ? 'Août – Sept. 2026' : 'Aug – Sept 2026',
      title: isFr ? 'Refonte Intégrale & Qualité' : 'Architecture & Quality Overhaul',
      desc: isFr
        ? 'Intégration du système de commandes en temps réel, factures sécurisées, logistique de livraison et design moderne.'
        : 'Comprehensive overhaul integrating live order pipelines, luxury invoice generation, and bank-grade data security.',
    },
    {
      year: isFr ? 'Octobre 2026' : 'October 2026',
      title: isFr ? 'Lancement Officiel GLADYNS' : 'Official GLADYNS Marketplace Launch',
      desc: isFr
        ? 'Consécration de nos efforts : ouverture officielle de la marketplace moderne, rapide et fiable au service de nos clients.'
        : 'The triumphant official launch: an ultra-fast, robust, and beautiful digital department store built to serve our patrons with excellence.',
    },
  ];

  const pillars = [
    {
      icon: Award,
      title: isFr ? 'Ingénierie de Haute Précision' : 'High-Precision Engineering',
      desc: isFr
        ? 'Chaque équipement est rigoureusement sélectionné et testé pour offrir des performances acoustiques et technologiques de pointe.'
        : 'Every piece of equipment is meticulously calibrated and tested to deliver cutting-edge acoustic and technical performance.',
    },
    {
      icon: ShieldCheck,
      title: isFr ? 'Standards Sans Compromis' : 'Uncompromising Standards',
      desc: isFr
        ? 'Sélection stricte d\'appareils certifiés garantissant longévité, fiabilité et zéro compromis sur la qualité.'
        : 'Strict curation of certified devices guaranteeing endurance, operational reliability, and uncompromising quality.',
    },
    {
      icon: Globe,
      title: isFr ? 'Conception Durable & Certifiée' : 'Certified Sustainable Design',
      desc: isFr
        ? 'Matériaux nobles, alliages d\'aluminium haute résistance et composants certifiés conformes aux normes environnementales.'
        : 'Aerospace-grade aluminum alloys, durable engineering, and eco-certified components built to last.',
    },
    {
      icon: Heart,
      title: isFr ? 'Garantie GLADYNS 2 Ans' : '2-Year GLADYNS Warranty',
      desc: isFr
        ? 'Prise en charge intégrale pour que vos équipements fonctionnent parfaitement au quotidien.'
        : 'Complimentary device and product repairs or replacements for 2 full years on all items.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 animate-in fade-in duration-200">
      
      {/* Top Sticky Navigation Bar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-[60px] sm:top-[68px] z-30 shadow-2xs">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={onBackToShop}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-xl border border-slate-200/80"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isFr ? 'Retour à la boutique' : 'Back to shop'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/80">
              GLADYNS MANIFESTO
            </span>
          </div>
        </div>
      </div>

      {/* Hero Banner Section */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-16 sm:py-24 border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/60 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{isFr ? 'Boutique & Curation d\'Excellence' : 'Curated Department House & Boutique'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white leading-tight">
            {storeSettings?.aboutUs.title || (isFr ? 'À Propos de GLADYNS Boutique' : 'About GLADYNS Boutique')}
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 font-sans max-w-2xl mx-auto leading-relaxed">
            {storeSettings?.aboutUs.content || (isFr
              ? 'GLADYNS incarne l\'excellence du commerce moderne avec une sélection rigoureuse d\'appareils électroniques, d\'équipements audio et d\'électroménager intelligent au standard le plus élevé.'
              : 'GLADYNS is a modern multi-department store curating premium electronics, studio musical instruments, and autonomous smart home appliances. Every department represents uncompromising engineering, sustainable materials, and rigorous functional design.')}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onBackToShop}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
            >
              <span>{isFr ? 'Découvrir la Boutique' : 'Explore Boutique'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenBrandPage}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <span>{isFr ? 'Histoire de Marque' : 'Brand Story'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Shop & Atelier Showcase Section */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 pt-10">
        <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl bg-slate-900 group">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
            {/* Shop Image */}
            <div className="lg:col-span-7 relative min-h-[340px] lg:min-h-full overflow-hidden bg-slate-950">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950 pointer-events-none" />
              <img
                src={storeSettings?.aboutUs?.image || '/assets/gladyns_store_preview.png'}
                alt={`${storeName} Official Boutique & Flagship`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const fallback = '/assets/gladyns_store_preview.png';
                  if (target.src !== fallback) {
                    target.src = fallback;
                  }
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[1.12] contrast-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
              
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest font-black bg-blue-600 text-white px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isFr ? `Boutique Officielle ${storeName}` : `Official ${storeName} Boutique`}</span>
                </span>
                {storeSettings?.aboutUs?.foundedYear && (
                  <span className="text-[10px] font-mono uppercase tracking-widest font-bold bg-white/90 backdrop-blur-sm text-slate-900 px-3 py-1.5 rounded-full shadow-xs">
                    {isFr ? 'Depuis' : 'Est.'} {storeSettings.aboutUs.foundedYear}
                  </span>
                )}
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 bg-black/40 backdrop-blur-md p-2.5 rounded-xl border border-white/10 w-max max-w-full">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="truncate">{storeSettings?.contactAddress || "Habitat Extension, E 24, Abidjan, Côte d'Ivoire"}</span>
                </div>
              </div>
            </div>

            {/* Shop Narrative Panel */}
            <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white space-y-6">
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-blue-400 block">
                  {isFr ? `ESPACE DE CRÉATION ${storeName.toUpperCase()}` : `WELCOME TO ${storeName.toUpperCase()}`}
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white leading-tight">
                  {storeSettings?.aboutUs?.subtitle || (isFr ? 'Standards d\'Excellence & Ingénierie Moderne' : 'Curated Multi-Department House & Living Standards')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {storeSettings?.aboutUs?.content || (isFr
                    ? 'GLADYNS est un grand magasin moderne sélectionnant des équipements électroniques haut de gamme, des instruments de musique de studio et des appareils électroménagers autonomes. Chaque rayon représente une ingénierie sans compromis.'
                    : 'GLADYNS is a modern multi-department store curating premium electronics, studio musical instruments, and autonomous smart home appliances. Every department represents uncompromising engineering, sustainable materials, and rigorous functional design.')}
                </p>

                {storeSettings?.aboutUs?.missionStatement && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block">
                      {isFr ? 'Notre Manifeste' : 'Our Creed'}
                    </span>
                    <p className="text-xs text-slate-200 font-serif italic">
                      "{storeSettings.aboutUs.missionStatement}"
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span className="truncate">{storeSettings?.operatingHours || (isFr ? 'Lun - Sam : 10h - 19h' : 'Mon - Sat: 10:00 - 19:00')}</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-white shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span>100% Traceable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-12 space-y-16">
        
        {/* Section 1: The 4 Core Pillars */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-950">
              {isFr ? 'Nos Engagements & Piliers' : 'Our Core Commitments'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              {isFr
                ? 'Une philosophie axée sur la durabilité, la transparence et la perfection esthétique.'
                : 'A philosophy built on durability, total transparency, and aesthetic mastery.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {pillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-950">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Studio Locations & Service Network */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-xs space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-blue-600 tracking-wider">
                {isFr ? 'NOTRE RÉSEAU & INFRASTRUCTURE' : 'OUR SERVICE & LOGISTICS NETWORK'}
              </span>
              <h3 className="text-2xl font-display font-bold text-slate-950 mt-1">
                {isFr ? 'Showroom, Contrôle Qualité & Service Client' : 'Flagship Boutique, Quality & Direct Care'}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>{storeSettings?.contactAddress || "Habitat Extension, E 24, Abidjan, Côte d'Ivoire"}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-950">{isFr ? 'Showroom & Siège Central' : 'Central Flagship Hub'}</span>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                  {isFr ? 'Abidjan' : 'HQ Lab'}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isFr
                  ? 'Espace d\'exposition, gestion des stocks et accueil personnalisé pour nos clients et membres.'
                  : 'Official curation showroom, inventory management, and private appointments for our members.'}
              </p>
            </div>

            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-950">{isFr ? 'Contrôle Qualité Rigoureux' : 'Rigorous Quality Testing'}</span>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                  100% {isFr ? 'Certifié' : 'Verified'}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isFr
                  ? 'Vérification méticuleuse de chaque produit audio, équipement électronique et appareil électroménager avant expédition.'
                  : 'Multi-point verification and operational testing of every electronic device, acoustic system, and appliance.'}
              </p>
            </div>

            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-950">{isFr ? 'Expédition Express & Suivi' : 'Express Courier Dispatch'}</span>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                  {isFr ? 'En Direct' : 'Live Tracking'}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isFr
                  ? 'Livraison rapide avec suivi en 5 étapes, bons de livraison officiels et assistance conciergerie dédiée.'
                  : 'Swift dispatch with live 5-stage tracking, official waybills, and dedicated concierge direct support.'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Interactive Timeline */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-950">
              {isFr ? 'Notre Histoire & Chronologie' : 'Our Milestone Journey'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              {isFr
                ? 'Quelques grandes étapes qui ont façonné l\'identité GLADYNS.'
                : 'Key moments that shaped the GLADYNS artisanal standard.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-display font-extrabold text-blue-600">
                    {m.year}
                  </span>
                  <Compass className="w-5 h-5 text-slate-300" />
                </div>
                <h4 className="text-base font-bold text-slate-950 mb-1">{m.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Concierge & Support Direct Contact */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isFr ? 'Assistance Directe WhatsApp Studio' : 'WhatsApp Live Studio Concierge'}</span>
            </div>
            <h3 className="text-2xl font-display font-bold text-white">
              {isFr ? 'Besoin d\'un conseil personnalisé ?' : 'Need personalized assistance or advice?'}
            </h3>
            <p className="text-xs text-slate-300 max-w-md">
              {isFr
                ? 'Nos conseillers produits répondent directement à toutes vos questions sous 5 minutes.'
                : 'Connect directly with our category experts and product specialists in under 5 minutes.'}
            </p>
          </div>

          <a
            href={getWhatsAppLink(
              isFr
                ? 'Bonjour Concierge GLADYNS, je souhaiterais obtenir des informations sur l\'histoire et les produits de votre boutique.'
                : 'Hello GLADYNS Concierge, I would like to inquire about your brand history and products.',
              storeSettings?.whatsappNumber
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/20 shrink-0 flex items-center gap-2.5"
          >
            <WhatsAppIcon className="w-4 h-4 text-slate-950" />
            <span>{isFr ? 'Discuter sur WhatsApp' : 'Chat on WhatsApp'}</span>
          </a>
        </div>

      </div>
    </div>
  );
};
