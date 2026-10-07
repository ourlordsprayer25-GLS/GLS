import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Award,
  DollarSign,
  UserCheck,
  TrendingUp,
  Download,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  Calendar,
  Clock,
  Smartphone,
  Globe,
  Zap,
  MapPin,
  Activity,
  Check,
  MessageCircle,
  Phone,
  Mail,
  ShoppingBag,
  ExternalLink,
  X,
  ShieldCheck,
  ArrowUpDown,
  Copy
} from 'lucide-react';
import { UserProfile, Order, LoyaltyTier } from '../../types/store';
import { updateRealtimeUserProfile, deleteRealtimeUser } from '../../services/supabaseService';
import { useLanguageCurrency } from '../../context/LanguageCurrencyContext';
import { WhatsAppIcon } from '../WhatsAppWidget';

interface AdminCustomersProps {
  users: UserProfile[];
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  orders: Order[];
  initialSearchQuery?: string;
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({ 
  users, 
  setUsers, 
  orders, 
  initialSearchQuery 
}) => {
  const { formatPrice, language } = useLanguageCurrency();
  const isFr = language === 'fr';

  const [searchTerm, setSearchTerm] = useState(initialSearchQuery || '');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created-desc' | 'created-asc' | 'active-desc' | 'orders-desc' | 'points-desc'>('created-desc');
  const [selectedCustomer, setSelectedCustomer] = useState<UserProfile | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchTerm(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Sync selected customer if users array is updated
  React.useEffect(() => {
    if (selectedCustomer) {
      const refreshed = users.find(u => u.id === selectedCustomer.id);
      if (refreshed) {
        setSelectedCustomer(refreshed);
      }
    }
  }, [users]);

  // STRICT FILTER: Remove any profile with no account (no email or guest placeholder)
  const registeredAccounts = useMemo(() => {
    return users.filter(u => {
      if (!u) return false;
      const email = typeof u.email === 'string' ? u.email.trim() : '';
      if (!email || email.length === 0) return false;
      if (email.includes('@guest.')) return false;
      if (u.id?.startsWith('guest-') || u.id === 'usr-guest') return false;
      return true;
    });
  }, [users]);

  // Customer order map helper
  const getCustomerOrders = (customer: UserProfile): Order[] => {
    if (!orders || orders.length === 0) return [];
    return orders.filter(o => {
      const matchId = o.customerId && o.customerId === customer.id;
      const matchEmail = o.shippingAddress?.email && customer.email && 
        o.shippingAddress.email.toLowerCase().trim() === customer.email.toLowerCase().trim();
      const matchPhone = o.shippingAddress?.phone && customer.phone && 
        o.shippingAddress.phone.replace(/\D/g, '') === customer.phone.replace(/\D/g, '');
      return matchId || matchEmail || matchPhone;
    });
  };

  // Helper for Creation (Day of week, Date, Time)
  const getCreationInfo = (u: UserProfile) => {
    let d: Date | null = null;
    if (u.registrationDetails?.exactTimestamp) {
      const parsed = new Date(u.registrationDetails.exactTimestamp);
      if (!isNaN(parsed.getTime())) d = parsed;
    }
    if (!d && u.registeredDateExact) {
      const parsed = new Date(u.registeredDateExact);
      if (!isNaN(parsed.getTime())) d = parsed;
    }
    if (!d && (u as any).created_at) {
      const parsed = new Date((u as any).created_at);
      if (!isNaN(parsed.getTime())) d = parsed;
    }
    if (!d && (u as any).updated_at) {
      const parsed = new Date((u as any).updated_at);
      if (!isNaN(parsed.getTime())) d = parsed;
    }

    if (d) {
      const day = d.toLocaleDateString(isFr ? 'fr-FR' : 'en-US', { weekday: 'long' });
      const date = d.toLocaleDateString(isFr ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' });
      const time = d.toLocaleTimeString(isFr ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: !isFr });
      return {
        day: day.charAt(0).toUpperCase() + day.slice(1),
        date,
        time,
        timestamp: d.getTime()
      };
    }

    return {
      day: isFr ? 'Mercredi' : 'Wednesday',
      date: u.memberSince || (isFr ? 'Octobre 2026' : 'October 2026'),
      time: '12:00:00',
      timestamp: 0
    };
  };

  // Helper for Activity (Day of week, Date, Time)
  const getActivityInfo = (u: UserProfile) => {
    const custOrders = getCustomerOrders(u);
    let latestOrderDate: Date | null = null;
    if (custOrders.length > 0) {
      const validDates = custOrders.map(o => new Date(o.date).getTime()).filter(t => !isNaN(t));
      if (validDates.length > 0) {
        latestOrderDate = new Date(Math.max(...validDates));
      }
    }

    let d: Date | null = null;
    if ((u as any).updated_at) {
      const parsed = new Date((u as any).updated_at);
      if (!isNaN(parsed.getTime())) d = parsed;
    }
    if (latestOrderDate && (!d || latestOrderDate.getTime() > d.getTime())) {
      d = latestOrderDate;
    }

    const isOnline = u.sessionStatus === 'online' || u.lastSeen === 'Active Now';

    if (d) {
      const day = d.toLocaleDateString(isFr ? 'fr-FR' : 'en-US', { weekday: 'long' });
      const date = d.toLocaleDateString(isFr ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' });
      const time = d.toLocaleTimeString(isFr ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: !isFr });
      return {
        day: day.charAt(0).toUpperCase() + day.slice(1),
        date,
        time,
        timestamp: d.getTime(),
        isOnline
      };
    }

    return {
      day: isFr ? 'Mercredi' : 'Wednesday',
      date: '07 Oct 2026',
      time: '14:00:00',
      timestamp: Date.now(),
      isOnline
    };
  };

  // Adjust loyalty points helper
  const adjustLoyaltyPoints = (userId: string, pointsAmount: number) => {
    setUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id !== userId) return u;
        const currentPoints = u.loyaltyPoints || 0;
        const newPoints = Math.max(0, currentPoints + pointsAmount);
        const updated = {
          ...u,
          loyaltyPoints: newPoints,
          pointsHistory: [
            {
              id: `tx-${Date.now()}`,
              date: new Date().toLocaleDateString(),
              description: isFr ? 'Ajustement manuel administrateur' : 'Manual adjustment by administrator',
              points: pointsAmount,
              type: 'tier_bonus' as const
            },
            ...(u.pointsHistory || [])
          ]
        };
        updateRealtimeUserProfile(updated);
        return updated;
      })
    );

    if (selectedCustomer && selectedCustomer.id === userId) {
      setSelectedCustomer(prev =>
        prev
          ? {
              ...prev,
              loyaltyPoints: Math.max(0, (prev.loyaltyPoints || 0) + pointsAmount)
            }
          : null
      );
    }
  };

  // Update customer loyalty tier
  const updateCustomerTier = (userId: string, tier: LoyaltyTier) => {
    setUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id === userId) {
          const updated = { ...u, tier };
          updateRealtimeUserProfile(updated);
          return updated;
        }
        return u;
      })
    );

    if (selectedCustomer && selectedCustomer.id === userId) {
      setSelectedCustomer(prev => (prev ? { ...prev, tier } : null));
    }
  };

  // Delete customer record permanently
  const handleDeleteCustomer = () => {
    if (deleteConfirmationId) {
      setUsers(prev => prev.filter(u => u.id !== deleteConfirmationId));
      deleteRealtimeUser(deleteConfirmationId);
      if (selectedCustomer?.id === deleteConfirmationId) {
        setSelectedCustomer(null);
      }
      setDeleteConfirmationId(null);
    }
  };

  // Safe user display name and initials
  const getInitials = (u: UserProfile) => {
    const f = u.firstName ? u.firstName.trim().charAt(0).toUpperCase() : '';
    const l = u.lastName ? u.lastName.trim().charAt(0).toUpperCase() : '';
    if (f || l) return (f + l).slice(0, 2);
    if (u.email) return u.email.trim().slice(0, 2).toUpperCase();
    return 'CL';
  };

  const getDisplayName = (u: UserProfile) => {
    const full = `${u.firstName || ''} ${u.lastName || ''}`.trim();
    if (full) return full;
    if (u.email) return u.email.split('@')[0];
    return isFr ? 'Client Enregistré' : 'Registered Patron';
  };

  // Export CSV of registered patrons
  const exportCustomersCSV = () => {
    if (registeredAccounts.length === 0) return;
    const headers = [
      'Customer ID',
      'Full Name',
      'Email',
      'Phone',
      'Creation Day',
      'Creation Date',
      'Creation Time',
      'Activity Day',
      'Activity Date',
      'Activity Time',
      'Loyalty Tier',
      'Loyalty Points',
      'City',
      'Total Orders',
      'Total Spent (FCFA)'
    ];

    const rows = filteredUsers.map(u => {
      const cre = getCreationInfo(u);
      const act = getActivityInfo(u);
      const custOrders = getCustomerOrders(u);
      const totalSpent = custOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

      return [
        `"${u.id}"`,
        `"${getDisplayName(u)}"`,
        `"${u.email}"`,
        `"${u.phone || ''}"`,
        `"${cre.day}"`,
        `"${cre.date}"`,
        `"${cre.time}"`,
        `"${act.day}"`,
        `"${act.date}"`,
        `"${act.time}"`,
        `"${u.tier || 'Bronze'}"`,
        u.loyaltyPoints || 0,
        `"${u.location?.city || u.addresses?.[0]?.city || 'Abidjan'}"`,
        custOrders.length,
        totalSpent
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gladyns-patrons-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy email helper
  const handleCopyEmail = (email: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(email);
    setCopiedEmailId(id);
    setTimeout(() => setCopiedEmailId(null), 2000);
  };

  // Metrics Calculations
  const totalRegistered = registeredAccounts.length;
  const activeNowCount = registeredAccounts.filter(u => u.sessionStatus === 'online' || u.lastSeen === 'Active Now').length;
  const vipCount = registeredAccounts.filter(u => u.tier && u.tier !== 'Bronze').length;
  const totalCustomerSpend = registeredAccounts.reduce((acc, u) => {
    const custOrders = getCustomerOrders(u);
    return acc + custOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  }, 0);

  // Filtered & Sorted Customer List
  const filteredUsers = useMemo(() => {
    return registeredAccounts.filter(u => {
      const q = searchTerm?.toLowerCase().trim();
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
      const email = (u.email || '').toLowerCase();
      const phone = (u.phone || '');
      const city = (u.location?.city || u.addresses?.[0]?.city || '').toLowerCase();

      const matchesSearch = !q ||
        fullName.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        city.includes(q) ||
        u.id.toLowerCase().includes(q);

      let matchesTier = true;
      if (tierFilter === 'active-now') {
        matchesTier = u.sessionStatus === 'online' || u.lastSeen === 'Active Now';
      } else if (tierFilter === 'has-orders') {
        matchesTier = getCustomerOrders(u).length > 0;
      } else if (tierFilter === 'vip') {
        matchesTier = Boolean(u.tier && u.tier !== 'Bronze');
      } else if (tierFilter !== 'all') {
        matchesTier = u.tier?.toLowerCase() === tierFilter.toLowerCase();
      }

      return matchesSearch && matchesTier;
    }).sort((a, b) => {
      if (sortBy === 'created-asc') {
        return getCreationInfo(a).timestamp - getCreationInfo(b).timestamp;
      }
      if (sortBy === 'active-desc') {
        return getActivityInfo(b).timestamp - getActivityInfo(a).timestamp;
      }
      if (sortBy === 'orders-desc') {
        return getCustomerOrders(b).length - getCustomerOrders(a).length;
      }
      if (sortBy === 'points-desc') {
        return (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0);
      }
      // Default: created-desc
      return getCreationInfo(b).timestamp - getCreationInfo(a).timestamp;
    });
  }, [registeredAccounts, searchTerm, tierFilter, sortBy, orders]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-display font-black tracking-tight text-zinc-900">
              {isFr ? 'Clients Enregistrés & Activité' : 'Registered Patrons & Activity'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-bold font-mono">
              {totalRegistered} {isFr ? 'comptes actifs' : 'verified accounts'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {isFr
              ? 'Répertoire des comptes clients réels : date de création, heure exacte, dernière activité et historique.'
              : 'Verified customer account directory: creation day & time, live activity, orders, and rewards.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={exportCustomersCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200/90 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95"
            title={isFr ? 'Exporter les clients enregistrés en CSV' : 'Export registered customers to CSV'}
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span>{isFr ? 'Exporter Répertoire' : 'Export Directory'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Total Registered Accounts */}
        <div 
          onClick={() => setTierFilter('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            tierFilter === 'all' 
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
              : 'bg-white text-zinc-900 border-zinc-200/80 hover:border-blue-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${tierFilter === 'all' ? 'text-blue-100' : 'text-zinc-500'}`}>
              {isFr ? 'Comptes Vérifiés' : 'Registered Accounts'}
            </span>
            <Users className={`w-4 h-4 ${tierFilter === 'all' ? 'text-white' : 'text-zinc-400'}`} />
          </div>
          <p className="text-xl sm:text-2xl font-black mt-2 font-mono tracking-tight">{totalRegistered}</p>
          <p className={`text-[10px] mt-1 ${tierFilter === 'all' ? 'text-blue-100' : 'text-zinc-500'}`}>
            {isFr ? 'Profils sans compte retirés' : 'Zero guest placeholders'}
          </p>
        </div>

        {/* Card 2: Active / Online Now */}
        <div 
          onClick={() => setTierFilter('active-now')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            tierFilter === 'active-now' 
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20' 
              : 'bg-white text-zinc-900 border-zinc-200/80 hover:border-emerald-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${tierFilter === 'active-now' ? 'text-emerald-100' : 'text-emerald-600'}`}>
              {isFr ? 'En Ligne / Actifs' : 'Active / Online Now'}
            </span>
            <Activity className={`w-4 h-4 ${tierFilter === 'active-now' ? 'text-white' : 'text-emerald-500'}`} />
          </div>
          <p className="text-xl sm:text-2xl font-black mt-2 font-mono tracking-tight">{activeNowCount}</p>
          <p className={`text-[10px] mt-1 ${tierFilter === 'active-now' ? 'text-emerald-100' : 'text-zinc-500'}`}>
            {isFr ? 'Sessions en direct' : 'Live storefront sessions'}
          </p>
        </div>

        {/* Card 3: VIP Loyalty Patrons */}
        <div 
          onClick={() => setTierFilter('vip')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            tierFilter === 'vip' 
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20' 
              : 'bg-white text-zinc-900 border-zinc-200/80 hover:border-indigo-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${tierFilter === 'vip' ? 'text-indigo-100' : 'text-indigo-600'}`}>
              {isFr ? 'Membres VIP' : 'VIP & Loyalty Club'}
            </span>
            <Award className={`w-4 h-4 ${tierFilter === 'vip' ? 'text-white' : 'text-indigo-500'}`} />
          </div>
          <p className="text-xl sm:text-2xl font-black mt-2 font-mono tracking-tight">{vipCount}</p>
          <p className={`text-[10px] mt-1 ${tierFilter === 'vip' ? 'text-indigo-100' : 'text-zinc-500'}`}>
            {isFr ? 'Silver, Gold & Platinum' : 'Elevated reward tiers'}
          </p>
        </div>

        {/* Card 4: Total Customer Spend */}
        <div 
          onClick={() => setTierFilter('has-orders')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            tierFilter === 'has-orders' 
              ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-500/20' 
              : 'bg-white text-zinc-900 border-zinc-200/80 hover:border-amber-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${tierFilter === 'has-orders' ? 'text-amber-100' : 'text-amber-600'}`}>
              {isFr ? 'Commandes Clients' : 'Total Patron Spend'}
            </span>
            <DollarSign className={`w-4 h-4 ${tierFilter === 'has-orders' ? 'text-white' : 'text-amber-500'}`} />
          </div>
          <p className="text-xl sm:text-2xl font-black mt-2 font-mono tracking-tight">{formatPrice(totalCustomerSpend)}</p>
          <p className={`text-[10px] mt-1 ${tierFilter === 'has-orders' ? 'text-amber-100' : 'text-zinc-500'}`}>
            {isFr ? 'Chiffre d\'affaires cumulé' : 'Across all registered patrons'}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-3">
        {/* Horizontal Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          {[
            { id: 'all', label: isFr ? 'Tous les comptes' : 'All Accounts', count: totalRegistered },
            { id: 'active-now', label: isFr ? 'En ligne' : 'Active Now', count: activeNowCount },
            { id: 'has-orders', label: isFr ? 'Avec Commandes' : 'With Orders', count: registeredAccounts.filter(u => getCustomerOrders(u).length > 0).length },
            { id: 'vip', label: isFr ? 'VIP & Fidélité' : 'VIP & Loyalty', count: vipCount },
            { id: 'Bronze', label: 'Bronze', count: registeredAccounts.filter(u => u.tier === 'Bronze' || !u.tier).length },
            { id: 'Silver', label: 'Silver', count: registeredAccounts.filter(u => u.tier === 'Silver').length },
            { id: 'Gold', label: 'Gold', count: registeredAccounts.filter(u => u.tier === 'Gold').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTierFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
                tierFilter === tab.id
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-zinc-100/80 hover:bg-zinc-200/80 text-zinc-600'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                tierFilter === tab.id ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200/80 text-zinc-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-zinc-100">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder={isFr ? "Rechercher par nom, email, téléphone, ville..." : "Search by customer name, email, phone, city..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white border border-zinc-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-zinc-50 border border-zinc-200/80 rounded-xl text-xs font-semibold text-zinc-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-none cursor-pointer pr-1"
              >
                <option value="created-desc">{isFr ? 'Création : Plus récent' : 'Creation: Newest First'}</option>
                <option value="created-asc">{isFr ? 'Création : Plus ancien' : 'Creation: Oldest First'}</option>
                <option value="active-desc">{isFr ? 'Activité : Plus récente' : 'Activity: Most Recent'}</option>
                <option value="orders-desc">{isFr ? 'Commandes : Plus élevées' : 'Orders: Most Placed'}</option>
                <option value="points-desc">{isFr ? 'Points Fidélité : Élevés' : 'Loyalty Points: High to Low'}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600">
            <thead>
              <tr className="border-b border-zinc-200/80 bg-zinc-50/80 text-zinc-800 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5">{isFr ? 'Client & Contact' : 'Customer & Contact'}</th>
                <th className="py-3.5 px-4">{isFr ? 'Création (Jour, Date & Heure)' : 'Creation (Day, Date & Time)'}</th>
                <th className="py-3.5 px-4">{isFr ? 'Dernière Activité' : 'Last Activity'}</th>
                <th className="py-3.5 px-4">{isFr ? 'Ville & Fidélité' : 'City & Tier'}</th>
                <th className="py-3.5 px-4 text-right">{isFr ? 'Commandes' : 'Store Orders'}</th>
                <th className="py-3.5 px-4 text-center">{isFr ? 'Action' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-zinc-400">
                    <Users className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="font-bold text-sm text-zinc-700">{isFr ? 'Aucun client trouvé' : 'No registered patrons found'}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {isFr ? 'Tous les profils sans compte ont été filtrés.' : 'Profiles with no account are removed.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const cre = getCreationInfo(u);
                  const act = getActivityInfo(u);
                  const custOrders = getCustomerOrders(u);
                  const totalSpent = custOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
                  const isSelected = selectedCustomer?.id === u.id;
                  const isOnline = act.isOnline;

                  return (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedCustomer(u)}
                      className={`group hover:bg-blue-50/40 transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      {/* Customer Info Column */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          {/* Avatar with live pulse dot */}
                          <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 text-blue-900 flex items-center justify-center font-bold text-xs shadow-2xs">
                              {getInitials(u)}
                            </div>
                            <span 
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
                              }`} 
                              title={isOnline ? 'Active Online Now' : 'Offline'}
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-zinc-900 text-sm truncate group-hover:text-blue-700 transition-colors">
                                {getDisplayName(u)}
                              </span>
                              <span className="inline-flex items-center text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-semibold border border-blue-200/60 shrink-0">
                                <ShieldCheck className="w-2.5 h-2.5 mr-0.5" />
                                {isFr ? 'Compte' : 'Account'}
                              </span>
                            </div>

                            {/* Email with copy button */}
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[11px] text-zinc-500 font-mono truncate">{u.email}</span>
                              <button
                                type="button"
                                onClick={(e) => handleCopyEmail(u.email, u.id, e)}
                                className="p-0.5 text-zinc-400 hover:text-zinc-700 cursor-pointer rounded"
                                title={isFr ? "Copier l'email" : "Copy email"}
                              >
                                {copiedEmailId === u.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>

                            {/* Phone if available */}
                            {u.phone && (
                              <span className="text-[11px] text-zinc-500 font-mono block mt-0.5">
                                {u.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Creation Day, Date & Time Column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-zinc-900 font-bold text-xs">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{cre.day}, {cre.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono mt-0.5">
                          <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span>{cre.time}</span>
                        </div>
                      </td>

                      {/* Activity Day, Date & Time Column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {isOnline ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                              <span>{isFr ? 'En Ligne Maintenant' : 'Active Now'}</span>
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5 text-zinc-900 font-bold text-xs">
                              <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                              <span>{act.day}, {act.date}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono mt-0.5">
                          <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span>{act.time}</span>
                        </div>
                      </td>

                      {/* City & Loyalty Column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-zinc-800 text-xs font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>{u.location?.flag || '🇨🇮'} {u.location?.city || u.addresses?.[0]?.city || 'Abidjan'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.tier === 'Gold' || u.tier === 'Platinum'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : u.tier === 'Silver'
                              ? 'bg-slate-100 text-slate-800 border border-slate-300'
                              : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                          }`}>
                            {u.tier || 'Bronze'}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {u.loyaltyPoints || 0} pts
                          </span>
                        </div>
                      </td>

                      {/* Store Orders & Spend Column */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="font-bold text-zinc-900 text-xs font-mono">
                          {formatPrice(totalSpent)}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          {custOrders.length} {isFr ? (custOrders.length > 1 ? 'commandes' : 'commande') : (custOrders.length > 1 ? 'orders' : 'order')}
                        </div>
                      </td>

                      {/* Quick Actions Column */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {u.phone ? (
                            <a
                              href={`https://wa.me/${u.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                isFr 
                                  ? `Bonjour ${getDisplayName(u)}, c'est la boutique GLADYNS.` 
                                  : `Hello ${getDisplayName(u)}, this is GLADYNS store.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title={isFr ? "Discuter sur WhatsApp" : "Chat on WhatsApp"}
                            >
                              <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                            </a>
                          ) : (
                            <a
                              href={`mailto:${u.email}`}
                              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                              title="Send Email"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(u)}
                            className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title={isFr ? "Ouvrir dossier client" : "Open patron file"}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Dossier Slide-Over Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-zinc-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="w-full max-w-xl h-full bg-white shadow-2xl flex flex-col border-l border-zinc-200 animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-base shadow-md shadow-blue-500/20">
                  {getInitials(selectedCustomer)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                      {getDisplayName(selectedCustomer)}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      {selectedCustomer.tier || 'Bronze'} Tier
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5 flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-zinc-400" />
                    <span>{selectedCustomer.email}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

              {/* Direct Quick Contact Buttons */}
              <div className="grid grid-cols-3 gap-2.5">
                {selectedCustomer.phone ? (
                  <a
                    href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      isFr 
                        ? `Bonjour ${getDisplayName(selectedCustomer)}, c'est la boutique GLADYNS.` 
                        : `Hello ${getDisplayName(selectedCustomer)}, this is GLADYNS store.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 transition-all font-bold text-xs"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-emerald-600 mb-1" />
                    <span>WhatsApp</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex flex-col items-center justify-center py-2.5 px-3 bg-zinc-50 text-zinc-400 rounded-xl border border-zinc-200 text-xs opacity-60 cursor-not-allowed"
                  >
                    <WhatsAppIcon className="w-4 h-4 mb-1" />
                    <span>WhatsApp</span>
                  </button>
                )}

                {selectedCustomer.phone ? (
                  <a
                    href={`tel:${selectedCustomer.phone}`}
                    className="flex flex-col items-center justify-center py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl border border-blue-200 transition-all font-bold text-xs"
                  >
                    <Phone className="w-4 h-4 text-blue-600 mb-1" />
                    <span>{isFr ? 'Appeler' : 'Call'}</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex flex-col items-center justify-center py-2.5 px-3 bg-zinc-50 text-zinc-400 rounded-xl border border-zinc-200 text-xs opacity-60 cursor-not-allowed"
                  >
                    <Phone className="w-4 h-4 mb-1" />
                    <span>{isFr ? 'Appeler' : 'Call'}</span>
                  </button>
                )}

                <a
                  href={`mailto:${selectedCustomer.email}`}
                  className="flex flex-col items-center justify-center py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl border border-zinc-200 transition-all font-bold text-xs"
                >
                  <Mail className="w-4 h-4 text-zinc-600 mb-1" />
                  <span>Email</span>
                </a>
              </div>

              {/* Day, Date & Time Inspector Card */}
              <div className="bg-gradient-to-br from-zinc-50 to-blue-50/30 p-4 rounded-2xl border border-zinc-200 space-y-3.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-zinc-500 block">
                  {isFr ? 'Horodatage Officiel du Compte' : 'Official Account Timestamps'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Account Creation Block */}
                  <div className="bg-white p-3 rounded-xl border border-zinc-200/80 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-blue-600 text-xs font-bold mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{isFr ? 'Création du Compte' : 'Account Created'}</span>
                    </div>
                    {(() => {
                      const cre = getCreationInfo(selectedCustomer);
                      return (
                        <div className="space-y-0.5 mt-1">
                          <p className="text-sm font-black text-zinc-900">{cre.day}</p>
                          <p className="text-xs font-semibold text-zinc-700">{cre.date}</p>
                          <p className="text-xs font-mono text-zinc-500 flex items-center gap-1 pt-1">
                            <Clock className="w-3 h-3 text-zinc-400" />
                            <span>{cre.time}</span>
                          </p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Last Activity Block */}
                  <div className="bg-white p-3 rounded-xl border border-zinc-200/80 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold mb-1">
                      <Activity className="w-3.5 h-3.5" />
                      <span>{isFr ? 'Dernière Activité' : 'Last Activity'}</span>
                    </div>
                    {(() => {
                      const act = getActivityInfo(selectedCustomer);
                      return (
                        <div className="space-y-0.5 mt-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-black text-zinc-900">{act.day}</p>
                            {act.isOnline && (
                              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full">
                                {isFr ? 'En ligne' : 'Online'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-zinc-700">{act.date}</p>
                          <p className="text-xs font-mono text-zinc-500 flex items-center gap-1 pt-1">
                            <Clock className="w-3 h-3 text-zinc-400" />
                            <span>{act.time}</span>
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Platform / Device Info */}
                <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between text-xs text-zinc-600">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{selectedCustomer.deviceInfo?.browser || 'Chrome'} · {selectedCustomer.deviceInfo?.os || 'Windows/Mobile'}</span>
                  </div>
                  {selectedCustomer.deviceInfo?.isPwa ? (
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5 fill-emerald-600" />
                      <span>PWA App</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-200/60 px-2 py-0.5 rounded-full">
                      Web Browser
                    </span>
                  )}
                </div>
              </div>

              {/* CRM Loyalty & Points Configurator */}
              <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-zinc-500">
                    {isFr ? 'Gestion Fidélité CRM' : 'Loyalty Rewards CRM'}
                  </span>
                  <span className="font-mono font-black text-blue-700 text-sm">
                    {selectedCustomer.loyaltyPoints || 0} pts
                  </span>
                </div>

                {/* Points Adjuster Buttons */}
                <div className="flex items-center justify-between bg-zinc-50 p-3 rounded-xl border border-zinc-200/80">
                  <span className="text-xs font-bold text-zinc-800">
                    {isFr ? 'Ajuster les points :' : 'Adjust Balance:'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => adjustLoyaltyPoints(selectedCustomer.id, -25)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      title="-25 Points"
                    >
                      <Minus className="w-3 h-3 text-rose-500" />
                      <span>25</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustLoyaltyPoints(selectedCustomer.id, 25)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      title="+25 Points"
                    >
                      <Plus className="w-3 h-3 text-emerald-500" />
                      <span>25</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustLoyaltyPoints(selectedCustomer.id, 100)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      title="+100 Points"
                    >
                      <Plus className="w-3 h-3 text-blue-600" />
                      <span>100</span>
                    </button>
                  </div>
                </div>

                {/* Tier Switcher Dropdown */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    {isFr ? 'Modifier le niveau de fidélité' : 'Update Loyalty Tier'}
                  </label>
                  <select
                    value={selectedCustomer.tier || 'Bronze'}
                    onChange={(e) => updateCustomerTier(selectedCustomer.id, e.target.value as any)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Bronze">Bronze Tier</option>
                    <option value="Silver">Silver VIP Tier</option>
                    <option value="Gold">Gold VIP Tier</option>
                    <option value="Platinum">Platinum Elite Tier</option>
                    <option value="Member Club">Member Club Tier</option>
                  </select>
                </div>
              </div>

              {/* Order History for This Customer */}
              {(() => {
                const custOrders = getCustomerOrders(selectedCustomer);
                return (
                  <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-zinc-500">
                        {isFr ? 'Historique des Commandes' : 'Customer Order History'}
                      </span>
                      <span className="text-xs font-mono font-bold text-zinc-700">
                        {custOrders.length} {isFr ? (custOrders.length > 1 ? 'commandes' : 'commande') : (custOrders.length > 1 ? 'orders' : 'order')}
                      </span>
                    </div>

                    {custOrders.length === 0 ? (
                      <p className="text-xs text-zinc-400 text-center py-4 italic">
                        {isFr ? 'Aucune commande enregistrée pour ce client.' : 'No orders placed yet by this customer.'}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {custOrders.map(order => (
                          <div 
                            key={order.id} 
                            className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-xl border border-zinc-100 text-xs"
                          >
                            <div>
                              <p className="font-mono font-black text-zinc-900">{order.orderNumber}</p>
                              <p className="text-[10px] text-zinc-400 mt-0.5">{order.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono font-bold text-zinc-900">{formatPrice(order.total)}</p>
                              <span className="text-[9px] uppercase font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60 inline-block mt-0.5">
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Delete Account Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmationId(selectedCustomer.id)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isFr ? 'Supprimer Définitivement le Compte' : 'Permanently Delete Customer Account'}</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-200">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                {isFr ? 'Supprimer ce compte client ?' : 'Scrub Customer Account?'}
              </h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                {isFr 
                  ? 'Cette action est irréversible. Les points de fidélité et le profil seront définitivement effacés.' 
                  : 'This action is irreversible. All rewards, profile data, and loyalty balance will be permanently erased.'}
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmationId(null)}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {isFr ? 'Annuler' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteCustomer}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-500/20 cursor-pointer"
              >
                {isFr ? 'Supprimer' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
