import React, { useState, useEffect } from 'react';
import { ShoppingCart, TrendingUp, Package, AlertCircle, Loader2, ChevronDown, Calendar, RefreshCcw, TriangleAlert } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Product {
  _id: string;
  name: string;
  stock: number;
  sizesEG?: { size: string; stock?: number }[];
}

interface AnalyticsData {
  kpis: {
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    lowStockProducts: number;
    outOfStockCount: number;
    inventoryValue: number;
    aov: number;
  };
  trends: { _id: string; revenue: number; orders: number }[];
  topProducts: any[];
  bottomProducts: any[];
  regionalData: any[];
  recentOrders: any[];
}

const FullPageLoader: React.FC = () => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-md transition-all duration-300">
    <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white shadow-2xl border border-zinc-100">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-zinc-100 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">Syncing Command Center</p>
    </div>
  </div>
);

const MinimalLineChart: React.FC<{ data: { name: string; sales: number }[] }> = ({ data }) => {
  const isDense = data.length > 40;
  
  return (
    <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-4 sm:p-6 h-full flex flex-col">
      <h3 className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-6">
        Financial Velocity Stream
      </h3>
      <div className="flex-1 w-full min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 700 }}
              dy={15}
              minTickGap={30}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 700 }}
              dx={-10}
              tickFormatter={(v) => `${Number(v).toLocaleString()} EGP`}
              width={80}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e4e4e7',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                fontFamily: 'inherit',
                fontSize: 12,
                padding: '12px'
              }}
              formatter={(value: number) => [`${Number(value).toLocaleString()} EGP`, 'Revenue']}
              labelStyle={{
                fontWeight: 700,
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#71717a',
                marginBottom: '4px'
              }}
              itemStyle={{
                paddingTop: '2px'
              }}
              cursor={{ stroke: '#f4f4f5', strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#f97316"
              strokeWidth={2.5}
              dot={isDense ? false : { r: 3, fill: '#f97316', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
              animationDuration={1500}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [inventory, setInventory] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    fetchInventory();
  }, [period]);

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/admin/inventory');
      const json = await res.json();
      if (json.success) setInventory(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAnalytics = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`);
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError('Failed to load metrics');
    } catch (err) {
      setError('Connection Timeout');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const processTrends = () => {
    if (!data?.trends || data.trends.length === 0) return [];

    const sortedTrends = [...data.trends].sort((a, b) => a._id.localeCompare(b._id));
    
    // Fill gaps only for long-term views (Month/Quarter/Year/Max) where labels are aggregated
    // and gaps results in "point charts".
    if (period === '7d' || period === '30d' || period === '90d') {
        return sortedTrends.map(t => {
            const [y, m, d] = t._id.split('-');
            return {
                name: `${d}/${m}`,
                sales: t.revenue
            };
        });
    }

    // For Week/Month aggregations, Recharts connectNulls is usually enough if labels are consistent.
    // However, if whole months/weeks are missing, we should fill them.
    
    return sortedTrends.map(t => {
      let label = t._id;
      if (period === 'all' || period === '1y') {
          const [y, m] = t._id.split('-');
          const d = new Date(parseInt(y), parseInt(m) - 1);
          label = d.toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' });
      }
      return {
        name: label,
        sales: t.revenue
      };
    });
  };

  const chartData = processTrends();

  const lowStockItems = inventory.flatMap(p => {
    const isBaseLow = (!p.sizesEG || p.sizesEG.length === 0) && p.stock < 10;
    const lowVariants = (p.sizesEG || []).filter(v => (v.stock ?? 0) < 10);
    const items = [];
    if (isBaseLow) items.push({ name: p.name, stock: p.stock, size: 'Base' });
    lowVariants.forEach(v => items.push({ name: p.name, stock: v.stock ?? 0, size: v.size }));
    return items;
  }).sort((a, b) => a.stock - b.stock);

  const periods = [
    { label: 'Week', value: '7d' },
    { label: 'Month', value: '30d' },
    { label: 'Quarter', value: '90d' },
    { label: 'Year', value: '1y' },
    { label: 'Maximum', value: 'all' }
  ];

  const showLoader = loading || isRefreshing;

  return (
    <div className="relative p-8 pb-20 space-y-8 min-h-screen">
      {showLoader && <FullPageLoader />}
      
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 mb-1 tracking-tight">Command Center</h1>
          <p className="text-zinc-400 text-[11px] font-medium uppercase tracking-[0.2em]">Regional Performance Hub</p>
        </div>
        
        <div className="flex items-center gap-3">
             <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-1 flex items-center shadow-sm">
                {periods.map(p => (
                    <button
                        key={p.value}
                        onClick={() => setPeriod(p.value)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                            period === p.value 
                            ? 'bg-white text-zinc-900 shadow-sm' 
                            : 'text-zinc-400 hover:text-zinc-600'
                        }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>
        </div>
      </header>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
         {[
           { label: 'Total Revenue', value: `${data?.kpis.totalRevenue.toLocaleString()}`, unit: 'EGP', accent: 'text-orange-500' },
           { label: 'Avg Order Value', value: `${Math.round(data?.kpis.aov || 0).toLocaleString()}`, unit: 'EGP', accent: 'text-zinc-900' },
           { label: 'Fulfillment Count', value: data?.kpis.totalOrders, accent: 'text-zinc-900' }
         ].map((kpi, i) => (
           <div key={i} className="bg-white border border-zinc-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
             <p className="text-zinc-400 text-[10px] font-semibold uppercase tracking-widest mb-1.5">{kpi.label}</p>
             <div className="flex items-baseline gap-1">
                <h3 className={`text-xl font-bold ${kpi.accent} tracking-tight`}>{kpi.value}</h3>
                {kpi.unit && <span className="text-[10px] font-bold text-zinc-300">{kpi.unit}</span>}
             </div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Performance Chart */}
        <div className="lg:col-span-2 min-h-[400px]">
            <MinimalLineChart data={chartData} />
        </div>

        {/* Inventory Health */}
        <div className="bg-white border border-zinc-100 rounded-xl p-8 flex flex-col shadow-sm h-full">
           <h2 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-8">Stock Intelligence</h2>
           <div className="space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-3">
                  <div className={`p-4 rounded-xl border ${data?.kpis.lowStockProducts ? 'bg-orange-50/50 border-orange-100' : 'bg-zinc-50 border-zinc-100'}`}>
                      <p className={`text-[9px] font-semibold uppercase tracking-widest mb-0.5 flex items-center gap-1.5 ${data?.kpis.lowStockProducts ? 'text-orange-500' : 'text-zinc-500'}`}>
                          {data?.kpis.lowStockProducts ? <TriangleAlert className="w-3 h-3"/> : null} Low Stock
                      </p>
                      <h4 className={`text-lg font-bold ${data?.kpis.lowStockProducts ? 'text-orange-600' : 'text-zinc-900'}`}>{data?.kpis.lowStockProducts}</h4>
                  </div>
                  <div className={`p-4 rounded-xl border ${data?.kpis.outOfStockCount ? 'bg-red-50/50 border-red-100' : 'bg-zinc-50 border-zinc-100'}`}>
                      <p className={`text-[9px] font-semibold uppercase tracking-widest mb-0.5 flex items-center gap-1.5 ${data?.kpis.outOfStockCount ? 'text-red-500' : 'text-zinc-500'}`}>
                          {data?.kpis.outOfStockCount ? <AlertCircle className="w-3 h-3"/> : null} Out of Stock
                      </p>
                      <h4 className={`text-lg font-bold ${data?.kpis.outOfStockCount ? 'text-red-600' : 'text-zinc-900'}`}>{data?.kpis.outOfStockCount}</h4>
                  </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t border-zinc-50">
                 <h3 className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">Regional Hubs</h3>
                 <div className="space-y-3">
                    {data?.regionalData.slice(0, 3).map((reg, i) => (
                       <div key={i} className="space-y-1.5 text-zinc-400">
                          <div className="flex justify-between text-[10px] font-semibold uppercase">
                             <span>{reg._id || 'Cairo Hub'}</span>
                             <span className="text-zinc-900">{Math.round((reg.revenue / (data?.kpis.totalRevenue || 1)) * 100)}%</span>
                          </div>
                          <div className="h-1 w-full bg-zinc-50 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-zinc-900 rounded-full"
                                style={{ width: `${(reg.revenue / (data?.kpis.totalRevenue || 1)) * 100}%` }}
                             />
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-white border border-red-100 rounded-xl p-8 shadow-sm">
           <div className="flex justify-between items-center mb-6 border-b border-red-50 pb-4">
              <h2 className="text-[11px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                 <TriangleAlert className="w-4 h-4"/> Immediate Stock Attention Required
              </h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.map((item, i) => (
                <div key={i} className={`p-4 rounded-xl border ${item.stock === 0 ? 'bg-red-50/50 border-red-100' : 'bg-orange-50/30 border-orange-100'}`}>
                   <p className="text-xs font-bold text-zinc-900 mb-1">{item.name}</p>
                   <div className="flex justify-between items-end">
                      <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">{item.size}</p>
                      <p className={`text-lg font-black ${item.stock === 0 ? 'text-red-500' : 'text-orange-500'}`}>{item.stock} <span className="text-[10px] font-bold uppercase text-opacity-50">Units</span></p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Tables */}
        <div className="bg-white border border-zinc-100 rounded-xl p-8 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-[11px] font-bold text-zinc-900 uppercase tracking-widest">High Velocity</h2>
              <ShoppingCart size={13} className="text-zinc-300" />
           </div>
           <div className="space-y-1">
              {data?.topProducts.map((prod, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 hover:bg-zinc-50 rounded-lg transition-colors group">
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-zinc-200">0{i+1}</span>
                      <p className="text-xs font-semibold text-zinc-800 uppercase tracking-tight">{prod._id}</p>
                   </div>
                   <div className="text-right flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs font-bold text-orange-500">{prod.totalQty} Units</p>
                        <p className="text-[9px] font-semibold text-zinc-300 uppercase tracking-widest">{Math.round(prod.revenue).toLocaleString()} EGP</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white border border-zinc-100 rounded-xl p-8 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Low velocity</h2>
              <Package size={13} className="text-zinc-300" />
           </div>
           <div className="space-y-1">
              {data?.bottomProducts.map((prod, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 hover:bg-zinc-50 rounded-lg transition-colors group">
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-zinc-200">0{i+1}</span>
                      <p className="text-xs font-medium text-zinc-400 group-hover:text-zinc-900 uppercase tracking-tight transition-colors">{prod._id}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-xs font-semibold text-zinc-400 group-hover:text-red-500 transition-colors">{prod.totalQty} Sold</p>
                      <p className="text-[9px] font-semibold text-zinc-200 group-hover:text-zinc-300 uppercase tracking-widest transition-colors">Growth Risk</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
