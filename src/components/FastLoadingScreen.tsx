import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface FastLoadingScreenProps {
  message?: string;
  subMessage?: string;
  isInitialBoot?: boolean;
  isReady?: boolean;
  onFinish?: () => void;
}

export const FastLoadingScreen: React.FC<FastLoadingScreenProps> = ({
  message = 'GLADYNS DEPARTMENT STORE',
  subMessage = 'Loading Curated Catalog & Atelier...',
  isInitialBoot = true,
  isReady = true,
  onFinish,
}) => {
  const [progress, setProgress] = useState(15);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Fast 400ms progress animation
    const t1 = setTimeout(() => setProgress(55), 100);
    const t2 = setTimeout(() => setProgress(90), 220);
    const t3 = setTimeout(() => setProgress(100), 380);

    

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      
    };
  }, []);


  useEffect(() => {
    if (isReady && progress === 100) {
      setIsFadingOut(true);
      const timer = setTimeout(() => {
        if (onFinish) onFinish();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isReady, progress, onFinish]);


  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#0A0A0B] text-white flex flex-col items-center justify-center transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full">
        {/* Monogram Emblem */}
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-zinc-900 to-zinc-800 border border-white/10 flex items-center justify-center shadow-2xl shadow-black/80">
            <span className="font-display font-black text-2xl tracking-tighter text-white">G</span>
          </div>
          <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-blue-600 text-white shadow-md animate-bounce">
            <Sparkles className="w-3 h-3" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display font-black tracking-[0.2em] text-sm uppercase text-white mb-1.5">
          {message}
        </h1>
        <p className="text-[11px] text-zinc-400 font-medium tracking-wider mb-6">
          {subMessage}
        </p>

        {/* High-speed Progress Bar */}
        <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mb-3 relative">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 rounded-full transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full text-[10px] font-mono text-zinc-500">
          <span>INITIALIZING DEPARTMENTS</span>
          <span className="font-bold text-zinc-300">{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export const FastActionLoader: React.FC<{ message?: string }> = ({
  message = 'Adding to Catalog...',
}) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl p-5 shadow-2xl border border-zinc-200 flex items-center gap-4 max-w-xs animate-in zoom-in-95 duration-150">
        <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white shrink-0">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
        <div>
          <h4 className="text-xs font-bold text-zinc-900">{message}</h4>
          <p className="text-[10px] text-zinc-400">Broadcasting live across devices</p>
        </div>
      </div>
    </div>
  );
};
