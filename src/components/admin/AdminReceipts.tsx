import React, { useState } from 'react';
import { Order } from '../../types/store';
import { useLanguageCurrency } from '../../context/LanguageCurrencyContext';
import { 
  FileText, 
  Search, 
  Download, 
  Printer, 
  Mail, 
  CreditCard,
  ChevronRight,
  ExternalLink,
  Eye,
  X,
  Package
} from 'lucide-react';

interface AdminReceiptsProps {
  orders: Order[];
}

export const AdminReceipts: React.FC<AdminReceiptsProps> = ({ orders }) => {
  const { formatPrice } = useLanguageCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(order => 
    order.orderNumber?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
    order.shippingAddress.firstName?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
    order.shippingAddress.lastName?.toLowerCase().includes(searchQuery?.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Receipt Ledger</h2>
          <p className="text-xs text-zinc-500 mt-1">Manage transactional documentation and invoice history.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-sm">
          <Download className="w-4 h-4" />
          <span>Export Ledger</span>
        </button>
      </div>

      {/* Receipt Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Invoice: INV-{selectedOrder.orderNumber.slice(-8).toUpperCase()}</h3>
                <p className="text-xs text-zinc-500">Document generated on {selectedOrder.date}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Billed To</p>
                  <p className="text-sm font-bold text-zinc-900">{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                  <p className="text-xs text-zinc-500">{selectedOrder.shippingAddress.email}</p>
                  <p className="text-xs text-zinc-500">{selectedOrder.shippingAddress.street}</p>
                  <p className="text-xs text-zinc-500">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</p>
                  <span className="inline-block px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase">Fully Paid</span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Line Items</p>
                <div className="border border-zinc-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 border-b border-zinc-100">
                      <tr>
                        <th className="px-4 py-3 font-bold text-zinc-900">Item Description</th>
                        <th className="px-4 py-3 font-bold text-zinc-900 text-center">Qty</th>
                        <th className="px-4 py-3 font-bold text-zinc-900 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <p className="font-bold text-zinc-900">{item.product.name}</p>
                            <p className="text-[10px] text-zinc-500 uppercase">{item.selectedColor.name} · {item.selectedSize.name}</p>
                          </td>
                          <td className="px-4 py-3 text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-right font-mono">{formatPrice(item.product.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-zinc-50/50">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 font-bold text-zinc-900 text-right">Total Amount</td>
                        <td className="px-4 py-3 font-bold text-zinc-900 text-right font-mono text-sm">{formatPrice(selectedOrder.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-zinc-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button className="flex-1 py-3 bg-white border border-zinc-200 text-zinc-900 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-zinc-50 transition-all">
                  <Printer className="w-4 h-4" />
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search receipts by order # or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Document</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Patron</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Payment</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">INV-{order.orderNumber.slice(-8).toUpperCase()}</p>
                        <p className="text-[10px] text-zinc-400 uppercase font-mono">{order.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-zinc-900">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p className="text-[10px] text-zinc-500">{order.shippingAddress.email}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[9px] font-bold uppercase">
                      <CreditCard className="w-3 h-3" />
                      {order.paymentMethod === 'card' ? 'Visa •••• 4242' : order.paymentMethod}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-sm font-bold text-zinc-900">{formatPrice(order.total)}</p>
                    <p className="text-[9px] text-emerald-600 font-black uppercase">Paid</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all" 
                        title="View Receipt"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all" title="Download PDF">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all" title="Print Receipt">
                        <Printer className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all" title="Email to Client">
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
            <p className="text-sm font-bold text-zinc-900">No receipts found</p>
            <p className="text-xs text-zinc-500 mt-1">Try adjusting your search query.</p>
          </div>
        )}
      </div>
    </div>
  );
};

