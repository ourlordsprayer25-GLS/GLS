import React, { useState } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  FileText,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  User,
  Check,
  Sparkles,
  ArrowLeft,
  Calendar,
  Layers,
  Printer,
  MapPin,
  Copy,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import { Order, CartItem, Product, UserProfile, ProductVariant, ProductSize, StoreSettings } from '../types/store';
import { INITIAL_PRODUCTS } from '../data/products';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';
import { ProductCard } from './ProductCard';
import { getWhatsAppLink } from './WhatsAppWidget';

interface OrdersPageProps {
  user: UserProfile | null;
  orders: Order[];
  products: Product[];
  wishlistIds: string[];
  onCancelOrder: (orderId: string, reason: string) => void;
  onRequestReturn: (orderId: string) => void;
  onReorder: (items: CartItem[]) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart?: (product: Product, variant: ProductVariant, size: ProductSize, quantity: number) => void;
  onToggleWishlist: (productId: string) => void;
  onBackToShop: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onUpdateOrderStatus?: (orderId: string, newStatus: Order['status']) => void;
  initialInvoiceNumber?: string | null;
  onClearInitialInvoiceNumber?: () => void;
  storeSettings?: StoreSettings;
}

// The 5 distinct canonical lifecycle stages requested by the user
const getOrderStages = (isFr: boolean) => [
  {
    id: 'placed',
    label: isFr ? 'Commandé' : 'Placed',
    title: isFr ? 'Commande enregistrée' : 'Order Placed',
    description: isFr ? 'Commande enregistrée dans le système' : 'Order registered in system queue',
  },
  {
    id: 'confirmed',
    label: isFr ? 'Confirmé' : 'Confirmed',
    title: isFr ? 'Commande confirmée' : 'Order Confirmed',
    description: isFr ? 'Paiement & pièces vérifiés' : 'Payment & material allocation verified',
  },
  {
    id: 'processing',
    label: isFr ? 'En cours' : 'Processing',
    title: isFr ? 'Préparation en atelier' : 'Product Processing',
    description: isFr ? 'Préparation, tests & emballage' : 'Product preparation, testing & packaging',
  },
  {
    id: 'shipping',
    label: isFr ? 'Expédié' : 'Shipping',
    title: isFr ? 'Expédié & En transit' : 'Dispatched & Shipping',
    description: isFr ? 'En transit avec transporteur neutre en carbone' : 'In transit with carbon-neutral courier',
  },
  {
    id: 'delivered',
    label: isFr ? 'Livré' : 'Delivered',
    title: isFr ? 'Livré et réceptionné' : 'Delivered',
    description: isFr ? 'Reçu & vérifié à l\'adresse de livraison' : 'Received & verified at delivery address',
  },
];

