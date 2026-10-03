import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowLeft, 
  AlertCircle, 
  Sparkles,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface AdminLoginProps {
  onLoginSuccess: (adminEmail: string) => void;
  onBackToStore: () => void;
  storeName?: string;
}

export const ADMIN_SESSION_KEY = 'gladyns_admin_session';

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToStore,
  storeName = 'GLADYNS DEPARTMENT STORE',
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      setErrorMessage('Please provide both administrative username/email and password.');
      return;
    }

    setIsLoading(true);

    try {
      let isAuthenticated = false;
      let authenticatedEmail = cleanId;

      // 1. Check Master Admin Credentials (offline/immediate access)
      const isMasterAdmin = (
        (cleanId.toLowerCase() === 'admin' || 
         cleanId.toLowerCase() === 'admin@gladyns.store' || 
         cleanId.toLowerCase() === 'admin@gladyns.com' ||
         cleanId.toLowerCase() === 'concierge@gladyns.com') &&
        (cleanPass === 'gladyns2025' || cleanPass === 'admin1234' || cleanPass === 'admin12345')
      );

      if (isMasterAdmin) {
        isAuthenticated = true;
        authenticatedEmail = cleanId.includes('@') ? cleanId : 'admin@gladyns.store';
      }

      // 2. If not matched with master, try Supabase Authentication (if configured and looks like an email)
      if (!isAuthenticated && isSupabaseConfigured && cleanId.includes('@')) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanId,
            password: cleanPass,
          });

          if (!error && data.user) {
            isAuthenticated = true;
            authenticatedEmail = data.user.email || cleanId;
          } else if (error) {
            console.warn('Supabase admin login attempt error:', error.message);
          }
        } catch (sbErr) {
          console.warn('Supabase auth network error:', sbErr);
        }
      }

      // 3. Fallback: Also accept any email if using the master password
      if (!isAuthenticated && (cleanPass === 'gladyns2025' || cleanPass === 'admin12345')) {
        isAuthenticated = true;
        authenticatedEmail = cleanId;
      }

      if (isAuthenticated) {
        const sessionData = {
          email: authenticatedEmail,
          authenticatedAt: Date.now(),
          token: `adm-token-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`,
        };

        if (rememberMe) {
          localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
        } else {
          sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
        }

        onLoginSuccess(authenticatedEmail);
      } else {
        setErrorMessage('Invalid administrative credentials. Please verify your email and password.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden select-none">
      {/* Ambient luminous glow halos */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[380px] h-[380px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Back to Store Top Button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={onBackToStore}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/15 transition-all cursor-pointer shadow-sm group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Store</span>
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="absolute inset-0 rounded-2xl bg-blue-500/30 blur-xl"></div>
            <img 
              src="/assets/logo-icon.png" 
              alt="GLADYNS Maison" 
              className="relative w-16 h-16 rounded-2xl object-contain drop-shadow-2xl border border-white/20 bg-slate-900/80 p-2"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-400/30 text-blue-300 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Administrative Gateway</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Maison Control Panel
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 font-light max-w-sm mx-auto leading-relaxed">
            Enter authorized executive credentials to access catalog logistics, order processing, and analytics.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-7 sm:p-9 border border-white/15 shadow-2xl relative">
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-3 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-200 leading-snug">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username / Email Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-2">
                Administrator Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@gladyns.store"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-2">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-slate-950/70 border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Help */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer hover:text-slate-200 transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500/40 cursor-pointer"
                />
                <span>Remember this terminal</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Authenticate to Console</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Hint Box (for initial setup convenience) */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <span>Default Admin:</span>
              <strong className="text-blue-300">admin@gladyns.store</strong>
              <span>·</span>
              <strong className="text-blue-300">gladyns2025</strong>
            </div>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="text-center mt-6 text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>256-Bit SSL Encrypted & Protected Session</span>
        </div>
      </div>
    </div>
  );
};
