import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Package, 
  Truck, 
  XCircle,
  Download,
  Trash2,
  AlertTriangle,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Printer,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  ArrowUpDown,
  Eye,
  Check
} from 'lucide-react';
import { Order, CartItem } from '../../types/store';
import { useLanguageCurrency } from '../../context/LanguageCurrencyContext';
import { updateRealtimeOrderStatus, deleteRealtimeOrder, addRealtimeNotification } from '../../services/supabaseService';
import { WhatsAppIcon } from '../WhatsAppWidget';

interface AdminOrdersProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  initialSearchQuery?: string;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, setOrders, initialSearchQuery }) => {
  const { formatPrice, language } = useLanguageCurrency();
  const isFr = language === 'fr';

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'total-desc' | 'total-asc'>('date-desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [editingTracking, setEditingTracking] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Keep selectedOrder in sync when orders update
  React.useEffect(() => {
    if (selectedOrder) {
      const refreshed = orders.find(o => o.id === selectedOrder.id);
      if (refreshed) {
        setSelectedOrder(refreshed);
      }
    }
  }, [orders]);

  const handleUpdateStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    updateRealtimeOrderStatus(orderId, newStatus);
    
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }

    const order = orders.find(o => o.id === orderId);
    if (order && order.customerId) {
      const statusLabel = {
        placed: isFr ? 'Enregistrée' : 'Placed',
        confirmed: isFr ? 'Confirmée' : 'Confirmed',
        processing: isFr ? 'En cours de préparation' : 'Processing',
        shipping: isFr ? 'En cours de livraison' : 'Shipping',
        shipped: isFr ? 'Expédiée' : 'Shipped',
        delivered: isFr ? 'Livrée' : 'Delivered',
        cancelled: isFr ? 'Annulée' : 'Cancelled',
      }[newStatus] || newStatus;

      addRealtimeNotification({
        id: `notif-upd-${Date.now()}`,
        title: isFr ? `Commande mise à jour : ${order.orderNumber}` : `Order Updated: ${order.orderNumber}`,
        message: isFr ? `Statut de votre commande : ${statusLabel}` : `Your order is now: ${statusLabel}`,
        timestamp: Date.now(),
        read: false,
        type: 'order',
        linkTarget: order.orderNumber,
        customerId: order.customerId,
        image: order.items?.[0]?.product?.primaryImage || order.items?.[0]?.product?.images?.[0],
      });
    }
  };

  const handleSaveTracking = () => {
    if (!selectedOrder) return;
    const clean = trackingInput.trim();
    setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, trackingNumber: clean } : o));
    setSelectedOrder(prev => prev ? { ...prev, trackingNumber: clean } : null);
    setEditingTracking(false);
  };

  const handleDeleteOrder = () => {
    if (deleteConfirmationId) {
      setOrders(prev => prev.filter(o => o.id !== deleteConfirmationId));
      deleteRealtimeOrder(deleteConfirmationId);
      if (selectedOrder?.id === deleteConfirmationId) {
        setSelectedOrder(null);
      }
      setDeleteConfirmationId(null);
    }
  };

  const handleExportCSV = () => {
    if (!orders || orders.length === 0) return;
    const headers = ['Order Number', 'Date', 'Customer Name', 'Email', 'Phone', 'City', 'Status', 'Total (CFA)', 'Items Count'];
    const rows = filteredOrders.map(o => [
      `"${o.orderNumber}"`,
      `"${o.date}"`,
      `"${(o.shippingAddress?.firstName || '') + ' ' + (o.shippingAddress?.lastName || '')}"`,
      `"${o.shippingAddress?.email || ''}"`,
      `"${o.shippingAddress?.phone || ''}"`,
      `"${o.shippingAddress?.city || ''}"`,
      `"${o.status}"`,
      o.total,
      o.items?.length || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gladyns-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleCopyOrderNumber = (num: string) => {
    navigator.clipboard?.writeText(num);
    setCopiedOrderId(num);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // Metrics Calculations
  const totalRevenue = orders.reduce((sum, o) => o.status !== 'cancelled' ? sum + (Number(o.total) || 0) : sum, 0);
  const placedCount = orders.filter(o => o.status === 'placed').length;
  const confirmedCount = orders.filter(o => o.status === 'confirmed').length;
  const processingCount = orders.filter(o => o.status === 'processing').length;
  const shippedCount = orders.filter(o => o.status === 'shipping' || o.status === 'shipped').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

  // Filter & Sort
  const filteredOrders = orders.filter(order => {
    const q = searchQuery?.toLowerCase().trim();
    const customerFullName = `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.toLowerCase();
    const itemNames = order.items?.map(i => i.product?.name?.toLowerCase() || '').join(' ') || '';

    const matchesSearch = !q ||
      order.orderNumber?.toLowerCase().includes(q) ||
      order.id?.toLowerCase().includes(q) ||
      (order.trackingNumber && order.trackingNumber?.toLowerCase().includes(q)) ||
      customerFullName.includes(q) ||
      order.shippingAddress?.email?.toLowerCase().includes(q) ||
      order.shippingAddress?.phone?.includes(q) ||
      order.shippingAddress?.city?.toLowerCase().includes(q) ||
      itemNames.includes(q);

    let matchesStatus = true;
    if (statusFilter === 'shipped') {
      matchesStatus = order.status === 'shipping' || order.status === 'shipped';
    } else if (statusFilter !== 'all') {
      matchesStatus = order.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'total-desc') return (b.total || 0) - (a.total || 0);
    if (sortBy === 'total-asc') return (a.total || 0) - (b.total || 0);
    // Default: date-desc
    return (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0);
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return {
          bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/80',
          dot: 'bg-emerald-500',
          label: isFr ? 'Livré' : 'Delivered',
          icon: CheckCircle2,
        };
      case 'shipping':
      case 'shipped':
        return {
          bg: 'bg-blue-500/10 text-blue-700 border-blue-200/80',
          dot: 'bg-blue-500',
          label: isFr ? 'Expédiée' : 'Shipped',
          icon: Truck,
        };
      case 'processing':
        return {
          bg: 'bg-amber-500/10 text-amber-700 border-amber-200/80',
          dot: 'bg-amber-500',
          label: isFr ? 'En préparation' : 'Processing',
          icon: Clock,
        };
      case 'confirmed':
        return {
          bg: 'bg-indigo-500/10 text-indigo-700 border-indigo-200/80',
          dot: 'bg-indigo-500',
          label: isFr ? 'Confirmée' : 'Confirmed',
          icon: Package,
        };
      case 'cancelled':
        return {
          bg: 'bg-rose-500/10 text-rose-700 border-rose-200/80',
          dot: 'bg-rose-500',
          label: isFr ? 'Annulée' : 'Cancelled',
          icon: XCircle,
        };
      default:
        return {
          bg: 'bg-zinc-500/10 text-zinc-700 border-zinc-200/80',
          dot: 'bg-zinc-500',
          label: isFr ? 'Enregistrée' : 'Placed',
          icon: ShoppingBag,
        };
    }
  };

  const statusWorkflow: Array<{ key: Order['status']; label: string; desc: string }> = [
    { key: 'placed', label: isFr ? 'Enregistrée' : 'Placed', desc: isFr ? 'Commande créée' : 'Order received' },
    { key: 'confirmed', label: isFr ? 'Confirmée' : 'Confirmed', desc: isFr ? 'Acceptée par l\'atelier' : 'Accepted by store' },
    { key: 'processing', label: isFr ? 'En préparation' : 'Processing', desc: isFr ? 'Emballage & colis' : 'Packing items' },
    { key: 'shipped', label: isFr ? 'Expédiée' : 'Shipped', desc: isFr ? 'Remis au livreur' : 'Handed to courier' },
    { key: 'delivered', label: isFr ? 'Livrée' : 'Delivered', desc: isFr ? 'Remis au client' : 'Package handed to customer' },
  ];

  const getWorkflowStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'placed': return 0;
      case 'confirmed': return 1;
      case 'processing': return 2;
      case 'shipping':
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return -1;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-display font-black tracking-tight text-zinc-900">
              {isFr ? 'Commandes & Expéditions' : 'Orders & Logistics'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-bold font-mono">
              {orders.length}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {isFr 
              ? 'Cliquez sur n\'importe quelle commande pour voir les détails, contacter le client ou imprimer la facture.' 
              : 'Click any order to view full customer details, WhatsApp contact, items, and print receipt.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200/90 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95"
            title={isFr ? 'Exporter toutes les commandes en CSV' : 'Export all orders to CSV'}
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span>{isFr ? 'Exporter CSV' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'all' 
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
              : 'bg-white text-zinc-900 border-zinc-200/80 hover:border-blue-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'all' ? 'text-blue-100' : 'text-zinc-500'}`}>
              {isFr ? 'Total Ventes' : 'Total Revenue'}
            </span>
            <ShoppingBag className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${statusFilter === 'all' ? 'text-white' : 'text-zinc-400'}`} />
          </div>
          <p className="text-base sm:text-lg font-black mt-1.5 font-mono tracking-tight truncate">{formatPrice(totalRevenue)}</p>
          <p className={`text-[10px] mt-0.5 truncate ${statusFilter === 'all' ? 'text-blue-100' : 'text-zinc-500'}`}>
            {orders.length} {isFr ? 'commandes' : 'total orders'}
          </p>
        </div>

        <div 
          onClick={() => setStatusFilter('placed')}
          className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'placed' 
              ? 'bg-zinc-900 text-white border-zinc-900 shadow-md shadow-zinc-900/20' 
              : 'bg-white text-zinc-900 border-zinc-200/80 hover:border-zinc-400 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'placed' ? 'text-zinc-300' : 'text-zinc-500'}`}>
              {isFr ? 'Enregistrées' : 'Placed'}
            </span>
            <ShoppingBag className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${statusFilter === 'placed' ? 'text-white' : 'text-zinc-400'}`} />
          </div>
          <p className="text-base sm:text-lg font-black mt-1.5 font-mono tracking-tight">{placedCount}</p>
          <p className={`text-[10px] mt-0.5 truncate ${statusFilter === 'placed' ? 'text-zinc-300' : 'text-zinc-500'}`}>
            {isFr ? 'Nouvelles commandes' : 'New orders received'}
          </p>
        </div>

        <div 
          onClick={() => setStatusFilter('confirmed')}
          className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'confirmed' 
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20' 
              : 'bg-white text-zinc-900 border-zinc-200/80 hover:border-indigo-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'confirmed' ? 'text-indigo-100' : 'text-indigo-600'}`}>
              {isFr ? 'Confirmées' : 'Confirmed'}
            </span>
            <Package className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${statusFilter === 'confirmed' ? 'text-white' : 'text-indigo-500'}`} />
          </div>
          <p className="text-base sm:text-lg font-black mt-1.5 font-mono tracking-tight">{confirmedCount}</p>
          <p className={`text-[10px] mt-0.5 truncate ${statusFilter === 'confirmed' ? 'text-indigo-100' : 'text-zinc-500'}`}>
            {isFr ? 'Validées en atelier' : 'Accepted by store'}
          </p>
        </div>

        <div 
          onClick={() => setStatusFilter('processing')}
          className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'processing' 
              ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-500/20' 
              : 'bg-white text-zinc-900 border-zinc-200/80 hover:border-amber-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'processing' ? 'text-amber-100' : 'text-amber-600'}`}>
              {isFr ? 'En préparation' : 'Processing'}
            </span>
            <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${statusFilter === 'processing' ? 'text-white' : 'text-amber-500'}`} />
          </div>
          <p className="text-base sm:text-lg font-black mt-1.5 font-mono tracking-tight">{processingCount}</p>
          <p className={`text-[10px] mt-0.5 truncate ${statusFilter === 'processing' ? 'text-amber-100' : 'text-zinc-500'}`}>
            {isFr ? 'Emballage colis' : 'Packing items'}
          </p>
        </div>

        <div 
          onClick={() => setStatusFilter('shipped')}
          className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'shipped' 
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
              : 'bg-white text-zinc-900 border-zinc-200/80 hover:border-blue-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'shipped' ? 'text-blue-100' : 'text-blue-600'}`}>
              {isFr ? 'Expédiées' : 'Shipped'}
            </span>
            <Truck className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${statusFilter === 'shipped' ? 'text-white' : 'text-blue-500'}`} />
          </div>
          <p className="text-base sm:text-lg font-black mt-1.5 font-mono tracking-tight">{shippedCount}</p>
          <p className={`text-[10px] mt-0.5 truncate ${statusFilter === 'shipped' ? 'text-blue-100' : 'text-zinc-500'}`}>
            {isFr ? 'Remis au livreur' : 'Handed to courier'}
          </p>
        </div>

        <div 
          onClick={() => setStatusFilter('delivered')}
          className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'delivered' 
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20' 
              : 'bg-white text-zinc-900 border-zinc-200/80 hover:border-emerald-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'delivered' ? 'text-emerald-100' : 'text-emerald-600'}`}>
              {isFr ? 'Livrées' : 'Delivered'}
            </span>
            <CheckCircle2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${statusFilter === 'delivered' ? 'text-white' : 'text-emerald-500'}`} />
          </div>
          <p className="text-base sm:text-lg font-black mt-1.5 font-mono tracking-tight">{deliveredCount}</p>
          <p className={`text-[10px] mt-0.5 truncate ${statusFilter === 'delivered' ? 'text-emerald-100' : 'text-zinc-500'}`}>
            {isFr ? 'Remis aux clients' : 'Handed to customer'}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-3">
        {/* Horizontal Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          {[
            { id: 'all', label: isFr ? 'Toutes' : 'All Orders', count: orders.length },
            { id: 'placed', label: isFr ? 'Enregistrées' : 'Placed', count: placedCount },
            { id: 'confirmed', label: isFr ? 'Confirmées' : 'Confirmed', count: confirmedCount },
            { id: 'processing', label: isFr ? 'En préparation' : 'Processing', count: processingCount },
            { id: 'shipped', label: isFr ? 'Expédiées' : 'Shipped', count: shippedCount },
            { id: 'delivered', label: isFr ? 'Livrées' : 'Delivered', count: deliveredCount },
            { id: 'cancelled', label: isFr ? 'Annulées' : 'Cancelled', count: cancelledCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-zinc-100/80 hover:bg-zinc-200/80 text-zinc-600'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                statusFilter === tab.id ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200/80 text-zinc-700'
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
              placeholder={isFr ? "Rechercher par n° commande, client, téléphone, ville, produit..." : "Search by order #, customer, phone, city, product..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white border border-zinc-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
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
                <option value="date-desc">{isFr ? 'Date : Plus récent' : 'Date: Newest First'}</option>
                <option value="date-asc">{isFr ? 'Date : Plus ancien' : 'Date: Oldest First'}</option>
                <option value="total-desc">{isFr ? 'Montant : Élevé à faible' : 'Total: High to Low'}</option>
                <option value="total-asc">{isFr ? 'Montant : Faible à élevé' : 'Total: Low to High'}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Clickable Orders Table */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-200/80 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                <th className="px-5 py-3.5">{isFr ? 'Commande' : 'Order'}</th>
                <th className="px-5 py-3.5">{isFr ? 'Articles' : 'Items'}</th>
                <th className="px-5 py-3.5">{isFr ? 'Client & Contact' : 'Customer & Contact'}</th>
                <th className="px-5 py-3.5">{isFr ? 'Montant Total' : 'Total Amount'}</th>
                <th className="px-5 py-3.5">{isFr ? 'Statut' : 'Status'}</th>
                <th className="px-5 py-3.5 text-right">{isFr ? 'Actions' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const badge = getStatusBadge(order.status);
                  const BadgeIcon = badge.icon;
                  const customerName = `${order.shippingAddress?.firstName || 'Client'} ${order.shippingAddress?.lastName || ''}`.trim();
                  const phone = order.shippingAddress?.phone;
                  const cleanPhone = phone?.replace(/[^0-9+]/g, '') || '';

                  return (
                    <tr 
                      key={order.id} 
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-blue-50/40 transition-colors group cursor-pointer active:bg-blue-100/40 select-none"
                      title={isFr ? "Cliquez pour ouvrir les détails de la commande" : "Click to view full order details"}
                    >
                      {/* Order Number & Date */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-100 group-hover:bg-blue-100 text-zinc-700 group-hover:text-blue-700 flex items-center justify-center font-mono text-xs font-black transition-colors shrink-0">
                            {order.orderNumber ? order.orderNumber.slice(-4) : 'ORD'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-sm text-zinc-900 group-hover:text-blue-600 transition-colors">
                                {order.orderNumber}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-zinc-400" />
                              <span>{order.date}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Items Preview */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {order.items?.slice(0, 3).map((item, idx) => {
                            const imgSrc = item.product?.primaryImage || item.product?.images?.[0] || '';
                            return (
                              <div 
                                key={idx} 
                                className="w-9 h-9 rounded-lg border border-zinc-200 overflow-hidden bg-zinc-50 shrink-0 relative"
                                title={`${item.product?.name || 'Item'} (x${item.quantity})`}
                              >
                                {imgSrc ? (
                                  <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400 font-bold">
                                    P
                                  </div>
                                )}
                                {item.quantity > 1 && (
                                  <span className="absolute bottom-0 right-0 bg-zinc-900 text-white text-[8px] font-bold px-1 rounded-tl">
                                    {item.quantity}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                          {(order.items?.length || 0) > 3 && (
                            <span className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                              +{(order.items?.length || 0) - 3}
                            </span>
                          )}
                          <span className="text-xs text-zinc-500 font-medium ml-1">
                            {order.items?.length || 0} {isFr ? 'art.' : 'items'}
                          </span>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-bold text-zinc-900 group-hover:text-blue-900 transition-colors">
                            {customerName}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {phone && (
                              <span className="text-[11px] font-mono text-zinc-600 flex items-center gap-1">
                                <Phone className="w-3 h-3 text-zinc-400" />
                                {phone}
                              </span>
                            )}
                            {order.shippingAddress?.city && (
                              <span className="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.2 rounded font-medium">
                                {order.shippingAddress.city}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-black text-zinc-900 font-mono">
                            {formatPrice(order.total)}
                          </p>
                          <span className="text-[10px] text-zinc-500 uppercase font-semibold">
                            {order.paymentMethod === 'cod' 
                              ? (isFr ? 'À la livraison (Cash)' : 'Cash on Delivery') 
                              : (isFr ? 'Carte / En ligne' : 'Card / Online')}
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${badge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <BadgeIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Row Actions */}
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct WhatsApp Customer Link */}
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                isFr 
                                  ? `Bonjour ${customerName}, concernant votre commande ${order.orderNumber} sur GLADYNS : ` 
                                  : `Hello ${customerName}, regarding your order ${order.orderNumber} on GLADYNS: `
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-200"
                              title={isFr ? "Discuter sur WhatsApp" : "Chat on WhatsApp"}
                            >
                              <WhatsAppIcon className="w-4 h-4" />
                            </a>
                          )}

                          {/* View details button */}
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-200"
                            title={isFr ? "Ouvrir les détails" : "View Details"}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete order */}
                          <button 
                            type="button"
                            onClick={() => setDeleteConfirmationId(order.id)}
                            className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-200"
                            title={isFr ? "Supprimer la commande" : "Delete order"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <p className="text-base font-bold text-zinc-900">
                        {isFr ? 'Aucune commande trouvée' : 'No orders found'}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {isFr 
                          ? 'Essayez de modifier vos filtres ou vos termes de recherche.' 
                          : 'Try adjusting your search criteria or status filter.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LUXURY ORDER DETAILS MODAL / SLIDE-OVER DRAWER (CLICKABLE ORDER VIEW) */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[70] flex items-center justify-end bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col border-l border-zinc-200 animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold font-mono shadow-xs">
                  {selectedOrder.orderNumber ? selectedOrder.orderNumber.slice(-4) : 'ORD'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black font-mono text-zinc-900 tracking-tight">
                      {selectedOrder.orderNumber}
                    </h2>
                    <button
                      onClick={() => handleCopyOrderNumber(selectedOrder.orderNumber)}
                      className="text-xs text-zinc-400 hover:text-zinc-600 cursor-pointer p-1"
                      title={isFr ? "Copier le n° de commande" : "Copy order number"}
                    >
                      {copiedOrderId === selectedOrder.orderNumber ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <span className="text-[10px] font-bold bg-zinc-200 text-zinc-700 px-1.5 py-0.2 rounded">
                          {isFr ? 'Copier' : 'Copy'}
                        </span>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{selectedOrder.date}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 rounded-xl transition-all cursor-pointer"
                  title={isFr ? "Imprimer le reçu" : "Print receipt"}
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Status Timeline Stepper */}
              <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-500">
                    {isFr ? 'Statut du Colis (Cliquez pour changer)' : 'Order Status (Click stage to update)'}
                  </span>
                  {(() => {
                    const b = getStatusBadge(selectedOrder.status);
                    return (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${b.bg}`}>
                        {b.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Interactive Status Stepper */}
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {statusWorkflow.map((step, idx) => {
                    const currentIdx = getWorkflowStepIndex(selectedOrder.status);
                    const isCompleted = currentIdx >= idx && selectedOrder.status !== 'cancelled';
                    const isCurrent = currentIdx === idx && selectedOrder.status !== 'cancelled';

                    return (
                      <button
                        key={step.key}
                        type="button"
                        onClick={() => handleUpdateStatus(selectedOrder.id, step.key)}
                        className={`group p-2 rounded-xl text-center transition-all cursor-pointer border ${
                          isCurrent
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : isCompleted
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-white text-zinc-500 border-zinc-200 hover:border-blue-300 hover:text-blue-600'
                        }`}
                      >
                        <div className="text-[10px] font-black uppercase tracking-wider truncate">
                          {step.label}
                        </div>
                        <div className={`text-[8px] mt-0.5 truncate ${isCurrent ? 'text-blue-100' : 'text-zinc-400'}`}>
                          {step.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Cancel option */}
                <div className="flex justify-end pt-1">
                  {selectedOrder.status !== 'cancelled' ? (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                    >
                      {isFr ? 'Marquer comme annulée' : 'Mark as cancelled'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'placed')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      {isFr ? 'Réactiver la commande' : 'Reactivate order'}
                    </button>
                  )}
                </div>
              </div>

              {/* Customer & Delivery Card */}
              <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>{isFr ? 'Informations Client & Livraison' : 'Customer & Shipping Info'}</span>
                  </h3>
                  {selectedOrder.shippingAddress?.phone && (
                    <a
                      href={`https://wa.me/${selectedOrder.shippingAddress.phone.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent(
                        isFr 
                          ? `Bonjour ${selectedOrder.shippingAddress.firstName}, je vous contacte concernant votre commande GLADYNS n° ${selectedOrder.orderNumber}.` 
                          : `Hello ${selectedOrder.shippingAddress.firstName}, contacting you regarding your GLADYNS order #${selectedOrder.orderNumber}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isFr ? 'Contacter WhatsApp' : 'Chat WhatsApp'}</span>
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-400 font-semibold uppercase text-[10px] block">{isFr ? 'Nom du destinataire' : 'Customer Name'}</span>
                    <p className="font-bold text-zinc-900 text-sm mt-0.5">
                      {selectedOrder.shippingAddress?.firstName || ''} {selectedOrder.shippingAddress?.lastName || ''}
                    </p>
                  </div>

                  <div>
                    <span className="text-zinc-400 font-semibold uppercase text-[10px] block">{isFr ? 'Téléphone' : 'Phone Number'}</span>
                    <div className="flex items-center gap-2 mt-0.5 font-mono font-bold text-zinc-900">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      <a href={`tel:${selectedOrder.shippingAddress?.phone}`} className="hover:text-blue-600 hover:underline">
                        {selectedOrder.shippingAddress?.phone || 'N/A'}
                      </a>
                    </div>
                  </div>

                  <div>
                    <span className="text-zinc-400 font-semibold uppercase text-[10px] block">{isFr ? 'Email' : 'Email Address'}</span>
                    <div className="flex items-center gap-1.5 mt-0.5 text-zinc-700 font-medium">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{selectedOrder.shippingAddress?.email || 'N/A'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-zinc-400 font-semibold uppercase text-[10px] block">{isFr ? 'Ville & Région' : 'City & Region'}</span>
                    <p className="font-bold text-zinc-900 mt-0.5">
                      {selectedOrder.shippingAddress?.city || ''} {selectedOrder.shippingAddress?.state ? `(${selectedOrder.shippingAddress.state})` : ''}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-zinc-400 font-semibold uppercase text-[10px] block">{isFr ? 'Adresse de livraison exacte' : 'Exact Street Address'}</span>
                    <p className="font-medium text-zinc-800 mt-0.5 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/60 leading-relaxed">
                      {selectedOrder.shippingAddress?.street || isFr ? 'Non spécifiée' : 'Not specified'}
                      {selectedOrder.shippingAddress?.apartment ? `, Appt / Repère : ${selectedOrder.shippingAddress.apartment}` : ''}
                    </p>
                  </div>
                </div>

                {/* Tracking Number Input */}
                <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-500 font-semibold">{isFr ? 'N° de Suivi Livreurs :' : 'Tracking Number:'}</span>
                    {editingTracking ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={trackingInput}
                          onChange={(e) => setTrackingInput(e.target.value)}
                          placeholder="e.g. GL-TRK-78491"
                          className="px-2.5 py-1 bg-zinc-50 border border-zinc-300 rounded-lg text-xs font-mono font-bold text-zinc-900"
                        />
                        <button
                          type="button"
                          onClick={handleSaveTracking}
                          className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold"
                        >
                          {isFr ? 'Sauvegarder' : 'Save'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">
                          {selectedOrder.trackingNumber || (isFr ? 'Non assigné' : 'Unassigned')}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setTrackingInput(selectedOrder.trackingNumber || '');
                            setEditingTracking(true);
                          }}
                          className="text-[11px] font-bold text-blue-600 hover:underline"
                        >
                          {isFr ? 'Modifier' : 'Edit'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Ordered List */}
              <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider flex items-center justify-between">
                  <span>{isFr ? 'Articles de la Commande' : 'Items Ordered'}</span>
                  <span className="text-xs font-bold text-zinc-500 font-mono">
                    {selectedOrder.items?.length || 0} {isFr ? 'articles' : 'items'}
                  </span>
                </h3>

                <div className="divide-y divide-zinc-100">
                  {selectedOrder.items?.map((item: CartItem, idx: number) => {
                    const prod = item.product;
                    const imgSrc = prod?.primaryImage || prod?.images?.[0] || '';
                    const itemTotal = (Number(prod?.price) || 0) * (Number(item.quantity) || 1);

                    return (
                      <div key={idx} className="py-3.5 flex items-center gap-3.5 first:pt-0 last:pb-0">
                        <div className="w-14 h-14 rounded-xl border border-zinc-200 overflow-hidden bg-zinc-50 shrink-0">
                          {imgSrc ? (
                            <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-zinc-400">
                              GLS
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-zinc-900 truncate">
                            {prod?.name || 'Item'}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                            {item.selectedSize && (
                              <span className="bg-zinc-100 px-2 py-0.5 rounded font-medium">
                                Taille : {item.selectedSize.name}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="flex items-center gap-1 bg-zinc-100 px-2 py-0.5 rounded font-medium">
                                {item.selectedColor.colorHex && (
                                  <span 
                                    className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0" 
                                    style={{ backgroundColor: item.selectedColor.colorHex }} 
                                  />
                                )}
                                <span>{item.selectedColor.name}</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                            {formatPrice(prod?.price || 0)} × {item.quantity}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-black font-mono text-sm text-zinc-900">
                            {formatPrice(itemTotal)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200/80 space-y-2.5 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>{isFr ? 'Sous-total articles' : 'Items Subtotal'}</span>
                  <span className="font-mono font-bold">{formatPrice(selectedOrder.subtotal || 0)}</span>
                </div>

                <div className="flex justify-between text-zinc-600">
                  <span>{isFr ? 'Frais de livraison' : 'Shipping Fee'}</span>
                  <span className="font-mono font-bold">
                    {selectedOrder.shippingCost ? formatPrice(selectedOrder.shippingCost) : '2,000 CFA'}
                  </span>
                </div>

                {Boolean(selectedOrder.discount) && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>{isFr ? 'Remise appliquée' : 'Discount'}</span>
                    <span className="font-mono">-{formatPrice(selectedOrder.discount)}</span>
                  </div>
                )}

                <div className="pt-2.5 border-t border-zinc-200 flex justify-between items-center text-sm font-black text-zinc-900">
                  <span className="text-base">{isFr ? 'Total à Encaisser' : 'Total Amount'}</span>
                  <span className="text-lg font-mono text-blue-600">{formatPrice(selectedOrder.total)}</span>
                </div>

                <div className="flex items-center gap-1.5 pt-1 text-[11px] text-zinc-500">
                  <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                  <span>
                    {isFr ? 'Mode de règlement :' : 'Payment Method:'} {' '}
                    <strong className="text-zinc-800 uppercase">
                      {selectedOrder.paymentMethod === 'cod' ? (isFr ? 'Paiement à la livraison (Cash)' : 'Cash on Delivery') : 'Carte Bancaire / En ligne'}
                    </strong>
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 sm:p-5 border-t border-zinc-200 bg-white flex items-center justify-between gap-3 sticky bottom-0">
              <button
                type="button"
                onClick={() => setDeleteConfirmationId(selectedOrder.id)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">{isFr ? 'Supprimer' : 'Delete Order'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isFr ? 'Imprimer Reçu' : 'Print Receipt'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  {isFr ? 'Fermer' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-7 shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-5">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-zinc-900">
              {isFr ? 'Supprimer cette commande ?' : 'Delete Order?'}
            </h3>
            <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
              {isFr 
                ? 'Cette action est irréversible. La commande sera définitivement retirée du registre.' 
                : 'This action is permanent. The order will be purged from history.'}
            </p>
            <div className="flex gap-2.5 mt-6">
              <button 
                type="button"
                onClick={() => setDeleteConfirmationId(null)}
                className="flex-1 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {isFr ? 'Annuler' : 'Cancel'}
              </button>
              <button 
                type="button"
                onClick={handleDeleteOrder}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-200 cursor-pointer"
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
