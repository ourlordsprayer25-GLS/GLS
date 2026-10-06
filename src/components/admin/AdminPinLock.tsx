import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Lock, ArrowLeft, LogOut, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { verifyAdminPin } from '../../services/adminAuthService';

interface AdminPinLockProps {
  adminEmail: string;
  onUnlock: () => void;
  onLogout: () => void;
  onBackToStore: () => void;
}

export const AdminPinLock: React.FC<AdminPinLockProps> = ({
  adminEmail,
  onUnlock,
  onLogout,
  onBackToStore,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleDigitChange = async (index: number, value: string) => {
    setError(null);

    // Only allow single digit
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = cleaned;
    setDigits(nextDigits);

    // Advance to next input
    if (cleaned && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // If all 4 digits entered, verify
    const pin = nextDigits.join('');
    if (pin.length === 4) {
      setIsVerifying(true);
      try {
        const isValid = await verifyAdminPin(pin);
        if (isValid) {
          onUnlock();
        } else {
          triggerShake();
          setError('Incorrect 4-digit PIN. Please try again.');
          setDigits(['', '', '', '']);
          inputRefs[0].current?.focus();
        }
      } catch (err) {
        setError('Verification error. Please try again.');
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const nextDigits = [...digits];
        nextDigits[index - 1] = '';
        setDigits(nextDigits);
        inputRefs[index - 1].current?.focus();
      }
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length === 4) {
      const nextDigits = pasted.split('');
      setDigits(nextDigits);
      setIsVerifying(true);
      try {
        const isValid = await verifyAdminPin(pasted);
        if (isValid) {
          onUnlock();
        } else {
          triggerShake();
          setError('Incorrect 4-digit PIN. Please try again.');
          setDigits(['', '', '', '']);
          inputRefs[0].current?.focus();
        }
      } catch (err) {
        setError('Verification error. Please try again.');
      } finally {
        setIsVerifying(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden select-none">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[380px] h-[380px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top action buttons */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
        <button
          onClick={onBackToStore}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/15 transition-all cursor-pointer shadow-sm group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Store</span>
        </button>
      </div>

      <div className="w-full max-w-sm relative z-10 text-center">
        {/* Lock Shield Icon */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-3xl bg-blue-500/30 blur-2xl"></div>
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-950 border border-white/20 flex items-center justify-center shadow-2xl">
            <Lock className="w-9 h-9 text-blue-400" />
          </div>
        </div>

        {/* Heading */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-400/30 text-blue-300 text-[11px] font-mono font-bold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Session Locked on Refresh</span>
        </div>

        <h1 className="text-2xl font-display font-bold text-white tracking-tight">
          Enter 4-Digit Security PIN
        </h1>
        <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto leading-relaxed">
          Logged in as <strong className="text-white font-mono">{adminEmail}</strong>. Enter your secret PIN to resume session.
        </p>

        {/* PIN Entry Card */}
        <div className={`mt-8 bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-7 border border-white/15 shadow-2xl transition-all ${
          isShaking ? 'animate-shake border-rose-500/50' : ''
        }`}>
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2.5 text-left text-xs text-rose-200 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 4 Digit Boxes */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 my-2" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                disabled={isVerifying}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-14 h-16 sm:w-16 sm:h-18 text-center text-2xl font-bold font-mono rounded-2xl border transition-all outline-none ${
                  digit
                    ? 'bg-blue-600/20 border-blue-400 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-slate-950/80 border-white/15 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                }`}
              />
            ))}
          </div>

          {isVerifying && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-blue-300">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span>Verifying secret PIN with Supabase...</span>
            </div>
          )}

          {/* Sign out / Full login link */}
          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs">
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Full Sign In</span>
            </button>
            <span className="text-[11px] text-slate-500 font-mono">
              Secured by Supabase
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
