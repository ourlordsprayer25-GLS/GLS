import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Order } from '../../types/store';

interface AdminDashboardChartsProps {
  orders: Order[];
}

export const AdminDashboardCharts: React.FC<AdminDashboardChartsProps> = ({ orders }) => {
  // Process orders for the last 7 days or all time grouped by day
  const processData = () => {
    const dataMap: Record<string, { date: string; revenue: number; volume: number; rawDate: Date }> = {};

    orders.forEach(order => {
      const dateObj = new Date(order.date);
      if (isNaN(dateObj.getTime())) return;
      
      const dateKey = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (!dataMap[dateKey]) {
        dataMap[dateKey] = {
          date: dateKey,
          revenue: 0,
          volume: 0,
          rawDate: dateObj
        };
      }
      
      dataMap[dateKey].revenue += order.total;
      dataMap[dateKey].volume += 1;
    });

    // Sort by date
    return Object.values(dataMap).sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());
  };

  const chartData = processData();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Revenue Trend */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Revenue Trends</h3>
            <p className="text-xs text-zinc-500 mt-1">Total revenue daily performance</p>
          </div>
          <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full">
            REAL-TIME
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#71717a' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#71717a' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  fontSize: '12px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Order Volume */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Order Logistics</h3>
            <p className="text-xs text-zinc-500 mt-1">Daily order acquisition volume</p>
          </div>
          <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full">
            LIVE FEED
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#71717a' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#71717a' }}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  fontSize: '12px'
                }}
                cursor={{ fill: '#f8f9fa' }}
              />
              <Bar 
                dataKey="volume" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
