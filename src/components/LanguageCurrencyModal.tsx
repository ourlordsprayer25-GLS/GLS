import React, { useState } from 'react';
import { X, Globe, Check, Sparkles, DollarSign, MapPin, ArrowRight } from 'lucide-react';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';
import { Language } from '../types/localization';

export const LanguageCurrencyModal: React.FC = () => {
  const {
    language,
    setLanguage,
    currency,
    setCurrency,
    country,
    setCountry,
    allCurrencies,
    allCountries,
    t,
    isAutoDetected,
    isSelectorModalOpen,
    setIsSelectorModalOpen,
    formatPrice,
  } = useLanguageCurrency();

  const [activeTab, setActiveTab] = useState<'language' | 'currency' | 'country'>('language');

  if (!isSelectorModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsSelectorModalOpen(false)}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200 animate-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-950 leading-tight">
                  {t('changeLanguageCurrency')}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {isAutoDetected ? (
                    <span className="text-blue-600 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 inline" />
                      {t('autoDetected')}
                    </span>
                  ) : (
                    <span>{language === 'fr' ? 'Préférences personnalisées' : 'Customized preferences'}</span>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsSelectorModalOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Quick Tabs */}
          <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50/50 p-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('language')}
              className={`py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'language'
                  ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t('language')} ({language.toUpperCase()})</span>
            </button>

            <button
              onClick={() => setActiveTab('currency')}
              className={`py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'currency'
                  ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>{t('currency')} ({currency.code})</span>
            </button>

            <button
              onClick={() => setActiveTab('country')}
              className={`py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'country'
                  ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{country.flag} {country.code}</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Tab 1: Language */}
            {activeTab === 'language' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  {language === 'fr' 
                    ? 'Choisissez votre langue préférée. La langue de votre appareil est détectée automatiquement.' 
                    : 'Select your preferred shopping language. Device language is automatically detected.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { code: 'en' as Language, title: 'English', sub: language === 'fr' ? 'Par défaut / International' : 'Default / International', flag: '🇺🇸' },
                    { code: 'fr' as Language, title: 'Français', sub: language === 'fr' ? 'France & International' : 'French / France & International', flag: '🇫🇷' },
                  ].map((langItem) => {
                    const isSelected = language === langItem.code;
                    return (
                      <button
                        key={langItem.code}
                        onClick={() => setLanguage(langItem.code)}
                        className={`p-4 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{langItem.flag}</span>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{langItem.title}</p>
                            <p className="text-xs text-slate-500">{langItem.sub}</p>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Currency */}
            {activeTab === 'currency' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  {language === 'fr'
                    ? 'Les prix sont convertis en temps réel selon les taux de change internationaux de référence.'
                    : 'Prices are converted in real-time based on current international exchange benchmarks.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {allCurrencies.map((curr) => {
                    const isSelected = currency.code === curr.code;
                    return (
                      <button
                        key={curr.code}
                        onClick={() => setCurrency(curr.code)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl">{curr.flag}</span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900">{curr.code}</span>
                              <span className="text-xs font-mono font-semibold text-blue-600">({curr.symbol})</span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">{curr.name}</p>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Country / Region */}
            {activeTab === 'country' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  {language === 'fr'
                    ? 'Sélectionnez votre pays pour adapter les estimations de livraison et la devise locale.'
                    : 'Select your country to auto-configure appropriate regional shipping estimates and local currency.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {allCountries.map((c) => {
                    const isSelected = country.code === c.code;
                    const cName = language === 'fr' ? c.nameFr : c.name;
                    return (
                      <button
                        key={c.code}
                        onClick={() => setCountry(c.code)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl">{c.flag}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{cName}</p>
                            <p className="text-[11px] text-slate-500 font-mono">
                              {language === 'fr' ? 'Devise : ' : 'Currency: '}{c.defaultCurrency}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Live Preview & Apply Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-left w-full sm:w-auto">
              <span className="text-[11px] text-slate-500 block">
                {language === 'fr' ? 'Aperçu du prix indicatif :' : 'Sample price preview:'}
              </span>
              <span className="text-sm font-bold font-mono text-slate-950">
                $100.00 USD → <strong className="text-blue-600 font-bold">{formatPrice(100)}</strong>
              </span>
            </div>

            <button
              onClick={() => setIsSelectorModalOpen(false)}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{language === 'fr' ? 'Enregistrer & Continuer' : 'Save & Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
