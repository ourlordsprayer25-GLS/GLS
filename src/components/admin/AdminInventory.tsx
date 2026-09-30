import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingDown,
  TrendingUp,
  Plus,
  Minus,
  Barcode,
  Printer,
  RefreshCw,
  Sparkles,
  DollarSign,
  ArrowUpDown,
  Box,
  Layers,
  Check,
  Save,
  Download
} from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { Product } from '../../types/store';
import { CATEGORIES } from '../../data/products';
import { saveRealtimeProduct } from '../../services/supabaseService';
import { useLanguageCurrency } from '../../context/LanguageCurrencyContext';

interface AdminInventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  initialSearchQuery?: string;
}

export const AdminInventory: React.FC<AdminInventoryProps> = ({
  products,
  setProducts,
  initialSearchQuery
}) => {
  const { formatPrice } = useLanguageCurrency();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [statusFilter, setStatusFilter] = useState<'all' | 'healthy' | 'low' | 'out'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'stock-asc' | 'stock-desc' | 'name' | 'valuation'>('stock-asc');

  // Barcode Label Modal
  const [barcodeModalProduct, setBarcodeModalProduct] = useState<Product | null>(null);
  const barcodeSvgRef = useRef<SVGSVGElement>(null);

  // Bulk Restock Modal
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkRestockAmount, setBulkRestockAmount] = useState<number>(10);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  useEffect(() => {
    if (barcodeModalProduct && barcodeSvgRef.current) {
      try {
        const codeValue = barcodeModalProduct.barcode || barcodeModalProduct.sku || barcodeModalProduct.id;
        JsBarcode(barcodeSvgRef.current, codeValue, {
          format: 'CODE128',
          lineColor: '#18181b',
          width: 2,
          height: 50,
          displayValue: true,
          font: 'monospace',
          fontSize: 12,
        });
      } catch (err) {
        console.warn('Barcode render error:', err);
      }
    }
  }, [barcodeModalProduct]);

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  // Inventory Statistics
  const totalUnits = products.reduce((acc, p) => acc + (p.stockLevel !== undefined ? p.stockLevel : 10), 0);
  const outOfStockCount = products.filter(p => (p.stockLevel !== undefined ? p.stockLevel : 10) === 0).length;
  const lowStockCount = products.filter(p => {
    const stock = p.stockLevel !== undefined ? p.stockLevel : 10;
    return stock > 0 && stock < 5;
  }).length;
  const healthyStockCount = products.filter(p => (p.stockLevel !== undefined ? p.stockLevel : 10) >= 5).length;
  const totalValuation = products.reduce((acc, p) => acc + p.price * (p.stockLevel !== undefined ? p.stockLevel : 10), 0);

  // Handle Quick Stock Adjust
  const handleAdjustStock = (product: Product, delta: number) => {
    const currentStock = product.stockLevel !== undefined ? product.stockLevel : 10;
    const newStock = Math.max(0, currentStock + delta);
    const updatedProduct = { ...product, stockLevel: newStock };
    
    setProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
    saveRealtimeProduct(updatedProduct);
    setToastMessage(`Updated "${product.name}" stock to ${newStock} units`);
  };

  const handleSetExactStock = (product: Product, exactVal: number) => {
    const newStock = Math.max(0, exactVal);
    const updatedProduct = { ...product, stockLevel: newStock };
    
    setProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
    saveRealtimeProduct(updatedProduct);
  };

  // Bulk Restock Execution
  const handleExecuteBulkRestock = () => {
    if (selectedProductIds.length === 0) return;
    
    setProducts(prev => prev.map(p => {
      if (selectedProductIds.includes(p.id)) {
        const cur = p.stockLevel !== undefined ? p.stockLevel : 10;
        const updated = { ...p, stockLevel: cur + bulkRestockAmount };
        saveRealtimeProduct(updated);
        return updated;
      }
      return p;
    }));

    setToastMessage(`Restocked ${selectedProductIds.length} items by +${bulkRestockAmount} units`);
    setIsBulkModalOpen(false);
    setSelectedProductIds([]);
  };

  const handleSelectAllFiltered = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  // Filtering & Sorting
  const filteredProducts = products.filter(p => {
    const stock = p.stockLevel !== undefined ? p.stockLevel : 10;
    const q = searchQuery.toLowerCase().trim();

    const matchesSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.barcode && p.barcode.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      p.categoryLabel.toLowerCase().includes(q);

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

    let matchesStatus = true;
    if (statusFilter === 'healthy') matchesStatus = stock >= 5;
    else if (statusFilter === 'low') matchesStatus = stock > 0 && stock < 5;
    else if (statusFilter === 'out') matchesStatus = stock === 0;

    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    const stockA = a.stockLevel !== undefined ? a.stockLevel : 10;
    const stockB = b.stockLevel !== undefined ? b.stockLevel : 10;

    if (sortBy === 'stock-asc') return stockA - stockB;
    if (sortBy === 'stock-desc') return stockB - stockA;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'valuation') return (b.price * stockB) - (a.price * stockA);
    return 0;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-semibold animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-display font-bold text-zinc-900">Inventory & Warehouse Control</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700">
              Live Stock Hub
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Real-time multi-device warehouse stock counts, SKU tracking, restock triggers, and printable barcode labels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedProductIds.length > 0 && (
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Bulk Restock ({selectedProductIds.length})</span>
            </button>
          )}

          <button
            onClick={() => {
              const csvRows = [
                ['SKU', 'Product Name', 'Category', 'Price', 'Stock Level', 'Stock Status', 'Total Valuation'],
                ...products.map(p => {
                  const s = p.stockLevel !== undefined ? p.stockLevel : 10;
                  const status = s === 0 ? 'Out of Stock' : s < 5 ? 'Low Stock' : 'In Stock';
                  return [p.sku || p.id, `"${p.name}"`, p.categoryLabel, p.price, s, status, (p.price * s).toFixed(2)];
                })
              ];
              const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
              const link = document.createElement('a');
              link.setAttribute('href', encodeURI(csvContent));
              link.setAttribute('download', `GLADYNS_Inventory_Manifest_${new Date().toISOString().slice(0,10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-800 rounded-xl text-sm font-semibold hover:bg-zinc-50 transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-zinc-500" />
            <span>Export Stock CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Units</p>
            <h3 className="text-2xl font-display font-bold text-zinc-900 mt-1">{totalUnits}</h3>
            <span className="text-[11px] text-zinc-500">Across {products.length} SKUs</span>
          </div>
          <div className="p-3 bg-zinc-100 rounded-xl text-zinc-700">
            <Box className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Healthy Stock (5+)</p>
            <h3 className="text-2xl font-display font-bold text-emerald-600 mt-1">{healthyStockCount}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Optimal availability</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Low Stock (&lt; 5)</p>
            <h3 className="text-2xl font-display font-bold text-amber-600 mt-1">{lowStockCount}</h3>
            <span className="text-[11px] text-amber-600 font-medium">Restock recommended</span>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Out of Stock</p>
            <h3 className="text-2xl font-display font-bold text-rose-600 mt-1">{outOfStockCount}</h3>
            <span className="text-[11px] text-rose-600 font-medium">Needs immediate replenishment</span>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Inventory Valuation</p>
            <h3 className="text-xl font-display font-bold text-zinc-900 mt-1">{formatPrice(totalValuation)}</h3>
            <span className="text-[11px] text-zinc-500">Retail value</span>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SKU, barcode, piece title, brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-zinc-900 transition-all"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {[
            { id: 'all', label: 'All Inventory', count: products.length },
            { id: 'healthy', label: 'In Stock', count: healthyStockCount },
            { id: 'low', label: 'Low Stock', count: lowStockCount },
            { id: 'out', label: 'Out of Stock', count: outOfStockCount },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                statusFilter === tab.id ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Category & Sort */}
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-700 focus:outline-none focus:border-zinc-900"
          >
            <option value="all">All Departments</option>
            {CATEGORIES.filter(c => c.id !== 'all').map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-700 focus:outline-none focus:border-zinc-900"
          >
            <option value="stock-asc">Stock: Low → High</option>
            <option value="stock-desc">Stock: High → Low</option>
            <option value="name">Product Title</option>
            <option value="valuation">Valuation: High → Low</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/70 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
                    onChange={handleSelectAllFiltered}
                    className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Item & Department</th>
                <th className="py-3.5 px-4">SKU & Barcode</th>
                <th className="py-3.5 px-4">Unit Price</th>
                <th className="py-3.5 px-4 text-center">Stock Level</th>
                <th className="py-3.5 px-4">Inventory Status</th>
                <th className="py-3.5 px-4 text-center">Quick Stock Adjust</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-zinc-400">
                    <Box className="w-10 h-10 mx-auto mb-2 text-zinc-300" />
                    <p className="font-bold text-zinc-700">No inventory records match criteria</p>
                    <p className="text-xs text-zinc-400 mt-1">Try resetting the search or status filter.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const stock = product.stockLevel !== undefined ? product.stockLevel : 10;
                  const isLow = stock > 0 && stock < 5;
                  const isOut = stock === 0;
                  const isSelected = selectedProductIds.includes(product.id);

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-zinc-50/80 transition-colors ${
                        isOut ? 'bg-rose-50/20' : isLow ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProductIds(prev => [...prev, product.id]);
                            } else {
                              setSelectedProductIds(prev => prev.filter(id => id !== product.id));
                            }
                          }}
                          className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.primaryImage}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover border border-zinc-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-zinc-900 truncate max-w-xs">{product.name}</p>
                            <p className="text-[11px] text-zinc-400">
                              {product.categoryLabel} {product.brand ? `· ${product.brand}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="font-mono text-[11px] font-bold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
                            {product.sku || product.id}
                          </span>
                          {product.barcode && (
                            <p className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                              <Barcode className="w-3 h-3 text-zinc-400" />
                              {product.barcode}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-900">
                        {formatPrice(product.price)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            value={stock}
                            onChange={(e) => handleSetExactStock(product, parseInt(e.target.value) || 0)}
                            className="w-16 py-1 px-2 text-center font-mono font-bold text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900"
                          />
                          <span className="text-[10px] text-zinc-400 font-semibold">units</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100">
                            <XCircle className="w-3 h-3" />
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock ({stock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <CheckCircle2 className="w-3 h-3" />
                            In Stock ({stock})
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
                          <button
                            onClick={() => handleAdjustStock(product, -1)}
                            disabled={stock <= 0}
                            title="Subtract 1 unit"
                            className="p-1 rounded-lg hover:bg-white text-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleAdjustStock(product, 1)}
                            title="Add 1 unit"
                            className="p-1 rounded-lg hover:bg-white text-zinc-700 transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleAdjustStock(product, 5)}
                            title="Add 5 units (Quick Restock)"
                            className="px-1.5 py-0.5 text-[10px] font-bold rounded-lg hover:bg-white text-blue-700 transition-all cursor-pointer"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => handleAdjustStock(product, 20)}
                            title="Add 20 units (Bulk Batch)"
                            className="px-1.5 py-0.5 text-[10px] font-bold rounded-lg hover:bg-white text-emerald-700 transition-all cursor-pointer"
                          >
                            +20
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setBarcodeModalProduct(product)}
                          className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Barcode className="w-3.5 h-3.5 text-zinc-600" />
                          <span>Barcode Label</span>
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

      {/* Barcode & Label Modal */}
      {barcodeModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-zinc-200 p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-zinc-900 text-base">Printable Warehouse Label</h3>
              </div>
              <button
                onClick={() => setBarcodeModalProduct(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Label Preview Card */}
            <div id="printable-label" className="p-6 border-2 border-dashed border-zinc-300 rounded-2xl bg-[#FAFAFA] text-center space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">GLADYNS WAREHOUSE SYSTEM</p>
              <h4 className="font-bold text-sm text-zinc-900 leading-snug">{barcodeModalProduct.name}</h4>
              <p className="text-xs text-zinc-500 font-medium">{barcodeModalProduct.categoryLabel} · {formatPrice(barcodeModalProduct.price)}</p>

              {/* Barcode SVG */}
              <div className="py-2 flex justify-center bg-white p-2 rounded-xl border border-zinc-100">
                <svg ref={barcodeSvgRef} className="max-w-full"></svg>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 px-2 pt-1 border-t border-zinc-200">
                <span>SKU: {barcodeModalProduct.sku || barcodeModalProduct.id}</span>
                <span>Stock: {barcodeModalProduct.stockLevel !== undefined ? barcodeModalProduct.stockLevel : 10} units</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setBarcodeModalProduct(null)}
                className="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Label</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Restock Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-zinc-200 p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-zinc-900 text-base">Bulk Inventory Replenishment</h3>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-zinc-500">
                You have selected <span className="font-bold text-zinc-900">{selectedProductIds.length} pieces</span> for bulk restocking.
              </p>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Add Quantity per Selected Item:
                </label>
                <div className="flex items-center gap-2">
                  {[5, 10, 25, 50, 100].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setBulkRestockAmount(amt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        bulkRestockAmount === amt
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                      }`}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  value={bulkRestockAmount}
                  onChange={(e) => setBulkRestockAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="mt-3 w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:outline-none focus:border-zinc-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-100">
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteBulkRestock}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Restock (+{bulkRestockAmount} each)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
