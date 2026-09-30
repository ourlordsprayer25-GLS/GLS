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
import { Order, CartItem, ProductVariant, ProductSize, Product } from '../types/store';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';

interface OrdersViewProps {
  orders: Order[];
  onCancelOrder: (orderId: string, reason: string) => void;
  onRequestReturn: (orderId: string) => void;
  onReorder: (items: CartItem[]) => void;
  onSelectProduct: (product: Product) => void;
  onExploreCatalog: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onCancelOrder,
  onRequestReturn,
  onReorder,
  onSelectProduct,
  onExploreCatalog,
}) => {
  const { formatPrice, t, language } = useLanguageCurrency();
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
            <span>Shipped · In Transit</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Product Processing</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" />
            <span>Order Confirmed</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Delivered & Signed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Cancelled & Refunded</span>
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
              Orders & Archival Dispatches
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Review current consignments, track real-time DHL & FedEx air manifests, or manage cancellations.
            </p>
          </div>
          <div className="text-xs text-zinc-500 font-mono">
            <span>Total records: <strong>{orders.length}</strong></span>
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
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'active'
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              In Transit & Active ({orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length})
            </button>
            <button
              onClick={() => setStatusFilter('delivered')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'delivered'
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Delivered ({orders.filter((o) => o.status === 'delivered').length})
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'cancelled'
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Cancelled ({orders.filter((o) => o.status === 'cancelled').length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, tracking, item..."
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
            <h3 className="text-base font-semibold text-zinc-900">No orders found</h3>
            <p className="text-xs text-zinc-500 mt-1">
              {searchQuery
                ? `No orders matching "${searchQuery}". Try clearing search.`
                : 'You have no archived orders under this filter.'}
            </p>
          </div>
          <button
            onClick={onExploreCatalog}
            className="px-4 py-2 bg-zinc-950 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Explore Seasonal Collection
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
                        <span>{order.items.length} {order.items.length === 1 ? 'piece' : 'pieces'}</span>
                        <span className="mx-1.5">·</span>
                        <span className="font-semibold text-zinc-900 font-mono">${order.total.toFixed(2)}</span>
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
                            Estimated Delivery
                          </span>
                          <span className="text-xs font-bold text-zinc-950 font-mono">
                            {order.estimatedDelivery}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600">
                          Carrier: <strong>{order.carrier || 'GLADYNS Standard Logistics'}</strong> · Tracking: <span className="font-mono text-zinc-900">{order.trackingNumber}</span>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setTrackingModalOrder(order)}
                          className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Package</span>
                        </button>
                        <button
                          onClick={() => setInvoiceModalOrder(order)}
                          className="px-3 py-1.5 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View GLADYNS Invoice</span>
                        </button>
                      </div>
                    </div>

                    {/* Items Grid */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Consignment Items
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
                                  <span>Color: <strong>{item.selectedColor?.name || 'Standard'}</strong></span>
                                  <span>·</span>
                                  <span>Size: <strong>{item.selectedSize?.name || 'One Size'}</strong></span>
                                  <span>·</span>
                                  <span>Qty: {item.quantity}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-xs sm:text-sm font-semibold font-mono text-zinc-900">
                                ${(item.product.price * item.quantity).toFixed(2)}
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
                        <span className="font-semibold text-zinc-900 block">Shipping Destination</span>
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
                          <span>Subtotal</span>
                          <span>${order.subtotal.toFixed(2)}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-emerald-700">
                            <span>Promotional Savings</span>
                            <span>-${order.discount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-zinc-600">
                          <span>Shipping ({order.shippingMethod === 'express' ? 'DHL Express' : 'Standard Carbon-Neutral'})</span>
                          <span>{order.shippingCost === 0 ? 'Free' : `$${order.shippingCost.toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between text-zinc-600">
                          <span>Estimated Tax</span>
                          <span>${order.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-zinc-950 pt-2 border-t border-zinc-200 font-sans">
                          <span>Total Paid</span>
                          <span className="font-mono">${order.total.toFixed(2)}</span>
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
                          <span>Buy Items Again</span>
                        </button>

                        {canReturn && (
                          <button
                            onClick={() => onRequestReturn(order.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{order.returnRequested ? 'Return Pending' : 'Request Return / Exchange'}</span>
                          </button>
                        )}
                      </div>

                      {canCancel && (
                        <button
                          onClick={() => setCancellingOrder(order)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Cancel This Order</span>
                        </button>
                      )}

                      {order.status === 'cancelled' && (
                        <div className="text-xs text-rose-600 font-medium">
                          Cancelled on {order.cancelledAt || 'recently'} · Reason: {order.cancelReason || 'Customer Request'}
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
                <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-950">Order Invoice Details</h3>
                <button
                  onClick={() => setTrackingModalOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Order ID Section */}
              <div className="mt-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 block">ORDER ID</span>
                <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1 select-all font-mono">
                  {trackingModalOrder.orderNumber}
                </p>
              </div>

              {/* Timeline & Status Section */}
              <div className="mt-5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 block">TIMELINE & STATUS</span>
                
                {/* Localized Status Label with Blue Bullet */}
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 mt-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shrink-0 animate-pulse" />
                  <span>
                    {language === 'fr' 
                      ? (trackingModalOrder.status === 'placed' ? 'En cours (Commandé)' : trackingModalOrder.status === 'confirmed' ? 'Confirmé' : trackingModalOrder.status === 'processing' ? 'En cours' : trackingModalOrder.status === 'shipping' || trackingModalOrder.status === 'shipped' ? 'Expédié' : trackingModalOrder.status === 'delivered' ? 'Livré' : 'Annulé')
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
                    { label: 'PLACED', stepNum: 1 },
                    { label: 'CONFIRM', stepNum: 2 },
                    { label: 'PROCESSING', stepNum: 3 },
                    { label: 'SHIPPING', stepNum: 4 },
                    { label: 'DONE', stepNum: 5 },
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
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 block">SHIPPING ADDRESS</span>
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
                  Code: <strong className="text-slate-800">#{trackingModalOrder.orderNumber}</strong>
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={() => window.print()} 
                    className="flex items-center gap-1.5 px-3.5 h-10 border-2 border-slate-900 rounded-xl text-xs font-black uppercase text-slate-900 hover:bg-slate-100 cursor-pointer bg-white transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Print</span>
                  </button>
                  <button 
                    onClick={() => alert(language === 'fr' ? 'Veuillez contacter le support pour modifier l\'adresse de livraison.' : 'Please contact GLADYNS concierge to update your shipping address.')} 
                    className="px-3.5 h-10 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer bg-white transition-colors"
                  >
                    Change Address
                  </button>
                  {!['delivered', 'cancelled'].includes(trackingModalOrder.status) && (
                    <button 
                      onClick={() => { setCancellingOrder(trackingModalOrder); setTrackingModalOrder(null); }} 
                      className="flex items-center gap-1.5 px-3.5 h-10 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}
                  <button 
                    onClick={() => setTrackingModalOrder(null)} 
                    className="px-3.5 h-10 border border-rose-200 hover:border-rose-300 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer bg-white transition-colors"
                  >
                    Remove
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
                      STATUS: {invoiceModalOrder.status === 'placed' 
                        ? '⏳ Pending' 
                        : invoiceModalOrder.status === 'confirmed' 
                        ? '✅ Confirmed' 
                        : invoiceModalOrder.status === 'processing' 
                        ? '⚙️ Processing' 
                        : invoiceModalOrder.status === 'delivered' 
                        ? '📦 Delivered' 
                        : '❌ Cancelled'}
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
                    { label: 'PLACED' },
                    { label: 'CONFIRMED' },
                    { label: 'PROCESSING' },
                    { label: 'DONE' },
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
                        GLADYNS MARKETPLACE
                      </h3>
                      <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-0.5">
                        Paris · New York · Milan
                      </p>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                        www.gladyns.com
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                        INVOICE NUMBER
                      </span>
                      <p className="font-mono text-xs font-black text-slate-950 mt-0.5 select-all">
                        {invoiceModalOrder.orderNumber}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {invoiceModalOrder.date || 'Sep 23, 2026'}
                      </p>
                    </div>
                  </div>

                  {/* Info Blocks: Customer & Admin details */}
                  <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                    <div>
                      <span className="text-[9px] font-black text-amber-900/70 tracking-wider block uppercase mb-1">
                        CUSTOMER / CLIENT
                      </span>
                      <div className="space-y-0.5 text-slate-800">
                        <p className="font-bold text-slate-950">
                          {invoiceModalOrder.shippingAddress.firstName} {invoiceModalOrder.shippingAddress.lastName}
                        </p>
                        <p className="text-[11px] text-indigo-600 font-mono font-semibold">
                          {invoiceModalOrder.shippingAddress.phone || '+1(555) 382-9102'}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase leading-tight mt-1">
                          {invoiceModalOrder.shippingAddress.street}, {invoiceModalOrder.shippingAddress.city}, {invoiceModalOrder.shippingAddress.country}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] font-black text-amber-900/70 tracking-wider block uppercase mb-1">
                        PREPARED BY (ADMIN)
                      </span>
                      <div className="space-y-0.5 text-slate-800">
                        <p className="font-bold text-slate-950">
                          Admin: Eléonore de Laurent
                        </p>
                        <p className="text-[11px] text-emerald-600 font-mono font-semibold">
                          Authorized Signatory
                        </p>
                        <p className="text-[10px] text-slate-400 leading-tight mt-1 uppercase">
                          GLADYNS Paris HQ Office <br />
                          Terminal ID: #FR-GL-902
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Pieces Grid */}
                  <div className="pt-4 border-t border-dashed border-slate-200">
                    <span className="text-[9px] font-black text-slate-400 tracking-wider block uppercase mb-3">
                      ORDERED PIECES ({invoiceModalOrder.items.length})
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
                                Qty {item.quantity}x · {item.selectedColor?.name || 'Standard'} · Size {item.selectedSize?.name || 'One Size'}
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
                      TOTAL TRANSACTION VALUE
                    </span>
                    <p className="text-2xl sm:text-3xl font-display font-black text-blue-600 tracking-tight mt-1 font-mono">
                      {formatPrice(invoiceModalOrder.total)}
                    </p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                      PAID IN FULL via {invoiceModalOrder.paymentMethod ? invoiceModalOrder.paymentMethod.toUpperCase() : 'SECURE TRANSFER'}
                    </p>
                  </div>

                  {/* Certified Seal / Stamp footer */}
                  <div className="pt-1 text-center space-y-1">
                    <p className="text-[10px] text-slate-400 font-serif italic">
                      "Thank you for your patronage. GLADYNS guarantees 100% authenticity on all artisanal releases."
                    </p>
                    <div className="flex items-center justify-center gap-1.5 pt-2">
                      <span className="h-px w-8 bg-slate-200" />
                      <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase">
                        OFFICIAL GLADYNS RECEIPT
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
                      onClick={() => window.open(`https://wa.me/23725500619923?text=Order%20Inquiry%20${invoiceModalOrder.orderNumber}`)}
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
                Cancel Order {cancellingOrder.orderNumber}?
              </h3>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Since this piece has not departed our European workshop, you may cancel for an immediate 100% refund of <strong className="font-mono text-zinc-900">${cancellingOrder.total.toFixed(2)}</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Reason for cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:bg-white focus:outline-none"
              >
                <option value="Changed my mind">Changed my mind</option>
                <option value="Need different size or colorway">Need different size or colorway</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Shipping time not suitable">Shipping time not suitable</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
              <button
                onClick={() => setCancellingOrder(null)}
                className="px-3 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 rounded-lg cursor-pointer"
              >
                Keep Order
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer shadow-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
