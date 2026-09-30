import React from 'react';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  Navigation,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Mail,
  Store,
} from 'lucide-react';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';
import { getWhatsAppLink, WhatsAppIcon } from './WhatsAppWidget';
import { StoreSettings } from '../types/store';
import defaultShopImg from '../assets/images/workshop_textile_banner_1790121031293.jpg';

interface StoreLocatorPageProps {
  onBackToShop: () => void;
  onOpenAboutUsPage: () => void;
  storeSettings?: StoreSettings;
}

export const StoreLocatorPage: React.FC<StoreLocatorPageProps> = ({
  onBackToShop,
  onOpenAboutUsPage,
  storeSettings,
}) => {
  const { language } = useLanguageCurrency();
  const isFr = language === 'fr';
  const storeName = storeSettings?.storeName || 'GLADYNS';

  const stores = [
    {
      id: 'porto',
      city: 'Porto',
      country: 'Portugal',
      title: isFr ? 'Studio Central & Design' : 'Central Curation & Design Lab',
      address: 'Rua Miguel Bombarda 142, 4050-377 Porto, Portugal',
      hours: isFr ? 'Lun - Sam : 10h00 - 19h00' : 'Mon - Sat: 10:00 AM - 7:00 PM',
      phone: '+351 22 600 1420',
      badge: isFr ? 'Flagship Principal' : 'Primary Flagship',
      mapsUrl: 'https://maps.google.com/?q=Rua+Miguel+Bombarda+142+Porto+Portugal',
    },
    {
      id: 'florence',
      city: 'Florence (Firenze)',
      country: 'Italie',
      title: isFr ? 'Maison & Tannerie Végétale' : 'Tuscan Leathercraft House',
      address: 'Via de’ Tornabuoni 28, 50123 Firenze FI, Italy',
      hours: isFr ? 'Mar - Dim : 10h30 - 19h30' : 'Tue - Sun: 10:30 AM - 7:30 PM',
      phone: '+39 055 212 800',
      badge: isFr ? 'Maroquinerie D\'Exception' : 'Fine Leather Lab',
      mapsUrl: 'https://maps.google.com/?q=Via+de+Tornabuoni+28+Firenze+Italy',
    },
    {
      id: 'milan',
      city: 'Milan (Milano)',
      country: 'Italie',
      title: isFr ? 'Showroom Couture & Maille' : 'Knitwear & Couture Showroom',
      address: 'Via Monte Napoleone 12, 20121 Milano MI, Italy',
      hours: isFr ? 'Lun - Sam : 10h00 - 19h00' : 'Mon - Sat: 10:00 AM - 7:00 PM',
      phone: '+39 02 760 0120',
      badge: isFr ? 'Showroom Mode' : 'Fashion Showroom',
      mapsUrl: 'https://maps.google.com/?q=Via+Monte+Napoleone+12+Milano+Italy',
    },
    {
      id: 'paris',
      city: 'Paris',
      country: 'France',
      title: isFr ? 'Boutique Éphémère Le Marais' : 'Le Marais Boutique & Concierge',
      address: '74 Rue Vieille du Temple, 75003 Paris, France',
      hours: isFr ? 'Lun - Dim : 11h00 - 19h30' : 'Mon - Sun: 11:00 AM - 7:30 PM',
      phone: '+33 1 42 78 74 00',
      badge: isFr ? 'Boutique Capitale' : 'Capital Flagship',
      mapsUrl: 'https://maps.google.com/?q=74+Rue+Vieille+du+Temple+75003+Paris+France',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 animate-in fade-in duration-200">
      {/* Top Bar Navigation */}
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
            STORE LOCATOR & EXPERIENCES
          </span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-slate-950 text-white py-14 sm:py-20 border-b border-slate-800 relative overflow-hidden">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-bold">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>{isFr ? 'Nous Trouver en Europe' : 'Global Store Network'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight">
            {isFr ? 'Boutiques GLADYNS' : 'Find GLADYNS Boutiques'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-sans leading-relaxed">
            {isFr
              ? 'Découvrez nos espaces de vente et showrooms d\'exception à Porto, Florence, Milan et Paris.'
              : 'Visit our curation labs and flagship boutiques in Porto, Florence, Milan, and Paris.'}
          </p>
        </div>
      </div>

      {/* Stores List */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Featured Flagship Boutique & Workshop from Admin Settings */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden group">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
            {/* Shop Image */}
            <div className="lg:col-span-6 relative min-h-[280px] lg:min-h-full overflow-hidden bg-slate-950">
              <img
                src={storeSettings?.aboutUs?.image || defaultShopImg}
                alt={`${storeName} Flagship Boutique`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
              <div className="absolute top-4 left-4">
                <span className="text-[10px] font-mono uppercase tracking-widest font-black bg-blue-600 text-white px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>{isFr ? `Flagship Principal ${storeName}` : `${storeName} Primary Flagship`}</span>
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-sm font-bold text-white">{storeName} Central Flagship</p>
                <p className="text-xs text-slate-300 font-sans truncate">{storeSettings?.contactAddress || 'Porto & Florence'}</p>
              </div>
            </div>

            {/* Details */}
            <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/80">
                    {isFr ? 'Siège & Espace Boutique' : 'Headquarters & Boutique'}
                  </span>
                  <h3 className="text-2xl font-display font-bold text-slate-950 mt-2">
                    {storeSettings?.storeName || 'GLADYNS BOUTIQUE'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {storeSettings?.storeDescription || (isFr ? 'Espace d\'exposition et essayages privés sur rendez-vous.' : 'Curated showroom and private fitting lab by appointment.')}
                  </p>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 font-sans pt-3 border-t border-slate-100">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-900">{storeSettings?.contactAddress || 'Rua Miguel Bombarda 142, 4050-377 Porto, Portugal'}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{storeSettings?.operatingHours || (isFr ? 'Lun - Sam : 10h00 - 19h00' : 'Monday – Saturday: 10:00 AM – 7:00 PM CET')}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{storeSettings?.contactPhone || '+33 1 23 45 67 89'}</span>
                  </div>

                  {storeSettings?.contactEmail && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{storeSettings.contactEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(storeSettings?.contactAddress || 'Porto Portugal')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer text-center"
                >
                  <Navigation className="w-4 h-4" />
                  <span>{isFr ? 'Itinéraire Maps' : 'Get Directions'}</span>
                </a>

                <a
                  href={getWhatsAppLink(
                    isFr
                      ? 'Bonjour, je souhaite réserver une visite privée à la boutique GLADYNS.'
                      : 'Hello, I would like to arrange a private appointment at GLADYNS boutique.'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4 text-emerald-700" />
                  <span>{isFr ? 'Contacter Concierge' : 'Contact Concierge'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="text-left pt-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
            {isFr ? 'RÉSEAU EUROPÉEN' : 'REGIONAL EUROPEAN LABS'}
          </span>
          <h3 className="text-xl font-display font-bold text-slate-950 mt-1">
            {isFr ? 'Nos Autres Espaces & Showrooms' : 'Our European Studio Network'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stores.map((st) => (
            <div
              key={st.id}
              className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/80">
                    {st.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{st.country}</span>
                </div>

                <div>
                  <h2 className="text-xl font-display font-bold text-slate-950">{st.city}</h2>
                  <p className="text-xs text-slate-500 font-medium">{st.title}</p>
                </div>

                <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100 font-sans">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{st.address}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{st.hours}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{st.phone}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <a
                  href={st.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{isFr ? 'Itinéraire Maps' : 'Get Directions'}</span>
                </a>

                <a
                  href={getWhatsAppLink(
                    isFr
                      ? `Bonjour, je souhaite réserver un rendez-vous sur-mesure à la boutique GLADYNS de ${st.city}.`
                      : `Hello, I would like to schedule a private fitting appointment at GLADYNS ${st.city}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isFr ? 'Rendez-vous' : 'Book Visit'}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
