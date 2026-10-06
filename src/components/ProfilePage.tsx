import React, { useState, useMemo } from 'react';
import {
  User,
  Package,
  MapPin,
  Settings,
  ShieldCheck,
  Award,
  LogOut,
  Plus,
  Trash2,
  Check,
  Edit2,
  Sparkles,
  ArrowRight,
  Heart,
  Calendar,
  Lock,
  Crown,
  ChevronRight,
  TrendingUp,
  Gift,
  Zap,
  Bell,
  CreditCard,
  ShoppingBag,
  Clock,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { UserProfile, UserAddress, LoyaltyTier, Order, Product, ProductVariant, ProductSize } from '../types/store';
import { calculateLoyaltyProgress, LOYALTY_TIERS } from '../utils/loyalty';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';
import { COUNTRY_CODES, COUNTRIES } from '../data/countries';
import { INITIAL_PRODUCTS } from '../data/products';
import { ProductCard } from './ProductCard';

interface ProfilePageProps {
  user: UserProfile | null;
  orders: Order[];
  products: Product[];
  wishlistIds: string[];
  onUpdateUser: (updated: UserProfile) => void;
  onLogout: () => void;
  onOpenAuth: () => void;
  onBackToShop: () => void;
  onOpenOrders: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart?: (product: Product, variant: ProductVariant, size: ProductSize, quantity: number) => void;
  onToggleWishlist?: (productId: string) => void;
  initialTab?: 'dashboard' | 'profile' | 'addresses' | 'loyalty';
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  orders,
  products,
  wishlistIds,
  onUpdateUser,
  onLogout,
  onOpenAuth,
  onBackToShop,
  onOpenOrders,
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
  initialTab = 'dashboard',
}) => {
  const { t, formatPrice, language } = useLanguageCurrency();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'addresses' | 'loyalty'>(
    initialTab === ('preferences' as any) ? 'profile' : initialTab
  );

  // Form states
  const [editFirstName, setEditFirstName] = useState(user?.firstName || '');
  const [editLastName, setEditLastName] = useState(user?.lastName || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  
  // Extract dial code or default to +225 (Côte d'Ivoire)
  const initialDialCode = useMemo(() => {
    const matched = COUNTRY_CODES.find(c => user?.phone?.startsWith(c.code));
    return matched ? matched.code : '+225';
  }, [user]);

  const initialRawPhone = useMemo(() => {
    if (!user?.phone) return '';
    const matched = COUNTRY_CODES.find(c => user.phone.startsWith(c.code));
    return matched ? user.phone.replace(matched.code, '').trim() : user.phone;
  }, [user]);

  const [profilePhoneDialCode, setProfilePhoneDialCode] = useState(initialDialCode);
  const [profilePhoneRaw, setProfilePhoneRaw] = useState(initialRawPhone);
  const [editPreferredSize, setEditPreferredSize] = useState<'XS' | 'S' | 'M' | 'L' | 'XL'>(
    user?.preferences.preferredSize || 'M'
  );
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Address states
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-[2rem] border border-zinc-200 p-10 text-center shadow-2xl shadow-zinc-200/50 space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-zinc-950 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500">
            <User className="w-10 h-10" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl font-display font-medium text-zinc-950 tracking-tight">
              {language === 'fr' ? 'GLADYNS Customer Account' : 'GLADYNS Customer Account'}
            </h1>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Identify yourself to access your personal dashboard, marketplace order history, and membership benefits.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onOpenAuth}
              className="w-full py-4 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl text-sm font-bold shadow-lg shadow-zinc-950/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>{t('signIn')} / {t('register')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onBackToShop}
              className="w-full py-4 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 rounded-2xl text-sm font-semibold transition-all"
            >
              Return to Boutique
            </button>
          </div>
        </div>
      </div>
    );
  }

  const loyalty = calculateLoyaltyProgress(user.loyaltyPoints);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onUpdateUser({
        ...user,
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        phone: `${profilePhoneDialCode} ${profilePhoneRaw}`.trim(),
        preferences: {
          ...user.preferences,
          preferredSize: editPreferredSize,
        },
      });
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      {/* Top Navigation Bar / Breadcrumb */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBackToShop}
              className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="text-zinc-400">Account</span>
              <ChevronRight className="w-4 h-4 text-zinc-300" />
              <span className="text-zinc-900">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex flex-col lg:flex-row gap-12">
        
        {/* Sidebar Navigation */}
        <aside className="lg:w-72 shrink-0 space-y-8">
          <div className="flex items-center gap-4 p-2">
            <div className="w-14 h-14 rounded-2xl bg-zinc-950 flex items-center justify-center text-white text-xl font-display shadow-xl shadow-zinc-950/20">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <h2 className="text-lg font-display font-medium text-zinc-950 leading-tight">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-xs text-zinc-500">{user.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: ShoppingBag },
              { id: 'profile', label: 'Identity & Details', icon: User },
              { id: 'loyalty', label: 'Loyalty Tiers', icon: Crown },
              { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all group ${
                  activeTab === tab.id
                    ? 'bg-zinc-950 text-white shadow-lg shadow-zinc-950/20'
                    : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-950'}`} />
                  <span>{tab.label}</span>
                </div>
                {activeTab === tab.id && <ChevronRight className="w-4 h-4" />}
              </button>
            ))}
          </nav>

          <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 space-y-4">
            <div className="flex items-center gap-2 text-blue-700">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-sm font-bold">Priority Support</span>
            </div>
            <p className="text-xs text-blue-600/80 leading-relaxed">
              As a <b>{user.tier}</b> member, you have priority premium support assigned to your account.
            </p>
            <button className="w-full py-2.5 bg-white border border-blue-200 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors">
              Chat with Specialist
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          
          {/* DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <header className="space-y-2">
                <h1 className="text-4xl font-display font-medium text-zinc-950 tracking-tight">GLADYNS Dashboard</h1>
                <p className="text-zinc-500">Your personalized marketplace dashboard.</p>
              </header>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Loyalty Card (Spans 2) */}
                <div className="md:col-span-2 bg-white rounded-[2.5rem] border border-zinc-200 p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-500 group">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                          <Crown className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Membership Status</p>
                          <h3 className="text-2xl font-display font-medium text-zinc-950">{user.tier} Tier</h3>
                        </div>
                      </div>
                      <button onClick={() => setActiveTab('loyalty')} className="p-3 bg-zinc-50 rounded-2xl hover:bg-zinc-950 hover:text-white transition-all">
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-end justify-between">
                        <div className="space-y-1">
                          <span className="text-3xl font-mono font-bold text-zinc-950">{user.loyaltyPoints.toLocaleString()}</span>
                          <span className="text-sm font-semibold text-zinc-400 ml-2">Total Points Earned</span>
                        </div>
                        <p className="text-xs font-bold text-zinc-500">Next: {loyalty.nextTier?.name || 'Platinum Max'}</p>
                      </div>
                      <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden p-0.5 border border-zinc-200">
                        <div 
                          className="h-full bg-zinc-950 rounded-full transition-all duration-1000 group-hover:bg-amber-600"
                          style={{ width: `${loyalty.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 flex flex-wrap gap-2">
                    {loyalty.currentTier.perks.slice(0, 3).map((perk, i) => (
                      <span key={i} className="px-3 py-1.5 bg-zinc-50 text-[10px] font-bold text-zinc-600 rounded-lg border border-zinc-100">
                        {perk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick Stats Column */}
                <div className="space-y-6">
                  <div className="bg-white rounded-[2rem] border border-zinc-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5 text-zinc-900" />
                      </div>
                      <h4 className="text-sm font-bold text-zinc-950">Active Orders</h4>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-mono font-bold text-zinc-950">
                        {orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length}
                      </span>
                      <span className="text-xs text-zinc-500">Currently in pipeline</span>
                    </div>
                    <button 
                      onClick={onOpenOrders}
                      className="w-full mt-4 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors"
                    >
                      Track Shipment
                    </button>
                  </div>

                  <div className="bg-zinc-950 rounded-[2rem] p-6 shadow-xl shadow-zinc-950/20 text-white relative overflow-hidden group">
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                          <Gift className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-sm font-bold">Prestige Credit</h4>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-mono font-bold">{formatPrice(loyalty.creditValueUSD)}</span>
                      </div>
                      <p className="text-[10px] text-white/50 leading-relaxed">
                        Convert your loyalty points into exclusive platform credit during checkout.
                      </p>
                    </div>
                    {/* Abstract background shape */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                  </div>
                </div>

                {/* Recent Activity Card */}
                <div className="md:col-span-3 bg-white rounded-[2.5rem] border border-zinc-200 overflow-hidden shadow-sm">
                  <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between">
                    <h3 className="text-lg font-display font-medium text-zinc-950">Recent Order History</h3>
                    <button onClick={onOpenOrders} className="text-xs font-bold text-zinc-500 hover:text-zinc-950 transition-colors flex items-center gap-1">
                      <span>View All History</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="divide-y divide-zinc-50">
                    {orders.slice(0, 3).length > 0 ? (
                      orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="px-8 py-6 flex items-center justify-between hover:bg-zinc-50 transition-colors group cursor-pointer" onClick={onOpenOrders}>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-zinc-950 group-hover:bg-white border border-transparent group-hover:border-zinc-200 transition-all">
                              <ShoppingBag className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-zinc-950">{order.orderNumber}</p>
                              <p className="text-xs text-zinc-500">{order.date} • {order.items.length} pieces</p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-6">
                            <div className="hidden sm:block">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <span className="text-sm font-mono font-bold text-zinc-950">{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-8 py-12 text-center">
                        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <ShoppingBag className="w-8 h-8 text-zinc-300" />
                        </div>
                        <p className="text-sm text-zinc-400">No acquisition history recorded yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* IDENTITY TAB */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <header className="space-y-2">
                <h1 className="text-4xl font-display font-medium text-zinc-950 tracking-tight">Identity & Interests</h1>
                <p className="text-zinc-500">Manage your profile data and curation preferences.</p>
              </header>

              <form onSubmit={handleSaveProfile} className="space-y-10">
                {saveSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm animate-in fade-in zoom-in-95">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold">Your changes have been saved successfully.</span>
                  </div>
                )}

                <section className="space-y-6">
                  <h3 className="text-lg font-display font-medium text-zinc-950 border-b border-zinc-100 pb-2">Account Details</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">First Name</label>
                      <input 
                        type="text" 
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        className="w-full h-14 px-5 bg-white border border-zinc-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Last Name</label>
                      <input 
                        type="text" 
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        className="w-full h-14 px-5 bg-white border border-zinc-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 outline-none transition-all"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Registered Email</label>
                      <input 
                        type="email" 
                        value={editEmail}
                        readOnly
                        className="w-full h-14 px-5 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium text-zinc-400 outline-none"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Phone Number</label>
                      <div className="flex gap-2">
                        <select
                          value={profilePhoneDialCode}
                          onChange={(e) => setProfilePhoneDialCode(e.target.value)}
                          className="h-14 px-4 bg-white border border-zinc-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 transition-all max-w-[120px]"
                        >
                          {COUNTRY_CODES.map((c, i) => (
                            <option key={i} value={c.code}>
                              {c.flag} {c.code}
                            </option>
                          ))}
                        </select>
                        <input 
                          type="tel" 
                          placeholder="e.g. 07 08 09 10"
                          value={profilePhoneRaw}
                          onChange={(e) => setProfilePhoneRaw(e.target.value)}
                          className="flex-1 h-14 px-5 bg-white border border-zinc-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 outline-none transition-all font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full h-16 bg-zinc-950 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Save Profile Updates</span>
                    </>
                  )}
                </button>
              </form>

              <section className="space-y-6 pt-6 border-t border-zinc-100">
                <div className="flex items-center gap-3 text-rose-600">
                  <Clock className="w-5 h-5" />
                  <h3 className="text-sm font-bold uppercase tracking-widest">Danger Zone</h3>
                </div>
                <div className="p-6 border border-rose-100 rounded-[2rem] bg-rose-50/30 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-rose-950">Deactivate Account</p>
                    <p className="text-xs text-rose-900/60 leading-relaxed">
                      Permanently erase your order history and customer account.
                    </p>
                  </div>
                  <button className="px-4 py-2 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 rounded-xl transition-all">
                    Delete Account
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* LOYALTY TAB */}
          {activeTab === 'loyalty' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <header className="space-y-2">
                <h1 className="text-4xl font-display font-medium text-zinc-950 tracking-tight">Prestige Loyalty</h1>
                <p className="text-zinc-500">The more you acquire, the more we dedicate to your experience.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {LOYALTY_TIERS.map((tier) => {
                  const isCurrent = user.tier === tier.id;
                  const isUnlocked = user.loyaltyPoints >= tier.minPoints;
                  
                  return (
                    <div 
                      key={tier.id}
                      className={`relative overflow-hidden rounded-[2.5rem] border p-8 flex flex-col justify-between transition-all duration-500 ${
                        isCurrent 
                          ? 'bg-zinc-950 text-white border-zinc-950 shadow-2xl shadow-zinc-950/40 ring-4 ring-zinc-950/5' 
                          : isUnlocked 
                            ? 'bg-white border-zinc-200' 
                            : 'bg-zinc-50 border-zinc-100 opacity-60'
                      }`}
                    >
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className={`p-3 rounded-2xl ${isCurrent ? 'bg-white/10' : 'bg-zinc-100'}`}>
                            <Award className={`w-6 h-6 ${isCurrent ? 'text-white' : 'text-zinc-950'}`} />
                          </div>
                          {isCurrent && (
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest">
                              Current Rank
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-2xl font-display font-medium">{tier.name}</h3>
                          <p className={`text-xs mt-1 ${isCurrent ? 'text-white/60' : 'text-zinc-500'}`}>
                            {tier.minPoints.toLocaleString()} Points Entry
                          </p>
                        </div>

                        <ul className="space-y-3">
                          {tier.perks.map((perk, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isCurrent ? 'text-white' : 'text-zinc-400'}`} />
                              <span className={`text-[13px] font-medium ${isCurrent ? 'text-white/80' : 'text-zinc-600'}`}>{perk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {!isUnlocked && (
                        <div className="mt-8 pt-6 border-t border-zinc-200">
                          <p className="text-xs font-bold text-zinc-400 italic">
                            Earn {(tier.minPoints - user.loyaltyPoints).toLocaleString()} more points to unlock.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-display font-medium text-zinc-950 tracking-tight">Saved Addresses</h1>
                  <p className="text-zinc-500">Manage your global delivery destinations.</p>
                </div>
                <button 
                  onClick={() => setIsAddingAddress(true)}
                  className="px-6 py-3 bg-zinc-950 text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Destination</span>
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user.addresses.length > 0 ? (
                  user.addresses.map((address) => (
                    <div 
                      key={address.id} 
                      className={`relative bg-white rounded-[2rem] border p-8 space-y-6 transition-all group ${
                        address.isDefault ? 'border-zinc-950 shadow-lg shadow-zinc-950/5' : 'border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-display font-medium text-zinc-950">{address.label || 'Destination'}</h4>
                            {address.isDefault && (
                              <span className="px-2 py-0.5 bg-zinc-950 text-white text-[9px] font-black uppercase tracking-widest rounded">Default</span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-zinc-900">{address.firstName} {address.lastName}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400 hover:text-zinc-950">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-rose-50 rounded-lg transition-colors text-zinc-400 hover:text-rose-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 text-sm text-zinc-500 leading-relaxed">
                        <p>{address.street}{address.apartment ? `, ${address.apartment}` : ''}</p>
                        <p>{address.city}, {address.state} {address.postalCode}</p>
                        <p>{address.country}</p>
                        <p className="mt-4 pt-4 border-t border-zinc-50 text-[11px] font-mono">{address.phone}</p>
                      </div>

                      {!address.isDefault && (
                        <button className="text-xs font-bold text-zinc-400 hover:text-zinc-950 transition-colors uppercase tracking-widest">
                          Set as Default
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-20 bg-zinc-50 rounded-[2.5rem] border border-dashed border-zinc-200 flex flex-col items-center justify-center text-center space-y-4">
                    <MapPin className="w-12 h-12 text-zinc-300" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-zinc-950">No delivery destinations found.</p>
                      <p className="text-xs text-zinc-500">Add an address to streamline your future dispatches.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* More to Discover section (Full width of standard max-w-7xl) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="space-y-10 pt-16 border-t border-zinc-100">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block">
                  {language === 'fr' ? 'SÉLECTION PERSONNALISÉE' : 'RECOMMENDED FOR YOU'}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-medium text-slate-950">
                {language === 'fr' ? 'Équipements à Découvrir' : 'More to Discover'}
              </h3>
              <p className="text-xs text-slate-500 max-w-xl">
                {language === 'fr' 
                  ? 'Découvrez d\'autres modèles et composants sélectionnés pour compléter votre profil.' 
                  : 'Explore curated models, hardware configurations, and accessories tailored to your preferences.'}
              </p>
            </div>
            <button 
              onClick={onBackToShop}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest flex items-center gap-1.5 mt-4 md:mt-0 cursor-pointer"
            >
              <span>{language === 'fr' ? 'Voir tout le catalogue' : 'Explore All Equipment'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.slice(0, 4).map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                isWishlisted={wishlistIds.includes(prod.id)}
                onSelect={onSelectProduct}
                onQuickAdd={(p, v) => {
                  const defaultSize = p.sizes.find(s => s.inStock) || p.sizes[0];
                  onAddToCart?.(p, v, defaultSize, 1);
                }}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action / Support */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-14 h-14 bg-zinc-950 text-white rounded-full flex items-center justify-center shadow-2xl shadow-zinc-950/40 hover:scale-110 transition-transform active:scale-95 group relative">
          <HelpCircle className="w-6 h-6" />
          <span className="absolute right-full mr-4 bg-zinc-950 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            GLADYNS Support
          </span>
        </button>
      </div>
    </div>
  );
};
