import React, { useState } from 'react';
import { Package, RefreshCw, AlertTriangle } from 'lucide-react';
import { Product, Order } from '../../types/store';

interface RestockSuggestion {
  sku: string;
  suggestedRestock: number;
  reason: string;
}

export const AdminInventoryForecasting: React.FC<{ products: Product[], orders: Order[] }> = ({ products, orders }) => {
  const [suggestions, setSuggestions] = useState<RestockSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runForecasting = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/forecast-restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products, orders }),
      });
      const data = await response.json();
      setSuggestions(data);
    } catch (e) {
      setError('Failed to fetch AI forecasts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" /> AI Inventory Forecast
        </h3>
        <button 
          onClick={runForecasting}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 disabled:bg-zinc-400"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing...' : 'Run Forecast'}
        </button>
      </div>
      
      {error && <div className="text-rose-600 text-xs font-bold">{error}</div>}
      
      <div className="space-y-2">
        {suggestions.map(s => {
            const product = products.find(p => p.sku === s.sku);
            return (
                <div key={s.sku} className="p-3 bg-zinc-50 rounded-xl flex items-center justify-between text-xs">
                    <div>
                        <p className="font-bold text-zinc-900">{product?.name || s.sku}</p>
                        <p className="text-zinc-500">{s.reason}</p>
                    </div>
                    <span className="font-bold text-emerald-600">+{s.suggestedRestock}</span>
                </div>
            )
        })}
        {suggestions.length === 0 && !loading && <p className="text-xs text-zinc-400 italic">No forecast run yet.</p>}
      </div>
    </div>
  );
};
