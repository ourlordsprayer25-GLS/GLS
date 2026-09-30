import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { language } = useLanguageCurrency();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[90] flex items-center gap-2 rounded-xl bg-amber-500 border border-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-xl animate-bounce">
      <WifiOff className="w-4 h-4 text-white animate-pulse" />
      <span>
        {language === 'fr' 
          ? 'Mode Hors-ligne — Navigation dans le catalogue en cache.' 
          : 'Offline Mode — Browsing cached design catalog.'}
      </span>
    </div>
  );
};
