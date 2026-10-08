import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Mail, Lock, User, ArrowRight, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (user: any) => void;
  initialMode?: 'login' | 'register';
  isPendingCheckout?: boolean;
  onContinueAsGuest?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  isPendingCheckout = false,
  onContinueAsGuest,
}) => {
  const { login, signInWithEmail, signUpWithEmail, user, providerErrorNotice, clearProviderError } = useAuth();
  const { language } = useLanguageCurrency();
  const isFr = language === 'fr';

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [acceptedAgeAndTerms, setAcceptedAgeAndTerms] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      clearProviderError();
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (user && isOpen) {
      if (onLoginSuccess) onLoginSuccess(user);
      onClose();
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    clearProviderError();
    try {
      await login('google');
    } catch (e: any) {
      setErrorMsg(e?.message || (isFr ? 'Échec de l\'authentification Google.' : 'Google authentication failed.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg(isFr ? 'Veuillez renseigner votre e-mail et votre mot de passe.' : 'Please provide both email and password.');
      return;
    }
    if (mode === 'register' && !name) {
      setErrorMsg(isFr ? 'Veuillez saisir votre nom complet.' : 'Please enter your full name.');
      return;
    }
    if (mode === 'register' && !acceptedAgeAndTerms) {
      setErrorMsg(isFr 
        ? 'Vous devez certifier avoir au moins 13 ans et accepter les Conditions Générales pour vous inscrire.' 
        : 'You must certify you are at least 13 years old and accept the Terms & Privacy Policy to register.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    clearProviderError();

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name);
      }
      onClose();
    } catch (e: any) {
      const rawMsg = e?.message || '';
      if (rawMsg.toLowerCase().includes('invalid login credentials') || rawMsg.toLowerCase().includes('invalid_grant')) {
        setErrorMsg(isFr ? 'E-mail ou mot de passe incorrect. Si vous êtes nouveau, cliquez sur « Créer un compte » ci-dessus.' : 'Invalid email or password. If you are new, click "Create Account" above to register.');
      } else {
        setErrorMsg(rawMsg || (isFr ? `${mode === 'login' ? 'Échec de la connexion' : 'Échec de la création du compte'}.` : `${mode === 'login' ? 'Sign in' : 'Account creation'} failed.`));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
      <div 
        className="relative max-w-md w-full bg-white rounded-[2.5rem] border border-zinc-200 overflow-hidden shadow-2xl shadow-zinc-950/10 animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 rounded-full transition-all cursor-pointer z-10"
          aria-label={isFr ? 'Fermer la boîte de dialogue' : 'Close modal'}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 sm:p-10 space-y-5 text-center">
          
          {/* Branded Logo */}
          <div className="space-y-2 pt-2 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border border-blue-500/30 bg-slate-900 shadow-blue-900/10">
              <img src="/assets/logo-icon.png" alt="GLADYNS Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-medium tracking-widest text-zinc-950">GLADYNS</h1>
              <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400 mt-0.5">{isFr ? 'Studio, Électronique & Innovation' : 'Studio, Electronics & Living Standards'}</p>
            </div>
          </div>

          {/* Cart reservation banner if checking out */}
          {isPendingCheckout && (
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-950 text-left flex items-start gap-2.5 shadow-2xs">
              <ShoppingBag className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-[12px] text-blue-900">
                  {isFr ? 'Vos articles sont précieusement conservés dans votre panier !' : 'Your items are safely reserved in your bag!'}
                </p>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  {isFr
                    ? 'Créez votre compte ou connectez-vous pour poursuivre immédiatement votre commande.'
                    : 'Sign in or create your account to proceed immediately to checkout without losing your selections.'}
                </p>
              </div>
            </div>
          )}

          {/* Segmented Auth Mode Switcher */}
          <div className="flex items-center p-1 bg-zinc-100 rounded-2xl border border-zinc-200/80">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-zinc-950 text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              {isFr ? 'Connexion' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-zinc-950 text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              {isFr ? 'Créer un compte' : 'Create Account'}
            </button>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-display font-medium text-zinc-900">
              {mode === 'login' 
                ? (isFr ? 'Connexion à votre compte' : 'Sign In to Your Account') 
                : (isFr ? 'Créer un compte Privilège' : 'Create Prestige Account')}
            </h2>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
              {mode === 'login'
                ? (isFr ? 'Accédez à vos commandes, vos favoris et vos préférences de boutique.' : 'Access your orders, wishlist, and boutique preferences.')
                : (isFr ? 'Rejoignez GLADYNS pour la livraison express mondiale et le suivi en temps réel.' : 'Join GLADYNS for global express shipping and live order tracking.')}
            </p>
          </div>

          {/* Error Notice */}
          {(errorMsg || providerErrorNotice) && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-[11px] text-rose-600 text-left animate-in fade-in duration-200">
              <p className="font-bold mb-0.5">{isFr ? 'Avis d\'authentification :' : 'Authentication Notice:'}</p>
              <p>{errorMsg || providerErrorNotice}</p>
            </div>
          )}

          {/* Continue with Google */}
          <div className="pt-1">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleGoogleAuth}
              className="w-full h-12 bg-white border border-zinc-200 hover:border-zinc-950 hover:shadow-md text-zinc-800 rounded-2xl text-xs font-bold flex items-center justify-center gap-3.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
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
              <span>{isFr ? 'Continuer avec Google' : 'Continue with Google'}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-zinc-200 w-full" />
            <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 shrink-0">
              {isFr
                ? (mode === 'login' ? 'Ou connectez-vous par e-mail' : 'Ou inscrivez-vous par e-mail')
                : `Or ${mode === 'login' ? 'sign in' : 'register'} with email`}
            </span>
            <div className="border-t border-zinc-200 w-full" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700 block">
                  {isFr ? 'Nom complet' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder={isFr ? 'Marie Dubois' : 'Jane Doe'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl text-xs text-zinc-900 transition-all outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-700 block">
                {isFr ? 'Adresse e-mail' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="patron@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl text-xs text-zinc-900 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-700 block">
                {isFr ? 'Mot de passe' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl text-xs text-zinc-900 transition-all outline-none"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="pt-1">
                <label className="flex items-start gap-2.5 text-[11px] text-zinc-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptedAgeAndTerms}
                    onChange={(e) => setAcceptedAgeAndTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                    required
                  />
                  <span className="leading-snug">
                    {isFr ? (
                      <>
                        J'atteste avoir <strong>au moins 13 ans</strong> et j'accepte les{' '}
                        <span className="text-blue-600 underline font-medium">Conditions d'Utilisation</span> et la{' '}
                        <span className="text-blue-600 underline font-medium">Politique de Confidentialité</span>.
                      </>
                    ) : (
                      <>
                        I certify that I am <strong>at least 13 years old</strong> and agree to the{' '}
                        <span className="text-blue-600 underline font-medium">Terms of Service</span> and{' '}
                        <span className="text-blue-600 underline font-medium">Privacy Policy</span>.
                      </>
                    )}
                  </span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing || (mode === 'register' && !acceptedAgeAndTerms)}
              className="w-full h-12 mt-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'login'
                      ? (isFr ? 'Connexion' : 'Sign In')
                      : (isFr ? 'Créer un compte' : 'Create Account')}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {isPendingCheckout && onContinueAsGuest && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onContinueAsGuest}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2 cursor-pointer transition-colors"
                >
                  {isFr ? 'Ou continuer la commande en tant qu\'invité (sans mot de passe) →' : 'Or continue checkout as guest (no password needed) →'}
                </button>
              </div>
            )}
          </form>

          {/* Toggle Mode Link */}
          <div className="pt-2 text-center text-xs text-zinc-500">
            {mode === 'login' ? (
              <p>
                {isFr ? 'Vous n\'avez pas encore de compte ? ' : 'Don\'t have an account? '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMsg(null); }}
                  className="font-bold text-zinc-950 hover:underline cursor-pointer"
                >
                  {isFr ? 'Créer un compte' : 'Create Account'}
                </button>
              </p>
            ) : (
              <p>
                {isFr ? 'Vous possédez déjà un compte ? ' : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(null); }}
                  className="font-bold text-zinc-950 hover:underline cursor-pointer"
                >
                  {isFr ? 'Connexion' : 'Sign In'}
                </button>
              </p>
            )}
          </div>

          {/* Security Footer */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 font-medium pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>{isFr ? 'Connexion chiffrée SSL 256 bits' : '256-bit SSL Encrypted Connection'}</span>
          </div>

        </div>
      </div>
    </div>
  );
};
