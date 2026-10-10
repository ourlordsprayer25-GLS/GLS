import React, { useState } from 'react';
import { Download, Sparkles, Smartphone, X, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';

interface PWAInstallButtonProps {
  mode?: 'store' | 'admin';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ mode = 'store' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { language } = useLanguageCurrency();

  const isAdmin = mode === 'admin' || (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'));

  // If already running as standalone or not installable on current browser, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={
          isAdmin
            ? "flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs border border-emerald-500/40"
            : "flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs"
        }
        title={isAdmin ? "Install MY ADMIN" : "Install Gladyns Marketplace"}
      >
        <Download className="w-3.5 h-3.5" />
        <span>
          {isAdmin
            ? (language === 'fr' ? 'Installer MY ADMIN' : 'Install MY ADMIN')
            : (language === 'fr' ? 'Installer Gladyns Marketplace' : 'Install Gladyns Marketplace')}
        </span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not natively supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={
            isAdmin
              ? "flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-emerald-400 text-[11px] font-bold transition-all cursor-pointer shadow-xs border border-emerald-500/30"
              : "flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs border border-zinc-800"
          }
        >
          {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Smartphone className="w-3.5 h-3.5 text-blue-400" />}
          <span>
            {isAdmin
              ? (language === 'fr' ? 'Installer MY ADMIN sur iOS' : 'Install MY ADMIN on iOS')
              : (language === 'fr' ? 'Installer Gladyns sur iOS' : 'Install Gladyns on iOS')}
          </span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-zinc-200 text-slate-800 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  {isAdmin ? <ShieldCheck className="w-4 h-4 text-emerald-600" /> : <Sparkles className="w-4 h-4 text-blue-600" />}
                  <span className="font-display font-bold text-sm text-zinc-950">
                    {isAdmin
                      ? 'MY ADMIN'
                      : 'Gladyns Marketplace'}
                  </span>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg cursor-pointer"
                  aria-label="Close guide"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs space-y-3 leading-relaxed text-zinc-600 font-medium">
                <p>
                  {isAdmin
                    ? (language === 'fr'
                        ? 'Ajoutez MY ADMIN à votre écran d\'accueil pour gérer les commandes, stocks et clients en plein écran :'
                        : 'Add MY ADMIN to your home screen for full-screen management of orders, inventory, and customer activity:')
                    : (language === 'fr'
                        ? 'Ajoutez Gladyns Marketplace à votre écran d\'accueil pour une expérience d\'achat fluide et des notifications d\'expédition :'
                        : 'Add Gladyns Marketplace to your home screen for seamless catalog browsing and instant shipping status notifications:')}
                </p>
                <div className="bg-[#FAF9F6] p-3 rounded-xl border border-zinc-200/60 space-y-2">
                  <p>
                    1. {language === 'fr' ? 'Appuyez sur le bouton' : 'Tap the'} <strong>{language === 'fr' ? 'Partager' : 'Share'}</strong> {language === 'fr' ? 'dans la barre d\'outils Safari.' : 'icon in Safari.'}
                  </p>
                  <p>
                    2. {language === 'fr' ? 'Faites défiler et sélectionnez' : 'Scroll down and tap'} <strong>{language === 'fr' ? 'Sur l\'écran d\'accueil' : 'Add to Home Screen'}</strong>.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className={
                  isAdmin
                    ? "w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition cursor-pointer"
                    : "w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition cursor-pointer"
                }
              >
                {language === 'fr' ? 'Compris' : 'Understood'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
