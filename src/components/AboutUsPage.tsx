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
      year: '2018',
      title: isFr ? 'Fondation à Porto' : 'Porto Studio Founded',
      desc: isFr
        ? 'Création du premier studio de design et curation au cœur du Portugal.'
        : 'Creation of our first design and product curation studio in Northern Portugal.',
    },
    {
      year: '2020',
      title: isFr ? 'Engagement 100% Éco-Certifié' : '100% Organic & Traceable',
      desc: isFr
        ? 'Certification GOTS pour l\'ensemble des cotons et tannerie végétale sans sels de chrome.'
        : 'GOTS organic cotton certification and 100% vegetable-tanned leather processes.',
    },
    {
      year: '2022',
      title: isFr ? 'Expansion à Florence & Milan' : 'Florence & Milan Expansion',
      desc: isFr
        ? 'Partenariat exclusif avec des studios familiaux italiens spécialisés.'
        : 'Exclusive partnership with multigenerational Italian family studios in Tuscany.',
    },
    {
      year: '2025',
      title: isFr ? 'Boutique Officielle Directe' : 'Direct Digital Boutique',
      desc: isFr
        ? 'Lancement de notre expérience numérique mondiale sans intermédiaires pour nos membres patrons.'
        : 'Global digital boutique launch delivering direct-to-patron luxury without middlemen.',
    },
  ];

  const pillars = [
    {
      icon: Award,
      title: isFr ? 'Artisanat Multigénérationnel' : 'Multigenerational Craftsmanship',
      desc: isFr
        ? 'Chaque pièce est confectionnée à la main par des maîtres artisans héritiers d\'un savoir-faire séculaire.'
        : 'Every garment is handcrafted by master artisans with decades of inherited heritage and technique.',
    },
    {
      icon: ShieldCheck,
      title: isFr ? 'Micro-Séries Limitées' : 'Limited Micro-Batches',
      desc: isFr
        ? 'Production éthique limitée de 50 à 150 pièces numérotées pour garantir l\'exclusivité et zéro gaspillage.'
        : 'Strict micro-batch releases of 50 to 150 numbered units to guarantee exclusivity and eliminate waste.',
    },
    {
      icon: Globe,
      title: isFr ? 'Fibres 100% Traçables' : '100% Traceable Fibers',
      desc: isFr
        ? 'Laines certifiées non-mulesed, cotons biologiques GOTS et cuirs à tannage végétal naturel.'
        : 'Non-mulesed organic wools, GOTS certified organic cottons, and chrome-free vegetable leathers.',
    },
    {
      icon: Heart,
      title: isFr ? 'Garantie GLADYNS 2 Ans' : '2-Year GLADYNS Warranty',
      desc: isFr
        ? 'Prise en charge intégrale pour que vos pièces durent toute une vie.'
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
            <span>{isFr ? 'Maison d\'Artisanat Européen' : 'European Artisanal House'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white leading-tight">
            {storeSettings?.aboutUs.title || (isFr ? 'À Propos de GLADYNS Boutique' : 'About GLADYNS Boutique')}
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 font-sans max-w-2xl mx-auto leading-relaxed">
            {storeSettings?.aboutUs.content || (isFr
              ? 'Fondée entre Porto et Florence, GLADYNS réinvente le luxe contemporain à travers une confection éthique, des micro-séries limitées et un respect absolu de la matière.'
              : 'Founded between Porto and Florence, GLADYNS redefines modern luxury through ethical craftsmanship, limited micro-batches, and uncompromising raw materials.')}
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
              <img
                src={storeSettings?.aboutUs?.image || ''}
                alt={`${storeName} Official Boutique & Flagship`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
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
                  <span className="truncate">{storeSettings?.contactAddress || 'Porto & Florence'}</span>
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
                  {storeSettings?.aboutUs?.subtitle || (isFr ? 'L\'Art de la Confection Éthique' : 'The Art of Modern European Craft')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {storeSettings?.aboutUs?.content || (isFr
                    ? 'Chaque pièce naît d\'une collaboration étroite avec nos artisans régionaux. De la sélection des cotons et laines vierges aux finitions manuelles, nos créations incarnent une vision sans compromis.'
                    : 'Each acquisition emerges from a close partnership with regional craftsmen. From sourcing raw fibers to handmade buttonhole details, our collections uphold uncompromising precision.')}
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

        {/* Section 2: Studio Locations & Atelier Network */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-xs space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-blue-600 tracking-wider">
                {isFr ? 'RÉSEAU DE PARTENAIRES' : 'PARTNER NETWORK'}
              </span>
              <h3 className="text-2xl font-display font-bold text-slate-950 mt-1">
                {isFr ? 'Porto, Florence & Biella' : 'Porto, Florence & Biella'}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>{isFr ? 'Partenaires Certifiés UE' : 'EU Certified Partners'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-950">Porto Studio</span>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isFr
                  ? 'Spécialisé dans la confection de vestes de travail, cotons biologiques lisses et maroquinerie.'
                  : 'Specializing in chore coats, organic heavy twills, and structured leathercraft.'}
              </p>
            </div>

            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-950">Florence Studio</span>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isFr
                  ? 'Expertise en mailles fines de laine mérinos et tannerie végétale de Toscane.'
                  : 'Mastery in fine merino knits and Tuscan vegetable-tanned full-grain hides.'}
              </p>
            </div>

            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-950">Biella Mill</span>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isFr
                  ? 'Filatures de laine italienne responsable et tissus techniques haute précision.'
                  : 'Responsible Italian wool spinning and high-precision technical outerwear textiles.'}
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
                : 'Hello GLADYNS Concierge, I would like to inquire about your brand history and products.'
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
