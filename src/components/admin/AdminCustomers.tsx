import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Award,
  DollarSign,
  UserCheck,
  Ban,
  TrendingUp,
  FileSpreadsheet,
  ChevronRight,
  Sparkles,
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
  Activity
} from 'lucide-react';
import { UserProfile, Order, LoyaltyTier } from '../../types/store';
import { updateRealtimeUserProfile } from '../../services/supabaseService';

interface AdminCustomersProps {
  users: UserProfile[];
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  orders: Order[];
  initialSearchQuery?: string;
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({ users, setUsers, orders, initialSearchQuery }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchQuery || '');
  const [tierFilter, setTierFilter] = useState<'all' | LoyaltyTier>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<UserProfile | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchTerm(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Quick stats derived from database
  const totalBannedMock = 0; // Simulated

  // Update customer loyalty points helper
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
              description: `Manual adjustment by administrator`,
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

    // Sync selected customer state
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

  // Change tier
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

  const handleDeleteCustomer = () => {
    if (deleteConfirmationId) {
      setUsers(prev => prev.filter(u => u.id !== deleteConfirmationId));
      if (selectedCustomer?.id === deleteConfirmationId) {
        setSelectedCustomer(null);
      }
      setDeleteConfirmationId(null);
    }
  };

  const exportCustomersCSV = () => {
    const headers = ['User ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Member Since', 'Loyalty Tier', 'Loyalty Points'];
    const rows = users.map(u => [
      u.id,
      u.firstName,
      u.lastName,
      u.email,
      u.phone,
      u.memberSince,
      u.tier,
      u.loyaltyPoints
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GLADYNS_Customer_Directory_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter customers
  const filteredUsers = users.filter(u => {
    const q = searchTerm?.toLowerCase().trim();
    if (!q) return tierFilter === 'all' || u.tier === tierFilter;

    const nameMatch = `${u.firstName} ${u.lastName}`?.toLowerCase().includes(q);
    const emailMatch = u.email?.toLowerCase().includes(q);
    const phoneMatch = u.phone?.toLowerCase().includes(q);
    const idMatch = u.id?.toLowerCase().includes(q);

    const matchesSearch = nameMatch || emailMatch || phoneMatch || idMatch;
    const matchesTier = tierFilter === 'all' || u.tier === tierFilter;

    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Search and export buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search customer directory by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 py-2.5">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as any)}
              className="text-xs font-semibold bg-transparent border-none outline-none text-zinc-700 cursor-pointer"
            >
              <option value="all">All Tiers</option>
              <option value="Bronze">Bronze</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
              <option value="Member Club">Member Club</option>
            </select>
          </div>

          <button
            onClick={exportCustomersCSV}
            className="bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Directory</span>
          </button>
        </div>
      </div>

      {/* Split (User Directory Table & Info Sidebar Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User directory lists (2/3 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-500">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-950 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Customer & App Mode</th>
                  <th className="py-4 px-6">Origin & Tier</th>
                  <th className="py-4 px-6 font-mono">Loyalty Points</th>
                  <th className="py-4 px-6 text-right">Registration (Y/M/D · Time)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium text-zinc-900">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-zinc-400">
                      No matching user records.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelected = selectedCustomer?.id === u.id;
                    const reg = u.registrationDetails;
                    return (
                      <tr
                        key={u.id}
                        onClick={() => setSelectedCustomer(u)}
                        className={`cursor-pointer transition-colors hover:bg-zinc-50/50 ${
                          isSelected ? 'bg-zinc-50 border-l-4 border-zinc-950' : ''
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-zinc-950 text-sm">
                              {u.firstName} {u.lastName}
                            </div>
                            {u.deviceInfo?.isPwa ? (
                              <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5 fill-emerald-600" />
                                <span>PWA</span>
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Globe className="w-2.5 h-2.5" />
                                <span>Web</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-400 block mt-0.5 font-mono">{u.email}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 font-semibold text-xs text-zinc-800">
                            <span>{u.location?.flag || '🇨🇮'}</span>
                            <span>{u.location?.city || u.location?.country || "Côte d'Ivoire"}</span>
                          </div>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              u.tier === 'Bronze'
                                ? 'bg-orange-50 text-orange-700 border border-orange-100'
                                : u.tier === 'Silver'
                                ? 'bg-slate-50 text-slate-700 border border-slate-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {u.tier}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-zinc-900">
                          {u.loyaltyPoints} points
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="font-bold text-zinc-900 text-xs flex items-center justify-end gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>
                              {reg ? `${reg.day} ${reg.month} ${reg.year}` : u.memberSince}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono flex items-center justify-end gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span>{reg?.time || '10:00 AM'}</span>
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

        {/* Selected Customer Detailed Profile Summary (1/3 cols) */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-6 flex flex-col justify-between">
          {selectedCustomer ? (
            <div className="space-y-6">
              {/* Profile Card Header */}
              <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
                <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200/80 flex items-center justify-center font-bold text-zinc-800 text-sm">
                  {selectedCustomer.firstName.charAt(0)}{selectedCustomer.lastName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-display font-bold text-zinc-950 text-sm">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </h4>
                  <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">
                    {selectedCustomer.registrationDetails ? (
                      `Registered: ${selectedCustomer.registrationDetails.day} ${selectedCustomer.registrationDetails.month} ${selectedCustomer.registrationDetails.year} at ${selectedCustomer.registrationDetails.time}`
                    ) : (
                      `Member since ${selectedCustomer.memberSince}`
                    )}
                  </span>
                </div>
              </div>

              {/* Device Environment & Geographic Origin */}
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-zinc-400">Environment</span>
                  {selectedCustomer.deviceInfo?.isPwa ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-emerald-600" />
                      <span>PWA Installed App</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-zinc-600 bg-zinc-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      <span>Web Browser</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-600">
                  <span className="text-zinc-400">Origin / City:</span>
                  <span className="font-bold text-zinc-800">
                    {selectedCustomer.location?.flag || '🇨🇮'} {selectedCustomer.location?.city || 'Abidjan'}, {selectedCustomer.location?.country || "Côte d'Ivoire"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-600">
                  <span className="text-zinc-400">Live Status:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="capitalize">{selectedCustomer.sessionStatus || 'online'}</span>
                  </span>
                </div>
              </div>

              {/* Loyalty CRM Actions */}
              <div className="space-y-4 text-xs text-zinc-600">
                <div className="bg-zinc-50/50 border border-zinc-100 p-4 rounded-xl space-y-3">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">CRM Loyalty Points System</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 text-sm">{selectedCustomer.loyaltyPoints} Points Available</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => adjustLoyaltyPoints(selectedCustomer.id, -25)}
                        className="p-1 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-lg text-zinc-600 cursor-pointer"
                        title="Deduct 25 Points"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => adjustLoyaltyPoints(selectedCustomer.id, 25)}
                        className="p-1 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-lg text-zinc-600 cursor-pointer"
                        title="Add 25 Points"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase block tracking-wider">Configure Loyalty Tier</span>
                  <select
                    value={selectedCustomer.tier}
                    onChange={(e) => updateCustomerTier(selectedCustomer.id, e.target.value as any)}
                    className="w-full border border-zinc-200 bg-zinc-50/50 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none focus:bg-white mt-1.5"
                  >
                    <option value="Bronze">Bronze Tier</option>
                    <option value="Silver">Silver Tier</option>
                    <option value="Gold">Gold Tier</option>
                    <option value="Platinum">Platinum Tier</option>
                    <option value="Member Club">Member Club Tier</option>
                  </select>
                </div>

                <div className="pt-2">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase block tracking-wider">Contact Coordinates</span>
                  <div className="mt-1.5 leading-relaxed text-[11px]">
                    Email: <span className="font-semibold text-zinc-900">{selectedCustomer.email}</span>
                    <br />
                    Phone: <span className="font-semibold text-zinc-900">{selectedCustomer.phone}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100">
                  <button 
                    onClick={() => setDeleteConfirmationId(selectedCustomer.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Scrub Customer Record</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-zinc-200 rounded-2xl h-full flex flex-col justify-center items-center">
              <Users className="w-10 h-10 text-zinc-300 mb-3" />
              <div className="text-xs font-semibold text-zinc-900">No Profile Selected</div>
              <div className="text-[10px] text-zinc-400 mt-1 max-w-[200px]">
                Click any row in the customer index list to view profiles, edit reward configurations, and adjust loyalty points.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900">Scrub Record?</h3>
            <p className="text-sm text-zinc-500 mt-3 leading-relaxed">
              This action is irreversible. All loyalty points, history, and profile data for this customer will be permanently removed from the boutique directory.
            </p>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setDeleteConfirmationId(null)}
                className="flex-1 px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-sm font-bold transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteCustomer}
                className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-rose-200"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

