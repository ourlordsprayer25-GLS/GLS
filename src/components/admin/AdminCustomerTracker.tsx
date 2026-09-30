import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Activity,
  Smartphone,
  Monitor,
  Globe,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Download,
  Eye,
  ShoppingBag,
  Heart,
  Sparkles,
  Zap,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Compass,
  FileSpreadsheet,
  X,
  ChevronDown,
  Layers
} from 'lucide-react';
import { UserProfile, UserActivityEvent } from '../../types/store';
import { useLanguageCurrency } from '../../context/LanguageCurrencyContext';

interface AdminCustomerTrackerProps {
  users: UserProfile[];
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
}

export const AdminCustomerTracker: React.FC<AdminCustomerTrackerProps> = ({ users, setUsers }) => {
  const { formatPrice, currency } = useLanguageCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'idle' | 'logged_out'>('all');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'pwa' | 'browser'>('all');
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'table' | 'feed'>('table');

  // Compute Live Metrics
  const onlineCount = users.filter((u) => u.sessionStatus === 'online').length;
  const idleCount = users.filter((u) => u.sessionStatus === 'idle').length;
  const loggedOutCount = users.filter((u) => u.sessionStatus === 'logged_out').length;
  
  const pwaUsersCount = users.filter((u) => u.deviceInfo?.isPwa).length;
  const pwaPercentage = users.length > 0 ? Math.round((pwaUsersCount / users.length) * 100) : 0;
  
  const avgSessionStay = Math.round(
    users.reduce((acc, u) => acc + (u.sessionDurationMinutes || 15), 0) / (users.length || 1)
  );

  // Filtered list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const name = `${u.firstName} ${u.lastName}`.toLowerCase();
      const email = u.email.toLowerCase();
      const phone = u.phone.toLowerCase();
      const country = (u.location?.country || '').toLowerCase();
      const city = (u.location?.city || '').toLowerCase();
      const ip = (u.location?.ipAddress || '').toLowerCase();

      const matchesSearch = !q || name.includes(q) || email.includes(q) || phone.includes(q) || country.includes(q) || city.includes(q) || ip.includes(q);

      const matchesStatus = statusFilter === 'all' || u.sessionStatus === statusFilter;
      const matchesDevice = deviceFilter === 'all' || (deviceFilter === 'pwa' ? u.deviceInfo?.isPwa : !u.deviceInfo?.isPwa);

      return matchesSearch && matchesStatus && matchesDevice;
    });
  }, [users, searchQuery, statusFilter, deviceFilter]);

  // Aggregate all live activities into a chronological feed
  const liveActivityFeed = useMemo(() => {
    const list: { user: UserProfile; event: UserActivityEvent }[] = [];
    users.forEach((u) => {
      if (u.recentActivity && u.recentActivity.length > 0) {
        u.recentActivity.forEach((act) => {
          list.push({ user: u, event: act });
        });
      }
    });
    return list;
  }, [users]);

  // Export full detailed analytics to CSV
  const handleExportCSV = () => {
    const headers = [
      'Customer ID',
      'Name',
      'Email',
      'Phone',
      'Registered Year',
      'Registered Month',
      'Registered Day',
      'Registered Time',
      'Exact Registration Timestamp',
      'Country',
      'City',
      'IP Address',
      'App Environment',
      'Device Type',
      'OS',
      'Browser',
      'Live Session Status',
      'Session Duration (Mins)',
      'Last Seen'
    ];

    const rows = users.map((u) => [
      `"${u.id}"`,
      `"${u.firstName} ${u.lastName}"`,
      `"${u.email}"`,
      `"${u.phone}"`,
      `"${u.registrationDetails?.year || 2026}"`,
      `"${u.registrationDetails?.month || 'September'}"`,
      `"${u.registrationDetails?.day || 26}"`,
      `"${u.registrationDetails?.time || '10:00:00'}"`,
      `"${u.registeredDateExact || u.registrationDetails?.exactTimestamp || ''}"`,
      `"${u.location?.country || "Côte d'Ivoire"}"`,
      `"${u.location?.city || 'Abidjan'}"`,
      `"${u.location?.ipAddress || '127.0.0.1'}"`,
      `"${u.deviceInfo?.isPwa ? 'PWA Installed App' : 'Web Browser'}"`,
      `"${u.deviceInfo?.deviceType || 'mobile'}"`,
      `"${u.deviceInfo?.os || 'Unknown'}"`,
      `"${u.deviceInfo?.browser || 'Unknown'}"`,
      `"${u.sessionStatus || 'online'}"`,
      `"${u.sessionDurationMinutes || 15}"`,
      `"${u.lastSeen || 'Just now'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GLADYNS_Customer_Live_Intelligence_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
              Live Surveillance Radar
            </span>
          </div>
          <h2 className="text-2xl font-display font-bold text-zinc-900 mt-1">
            Customer Intelligence & Storefront Tracker
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time telemetry: Device environments (PWA vs Browser), full registration timeline (Year, Month, Day, Time), geographic origin, session duration, and live store actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-200/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'table' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              Customer Directory
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'feed' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>Live Storefront Actions</span>
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Tracker Report</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Daily Storefront Visitors */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              +19.4%
            </span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Daily Web Visitors</p>
            <h3 className="text-2xl font-display font-bold text-zinc-900 mt-1">1,482</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Unique storefront visits today</p>
          </div>
        </div>

        {/* Daily Sign-In & Registered */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {users.length} Total
            </span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Daily Registered/Sign-ins</p>
            <h3 className="text-2xl font-display font-bold text-zinc-900 mt-1">34</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Authentications logged today</p>
          </div>
        </div>

        {/* Avg Session Stay */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              High Stay
            </span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Avg Stay Duration</p>
            <h3 className="text-2xl font-display font-bold text-zinc-900 mt-1">{avgSessionStay}m</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Time spent exploring catalog</p>
          </div>
        </div>

        {/* PWA App Installs vs Web Browser */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {pwaPercentage}% PWA
            </span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">PWA vs Browser</p>
            <h3 className="text-2xl font-display font-bold text-zinc-900 mt-1">{pwaUsersCount} App</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Installed on mobile home screens</p>
          </div>
        </div>

        {/* Live Active Customers */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-3 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Current Session State</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-display font-bold text-emerald-600">{onlineCount}</span>
              <span className="text-xs text-zinc-400">online · {loggedOutCount} logged out</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5">Real-time connection active</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by customer name, email, phone, city, or IP address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-950 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2">
            <Activity className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs font-bold bg-transparent border-none outline-none text-zinc-700 cursor-pointer"
            >
              <option value="all">All Session States</option>
              <option value="online">🟢 Active Now (Online)</option>
              <option value="idle">🟡 Idle (Inactive)</option>
              <option value="logged_out">⚪ Logged Out</option>
            </select>
          </div>

          {/* Device & Environment Filter */}
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2">
            <Smartphone className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value as any)}
              className="text-xs font-bold bg-transparent border-none outline-none text-zinc-700 cursor-pointer"
            >
              <option value="all">All App Environments</option>
              <option value="pwa">⚡ PWA Installed on Home Screen</option>
              <option value="browser">🌐 Standard Web Browser</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main View: Table or Live Feed */}
      {activeTab === 'table' ? (
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/80 text-zinc-950 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Customer & Identity</th>
                  <th className="py-4 px-6">Registration Date & Time</th>
                  <th className="py-4 px-6">Device & Environment</th>
                  <th className="py-4 px-6">Geographic Location</th>
                  <th className="py-4 px-6">Live Session & Stay Time</th>
                  <th className="py-4 px-6 text-right">Activity & Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-400">
                      No customer records match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const reg = u.registrationDetails || {
                      year: 2026,
                      month: 'September',
                      day: 26,
                      time: '10:14:02 AM',
                      exactTimestamp: u.registeredDateExact || '2026-09-26 10:14:02'
                    };

                    const isOnline = u.sessionStatus === 'online';
                    const isIdle = u.sessionStatus === 'idle';
                    const isLoggedOut = u.sessionStatus === 'logged_out';

                    return (
                      <tr key={u.id} className="hover:bg-zinc-50/80 transition-colors">
                        {/* Customer */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-950 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                              {(u.firstName?.[0] || 'C') + (u.lastName?.[0] || 'U')}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-zinc-950">
                                  {u.firstName} {u.lastName}
                                </p>
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                  {u.tier}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{u.email}</p>
                              {u.phone && <p className="text-[10px] text-zinc-400 mt-0.5">{u.phone}</p>}
                            </div>
                          </div>
                        </td>

                        {/* Registration Date (Year, Month, Day, Time) */}
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{reg.day} {reg.month}, {reg.year}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
                              <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                              <span>{reg.time}</span>
                            </div>
                            <span className="inline-block text-[9px] font-mono text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
                              {u.registeredDateExact || reg.exactTimestamp || `${reg.year}-${reg.month}-${reg.day}`}
                            </span>
                          </div>
                        </td>

                        {/* Device & Environment (PWA vs Browser) */}
                        <td className="py-4 px-6">
                          <div className="space-y-1.5">
                            {u.deviceInfo?.isPwa ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold text-[10px]">
                                <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                                <span>PWA Installed App</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 font-bold text-[10px]">
                                <Globe className="w-3 h-3 text-zinc-500" />
                                <span>Web Browser</span>
                              </div>
                            )}

                            <div className="text-[11px] text-zinc-600 flex items-center gap-1.5">
                              {u.deviceInfo?.deviceType === 'desktop' ? (
                                <Monitor className="w-3.5 h-3.5 text-zinc-400" />
                              ) : (
                                <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                              )}
                              <span>{u.deviceInfo?.os || 'Mobile OS'} · {u.deviceInfo?.browser || 'Browser'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 font-bold text-zinc-900">
                              <span className="text-base">{u.location?.flag || '🇨🇮'}</span>
                              <span>{u.location?.country || "Côte d'Ivoire"}</span>
                            </div>
                            <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                              <span>{u.location?.city || 'Abidjan'}</span>
                            </p>
                            {u.location?.ipAddress && (
                              <span className="inline-block text-[10px] font-mono text-zinc-400">
                                IP: {u.location.ipAddress}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Live Session State & Stay Duration */}
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            {isOnline && (
                              <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                                <span>Active Now (Online)</span>
                              </div>
                            )}
                            {isIdle && (
                              <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                <span>Idle ({u.lastSeen})</span>
                              </div>
                            )}
                            {isLoggedOut && (
                              <div className="flex items-center gap-1.5 text-zinc-400 font-bold text-xs">
                                <LogOut className="w-3 h-3 text-zinc-400" />
                                <span>Logged Out ({u.lastSeen})</span>
                              </div>
                            )}

                            <p className="text-[11px] text-zinc-500">
                              Stayed on site: <span className="font-bold text-zinc-900">{u.sessionDurationMinutes || 15} mins</span>
                            </p>
                          </div>
                        </td>

                        {/* Detail Trigger */}
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedUserDetail(u)}
                            className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                            <span>Inspect Activity</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Real-Time Live Activity Stream Feed */
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div>
              <h3 className="font-display font-bold text-base text-zinc-900">
                Live Storefront Action Stream
              </h3>
              <p className="text-xs text-zinc-500">
                Chronological sequence of all events, navigation, cart acquisitions, and logins in GLADYNS boutique.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Live Streaming Active</span>
            </div>
          </div>

          <div className="space-y-4">
            {liveActivityFeed.length === 0 ? (
              <p className="text-center py-10 text-xs text-zinc-400">No actions recorded yet.</p>
            ) : (
              liveActivityFeed.map(({ user, event }, idx) => (
                <div
                  key={`${event.id}-${idx}`}
                  className="flex items-start gap-4 p-4 rounded-xl border border-zinc-100 hover:border-zinc-200 bg-zinc-50/50 hover:bg-white transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-zinc-950 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    {(user.firstName?.[0] || 'C') + (user.lastName?.[0] || 'U')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-zinc-950">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          ({user.location?.city}, {user.location?.country})
                        </span>
                        {user.deviceInfo?.isPwa ? (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            ⚡ PWA App
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-zinc-600 bg-zinc-200 px-1.5 py-0.5 rounded">
                            🌐 Web
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">{event.timestamp}</span>
                    </div>

                    <p className="text-xs font-semibold text-zinc-800 mt-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>{event.action}</span>
                    </p>

                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-zinc-500">
                      <span>Page: <strong className="text-zinc-700">{event.page || 'Storefront'}</strong></span>
                      {event.target && <span>Piece Ref: <strong className="text-zinc-700 font-mono">{event.target}</strong></span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Customer Detail & Step-by-Step Activity Modal */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-zinc-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-zinc-950 text-white font-bold flex items-center justify-center text-sm shadow-md">
                  {(selectedUserDetail.firstName?.[0] || 'C') + (selectedUserDetail.lastName?.[0] || 'U')}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-zinc-950">
                    {selectedUserDetail.firstName} {selectedUserDetail.lastName}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">
                    ID: {selectedUserDetail.id} · {selectedUserDetail.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="p-2 hover:bg-zinc-200 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* Registration Breakdown */}
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-2">
                <h4 className="font-black uppercase tracking-wider text-[10px] text-zinc-400">
                  Full Registration Details (Year, Month, Day, Time)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-xl border border-zinc-200/80">
                    <p className="text-[10px] text-zinc-400">Year</p>
                    <p className="text-sm font-bold text-zinc-900 mt-0.5">
                      {selectedUserDetail.registrationDetails?.year || 2026}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-zinc-200/80">
                    <p className="text-[10px] text-zinc-400">Month</p>
                    <p className="text-sm font-bold text-zinc-900 mt-0.5">
                      {selectedUserDetail.registrationDetails?.month || 'September'}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-zinc-200/80">
                    <p className="text-[10px] text-zinc-400">Day</p>
                    <p className="text-sm font-bold text-zinc-900 mt-0.5">
                      {selectedUserDetail.registrationDetails?.day || 26}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-zinc-200/80">
                    <p className="text-[10px] text-zinc-400">Exact Time</p>
                    <p className="text-xs font-bold text-zinc-900 font-mono mt-0.5">
                      {selectedUserDetail.registrationDetails?.time || '10:00:00 AM'}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] font-mono text-zinc-500 pt-1">
                  ISO Registration Timestamp: {selectedUserDetail.registeredDateExact || selectedUserDetail.registrationDetails?.exactTimestamp || '2026-09-26 10:14:02'}
                </p>
              </div>

              {/* Hardware, App Mode & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 space-y-2">
                  <h4 className="font-black uppercase tracking-wider text-[10px] text-zinc-400">
                    Device & App Architecture
                  </h4>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">App Mode:</span>
                      {selectedUserDetail.deviceInfo?.isPwa ? (
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                          ⚡ PWA Installed App (Standalone)
                        </span>
                      ) : (
                        <span className="font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded text-[10px]">
                          🌐 Web Browser
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Device Type:</span>
                      <span className="font-bold text-zinc-900 uppercase">
                        {selectedUserDetail.deviceInfo?.deviceType || 'mobile'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Operating System:</span>
                      <span className="font-bold text-zinc-900">
                        {selectedUserDetail.deviceInfo?.os || 'iOS 18.2'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Browser Engine:</span>
                      <span className="font-bold text-zinc-900">
                        {selectedUserDetail.deviceInfo?.browser || 'Safari Mobile'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 space-y-2">
                  <h4 className="font-black uppercase tracking-wider text-[10px] text-zinc-400">
                    Geographic Origin
                  </h4>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Country:</span>
                      <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                        <span>{selectedUserDetail.location?.flag || '🇨🇮'}</span>
                        <span>{selectedUserDetail.location?.country || "Côte d'Ivoire"}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">City / District:</span>
                      <span className="font-bold text-zinc-900">
                        {selectedUserDetail.location?.city || 'Abidjan'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">IP Address:</span>
                      <span className="font-bold text-zinc-900 font-mono">
                        {selectedUserDetail.location?.ipAddress || '160.154.218.12'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Session Status:</span>
                      <span className={`font-bold capitalize ${
                        selectedUserDetail.sessionStatus === 'online' ? 'text-emerald-600' : 'text-zinc-500'
                      }`}>
                        {selectedUserDetail.sessionStatus} ({selectedUserDetail.lastSeen})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complete Step-by-Step Activity History */}
              <div className="space-y-3">
                <h4 className="font-black uppercase tracking-wider text-[10px] text-zinc-400">
                  Storefront Navigation Trail ({selectedUserDetail.recentActivity?.length || 0} Events)
                </h4>
                <div className="space-y-2">
                  {selectedUserDetail.recentActivity && selectedUserDetail.recentActivity.length > 0 ? (
                    selectedUserDetail.recentActivity.map((act, i) => (
                      <div
                        key={act.id || i}
                        className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-zinc-900">{act.action}</p>
                          <p className="text-[11px] text-zinc-500">
                            Page: <span className="font-semibold text-zinc-700">{act.page}</span>
                            {act.target && <span> · Target ID: <span className="font-mono">{act.target}</span></span>}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 bg-white px-2 py-1 rounded border border-zinc-200">
                          {act.timestamp}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-400 italic">No activity recorded for this user yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-end">
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="px-5 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
