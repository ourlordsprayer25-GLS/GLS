import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface FastLoadingScreenProps {
  message?: string;
  subMessage?: string;
  isInitialBoot?: boolean;
  isReady?: boolean;
  onFinish?: () => void;
}

const LUXURY_PHRASES = [
  'Curating Fine Collections...',
  'Preparing Your Luxury Experience...',
  'Polishing Exclusive Atelier Pieces...',
  'Opening Boutique Doors...',
];

export const FastLoadingScreen: React.FC<FastLoadingScreenProps> = ({
  message = 'GLADYNS',
  subMessage,
  isReady = true,
  onFinish,
}) => {
  const [progress, setProgress] = useState(25);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  // Smooth, snappy loading progression (fast & premium)
  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(65);
      setPhraseIndex(1);
    }, 120);

    const t2 = setTimeout(() => {
      setProgress(90);
      setPhraseIndex(2);
    }, 250);

    const t3 = setTimeout(() => {
      setProgress(100);
      setPhraseIndex(3);
    }, 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Gracefully transition out once complete (with 750ms safety cap so user is never stuck)
  useEffect(() => {
    if (progress >= 100) {
      const exitTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 100);

      const finishTimer = setTimeout(() => {
        if (onFinish) onFinish();
      }, 400);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(finishTimer);
      };
    }
  }, [progress, onFinish]);

  return (
    <div
      aria-label="Loading GLADYNS Store"
      className={`fixed inset-0 z-[9999] bg-[#07090e] text-white flex flex-col items-center justify-center overflow-hidden transition-all duration-500 ease-out select-none ${
        isFadingOut ? 'opacity-0 scale-[1.03] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Dynamic Luxury Ambient Lighting & Glowing Aura */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Radial Sapphire Core Spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-blue-600/18 rounded-full blur-[140px] animate-pulse" />
        
        {/* Warm Golden Sheen Accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] bg-amber-400/8 rounded-full blur-[90px]" />

        {/* Subtle Luxury Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-25" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-500">
        
        {/* Charming Floating Logo Centerpiece */}
        <div className="relative mb-7 flex items-center justify-center">
          
          {/* Animated Concentric Breathing Halo Rings */}
          <div className="absolute -inset-4 rounded-3xl bg-blue-500/20 blur-xl animate-pulse" />
          <div className="absolute -inset-8 rounded-full border border-blue-400/15 animate-ping opacity-30 [animation-duration:3s]" />
          
          {/* Logo Frame */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 bg-gradient-to-b from-blue-400/30 via-slate-900 to-blue-950 border border-blue-400/40 shadow-[0_0_40px_rgba(37,99,235,0.35)] shadow-black/80 flex items-center justify-center backdrop-blur-md overflow-hidden group">
            
            {/* Shimmer Light Beam Crossing */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            <div className="w-full h-full rounded-[22px] overflow-hidden bg-slate-950 flex items-center justify-center">
              <img
                src="/assets/logo-icon.png"
                alt="GLADYNS Logo"
                className="w-full h-full object-cover transform scale-105 transition-transform duration-700"
              />
            </div>
          </div>

          {/* Golden Boutique Sparkle Badge */}
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-lg shadow-amber-500/30 animate-bounce [animation-duration:2s]">
            <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </div>

        {/* Store Title */}
        <div className="space-y-1.5 mb-6">
          <h1 className="font-display font-medium text-2xl sm:text-3xl tracking-[0.32em] uppercase text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]">
            {message}
          </h1>
          <div className="flex items-center justify-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-amber-300/90 font-semibold">
            <span>✦</span>
            <span>Haute Joaillerie & Luxe</span>
            <span>✦</span>
          </div>
        </div>

        {/* Micro-Status Phrase */}
        <p className="text-xs text-slate-400 font-medium tracking-wide mb-6 h-5 transition-all duration-300">
          {subMessage || LUXURY_PHRASES[phraseIndex]}
        </p>

        {/* Sleek Luxury Progress Bar */}
        <div className="w-full max-w-[240px] bg-slate-900/90 border border-white/10 h-1.5 rounded-full overflow-hidden mb-3 relative p-0.5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-sky-400 to-amber-300 rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(56,189,248,0.8)] relative"
            style={{ width: `${progress}%` }}
          >
            {/* Travelling Light Tip */}
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full blur-[1px]" />
          </div>
        </div>

        {/* Discreet Metadata Footer */}
        <div className="flex items-center justify-between w-full max-w-[240px] text-[10px] font-mono tracking-widest text-slate-500">
          <span className="uppercase text-[9px] text-slate-400">BOUTIQUE ONLINE</span>
          <span className="font-bold text-sky-400">{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export const FastActionLoader: React.FC<{ message?: string }> = ({
  message = 'Synchronizing Catalog...',
}) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-zinc-950/70 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-slate-900/95 border border-blue-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-blue-950/50 flex items-center gap-4 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
        <div className="relative w-12 h-12 rounded-2xl bg-slate-950 border border-blue-400/30 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
          <img src="/assets/logo-icon.png" alt="GLADYNS" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-blue-600/20 animate-pulse pointer-events-none" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">{message}</h4>
          <p className="text-[10px] text-blue-300/80 tracking-wider uppercase mt-0.5 font-medium">Boutique Live Sync</p>
        </div>
        <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin shrink-0" />
      </div>
    </div>
  );
};