export const OrdersPage: React.FC<OrdersPageProps> = ({
  user,
  orders,
  products,
  wishlistIds,
  onCancelOrder,
  onRequestReturn,
  onReorder,
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
  onBackToShop,
  onOpenProfile,
  onOpenAuth,
  onUpdateOrderStatus,
  initialInvoiceNumber,
  onClearInitialInvoiceNumber,
  storeSettings,
}) => {
  const { formatPrice, t, language } = useLanguageCurrency();
  const isFr = language === 'fr';
  const orderStages = getOrderStages(isFr);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(orders[0]?.id || null);

  // Modals for Tracking and Invoices
  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<Order | null>(null);

  // Auto-open invoice modal if initialInvoiceNumber is provided
  React.useEffect(() => {
    if (initialInvoiceNumber) {
      const matched = orders.find(o => o.orderNumber === initialInvoiceNumber);
      if (matched) {
        setInvoiceModalOrder(matched);
        if (onClearInitialInvoiceNumber) {
          onClearInitialInvoiceNumber();
        }
      }
    }
  }, [initialInvoiceNumber, orders, onClearInitialInvoiceNumber]);

  const [copiedInvoiceId, setCopiedInvoiceId] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Changed my mind');

  // Helper to determine stage index (0 to 4)
  const getStageIndex = (status: Order['status']): number => {
    switch (status) {
      case 'placed':
        return 0;
      case 'confirmed':
        return 1;
      case 'processing':
        return 2;
      case 'shipping':
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const filteredOrders = orders.filter((order) => {
    // Status Filter
    if (statusFilter === 'active') {
      if (order.status === 'delivered' || order.status === 'cancelled') return false;
    } else if (statusFilter === 'delivered') {
      if (order.status !== 'delivered') return false;
    } else if (statusFilter === 'cancelled') {
      if (order.status !== 'cancelled') return false;
    }

    // Search Query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesNumber = order.orderNumber.toLowerCase().includes(q);
    const matchesTracking = order.trackingNumber.toLowerCase().includes(q);
    const matchesItems = order.items.some((i) =>
      i.product.name.toLowerCase().includes(q) || i.product.categoryLabel.toLowerCase().includes(q)
    );
    return matchesNumber || matchesTracking || matchesItems;
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'placed':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 bg-zinc-100/90 px-3 py-1 rounded-lg border border-zinc-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-zinc-500" />
            <span>{isFr ? 'Étape 01 · Commandé' : 'Stage 01 · Placed'}</span>
          </div>
        );
      case 'confirmed':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>{isFr ? 'Étape 02 · Confirmé' : 'Stage 02 · Confirmed'}</span>
          </div>
        );
      case 'processing':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{isFr ? 'Étape 03 · Préparation en atelier' : 'Stage 03 · Tailoring & Finishing'}</span>
          </div>
        );
      case 'shipping':
      case 'shipped':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200/80 shadow-2xs">
            <Truck className="w-3.5 h-3.5 text-blue-700 animate-pulse" />
            <span>{isFr ? 'Étape 04 · En transit' : 'Stage 04 · In Transit'}</span>
          </div>
        );
      case 'delivered':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200/80 shadow-2xs">
            <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
            <span>{isFr ? 'Étape 05 · Livré' : 'Stage 05 · Delivered'}</span>
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-800 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200/80 shadow-2xs">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>{isFr ? 'Commande annulée' : 'Order Cancelled'}</span>
          </div>
        );
      default:
        return null;
    }
  };

  const handleConfirmCancel = () => {
    if (!cancellingOrder) return;
    onCancelOrder(cancellingOrder.id, cancelReason);
    setCancellingOrder(null);
  };

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Breadcrumb & Page Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <button
              onClick={onBackToShop}
              className="hover:text-zinc-950 transition-colors cursor-pointer"
            >
              {isFr ? 'Boutique & Catalogue' : 'Shop Catalog'}
            </button>
            <span>/</span>
            <span className="text-zinc-900 font-medium">
              {isFr ? 'Commandes & Suivi' : 'Orders & Tracking'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-medium text-zinc-950">
            {isFr ? 'Commandes & Suivi en Direct' : 'Client Orders & Tracking'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            {isFr
              ? 'Suivi interactif de votre commande à travers les 5 étapes de fabrication, contrôle et expédition.'
              : 'Live progression through all 5 creation, inspection, and dispatch stages.'}
          </p>
        </div>

        {/* Quick Action Navigation between Pages */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBackToShop}
            className="px-3.5 py-2 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-100 rounded-xl border border-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isFr ? 'Retour à la boutique' : 'Back to Shop'}</span>
          </button>
        </div>
      </div>

      {/* Patron Metrics Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
        <div className="p-4 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
            {isFr ? 'Commandes Enregistrées' : 'Archived Orders'}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-zinc-950">{orders.length}</span>
            <span className="text-xs text-zinc-500 font-medium">
              {isFr ? (orders.length === 1 ? 'commande' : 'commandes') : 'consignments'}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
            {isFr ? 'En Cours & Acheminement' : 'Orders In-Flight'}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-amber-600">
              {orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length}
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              {isFr ? 'en atelier & transit' : 'in craft & transit'}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
            {isFr ? 'Livrées & Réceptionnées' : 'Delivered to Sanctuary'}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-emerald-700">
              {orders.filter((o) => o.status === 'delivered').length}
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              {isFr ? 'réceptionnées' : 'received'}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
            {isFr ? 'Garantie GLADYNS' : 'GLADYNS Warranty'}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <ShieldCheck className="w-5 h-5 text-zinc-950" />
            <span className="text-xs font-semibold text-zinc-900">
              {isFr ? 'Support & Garantie Actifs' : 'Lifetime Repair Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-zinc-100/90 p-1 rounded-xl self-start overflow-x-auto max-w-full">
          {[
            { id: 'all', label: isFr ? 'Toutes' : 'All Orders', count: orders.length },
            {
              id: 'active',
              label: isFr ? 'En cours' : 'Active & In Transit',
              count: orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length,
            },
            {
              id: 'delivered',
              label: isFr ? 'Livrées' : 'Delivered',
              count: orders.filter((o) => o.status === 'delivered').length,
            },
            {
              id: 'cancelled',
              label: isFr ? 'Annulées' : 'Cancelled',
              count: orders.filter((o) => o.status === 'cancelled').length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-white text-zinc-950 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-200/60 text-zinc-700">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isFr ? 'Rechercher par commande, suivi, article...' : 'Search by order, tracking, item...'}
            className="w-full pl-8 pr-4 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 hover:text-zinc-700"
            >
              {isFr ? 'Effacer' : 'Clear'}
            </button>
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="mt-6 space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200/80 space-y-4">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                {isFr ? 'Aucune commande correspondante trouvée' : 'No matching orders found'}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                {searchQuery
                  ? (isFr ? `Aucune commande ne correspond à « ${searchQuery} ». Essayez par n° de commande.` : `No orders matching "${searchQuery}". Try searching by order number.`)
                  : (isFr ? 'Vous n\'avez aucune commande dans cet affichage.' : 'You do not have any orders in this view.')}
              </p>
            </div>
            <button
              onClick={onBackToShop}
              className="px-4 py-2 bg-zinc-950 text-white rounded-xl text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {isFr ? 'Découvrir la collection' : 'Explore Collection'}
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const currentStageIdx = getStageIndex(order.status);
            const isCancelled = order.status === 'cancelled';
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-zinc-200/90 shadow-xs overflow-hidden transition-all"
              >
                {/* Order Summary Header */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-5 sm:p-6 cursor-pointer hover:bg-zinc-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-zinc-950 font-mono">
                          {order.orderNumber}
                        </span>
                        <span className="text-zinc-300">·</span>
                        <span className="text-xs text-zinc-500">{order.date}</span>
                      </div>
                      <div className="text-xs text-zinc-600 mt-1 flex items-center gap-2">
                        <span>
                          {order.items.length} {isFr ? (order.items.length === 1 ? 'article' : 'articles') : (order.items.length === 1 ? 'piece' : 'pieces')}
                        </span>
                        <span className="text-zinc-300">·</span>
                        <span className="font-semibold text-zinc-950 font-mono">
                          {formatPrice(order.total)}
                        </span>
                        <span className="text-zinc-300">·</span>
                        <span className="text-zinc-500">{order.carrier || (isFr ? 'DHL Express Logistique' : 'DHL Express')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                    {getStatusBadge(order.status)}
                    <div className="text-zinc-400 p-1">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* THE 5-STAGE PROGRESS PIPELINE (PLACED -> CONFIRMED -> PROCESSING -> SHIPPING -> DELIVERED) */}
                <div className="px-5 sm:px-6 py-4 bg-zinc-50/70 border-t border-b border-zinc-200/60">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                      {isFr ? 'Suivi en direct de la commande' : 'Live Order Pipeline'}
                    </span>
                    {order.status !== 'cancelled' && (
                      <span className="text-xs font-semibold text-zinc-900 font-mono">
                        {isFr
                          ? `Étape ${currentStageIdx + 1} sur 5 : ${orderStages[currentStageIdx]?.label}`
                          : `Stage ${currentStageIdx + 1} of 5: ${orderStages[currentStageIdx]?.label}`}
                      </span>
                    )}
                  </div>

                  {isCancelled ? (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-xs text-rose-800">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <div>
                          <p className="font-semibold">
                            {isFr
                              ? `Commande annulée ${order.cancelledAt ? `le ${order.cancelledAt}` : ''}`
                              : `Order Cancelled ${order.cancelledAt ? `on ${order.cancelledAt}` : ''}`}
                          </p>
                          <p className="text-[11px] text-rose-600 mt-0.5">
                            {isFr
                              ? `Motif : ${order.cancelReason || 'Demande client'}. Remboursement à 100% crédité sur le moyen de paiement.`
                              : `Reason: ${order.cancelReason || 'Customer requested'}. 100% Refund credited to payment method.`}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                        {isFr ? 'Remboursé' : 'Refunded'}
                      </span>
                    </div>
                  ) : (
                    /* 5-Step Visual Stepper */
                    <div className="relative pt-2 pb-1">
                      {/* Desktop / Tablet Horizontal Pipeline */}
                      <div className="hidden sm:grid grid-cols-5 relative">
                        {/* Connecting Line Track */}
                        <div className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-zinc-200 -z-0" />
                        <div
                          className="absolute top-4 left-[10%] h-0.5 bg-zinc-950 transition-all duration-500 -z-0"
                          style={{
                            width: `${(currentStageIdx / 4) * 80}%`,
                          }}
                        />

                        {orderStages.map((stage, idx) => {
                          const isPassed = idx < currentStageIdx;
                          const isCurrent = idx === currentStageIdx;

                          return (
                            <div key={stage.id} className="flex flex-col items-center text-center z-10">
                              {/* Step Circle Node */}
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all shadow-xs ${
                                  isPassed
                                    ? 'bg-zinc-950 text-white ring-4 ring-white'
                                    : isCurrent
                                    ? 'bg-zinc-950 text-white ring-4 ring-zinc-300 ring-offset-2 animate-pulse'
                                    : 'bg-white text-zinc-400 border border-zinc-300'
                                }`}
                              >
                                {isPassed ? (
                                  <Check className="w-4 h-4 stroke-[2.5]" />
                                ) : (
                                  <span>{idx + 1}</span>
                                )}
                              </div>

                              {/* Label */}
                              <span
                                className={`mt-2 text-xs font-bold transition-colors ${
                                  isCurrent
                                    ? 'text-zinc-950 font-extrabold underline underline-offset-4'
                                    : isPassed
                                    ? 'text-zinc-900'
                                    : 'text-zinc-400'
                                }`}
                              >
                                {stage.label}
                              </span>

                              {/* Subtext info */}
                              <span className="text-[10px] text-zinc-500 mt-0.5 max-w-[110px] leading-tight">
                                {isPassed
                                  ? idx === 0
                                    ? order.date
                                    : (isFr ? 'Terminé' : 'Completed')
                                  : isCurrent
                                  ? (isFr ? 'En cours' : 'In Progress')
                                  : (isFr ? 'En attente' : 'Pending')}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Mobile Compact Pipeline View */}
                      <div className="sm:hidden space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          {orderStages.map((stage, idx) => {
                            const isPassedOrCurrent = idx <= currentStageIdx;
                            return (
                              <div
                                key={stage.id}
                                className={`flex flex-col items-center ${
                                  idx === currentStageIdx ? 'text-zinc-950' : isPassedOrCurrent ? 'text-zinc-700' : 'text-zinc-300'
                                }`}
                              >
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    idx === currentStageIdx
                                      ? 'bg-zinc-950 text-white ring-2 ring-zinc-400'
                                      : isPassedOrCurrent
                                      ? 'bg-zinc-800 text-white'
                                      : 'bg-zinc-200 text-zinc-400'
                                  }`}
                                >
                                  {idx < currentStageIdx ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                                </div>
                                <span className="text-[10px] mt-1 font-semibold">{stage.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-4 space-y-6">
                    {/* Delivery & Tracking Highlights */}
                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase text-zinc-500 tracking-wider">
                            {isFr ? 'Livraison estimée' : 'Estimated Delivery'}
                          </span>
                          <span className="text-xs font-bold text-zinc-950 font-mono">
                            {order.estimatedDelivery}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600">
                          {isFr ? 'Transporteur :' : 'Carrier:'} <strong>{order.carrier || (isFr ? 'DHL Express GLADYNS Logistique' : 'DHL Express GLADYNS Logistics')}</strong> · {isFr ? 'N° de suivi :' : 'Tracking:'} <span className="font-mono text-zinc-900 font-semibold">{order.trackingNumber}</span>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setTrackingModalOrder(order)}
                          className="px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>{isFr ? 'Suivre en direct' : 'Track Live Package'}</span>
                        </button>
                        <button
                          onClick={() => setInvoiceModalOrder(order)}
                          className="px-3.5 py-1.5 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{isFr ? 'Facture GLADYNS' : 'GLADYNS Invoice'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Consignment Items Grid */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        {isFr ? `Articles commandés (${order.items.length})` : `Consignment Pieces (${order.items.length})`}
                      </h4>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white rounded-xl border border-zinc-200/80 flex items-center justify-between gap-3"
                          >
                            <div
                              onClick={() => onSelectProduct(item.product)}
                              className="flex items-center gap-3 cursor-pointer group flex-1"
                            >
                              <img
                                src={item.selectedColor?.image || item.product.primaryImage}
                                alt={item.product.name}
                                className="w-14 h-14 rounded-lg object-cover bg-zinc-100 border border-zinc-200 shrink-0"
                              />
                              <div>
                                <h5 className="text-xs sm:text-sm font-semibold text-zinc-900 group-hover:text-zinc-600 transition-colors line-clamp-1">
                                  {item.product.name}
                                </h5>
                                <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                                  <span>{isFr ? 'Couleur :' : 'Color:'} <strong>{item.selectedColor?.name || (isFr ? 'Standard' : 'Standard')}</strong></span>
                                  <span>·</span>
                                  <span>{isFr ? 'Taille :' : 'Size:'} <strong>{item.selectedSize?.name || (isFr ? 'Taille Unique' : 'One Size')}</strong></span>
                                  <span>·</span>
                                  <span>{isFr ? 'Qté :' : 'Qty:'} {item.quantity}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-xs sm:text-sm font-semibold font-mono text-zinc-900">
                                {formatPrice(item.product.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Financials & Shipping Destination */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Shipping Address */}
                      <div className="p-4 bg-zinc-50/60 rounded-xl border border-zinc-200/70 space-y-1">
                        <span className="font-semibold text-zinc-900 block">{isFr ? 'Adresse de livraison' : 'Shipping Destination'}</span>
                        <p className="text-zinc-700 font-medium">
                          {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                        </p>
                        <p className="text-zinc-500">
                          {order.shippingAddress.street}
                          {order.shippingAddress.apartment && `, ${order.shippingAddress.apartment}`}
                        </p>
                        <p className="text-zinc-500">
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                        </p>
                        <p className="text-zinc-500">{order.shippingAddress.country}</p>
                      </div>

                      {/* Financial Breakdown */}
                      <div className="p-4 bg-zinc-50/60 rounded-xl border border-zinc-200/70 space-y-1.5 font-mono">
                        <span className="font-sans font-semibold text-zinc-900 block mb-1">{isFr ? 'Récapitulatif Financier' : 'Financial Summary'}</span>
                        <div className="flex justify-between text-zinc-600">
                          <span>{isFr ? 'Sous-total' : 'Subtotal'}</span>
                          <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-emerald-700">
                            <span>{isFr ? 'Remise Promo' : 'Promo Discount'}</span>
                            <span>-{formatPrice(order.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-zinc-600">
                          <span>{isFr ? 'Livraison Neutre en Carbone' : 'Carbon-Neutral Shipping'}</span>
                          <span>{order.shippingCost === 0 ? (isFr ? 'Offerte' : 'Complimentary') : formatPrice(order.shippingCost)}</span>
                        </div>
                        <div className="flex justify-between text-zinc-600">
                          <span>{isFr ? 'Taxe estimée' : 'Estimated Tax'}</span>
                          <span>{formatPrice(order.tax)}</span>
                        </div>
                        <div className="pt-2 border-t border-zinc-200 flex justify-between font-bold text-zinc-950 text-sm">
                          <span className="font-sans">{isFr ? 'Total Payé' : 'Total Paid'}</span>
                          <span>{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Action Bar (Cancel, Return, Buy Again) */}
                    <div className="pt-4 border-t border-zinc-200/80 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {/* Cancel Button (Available if placed, confirmed, or processing) */}
                        {!isCancelled && (order.status === 'placed' || order.status === 'confirmed' || order.status === 'processing') && (
                          <button
                            onClick={() => setCancellingOrder(order)}
                            className="px-3.5 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            {isFr ? 'Annuler la commande' : 'Cancel Order'}
                          </button>
                        )}

                        {/* Request Return (Available if delivered) */}
                        {order.status === 'delivered' && (
                          <button
                            onClick={() => onRequestReturn(order.id)}
                            disabled={order.returnRequested}
                            className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                              order.returnRequested
                                ? 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed'
                                : 'border-zinc-300 hover:bg-zinc-100 text-zinc-800'
                            }`}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{order.returnRequested ? (isFr ? 'Retour initié' : 'Return Initiated') : (isFr ? 'Demander un retour offert' : 'Request Complimentary Return')}</span>
                          </button>
                        )}
                      </div>

                      {/* Buy Again (Reorder) */}
                      <button
                        onClick={() => onReorder(order.items)}
                        className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{isFr ? 'Commander à nouveau' : 'Buy Again (Reorder All)'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* More to Discover Section */}
      <div className="mt-20 pt-16 border-t border-zinc-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block">
                {language === 'fr' ? 'RECOMMANDATIONS DU CATALOGUE' : 'CATALOG DISCOVERIES'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-medium text-zinc-950">
              {language === 'fr' ? 'Équipements Recommandés' : 'Recommended Equipment'}
            </h2>
            <p className="text-xs text-zinc-500 max-w-xl">
              {language === 'fr' 
                ? 'Découvrez d\'autres modèles récents, mises à niveau et accessoires pour accompagner vos commandes.' 
                : 'Explore top-rated hardware models, upgrades, and accessories from our active catalog.'}
            </p>
          </div>
          <button 
            onClick={onBackToShop}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest flex items-center gap-1.5 mt-4 md:mt-0 cursor-pointer"
          >
            <span>{language === 'fr' ? 'Voir tout le catalogue' : 'Explore All Equipment'}</span>
            <ArrowRight className="w-4 h-4" />
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

      {/* Cancel Order Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 p-6 space-y-4 animate-in fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-zinc-950">
                {language === 'fr' 
                  ? `Annuler la commande ${cancellingOrder.orderNumber} ?` 
                  : `Cancel Order ${cancellingOrder.orderNumber}?`}
              </h3>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              {language === 'fr' 
                ? 'Cette commande n\'a pas encore été expédiée. Une fois annulée, un remboursement immédiat à 100% de ' 
                : 'This order has not shipped yet. Once cancelled, an immediate 100% refund of '}
              <strong className="text-zinc-950 font-mono">{formatPrice(cancellingOrder.total)}</strong>
              {language === 'fr' 
                ? ' vous sera restitué selon votre mode de paiement.' 
                : ' will be returned to your payment method.'}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700">
                {language === 'fr' ? 'Motif de l\'annulation' : 'Reason for Cancellation'}
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="Changed my mind">{language === 'fr' ? 'J\'ai changé d\'avis' : 'Changed my mind'}</option>
                <option value="Need different size or color">{language === 'fr' ? 'Besoin d\'une autre taille ou couleur' : 'Need different size or color'}</option>
                <option value="Delivery timing conflict">{language === 'fr' ? 'Délai de livraison incompatible' : 'Delivery timing conflict'}</option>
                <option value="Created order by mistake">{language === 'fr' ? 'Commande créée par erreur' : 'Created order by mistake'}</option>
                <option value="Other">{language === 'fr' ? 'Autre' : 'Other'}</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancellingOrder(null)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-medium cursor-pointer"
              >
                {language === 'fr' ? 'Garder la commande' : 'Keep Order'}
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
              >
                {language === 'fr' ? 'Confirmer l\'annulation & remboursement' : 'Confirm Cancellation & Refund'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Tracking Modal with Milestone Checkpoints */}
      {trackingModalOrder && (() => {
        const orderStageIdx = getStageIndex(trackingModalOrder.status);
        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-6 sm:p-8 animate-in fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
                  {language === 'fr' ? 'Détails du suivi & de la commande' : 'Order Invoice Details'}
                </h3>
                <button
                  onClick={() => setTrackingModalOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Order ID Section */}
              <div className="mt-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 block">
                  {language === 'fr' ? 'NUMÉRO DE COMMANDE' : 'ORDER ID'}
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1 select-all font-mono">
                  {trackingModalOrder.orderNumber}
                </p>
              </div>

              {/* Timeline & Status Section */}
              <div className="mt-5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 block">
                  {language === 'fr' ? 'CHRONOLOGIE & STATUT' : 'TIMELINE & STATUS'}
                </span>
                
                {/* Localized Status Label with Blue Bullet */}
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 mt-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shrink-0 animate-pulse" />
                  <span>
                    {language === 'fr' 
                      ? (trackingModalOrder.status === 'placed' ? 'En cours (Commandé)' : trackingModalOrder.status === 'confirmed' ? 'Confirmé' : trackingModalOrder.status === 'processing' ? 'En préparation' : trackingModalOrder.status === 'shipping' || trackingModalOrder.status === 'shipped' ? 'Expédié' : trackingModalOrder.status === 'delivered' ? 'Livré' : 'Annulé')
                      : (trackingModalOrder.status === 'placed' ? 'Placed' : trackingModalOrder.status === 'confirmed' ? 'Confirmed' : trackingModalOrder.status === 'processing' ? 'Processing' : trackingModalOrder.status === 'shipping' || trackingModalOrder.status === 'shipped' ? 'Shipping' : trackingModalOrder.status === 'delivered' ? 'Done' : 'Cancelled')}
                  </span>
                </div>

                {/* Highly Responsive Horizontal Connected Stepper */}
                <div className="relative flex items-center justify-between w-full mt-5 mb-7 px-1">
                  {/* Gray background line */}
                  <div className="absolute top-[18px] left-[5%] right-[5%] h-[3px] bg-slate-100 -z-10 rounded-full" />
                  {/* Blue progress line */}
                  <div 
                    className="absolute top-[18px] left-[5%] h-[3px] bg-blue-600 transition-all duration-500 -z-10 rounded-full"
                    style={{ width: `${orderStageIdx >= 0 ? (orderStageIdx / 4) * 90 : 0}%` }}
                  />

                  {[
                    { label: language === 'fr' ? 'COMMANDÉ' : 'PLACED', stepNum: 1 },
                    { label: language === 'fr' ? 'CONFIRMÉ' : 'CONFIRM', stepNum: 2 },
                    { label: language === 'fr' ? 'EN COURS' : 'PROCESSING', stepNum: 3 },
                    { label: language === 'fr' ? 'EXPÉDIÉ' : 'SHIPPING', stepNum: 4 },
                    { label: language === 'fr' ? 'LIVRÉ' : 'DONE', stepNum: 5 },
                  ].map((step, idx) => {
                    const isPassed = idx < orderStageIdx;
                    const isCurrent = idx === orderStageIdx;

                    return (
                      <div key={idx} className="flex flex-col items-center relative flex-1">
                        <div
                          className={`w-[36px] h-[36px] rounded-full flex items-center justify-center transition-all duration-300 font-sans text-xs font-extrabold ${
                            isPassed
                              ? 'bg-blue-600 text-white shadow-xs'
                              : isCurrent
                              ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md scale-105'
                              : 'bg-white text-slate-400 border-2 border-slate-200'
                          }`}
                        >
                          {isPassed ? (
                            <Check className="w-[18px] h-[18px] stroke-[2.8]" />
                          ) : (
                            <span>{step.stepNum}</span>
                          )}
                        </div>
                        <span
                          className={`mt-2 text-[9px] font-black uppercase tracking-wider text-center ${
                            isCurrent || isPassed ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipping Address Section */}
              <div className="mt-5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 block">
                  {language === 'fr' ? 'ADRESSE DE LIVRAISON' : 'SHIPPING ADDRESS'}
                </span>
                <div className="rounded-2xl border border-slate-100 p-4 mt-2 bg-slate-50/40 flex items-start gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-extrabold text-slate-900 text-sm">{trackingModalOrder.shippingAddress.firstName} {trackingModalOrder.shippingAddress.lastName}</p>
                    <p className="text-slate-500 font-semibold mt-1 leading-relaxed">
                      {trackingModalOrder.shippingAddress.street}
                      {trackingModalOrder.shippingAddress.apartment ? `, ${trackingModalOrder.shippingAddress.apartment}` : ''}
                    </p>
                    <p className="text-slate-400 font-medium">
                      {trackingModalOrder.shippingAddress.city}, {trackingModalOrder.shippingAddress.state} {trackingModalOrder.shippingAddress.postalCode}
                    </p>
                    <p className="text-slate-800 font-bold mt-1.5 font-mono text-xs">{trackingModalOrder.shippingAddress.phone || '0502030102'}</p>
                  </div>
                </div>
              </div>

              {/* Interactive Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-mono font-bold text-slate-500">
                  {language === 'fr' ? 'Réf : ' : 'Code: '}
                  <strong className="text-slate-800">#{trackingModalOrder.orderNumber}</strong>
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={() => window.print()} 
                    className="flex items-center gap-1.5 px-3.5 h-10 border-2 border-slate-900 rounded-xl text-xs font-black uppercase text-slate-900 hover:bg-slate-100 cursor-pointer bg-white transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>{language === 'fr' ? 'Imprimer' : 'Print'}</span>
                  </button>
                  <button 
                    onClick={() => alert(language === 'fr' ? 'Veuillez contacter le support pour modifier l\'adresse de livraison.' : 'Please contact GLADYNS support to update your shipping address.')} 
                    className="px-3.5 h-10 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer bg-white transition-colors"
                  >
                    {language === 'fr' ? 'Modifier l\'adresse' : 'Change Address'}
                  </button>
                  {!['delivered', 'cancelled'].includes(trackingModalOrder.status) && (
                    <button 
                      onClick={() => { setCancellingOrder(trackingModalOrder); setTrackingModalOrder(null); }} 
                      className="flex items-center gap-1.5 px-3.5 h-10 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{language === 'fr' ? 'Annuler' : 'Cancel'}</span>
                    </button>
                  )}
                  <button 
                    onClick={() => setTrackingModalOrder(null)} 
                    className="px-3.5 h-10 border border-rose-200 hover:border-rose-300 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer bg-white transition-colors"
                  >
                    {language === 'fr' ? 'Fermer' : 'Remove'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Invoice Modal */}
      {invoiceModalOrder && (() => {
        const orderStageIdx = getStageIndex(invoiceModalOrder.status);
        const handleCopyId = () => {
          navigator.clipboard.writeText(invoiceModalOrder.orderNumber || invoiceModalOrder.id);
          setCopiedInvoiceId(true);
          setTimeout(() => setCopiedInvoiceId(false), 2000);
        };

        return (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Premium Header with Connected 4-Stage Stepper (On top of modal!) */}
              <div className="bg-slate-50 border-b border-slate-100 p-5 sm:p-6 flex flex-col gap-4 relative">
                {/* Status Badge & Close Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      invoiceModalOrder.status === 'cancelled' ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'
                    }`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">
                      {language === 'fr' ? 'STATUT : ' : 'STATUS: '}
                      {invoiceModalOrder.status === 'placed' 
                        ? (language === 'fr' ? '⏳ En attente' : '⏳ Pending')
                        : invoiceModalOrder.status === 'confirmed' 
                        ? (language === 'fr' ? '✅ Confirmée' : '✅ Confirmed')
                        : invoiceModalOrder.status === 'processing' 
                        ? (language === 'fr' ? '⚙️ En préparation' : '⚙️ Processing')
                        : invoiceModalOrder.status === 'delivered' 
                        ? (language === 'fr' ? '📦 Livrée' : '📦 Delivered')
                        : (language === 'fr' ? '❌ Annulée' : '❌ Cancelled')}
                    </span>
                  </div>
                  {/* Close Button */}
                  <button
                    onClick={() => setInvoiceModalOrder(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-950 hover:bg-slate-200/50 rounded-full cursor-pointer transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                {/* Connected 4-Stage Stepper Line */}
                <div className="relative flex items-center justify-between w-full pt-1">
                  {/* Gray background line */}
                  <div className="absolute top-[12px] left-[5%] right-[5%] h-[2px] bg-slate-200 -z-10 rounded-full" />
                  {/* Colored progress line */}
                  <div 
                    className="absolute top-[12px] left-[5%] h-[2px] bg-emerald-500 transition-all duration-500 -z-10 rounded-full"
                    style={{ width: `${orderStageIdx >= 0 ? Math.min(100, (Math.min(3, orderStageIdx) / 3) * 90) : 0}%` }}
                  />

                  {[
                    { label: language === 'fr' ? 'COMMANDÉ' : 'PLACED' },
                    { label: language === 'fr' ? 'CONFIRMÉ' : 'CONFIRMED' },
                    { label: language === 'fr' ? 'EN COURS' : 'PROCESSING' },
                    { label: language === 'fr' ? 'LIVRÉ' : 'DONE' },
                  ].map((step, idx) => {
                    const normalizedStageIdx = orderStageIdx >= 4 ? 3 : orderStageIdx >= 2 ? 2 : orderStageIdx;
                    const isStepDone = idx < normalizedStageIdx;
                    const isStepCurrent = idx === normalizedStageIdx;

                    return (
                      <div key={idx} className="flex flex-col items-center relative flex-1">
                        <div
                          className={`w-[24px] h-[24px] rounded-full flex items-center justify-center transition-all text-[10px] font-black ${
                            isStepDone || isStepCurrent
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'bg-slate-200 text-slate-500 border border-slate-300'
                          }`}
                        >
                          {isStepDone ? (
                            <Check className="w-[11px] h-[11px] stroke-[3]" />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>
                        <span
                          className={`mt-1 text-[8px] font-black uppercase tracking-wider text-center ${
                            isStepCurrent || isStepDone ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* MODAL MAIN CONTENT: BEAUTIFUL LUXURY RECEIPT */}
              <div className="p-6 sm:p-8 overflow-y-auto max-h-[70vh] bg-[#FCFBF9]">
                {/* Receipt Paper Card */}
                <div className="bg-white border border-amber-900/10 rounded-2xl p-5 sm:p-6 shadow-2xs relative overflow-hidden space-y-6">
                  {/* Subtle watermarked chic bg logo */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.02] text-8xl font-display font-black tracking-widest text-amber-900 select-none">
                    GLADYNS
                  </div>

                  {/* Header Row: Business Name & Details */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-dashed border-slate-200">
                    <div>
                      <h3 className="text-xl font-display font-bold tracking-widest text-slate-900 uppercase">
                        {storeSettings?.storeName || 'GLADYNS MARKETPLACE'}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-0.5">
                        {storeSettings?.contactAddress || 'Abidjan, Côte d\'Ivoire'}
                      </p>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                        gladyns.store · {storeSettings?.contactPhone || storeSettings?.whatsappNumber || '+225 05 00 61 99 23'}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                        {language === 'fr' ? 'NUMÉRO DE FACTURE' : 'INVOICE NUMBER'}
                      </span>
                      <p className="font-mono text-xs font-black text-slate-950 mt-0.5 select-all">
                        {invoiceModalOrder.orderNumber}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {invoiceModalOrder.date || 'Oct 7, 2026'}
                      </p>
                    </div>
                  </div>

                  {/* Info Blocks: Customer & Admin details */}
                  <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                    <div>
                      <span className="text-[9px] font-black text-amber-900/70 tracking-wider block uppercase mb-1">
                        {language === 'fr' ? 'CLIENT / DESTINATAIRE' : 'CUSTOMER / CLIENT'}
                      </span>
                      <div className="space-y-0.5 text-slate-800">
                        <p className="font-bold text-slate-950">
                          {invoiceModalOrder.shippingAddress.firstName} {invoiceModalOrder.shippingAddress.lastName}
                        </p>
                        <p className="text-[11px] text-indigo-600 font-mono font-semibold">
                          {invoiceModalOrder.shippingAddress.phone || '—'}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase leading-tight mt-1">
                          {invoiceModalOrder.shippingAddress.street}, {invoiceModalOrder.shippingAddress.city}, {invoiceModalOrder.shippingAddress.country}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] font-black text-amber-900/70 tracking-wider block uppercase mb-1">
                        {language === 'fr' ? 'ÉMETTEUR DU REÇU' : 'ISSUED BY'}
                      </span>
                      <div className="space-y-0.5 text-slate-800">
                        <p className="font-bold text-slate-950">
                          {storeSettings?.storeName || 'GLADYNS STORE'}
                        </p>
                        <p className="text-[11px] text-emerald-600 font-mono font-semibold">
                          {language === 'fr' ? 'Service Facturation & Commandes' : 'Billing & Fulfillment Team'}
                        </p>
                        <p className="text-[10px] text-slate-400 leading-tight mt-1 uppercase">
                          {language === 'fr' ? (
                            <>{storeSettings?.contactAddress || 'Abidjan, Côte d\'Ivoire'} <br /> Réf. Caisse : #{invoiceModalOrder.orderNumber}</>
                          ) : (
                            <>{storeSettings?.contactAddress || 'Abidjan, Côte d\'Ivoire'} <br /> Register Ref: #{invoiceModalOrder.orderNumber}</>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Pieces Grid */}
                  <div className="pt-4 border-t border-dashed border-slate-200">
                    <span className="text-[9px] font-black text-slate-400 tracking-wider block uppercase mb-3">
                      {language === 'fr' 
                        ? `ARTICLES COMMANDÉS (${invoiceModalOrder.items.length})`
                        : `ORDERED PIECES (${invoiceModalOrder.items.length})`}
                    </span>
                    <div className="space-y-3.5">
                      {invoiceModalOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start text-xs gap-4">
                          <div className="flex gap-3">
                            <img
                              src={item.selectedColor?.image || item.product.primaryImage}
                              alt={item.product.name}
                              className="w-10 h-10 object-cover rounded-lg border border-slate-100 bg-slate-50 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-950">{item.product.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {language === 'fr' ? 'Qté' : 'Qty'} {item.quantity}x · {item.selectedColor?.name || 'Standard'} · {language === 'fr' ? 'Taille' : 'Size'} {item.selectedSize?.name || (language === 'fr' ? 'Unique' : 'One Size')}
                              </p>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-slate-950 text-right tabular-nums mt-1 shrink-0">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total Value Banner with custom luxury look */}
                  <div className="pt-4 border-t border-dashed border-slate-200 flex flex-col justify-center items-center text-center py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {language === 'fr' ? 'MONTANT TOTAL DE LA TRANSACTION' : 'TOTAL TRANSACTION VALUE'}
                    </span>
                    <p className="text-2xl sm:text-3xl font-display font-black text-blue-600 tracking-tight mt-1 font-mono">
                      {formatPrice(invoiceModalOrder.total)}
                    </p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                      {language === 'fr'
                        ? `RÉGLÉ EN TOTALITÉ via ${invoiceModalOrder.paymentMethod ? invoiceModalOrder.paymentMethod.toUpperCase() : 'PAIEMENT SÉCURISÉ'}`
                        : `PAID IN FULL via ${invoiceModalOrder.paymentMethod ? invoiceModalOrder.paymentMethod.toUpperCase() : 'SECURE TRANSFER'}`}
                    </p>
                  </div>

                  {/* Certified Seal / Stamp footer */}
                  <div className="pt-1 text-center space-y-1">
                    <p className="text-[10px] text-slate-400 font-serif italic">
                      {language === 'fr' 
                        ? '« Merci pour votre confiance. GLADYNS garantit une authenticité à 100% sur toutes ses pièces. »' 
                        : '"Thank you for your patronage. GLADYNS guarantees 100% authenticity on all artisanal releases."'}
                    </p>
                    <div className="flex items-center justify-center gap-1.5 pt-2">
                      <span className="h-px w-8 bg-slate-200" />
                      <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase">
                        {language === 'fr' ? 'REÇU OFFICIEL GLADYNS' : 'OFFICIAL GLADYNS RECEIPT'}
                      </span>
                      <span className="h-px w-8 bg-slate-200" />
                    </div>
                  </div>
                </div>

                {/* Action Buttons row (CONTINUE, PRINT, CONTACT US) */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setInvoiceModalOrder(null)}
                      className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase text-center cursor-pointer transition-colors tracking-wider"
                    >
                      {language === 'fr' ? 'Continuer' : 'Continue shopping'}
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors tracking-wider"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{language === 'fr' ? 'Imprimer' : 'Print Order'}</span>
                    </button>
                    <button
                      onClick={() => window.open(getWhatsAppLink(`Order Inquiry ${invoiceModalOrder.orderNumber}`, storeSettings?.whatsappNumber), '_blank')}
                      className="py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase text-center cursor-pointer transition-colors tracking-wider"
                    >
                      {language === 'fr' ? 'Contactez-nous' : 'Contact us'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
