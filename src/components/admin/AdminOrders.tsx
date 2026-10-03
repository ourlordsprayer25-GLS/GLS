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
  MoreVertical,
  Download,
  ExternalLink,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Order } from '../../types/store';
import { useLanguageCurrency } from '../../context/LanguageCurrencyContext';
import { updateRealtimeOrderStatus, deleteRealtimeOrder, addRealtimeNotification } from '../../services/supabaseService';

interface AdminOrdersProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  initialSearchQuery?: string;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, setOrders, initialSearchQuery }) => {
  const { formatPrice } = useLanguageCurrency();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const handleUpdateStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    updateRealtimeOrderStatus(orderId, newStatus);
    const order = orders.find(o => o.id === orderId);
    if (order && order.customerId) {
      addRealtimeNotification({
        id: `notif-upd-${Date.now()}`,
        title: `Order Updated: ${order.orderNumber}`,
        message: `Your order is now: ${newStatus}`,
        timestamp: Date.now(),
        read: false,
        type: 'order',
        linkTarget: order.orderNumber,
        customerId: order.customerId
      });
    }
  };

  const handleDeleteOrder = () => {
    if (deleteConfirmationId) {
      setOrders(prev => prev.filter(o => o.id !== deleteConfirmationId));
      deleteRealtimeOrder(deleteConfirmationId);
      setDeleteConfirmationId(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const q = searchQuery?.toLowerCase().trim();
    const matchesSearch = !q ||
      order.orderNumber?.toLowerCase().includes(q) ||
      order.id?.toLowerCase().includes(q) ||
      (order.trackingNumber && order.trackingNumber?.toLowerCase().includes(q)) ||
      order.shippingAddress?.firstName?.toLowerCase().includes(q) ||
      order.shippingAddress?.lastName?.toLowerCase().includes(q) ||
      `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`?.toLowerCase().includes(q) ||
      order.shippingAddress?.email?.toLowerCase().includes(q);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'shipping': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'processing': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'confirmed': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default: return 'bg-zinc-50 text-zinc-700 border-zinc-100';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return CheckCircle2;
      case 'cancelled': return XCircle;
      case 'shipping': return Truck;
      case 'processing': return Clock;
      case 'confirmed': return Package;
      default: return ShoppingBag;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-zinc-900">Order Logistics</h2>
          <p className="text-sm text-zinc-500">Manage fulfillment pipeline and track shipments.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by order or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-zinc-900"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-50 border-none rounded-xl text-sm px-4 py-2 focus:ring-1 focus:ring-zinc-900 font-semibold text-zinc-700"
          >
            <option value="all">All Statuses</option>
            <option value="placed">Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipping">Shipping</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Order Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const StatusIcon = getStatusIcon(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 font-mono text-xs font-bold">
                            {order.orderNumber.slice(-4)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-900">{order.orderNumber}</p>
                            <p className="text-[10px] text-zinc-500">{order.items.length} boutique items</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-zinc-900">
                          {order.shippingAddress?.firstName || 'Customer'} {order.shippingAddress?.lastName || ''}
                        </p>
                        <p className="text-[10px] text-zinc-500">{order.shippingAddress?.email || ''}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600">{order.date}</td>
                      <td className="px-6 py-4 text-sm font-bold text-zinc-900">{formatPrice(order.total)}</td>
                      <td className="px-6 py-4">
                        <select 
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value as any)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border cursor-pointer focus:ring-2 focus:ring-zinc-950/10 transition-all ${getStatusColor(order.status)}`}
                        >
                          <option value="placed">Placed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipping">Shipping</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-white rounded-lg transition-all border border-transparent hover:border-zinc-200 shadow-sm">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmationId(order.id)}
                            className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-200 shadow-sm"
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
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-zinc-200" />
                      <p className="text-zinc-500 text-sm">No orders found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Delete Order?</h3>
            <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
              This action is permanent. The order will be purged from the logistics ledger and history.
            </p>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setDeleteConfirmationId(null)}
                className="flex-1 px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-sm font-bold transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteOrder}
                className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-rose-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


