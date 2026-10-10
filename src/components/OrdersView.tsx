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
  Printer,
  MapPin,
  Copy,
  Trash2,
  User,
  Check,
} from 'lucide-react';
import { Order, CartItem, ProductVariant, ProductSize, Product, StoreSettings } from '../types/store';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';
import { getWhatsAppLink } from './WhatsAppWidget';
import { ReceiptModal } from './receipts/ReceiptModal';

interface OrdersViewProps {
  orders: Order[];
  onCancelOrder: (orderId: string, reason: string) => void;
  onRequestReturn: (orderId: string) => void;
  onReorder: (items: CartItem[]) => void;
  onSelectProduct: (product: Product) => void;
  onExploreCatalog: () => void;
  storeSettings?: StoreSettings;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onCancelOrder,
  onRequestReturn,
  onReorder,
  onSelectProduct,
  onExploreCatalog,
  storeSettings,
}) => {
  const { formatPrice, t, language } = useLanguageCurrency();
  const isFr = language === 'fr';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(orders[0]?.id || null);
  
  // Modals for Tracking and Invoices
  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<Order | null>(null);
  const [copiedInvoiceId, setCopiedInvoiceId] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Changed my mind');

  const filteredOrders = orders.filter((order) => {
    // Status Filter
    if (statusFilter === 'active') {
      if (order.status !== 'confirmed' && order.status !== 'processing' && order.status !== 'shipped') return false;
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
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Truck className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>{isFr ? 'Expédié · En transit' : 'Shipped · In Transit'}</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{isFr ? 'Préparation en atelier' : 'Product Processing'}</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" />
            <span>{isFr ? 'Commande confirmée' : 'Order Confirmed'}</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isFr ? 'Livré et réceptionné' : 'Delivered & Signed'}</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>{isFr ? 'Annulé & Remboursé' : 'Cancelled & Refunded'}</span>
          </span>
        );
    }
  };

  const handleConfirmCancel = () => {
    if (!cancellingOrder) return;
    onCancelOrder(cancellingOrder.id, cancelReason);
    setCancellingOrder(null);
  };

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

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-medium text-zinc-950">
              {isFr ? 'Commandes & Expéditions' : 'Orders & Archival Dispatches'}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {isFr
                ? 'Consultez vos commandes en cours, suivez l\'acheminement aérien DHL & FedEx en temps réel ou gérez vos annulations.'
                : 'Review current consignments, track real-time DHL & FedEx air manifests, or manage cancellations.'}
            </p>
          </div>
          <div className="text-xs text-zinc-500 font-mono">
            <span>{isFr ? 'Total des commandes :' : 'Total records:'} <strong>{orders.length}</strong></span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
          {/* Status Tabs */}
          <div className="flex items-center p-1 bg-zinc-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {isFr ? `Toutes (${orders.length})` : `All Orders (${orders.length})`}
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'active'
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {isFr 
                ? `En cours & En transit (${orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length})`
                : `In Transit & Active (${orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length})`}
            </button>
            <button
              onClick={() => setStatusFilter('delivered')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'delivered'
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {isFr
                ? `Livrées (${orders.filter((o) => o.status === 'delivered').length})`
                : `Delivered (${orders.filter((o) => o.status === 'delivered').length})`}
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'cancelled'
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {isFr
                ? `Annulées (${orders.filter((o) => o.status === 'cancelled').length})`
                : `Cancelled (${orders.filter((o) => o.status === 'cancelled').length})`}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isFr ? 'Rechercher par n° de commande, suivi, article...' : 'Search by order #, tracking, item...'}
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-zinc-100 text-zinc-500 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-900">
              {isFr ? 'Aucune commande trouvée' : 'No orders found'}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              {searchQuery
                ? (isFr ? `Aucune commande ne correspond à « ${searchQuery} ».` : `No orders matching "${searchQuery}". Try clearing search.`)
                : (isFr ? 'Vous n\'avez aucune commande dans cette sélection.' : 'You have no archived orders under this filter.')}
            </p>
          </div>
          <button
            onClick={onExploreCatalog}
            className="px-4 py-2 bg-zinc-950 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {isFr ? 'Découvrir la collection saisonnière' : 'Explore Seasonal Collection'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const canCancel = order.status === 'confirmed' || order.status === 'processing';
            const canReturn = order.status === 'delivered';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-xs hover:border-zinc-300 transition-all"
              >
                {/* Order Summary Bar */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50/50 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <div className="p-2.5 bg-[#FAF9F6] border border-zinc-200 rounded-xl text-zinc-900">
                      <Package className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-zinc-950">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-zinc-400">·</span>
                        <span className="text-xs text-zinc-500">{order.date}</span>
                      </div>
                      <div className="text-xs text-zinc-600 mt-0.5">
                        <span>{order.items.length} {isFr ? (order.items.length === 1 ? 'article' : 'articles') : (order.items.length === 1 ? 'piece' : 'pieces')}</span>
                        <span className="mx-1.5">·</span>
                        <span className="font-semibold text-zinc-900 font-mono">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    {getStatusBadge(order.status)}

                    <div className="text-zinc-400 hover:text-zinc-900 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-zinc-100 bg-[#FAF9F6]/40 space-y-6">
                    {/* Delivery & Tracking Highlights */}
                    <div className="p-4 bg-white rounded-xl border border-zinc-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">
                            {isFr ? 'Livraison estimée' : 'Estimated Delivery'}
                          </span>
                          <span className="text-xs font-bold text-zinc-950 font-mono">
                            {order.estimatedDelivery}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600">
                          {isFr ? 'Transporteur :' : 'Carrier:'} <strong>{order.carrier || (isFr ? 'Logistique Standard GLADYNS' : 'GLADYNS Standard Logistics')}</strong> · {isFr ? 'N° de suivi :' : 'Tracking:'} <span className="font-mono text-zinc-900">{order.trackingNumber}</span>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setTrackingModalOrder(order)}
                          className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>{isFr ? 'Suivre le colis' : 'Track Package'}</span>
                        </button>
                        {order.status === 'delivered' && order.receiptReviewed === true && (
                          <button
                            onClick={() => setInvoiceModalOrder(order)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/90 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            <span>{isFr ? 'Reçu officiel' : 'Official Receipt'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Items Grid */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        {isFr ? 'Articles commandés' : 'Consignment Items'}
                      </h4>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white rounded-xl border border-zinc-200/70 flex items-center justify-between gap-3"
                          >
                            <div
                              onClick={() => onSelectProduct(item.product)}
                              className="flex items-center gap-3 cursor-pointer group flex-1"
                            >
                              <img
                                src={item.selectedColor?.image || item.product.primaryImage}
                                alt={item.product.name}
                                className="w-14 h-14 rounded-lg object-cover bg-zinc-100 border border-zinc-200"
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
                      <div className="p-4 bg-white rounded-xl border border-zinc-200/70 space-y-1">
                        <span className="font-semibold text-zinc-900 block">{isFr ? 'Adresse de livraison' : 'Shipping Destination'}</span>
                        <p className="text-zinc-600">
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
                      <div className="p-4 bg-white rounded-xl border border-zinc-200/70 space-y-1.5 font-mono">
                        <div className="flex justify-between text-zinc-600">
                          <span>{isFr ? 'Sous-total' : 'Subtotal'}</span>
                          <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-emerald-700">
                            <span>{isFr ? 'Économie promotionnelle' : 'Promotional Savings'}</span>
                            <span>-{formatPrice(order.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-zinc-600">
                          <span>{isFr ? 'Livraison' : 'Shipping'} ({order.shippingMethod === 'express' ? 'DHL Express' : (isFr ? 'Standard Neutre en Carbone' : 'Standard Carbon-Neutral')})</span>
                          <span>{order.shippingCost === 0 ? (isFr ? 'Offerte' : 'Free') : formatPrice(order.shippingCost)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-zinc-950 pt-2 border-t border-zinc-200 font-sans">
                          <span>{isFr ? 'Total payé' : 'Total Paid'}</span>
                          <span className="font-mono">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Management Actions Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-200/80">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onReorder(order.items)}
                          className="px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{isFr ? 'Commander à nouveau' : 'Buy Items Again'}</span>
                        </button>

                        {canReturn && (
                          <button
                            onClick={() => onRequestReturn(order.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{order.returnRequested ? (isFr ? 'Retour en attente' : 'Return Pending') : (isFr ? 'Demander un retour / échange' : 'Request Return / Exchange')}</span>
                          </button>
                        )}
                      </div>

                      {canCancel && (
                        <button
                          onClick={() => setCancellingOrder(order)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{isFr ? 'Annuler cette commande' : 'Cancel This Order'}</span>
                        </button>
                      )}

                      {order.status === 'cancelled' && (
                        <div className="text-xs text-rose-600 font-medium">
                          {isFr
                            ? `Annulée le ${order.cancelledAt || 'récemment'} · Raison : ${order.cancelReason || 'Demande client'}`
                            : `Cancelled on ${order.cancelledAt || 'recently'} · Reason: ${order.cancelReason || 'Customer Request'}`}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
                  {isFr ? 'Suivi & Détails de la Commande' : 'Order Invoice Details'}
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
                  {isFr ? 'N° DE COMMANDE' : 'ORDER ID'}
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1 select-all font-mono">
                  {trackingModalOrder.orderNumber}
                </p>
              </div>

              {/* Timeline & Status Section */}
              <div className="mt-5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 block">
                  {isFr ? 'ÉTAPES & STATUT' : 'TIMELINE & STATUS'}
                </span>
                
                {/* Localized Status Label with Blue Bullet */}
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 mt-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shrink-0 animate-pulse" />
                  <span>
                    {isFr 
                      ? (trackingModalOrder.status === 'placed' ? 'Enregistrée (Commandé)' : trackingModalOrder.status === 'confirmed' ? 'Confirmée' : trackingModalOrder.status === 'processing' ? 'En cours de préparation' : trackingModalOrder.status === 'shipping' || trackingModalOrder.status === 'shipped' ? 'Expédiée' : trackingModalOrder.status === 'delivered' ? 'Livrée' : 'Annulée')
                      : (trackingModalOrder.status === 'placed' ? 'Placed' : trackingModalOrder.status === 'confirmed' ? 'Confirmed' : trackingModalOrder.status === 'processing' ? 'Processing' : trackingModalOrder.status === 'shipping' || trackingModalOrder.status === 'shipped' ? 'Shipping' : trackingModalOrder.status === 'delivered' ? 'Done' : 'Cancelled')}
                  </span>
                </div>

                {/* Highly Responsive Connected Stepper */}
                <div className="relative flex items-center justify-between w-full mt-5 mb-7 px-1">
                  {/* Gray background line */}
                  <div className="absolute top-[18px] left-[5%] right-[5%] h-[3px] bg-slate-100 -z-10 rounded-full" />
                  {/* Blue progress line */}
                  <div 
                    className="absolute top-[18px] left-[5%] h-[3px] bg-blue-600 transition-all duration-500 -z-10 rounded-full"
                    style={{ width: `${orderStageIdx >= 0 ? (orderStageIdx / 4) * 90 : 0}%` }}
                  />

                  {[
                    { label: isFr ? 'COMMANDÉ' : 'PLACED', stepNum: 1 },
                    { label: isFr ? 'CONFIRMÉ' : 'CONFIRM', stepNum: 2 },
                    { label: isFr ? 'EN COURS' : 'PROCESSING', stepNum: 3 },
                    { label: isFr ? 'EXPÉDIÉ' : 'SHIPPING', stepNum: 4 },
                    { label: isFr ? 'LIVRÉ' : 'DONE', stepNum: 5 },
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
                  {isFr ? 'ADRESSE DE LIVRAISON' : 'SHIPPING ADDRESS'}
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
                  {isFr ? 'Code :' : 'Code:'} <strong className="text-slate-800">#{trackingModalOrder.orderNumber}</strong>
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={() => window.print()} 
                    className="flex items-center gap-1.5 px-3.5 h-10 border-2 border-slate-900 rounded-xl text-xs font-black uppercase text-slate-900 hover:bg-slate-100 cursor-pointer bg-white transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>{isFr ? 'Imprimer' : 'Print'}</span>
                  </button>
                  <button 
                    onClick={() => alert(isFr ? 'Veuillez contacter le support pour modifier l\'adresse de livraison.' : 'Please contact GLADYNS concierge to update your shipping address.')} 
                    className="px-3.5 h-10 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer bg-white transition-colors"
                  >
                    {isFr ? 'Modifier l\'adresse' : 'Change Address'}
                  </button>
                  {!['delivered', 'cancelled'].includes(trackingModalOrder.status) && (
                    <button 
                      onClick={() => { setCancellingOrder(trackingModalOrder); setTrackingModalOrder(null); }} 
                      className="flex items-center gap-1.5 px-3.5 h-10 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isFr ? 'Annuler' : 'Cancel'}</span>
                    </button>
                  )}
                  <button 
                    onClick={() => setTrackingModalOrder(null)} 
                    className="px-3.5 h-10 border border-rose-200 hover:border-rose-300 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer bg-white transition-colors"
                  >
                    {isFr ? 'Fermer' : 'Remove'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Invoice Modal */}
      {/* Modern Blue & White Receipt Modal with 4 Reference Formats */}
      {invoiceModalOrder && (
        <ReceiptModal
          order={invoiceModalOrder}
          onClose={() => setInvoiceModalOrder(null)}
          storeSettings={storeSettings}
        />
      )}

      {/* Cancel Confirmation Dialog */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden p-6 space-y-4 animate-in fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-semibold text-zinc-950">
                {isFr ? `Annuler la commande ${cancellingOrder.orderNumber} ?` : `Cancel Order ${cancellingOrder.orderNumber}?`}
              </h3>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              {isFr
                ? `Cette commande n'ayant pas encore quitté notre atelier européen, vous pouvez l'annuler pour un remboursement immédiat à 100% de `
                : `Since this piece has not departed our European workshop, you may cancel for an immediate 100% refund of `}
              <strong className="font-mono text-zinc-900">{formatPrice(cancellingOrder.total)}</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                {isFr ? 'Motif de l\'annulation' : 'Reason for cancellation'}
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:bg-white focus:outline-none"
              >
                <option value="Changed my mind">{isFr ? 'J\'ai changé d\'avis' : 'Changed my mind'}</option>
                <option value="Need different size or colorway">{isFr ? 'Besoin d\'une taille ou couleur différente' : 'Need different size or colorway'}</option>
                <option value="Ordered by mistake">{isFr ? 'Commandé par erreur' : 'Ordered by mistake'}</option>
                <option value="Shipping time not suitable">{isFr ? 'Délai de livraison non adapté' : 'Shipping time not suitable'}</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
              <button
                onClick={() => setCancellingOrder(null)}
                className="px-3 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 rounded-lg cursor-pointer"
              >
                {isFr ? 'Conserver la commande' : 'Keep Order'}
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer shadow-xs"
              >
                {isFr ? 'Confirmer l\'annulation' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
