import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X, ChevronRight, Check } from 'lucide-react';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';

interface CookieConsentBannerProps {
  onOpenTerms: () => void;
  onOpenPrivacy?: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onOpenTerms,
  onOpenPrivacy,
}) => {
  const { language } = useLanguageCurrency();
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [analyticsCookies, setAnalyticsCookies] = useState(true);
  const [marketingCookies, setMarketingCookies] = useState(false);

  useEffect(() => {
    const isAdminRoute = typeof window !== 'undefined' && (
      window.location.pathname.startsWith('/admin') ||
      window.location.pathname.includes('admin')
    );
    if (isAdminRoute) return;

    try {
      const savedConsent = localStorage.getItem('gls_cookie_consent');
      if (!savedConsent) {
        // Delay entrance slightly so user experiences instant page render first
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch (_) {}
  }, []);

  const saveConsent = (type: 'all' | 'rejected' | 'custom') => {
    try {
      const consentPayload = {
        status: type,
        essential: true,
        analytics: type === 'all' ? true : type === 'rejected' ? false : analyticsCookies,
        marketing: type === 'all' ? true : type === 'rejected' ? false : marketingCookies,
        date: new Date().toISOString(),
      };
      localStorage.setItem('gls_cookie_consent', JSON.stringify(consentPayload));
    } catch (_) {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Privacy & Cookie Preferences"
      className="fixed bottom-3 left-3 right-3 sm:bottom-6 sm:right-6 sm:left-auto sm:max-w-md z-40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 pointer-events-auto"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-[0_12px_40px_rgba(0,0,0,0.14)] p-4 sm:p-5 text-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Cookie className="w-4 h-4" />
            </span>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              {language === 'fr' ? 'Confidentialité & Paramètres des cookies' : 'Privacy & cookie setting'}
            </h4>
          </div>
          <button
            type="button"
            onClick={() => saveConsent('rejected')}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full transition-colors cursor-pointer"
            aria-label="Dismiss cookie notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {!isCustomizing ? (
          <>
            <p className="text-[12px] leading-relaxed text-slate-600 mb-4">
              {language === 'fr' ? (
                <>
                  Nous utilisons des cookies et technologies similaires pour assurer la sécurité, optimiser votre expérience d'achat et mesurer les performances du service. Vous pouvez accepter ou refuser les cookies non essentiels conformément à nos{' '}
                  <button
                    type="button"
                    onClick={onOpenTerms}
                    className="text-blue-600 hover:underline font-medium cursor-pointer inline"
                  >
                    Conditions Générales
                  </button>
                  .
                </>
              ) : (
                <>
                  We use cookies and similar technologies to provide our Service, ensure security, improve your experience, and measure performance. If you select 'Accept All', you agree to storing cookies on your device for these purposes. You can also 'Reject All' or customize your choices. For more details, see our{' '}
                  <button
                    type="button"
                    onClick={onOpenTerms}
                    className="text-blue-600 hover:underline font-medium cursor-pointer inline"
                  >
                    Terms & Conditions
                  </button>
                  .
                </>
              )}
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => saveConsent('all')}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
              >
                {language === 'fr' ? 'Tout Accepter' : 'Accept All'}
              </button>

              <button
                type="button"
                onClick={() => saveConsent('rejected')}
                className="w-full py-2 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                {language === 'fr' ? 'Tout Refuser' : 'Reject All'}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsCustomizing(true)}
                  className="text-[11px] font-medium text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{language === 'fr' ? 'Personnaliser les cookies' : 'Customise Cookies'}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Customization Preferences Panel */
          <div className="space-y-3 pt-1">
            <p className="text-[11px] text-slate-500">
              {language === 'fr'
                ? 'Gérez vos préférences de cookies. Les cookies essentiels ne peuvent pas être désactivés car ils sont requis pour le panier et la connexion.'
                : 'Manage your cookie categories. Essential cookies cannot be turned off as they are needed for your cart and session.'}
            </p>

            {/* Essential (Locked) */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  {language === 'fr' ? 'Cookies Essentiels' : 'Essential Cookies'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {language === 'fr' ? 'Requis pour le panier, sécurité et connexion' : 'Required for cart, secure checkout and auth'}
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" /> {language === 'fr' ? 'Actif' : 'Always Active'}
              </span>
            </div>

            {/* Analytics Toggle */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  {language === 'fr' ? 'Performances & Analyses' : 'Analytics & Performance'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {language === 'fr' ? 'Nous aide à optimiser la vitesse du catalogue' : 'Helps us measure site speed and stability'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={analyticsCookies}
                  onChange={(e) => setAnalyticsCookies(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Marketing Toggle */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  {language === 'fr' ? 'Marketing & Recommandations' : 'Marketing & Recommendations'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {language === 'fr' ? 'Offres personnalisées et nouveautés' : 'Tailored offers and curated arrivals'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingCookies}
                  onChange={(e) => setMarketingCookies(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Save preferences */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => saveConsent('custom')}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {language === 'fr' ? 'Enregistrer mes choix' : 'Save Preferences'}
              </button>
              <button
                type="button"
                onClick={() => setIsCustomizing(false)}
                className="py-2 px-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {language === 'fr' ? 'Retour' : 'Back'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
