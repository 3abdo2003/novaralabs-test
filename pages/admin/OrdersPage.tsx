import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Eye, Trash2, X, AlertCircle, Loader2, CheckCircle, Clock, Truck, ChevronDown, Filter, Calendar, RefreshCcw, ChevronLeft, ChevronRight } from 'lucide-react';

interface Order {
  _id: string;
  orderId?: string;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  total?: number;
  status: string;
  items: any[];
  shipping?: {
    address1: string;
    city: string;
    governorate: string;
  };
  createdAt: string;
  promoCode?: string;
  discount?: number;
}

// Custom Premium Date Picker (Adapted for Orders)
const CustomDatePicker: React.FC<{ 
    value: string; 
    onChange: (date: string) => void; 
    placeholder: string;
    minDate?: string;
    maxDate?: string;
    allowPast?: boolean;
}> = ({ value, onChange, placeholder, minDate, maxDate, allowPast = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(value || minDate || maxDate || new Date()));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) setViewDate(new Date(value));
    else setViewDate(new Date(minDate || maxDate || new Date()));
  }, [value, minDate, maxDate]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handleSelect = (day: number) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(selected.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 cursor-pointer group"
      >
        <span className={`text-[10px] font-bold transition-colors ${value ? 'text-zinc-900' : 'text-zinc-300 group-hover:text-zinc-400'}`}>
            {value ? new Date(value).toLocaleDateString('en-GB') : placeholder}
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-full mt-4 -left-4 w-64 bg-white rounded-2xl shadow-2xl border border-zinc-100 p-5 z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              {months[viewDate.getMonth()]} {viewDate.getFullYear()}
            </h4>
            <div className="flex gap-1">
              <button type="button" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-1.5 hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-zinc-900"><ChevronLeft className="w-4 h-4" /></button>
              <button type="button" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-1.5 hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-zinc-900"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <div key={d} className="text-[8px] font-bold text-zinc-300 text-center py-1">{d}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-0.5">
            {Array(firstDayOfMonth).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
            {days.map(d => {
              const dateVal = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
              const dateStr = dateVal.toISOString().split('T')[0];
              const isSelected = value && value === dateStr;
              
              const isPastDisabled = !allowPast && dateStr < new Date().toISOString().split('T')[0];
              const isBeforeMin = minDate && dateStr < minDate;
              const isAfterMax = maxDate && dateStr > maxDate;
              
              const isDisabled = isPastDisabled || isBeforeMin || isAfterMax;
              
              return (
                <button
                  key={d}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelect(d)}
                  className={`w-full py-1.5 text-[10px] font-semibold rounded-md transition-all ${
                    isSelected ? 'bg-orange-500 text-white' : 
                    isDisabled ? 'text-zinc-100 cursor-not-allowed' : 'text-zinc-600 hover:bg-zinc-50 hover:text-orange-500'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const FullPageLoader: React.FC = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-md transition-all duration-300">
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white shadow-2xl border border-zinc-100">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-zinc-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">Syncing</p>
      </div>
    </div>
  );

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Pagination State
  const [limit, setLimit] = useState(10);
  const [skip, setSkip] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Filter State
  const [statusFilter, setStatusFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Initial fetch or fetch on filter change (reset skip)
    fetchOrders(true);
  }, [limit, statusFilter, regionFilter, startDate, endDate]);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (selectedOrder || deleteId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedOrder, deleteId]);

  const handleStatusUpdate = async (order: Order, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: order._id, status: newStatus })
      });
      if (res.ok) {
        if (selectedOrder?._id === order._id) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        setOrders(prev => prev.map(o => o._id === order._id ? { ...o, status: newStatus } : o));
      }
    } catch (e) {
      console.error('Status sync failed');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const fetchOrders = async (reset = false) => {
    const currentSkip = reset ? 0 : skip;
    if (reset) {
        setLoading(true);
        setSkip(0);
    } else {
        setFetchingMore(true);
    }

    try {
      const params = new URLSearchParams({
        skip: currentSkip.toString(),
        limit: limit.toString(),
        ...(statusFilter && { status: statusFilter }),
        ...(regionFilter && { region: regionFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const json = await res.json();
      
      if (json.success) {
        if (reset) {
            setOrders(json.data);
        } else {
            setOrders(prev => [...prev, ...json.data]);
        }
        setTotalOrders(json.totalOrders);
        setHasMore(json.hasMore);
        setSkip(currentSkip + json.data.length);
      } else {
        setError('Failed to retrieve order logs');
      }
    } catch (err) {
      setError('Connection failure');
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  const handleReset = () => {
    // Check if any filter is actually different from default
    const isDirty = statusFilter !== '' || regionFilter !== '' || startDate !== '' || endDate !== '' || limit !== 10;
    
    if (!isDirty) {
        // If already at defaults, just refresh the stream
        fetchOrders(true);
    } else {
        // Resetting these will trigger the useEffect to fetch
        setStatusFilter('');
        setRegionFilter('');
        setStartDate('');
        setEndDate('');
        setLimit(10);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !fetchingMore) {
        fetchOrders(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/orders?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setDeleteId(null);
        fetchOrders(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
      case 'SHIPPED': return <Truck className="w-3.5 h-3.5 text-blue-500" />;
      case 'AWAITING_REVIEW': return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
      case 'REJECTED': return <X className="w-3.5 h-3.5 text-zinc-400" />;
      default: return <Clock className="w-3.5 h-3.5 text-orange-500" />;
    }
  };

  if (loading && orders.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Initializing Fulfillment Hub...</p>
    </div>
  );

  return (
    <>
      <div className="p-4 sm:p-8 pb-20 relative min-h-screen">
      
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 mb-1.5 tracking-tight">Fulfillment Hub</h1>
          <p className="text-zinc-400 text-[11px] font-medium uppercase tracking-[0.2em]">Live Order Stream • {totalOrders} Total Records</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
            {/* Unified Filter Bar */}
            <div className="flex flex-wrap items-center gap-2 bg-white border border-zinc-100 p-1.5 rounded-2xl shadow-sm">
                {/* Date Selection */}
                <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-100/50 rounded-xl px-4 py-2">
                    <Calendar size={13} className="text-zinc-400" />
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">From</span>
                        <CustomDatePicker 
                            value={startDate} 
                            onChange={setStartDate} 
                            placeholder="START" 
                            maxDate={endDate}
                        />
                    </div>
                    <div className="w-px h-3 bg-zinc-200" />
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">To</span>
                        <CustomDatePicker 
                            value={endDate} 
                            onChange={setEndDate} 
                            placeholder="END" 
                            minDate={startDate}
                        />
                    </div>
                </div>

                {/* Status Selection */}
                <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-100/50 rounded-xl px-4 py-2">
                    <Filter size={13} className="text-zinc-400" />
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-zinc-800 focus:outline-none cursor-pointer min-w-[140px]"
                    >
                        <option value="">All</option>
                        <option value="AWAITING_REVIEW">Awaiting Review</option>
                        <option value="PENDING">Pending (Accepted)</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                </div>

                {/* Limit Selection */}
                <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-100/50 rounded-xl px-4 py-2">
                    <select 
                        value={limit} 
                        onChange={(e) => setLimit(parseInt(e.target.value))}
                        className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-zinc-800 focus:outline-none cursor-pointer"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>

                {/* Reset Action */}
                <button 
                    onClick={handleReset}
                    className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-orange-500 transition-colors flex items-center gap-2"
                >
                    <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} />
                    Reset
                </button>
            </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-100 rounded-xl overflow-hidden shadow-sm mb-8 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Synchronizing Logistics...</p>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-full">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-4 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Order ID</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Total</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
          <tbody className="divide-y divide-zinc-50 text-sm">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-zinc-50/30 transition-colors group">
                <td className="px-6 py-4 font-mono text-[10px] text-zinc-400">
                  {order.orderId || order._id.slice(-8).toUpperCase()}
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-zinc-900">{order.customer?.name || 'Unknown'}</p>
                  <p className="text-[10px] text-zinc-400">{order.customer?.email}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-zinc-900">{order.total?.toLocaleString()} EGP</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">
                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      {order.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {order.status === 'AWAITING_REVIEW' ? (
                      <>
                        <button 
                          onClick={() => handleStatusUpdate(order, 'PENDING')}
                          disabled={isUpdatingStatus}
                          className="p-2 text-zinc-300 hover:text-green-500 transition-colors"
                          title="Accept Order"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(order, 'REJECTED')}
                          disabled={isUpdatingStatus}
                          className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                          title="Reject Order"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-zinc-300 hover:text-zinc-900 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        {order.status !== 'REJECTED' && (
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-zinc-300 hover:text-zinc-900 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => setDeleteId(order._id)}
                          className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        
        {orders.length === 0 && !loading && (
            <div className="py-20 flex flex-col items-center justify-center text-zinc-300">
                <ShoppingCart size={40} className="mb-4 opacity-20" />
                <p className="text-[11px] font-bold uppercase tracking-[0.2em]">No Orders Detected</p>
            </div>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center">
            <button 
                onClick={handleLoadMore}
                disabled={fetchingMore}
                className="group flex items-center gap-2 px-8 py-3 bg-white border border-zinc-100 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
                {fetchingMore ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-orange-500 group-hover:translate-y-0.5 transition-transform" />
                )}
                <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-900">
                    {fetchingMore ? 'Synchronizing...' : 'Load Historical Records'}
                </span>
            </button>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85dvh] sm:max-h-[90vh] shadow-2xl overflow-hidden border border-zinc-100 flex flex-col animate-in zoom-in-95 duration-300">
            {/* Invoice Header */}
            <div className="px-6 sm:px-10 py-6 sm:py-8 bg-zinc-50/50 border-b border-zinc-100 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-zinc-900 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Official Invoice</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">#{selectedOrder.orderId || selectedOrder._id.slice(-8).toUpperCase()}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 leading-none">Order Specification</h2>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-3">
                    Issued: {new Date(selectedOrder.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-zinc-400 hover:text-zinc-900 p-2 rounded-xl hover:bg-white transition-all shadow-sm">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-10 space-y-5 sm:space-y-10">
              {/* Status Manager */}
              <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-3 sm:p-6 flex flex-col items-stretch sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
                  {isUpdatingStatus && (
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center animate-in fade-in duration-300">
                          <div className="flex items-center gap-3">
                              <div className="flex gap-1">
                                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></div>
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-900">Updating Communications...</span>
                          </div>
                      </div>
                  )}
                  <div>
                    <h3 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest mb-1">Customer Notification Hub</h3>
                    <p className="text-[10px] font-medium text-zinc-400 uppercase">Auto-notify users about status changes</p>
                 </div>
                 <div className="flex items-center gap-3 flex-wrap">
                     {selectedOrder.status === 'AWAITING_REVIEW' ? (
                         <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                             <button
                                 disabled={isUpdatingStatus}
                                 onClick={() => handleStatusUpdate(selectedOrder, 'REJECTED')}
                                 className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-zinc-50 text-zinc-400 hover:text-red-500 hover:bg-red-50/50 border border-zinc-100 transition-all text-center"
                             >
                                 Reject Order
                             </button>
                             <button
                                 disabled={isUpdatingStatus}
                                 onClick={() => handleStatusUpdate(selectedOrder, 'PENDING')}
                                 className="w-full sm:w-auto px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-orange-500 text-white shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                             >
                                 Accept Order
                             </button>
                         </div>
                     ) : (
                         <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-zinc-100 shadow-sm overflow-x-auto">
                             {['SHIPPED', 'COMPLETED'].map((s) => {
                                 const isTarget = selectedOrder.status === s;
                                 
                                 return (
                                     <button
                                         key={s}
                                         disabled={isUpdatingStatus || (s === 'SHIPPED' && selectedOrder.status === 'COMPLETED')}
                                         onClick={() => handleStatusUpdate(selectedOrder, s)}
                                         className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                             isTarget 
                                             ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200'
                                             : ((s === 'SHIPPED' && selectedOrder.status === 'COMPLETED') ? 'text-zinc-200 cursor-not-allowed opacity-50' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50')
                                         }`}
                                     >
                                         {s}
                                     </button>
                                 );
                             })}
                         </div>
                     )}
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Recipient Information</h3>
                  <div className="space-y-1">
                    <p className="text-base font-bold text-zinc-900">{selectedOrder.customer?.name}</p>
                    <p className="text-xs font-medium text-zinc-500">{selectedOrder.customer?.email}</p>
                    <p className="text-xs font-medium text-zinc-500">{selectedOrder.customer?.phone}</p>
                    <div className="pt-4 mt-4 border-t border-dotted border-zinc-200">
                      <p className="text-xs font-medium text-zinc-400 leading-relaxed">
                        {selectedOrder.shipping?.address1}, {selectedOrder.shipping?.city}<br/>
                        {selectedOrder.shipping?.governorate}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Financial Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-zinc-900">
                        <span className="text-zinc-400 uppercase tracking-widest text-[10px]">Subtotal (Gross)</span>
                        <span>{(Number(selectedOrder.total || 0) + Number(selectedOrder.discount || 0)).toLocaleString()} EGP</span>
                    </div>
                    {selectedOrder.promoCode && (
                        <div className="flex justify-between items-center text-xs font-bold text-orange-500">
                            <span className="uppercase tracking-widest text-[10px]">Discount ({selectedOrder.promoCode})</span>
                            <span>-{selectedOrder.discount?.toLocaleString()} EGP</span>
                        </div>
                    )}
                    <div className="pt-3 border-t border-zinc-900/10 flex justify-between items-center">
                        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-900">Net Total</span>
                        <span className="text-lg font-black text-zinc-900">{selectedOrder.total?.toLocaleString()} EGP</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Manifest items</h3>
                <div className="border border-zinc-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-zinc-50">
                      <tr>
                        <th className="p-3 sm:p-5 font-black text-zinc-400 uppercase tracking-widest text-[9px]">Description</th>
                        <th className="p-3 sm:p-5 font-black text-zinc-400 uppercase tracking-widest text-[9px] text-center">Qty</th>
                        <th className="p-3 sm:p-5 font-black text-zinc-400 uppercase tracking-widest text-[9px] text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {selectedOrder.items?.map((item, i) => (
                        <tr key={i}>
                          <td className="p-3 sm:p-5 font-bold text-zinc-900">
                            <span className="text-[11px] uppercase tracking-tight">{item.name}</span>
                            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{item.series}</p>
                          </td>
                          <td className="p-3 sm:p-5 text-center font-black text-zinc-300">{item.quantity}</td>
                          <td className="p-3 sm:p-5 text-right font-black text-zinc-900">{item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

      {/* Deletion Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-red-950/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-red-100 flex flex-col p-8 animate-in zoom-in-95 duration-300">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                    <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">Permanently remove order?</h3>
                <p className="text-zinc-500 text-xs mb-8 leading-relaxed font-medium">
                    This action is <span className="text-red-600 font-bold uppercase tracking-wider">irreversible</span>. Once purged, this record cannot be recovered from the logistics stream.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setDeleteId(null)}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 transition-all"
                    >
                        Back
                    </button>
                    <button 
                        onClick={() => handleDelete(deleteId)}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-500 text-white shadow-lg shadow-red-200 hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                    >
                        {isDeleting && <Loader2 className="w-3 h-3 animate-spin text-white" />}
                        Purge Record
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default OrdersPage;
