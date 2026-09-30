import React, { useState } from 'react';
import { X, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (user: any) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { login, providerErrorNotice, clearProviderError } = useAuth();
  const [isProcessing, setIsProcessing] = useState<'google' | 'facebook' | null>(null);

  if (!isOpen) return null;

  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    setIsProcessing(provider);
    clearProviderError();
    try {
      // This will trigger the real Supabase OAuth redirect flow
      await login(provider);
      // If it doesn't redirect immediately (e.g. error), we'll stop processing
    } catch (e) {
      console.error(`${provider} login failed:`, e);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
      <div 
        className="relative max-w-md w-full bg-white rounded-[2.5rem] border border-zinc-200 overflow-hidden shadow-2xl shadow-zinc-950/10 animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 rounded-full transition-all cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 sm:p-10 space-y-6 text-center">
          
          {/* Branded Logo */}
          <div className="space-y-2 pt-2">
            <h1 className="text-3xl font-display font-medium tracking-widest text-zinc-950">GLADYNS</h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Haute Joaillerie & Luxe</p>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-display font-medium text-zinc-900">Prestige Member Identification</h2>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
              Sign in with your real Google or Facebook account to sync your orders and boutique preferences globally.
            </p>
          </div>

          {/* Provider Error Notice */}
          {providerErrorNotice && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[11px] text-red-600 text-left animate-in fade-in duration-200">
              <p className="font-bold mb-0.5">Configuration Required:</p>
              <p>{providerErrorNotice}</p>
              <p className="mt-1 text-[10px] opacity-80">Make sure you have enabled the provider in your Supabase Dashboard.</p>
            </div>
          )}

          {/* Social Sign-in Buttons */}
          <div className="space-y-3 pt-2">
            {/* Google Button */}
            <button
              type="button"
              disabled={isProcessing !== null}
              onClick={() => handleSocialAuth('google')}
              className="w-full h-14 bg-white border border-zinc-200 hover:border-zinc-950 hover:shadow-md text-zinc-800 rounded-2xl text-xs font-bold flex items-center justify-center gap-3.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {isProcessing === 'google' ? (
                <div className="w-4 h-4 border-2 border-zinc-200 border-t-zinc-950 rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Facebook Button */}
            <button
              type="button"
              disabled={isProcessing !== null}
              onClick={() => handleSocialAuth('facebook')}
              className="w-full h-14 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-3.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {isProcessing === 'facebook' ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Continue with Facebook</span>
                </>
              )}
            </button>
          </div>

          {/* Secure Handshake Banner */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-3xl text-left space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-950 text-[11px] font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Secure OAuth Handshake</span>
            </div>
            <p className="text-[10px] text-emerald-800 leading-relaxed">
              Your credentials are authenticated directly by Google or Facebook. GLADYNS only receives your verified name and profile image.
            </p>
          </div>

          {/* Security Footer */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>256-bit SSL Encrypted Connection</span>
          </div>

        </div>
      </div>
    </div>
  );
};
