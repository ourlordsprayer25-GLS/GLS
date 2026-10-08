import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, 
  ShieldCheck, 
  Zap, 
  Headphones, 
  Home, 
  Sparkles, 
  Check, 
  Radio,
  Layers,
  Store
} from 'lucide-react';

interface FastLoadingScreenProps {
  message?: string;
  subMessage?: string;
  isInitialBoot?: boolean;
  isReady?: boolean;
  onFinish?: () => void;
}

const ECOMMERCE_STEPS = [
  {
    title: 'Connecting to GLADYNS Commerce Gateway...',
    badge: 'GATEWAY 256-BIT SECURE',
    icon: ShieldCheck,
  },
  {
    title: 'Syncing Multi-Department Catalog & Pricing...',
    badge: 'CATALOG CACHE READY',
    icon: Layers,
  },
  {
    title: 'Calibrating Precision Audio & Smart Appliances...',
    badge: 'HARDWARE SPECS VERIFIED',
    icon: Headphones,
  },
  {
    title: 'Finalizing Storefront Experience...',
    badge: 'STOREFRONT READY',
    icon: Store,
  },
];

const DEPARTMENTS = [
  { name: 'Studio Audio', icon: Headphones },
  { name: 'Smart Home', icon: Home },
  { name: 'Living Standards', icon: Sparkles },
];

export const FastLoadingScreen: React.FC<FastLoadingScreenProps> = ({
  message = 'GLADYNS',
  subMessage,
  isReady = true,
  onFinish,
}) => {
  const [progress, setProgress] = useState(15);
  const [currentStep, setCurrentStep] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Progressive, natural e-commerce loading timeline
  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(45);
      setCurrentStep(1);
    }, 180);

    const t2 = setTimeout(() => {
      setProgress(78);
      setCurrentStep(2);
    }, 380);

    const t3 = setTimeout(() => {
      setProgress(94);
      setCurrentStep(3);
    }, 600);

    const t4 = setTimeout(() => {
      setProgress(100);
    }, 800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // Smooth fade-out once 100% is reached
  useEffect(() => {
    if (progress >= 100) {
      const exitTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 150);

      const finishTimer = setTimeout(() => {
        if (onFinish) onFinish();
      }, 550);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(finishTimer);
      };
    }
  }, [progress, onFinish]);

  const activeStepInfo = ECOMMERCE_STEPS[currentStep] || ECOMMERCE_STEPS[0];
  const StepIcon = activeStepInfo.icon;

  return (
    <div
      aria-label="Loading GLADYNS E-Commerce Store"
      className={`fixed inset-0 z-[9999] bg-[#090b10] text-white flex flex-col items-center justify-center overflow-hidden transition-all duration-500 ease-out select-none ${
        isFadingOut ? 'opacity-0 scale-[1.02] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* High-Tech Ambient Grid & Dynamic Radial Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep Royal Blue Spotlight Core */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] bg-blue-600/15 rounded-full blur-[150px] animate-pulse" />
        
        {/* Subtle Cyan Accent Beam */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-sky-500/10 rounded-full blur-[100px]" />

        {/* Minimalist Tech Background Dot Matrix */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-35" />
      </div>

      {/* Main Glassmorphic Loading Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-400">
        
        {/* Central Brand Badge with Rotating E-Commerce Orbit */}
        <div className="relative mb-8 flex items-center justify-center">
          
          {/* Animated Pulsing Orbit Rings */}
          <div className="absolute -inset-6 rounded-full border border-blue-500/20 animate-spin [animation-duration:12s]" />
          <div className="absolute -inset-3 rounded-full border border-sky-400/30 animate-pulse [animation-duration:3s]" />
          <div className="absolute -inset-8 rounded-full bg-blue-600/10 blur-xl" />

          {/* Floating Cart / E-Commerce Satellite Node */}
          <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/50 border border-blue-400/50 z-20 animate-bounce [animation-duration:2.5s]">
            <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
          </div>

          {/* Official Store Logo Frame */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1 bg-gradient-to-b from-blue-500/40 via-slate-900 to-blue-950 border border-blue-400/40 shadow-[0_0_50px_rgba(37,99,235,0.3)] shadow-black/90 flex items-center justify-center backdrop-blur-xl overflow-hidden group">
            {/* Shimmer Light Beam */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            <div className="w-full h-full rounded-[22px] overflow-hidden bg-slate-950 flex items-center justify-center p-2">
              <img
                src="/assets/logo-icon.png"
                alt="GLADYNS"
                className="w-full h-full object-contain transform scale-100 transition-transform duration-500"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>

        {/* Brand Headline & Department Credo */}
        <div className="space-y-1.5 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-[10px] font-black uppercase tracking-widest mb-1 shadow-xs">
            <Radio className="w-3 h-3 text-blue-400 animate-pulse" />
            <span>ONLINE STOREFRONT · 2026 EDITION</span>
          </div>

          <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-[0.28em] uppercase text-white drop-shadow-sm">
            {message}
          </h1>

          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-semibold">
            Curated Multi-Department Standards
          </p>
        </div>

        {/* Dynamic Department Checklist Pills */}
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          {DEPARTMENTS.map((dept, idx) => {
            const isCompleted = currentStep >= idx;
            return (
              <div
                key={idx}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all duration-300 border ${
                  isCompleted
                    ? 'bg-blue-600/20 border-blue-400/40 text-blue-300 shadow-2xs'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3 text-sky-400 stroke-[3]" />
                ) : (
                  <dept.icon className="w-3 h-3 text-slate-500" />
                )}
                <span>{dept.name}</span>
              </div>
            );
          })}
        </div>

        {/* Real-Time Loading Step Message */}
        <div className="flex items-center gap-2 justify-center mb-4 min-h-[24px]">
          <StepIcon className="w-4 h-4 text-sky-400 shrink-0 animate-pulse" />
          <p className="text-xs text-slate-300 font-medium tracking-wide">
            {subMessage || activeStepInfo.title}
          </p>
        </div>

        {/* High-Precision Fluid Progress Bar */}
        <div className="w-full max-w-[280px] bg-slate-900/90 border border-blue-500/30 h-2 rounded-full overflow-hidden mb-3 relative p-0.5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-sky-400 to-blue-500 rounded-full transition-all duration-300 ease-out shadow-[0_0_15px_rgba(56,189,248,0.7)] relative"
            style={{ width: `${progress}%` }}
          >
            {/* Travelling Light Tip */}
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-white rounded-full blur-[1px]" />
          </div>
        </div>

        {/* Progress Percentage & Step Indicator */}
        <div className="flex items-center justify-between w-full max-w-[280px] text-[10px] font-mono tracking-widest text-slate-400 mb-8">
          <span className="uppercase text-[9px] text-blue-400 font-bold">
            {activeStepInfo.badge}
          </span>
          <span className="font-bold text-white text-xs">{progress}%</span>
        </div>

        {/* Verified Business Security & Dispatch Badges */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-4 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-Bit SSL</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Dispatch</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-blue-400" />
            <span>Official Store</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export const FastActionLoader: React.FC<{ message?: string }> = ({
  message = 'Synchronizing Catalog...',
}) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-zinc-950/75 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-slate-900/95 border border-blue-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-blue-950/50 flex items-center gap-4 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
        <div className="relative w-12 h-12 rounded-2xl bg-slate-950 border border-blue-400/30 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
          <img src="/assets/logo-icon.png" alt="GLADYNS" className="w-full h-full object-contain" />
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
