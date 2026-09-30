import React, { useEffect, useState } from 'react';
import { Bell, Sparkles, X, ShieldAlert } from 'lucide-react';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';

interface NotificationPermissionBannerProps {
  onRequestPermission: () => Promise<boolean>;
}

export const NotificationPermissionBanner: React.FC<NotificationPermissionBannerProps> = ({
  onRequestPermission,
}) => {
  const [showBanner, setShowBanner] = useState(false);
  const { language } = useLanguageCurrency();

  useEffect(() => {
    // Check if Notification API is supported and permission is not already decided
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        // Show after a small luxurious delay of 4 seconds
        const timer = setTimeout(() => {
          setShowBanner(true);
        }, 4000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleEnable = async () => {
    const granted = await onRequestPermission();
    if (granted) {
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 lg:right-8 z-50 max-w-sm w-full bg-zinc-950 text-white rounded-2xl border border-zinc-800 p-5 shadow-2xl animate-in fade-in slide-in-from-top-6 duration-500">
      <div className="flex items-start gap-4">
        {/* Animated Icon Container */}
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20 relative">
          <Bell className="w-5 h-5 animate-swing" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
        </div>

        {/* Copy Details */}
        <div className="space-y-1.5 flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-bold text-xs uppercase tracking-wider text-blue-400">
              {language === 'fr' ? 'Alertes d\'expédition' : 'System Alerts Active'}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          </div>
          <h4 className="text-sm font-semibold text-white tracking-tight">
            {language === 'fr' ? 'Activer les notifications système ?' : 'Enable phone header notifications?'}
          </h4>
          <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
            {language === 'fr'
              ? 'Recevez des alertes en temps réel qui s\'affichent sur votre écran d\'accueil, même en arrière-plan.'
              : 'Receive real-time order tracking status updates that drop from your device header and stay in background.'}
          </p>
          
          {/* Action Row */}
          <div className="pt-2.5 flex items-center gap-3">
            <button
              onClick={handleEnable}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
            >
              {language === 'fr' ? 'Activer' : 'Enable Alerts'}
            </button>
            <button
              onClick={handleDismiss}
              className="text-[11px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              {language === 'fr' ? 'Plus tard' : 'Maybe Later'}
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="p-1 text-zinc-600 hover:text-zinc-400 rounded-lg cursor-pointer shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
