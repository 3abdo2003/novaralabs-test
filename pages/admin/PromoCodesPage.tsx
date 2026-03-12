import React, { useState, useEffect, useRef } from 'react';
import { Ticket, Plus, Trash2, Loader2, X, Tag, AlertCircle, CheckCircle2, Power, Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertTriangle, ArrowRight, ToggleLeft, ToggleRight, RefreshCcw } from 'lucide-react';

interface PromoCode {
  _id?: string;
  code: string;
  discount: number;
  expiry?: string | null;
  expiryDate?: string | null;
  isActive: boolean;
  createdAt?: string;
}


// Custom Premium Date Picker
const CustomDatePicker: React.FC<{ 
    value: string; 
    onChange: (date: string) => void;
    minDate?: string;
    maxDate?: string;
}> = ({ value, onChange, minDate, maxDate }) => {
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
        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4 text-sm font-medium outline-none cursor-pointer flex items-center justify-between hover:border-zinc-300 transition-all shadow-sm"
      >
        <span className={value ? 'text-zinc-900' : 'text-zinc-300'}>
            {value ? new Date(value).toLocaleDateString('en-GB') : 'Select Expiry'}
        </span>
        <CalendarIcon className="w-4 h-4 text-zinc-300" />
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-xl shadow-2xl border border-zinc-100 p-5 z-[60] animate-in slide-in-from-top-4 duration-300">
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
              
              const isPastDisabled = dateStr < new Date().toISOString().split('T')[0];
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

const PromoCodesPage: React.FC = () => {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    expiry: ''
  });
  
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/promo-codes');
      const json = await res.json();
      if (json.success) setCodes(json.data);
      else setError('Failure');
    } catch (err) {
      setError('Connection Failure');
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (promo: PromoCode) => {
    if (!promo.isActive) return 'Inactive';
    const expiry = promo.expiry || promo.expiryDate;
    if (expiry && new Date(expiry) < new Date()) return 'Expired';
    return 'Active';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Duplicate Prevention
    const isDuplicate = codes.some(c => c.code.toUpperCase() === formData.code.toUpperCase());
    if (isDuplicate) {
        setError('A campaign with this code already exists');
        setTimeout(() => setError(null), 3000);
        return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        setIsAdding(false);
        setFormData({ code: '', discount: '', expiry: '' });
        fetchCodes();
      }
    } catch (err) {
       console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    if (togglingId) return;
    setTogglingId(id);
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus })
      });
      const json = await res.json();
      if (json.success) {
          // Update local state for immediate feedback
          setCodes(prev => prev.map(c => c._id === id ? { ...c, isActive: !currentStatus } : c));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (isDeletingId) return;
    setIsDeletingId(id);
    try {
      const res = await fetch(`/api/admin/promo-codes?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchCodes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeletingId(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Syncing Campaigns...</p>
    </div>
  );

  return (
    <div className="p-8 pb-20 min-h-screen relative overflow-x-hidden">
      {/* Table Section */}
      <div className={`transition-all duration-500 ease-in-out ${isAdding ? 'pr-[380px]' : ''}`}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 mb-1 tracking-tight">Promo Codes</h1>
            <p className="text-zinc-400 text-[11px] font-medium uppercase tracking-[0.2em]">Campaign & Status Controls</p>
          </div>
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-[11px] font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> New Campaign
            </button>
          )}
        </div>

        <div className="bg-white border border-zinc-100 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-4 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Code</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Discount</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Expiry</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 text-sm">
              {codes.map((promo) => {
                const displayExpiry = promo.expiry || promo.expiryDate;
                const status = getStatus(promo);
                const isToggling = togglingId === promo._id;
                
                return (
                  <tr key={promo._id} className="hover:bg-zinc-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="bg-zinc-50 text-zinc-900 px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider border border-zinc-100 group-hover:bg-white transition-all">
                        {promo.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-zinc-900">{promo.discount}% OFF</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 h-7">
                          {isToggling ? (
                              <RefreshCcw className="w-3 h-3 text-zinc-400 animate-spin" />
                          ) : (
                              <span className={`${
                                status === 'Active' ? 'bg-green-100 text-green-600' : 
                                status === 'Expired' ? 'bg-red-50 text-red-500' : 'bg-zinc-100 text-zinc-400'
                              } px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider`}>
                                {status}
                              </span>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-tight">
                        {displayExpiry ? new Date(displayExpiry).toLocaleDateString('en-GB') : 'NO EXPIRY'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                          <button 
                              onClick={() => toggleStatus(promo._id!, promo.isActive)}
                              disabled={isToggling}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                  promo.isActive 
                                  ? 'border-zinc-100 text-zinc-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50' 
                                  : 'border-green-100 text-green-600 bg-green-50 hover:bg-green-100'
                              }`}
                          >
                              {promo.isActive ? (
                                  <><Power className="w-3 h-3" /> Disable</>
                              ) : (
                                  <><CheckCircle2 className="w-3 h-3" /> Activate</>
                              )}
                          </button>
                          <button 
                              onClick={() => handleDelete(promo._id!)}
                              disabled={isDeletingId === promo._id}
                              className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          >
                              {isDeletingId === promo._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                  <Trash2 className="w-4 h-4" />
                              )}
                          </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Panel */}
      <div className={`fixed inset-y-0 right-0 w-[400px] bg-white shadow-[-8px_0_40px_rgba(0,0,0,0.04)] border-l border-zinc-100 z-[100] transform transition-transform duration-500 ease-in-out flex flex-col ${isAdding ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-8 py-10 border-b border-zinc-50 flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight">New Campaign</h2>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Define discount parameters</p>
            </div>
            <button 
                onClick={() => setIsAdding(false)} 
                className="p-2 rounded-xl text-zinc-300 hover:text-zinc-900 hover:bg-zinc-50 transition-all"
            >
                <X className="w-4 h-4" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex-1 space-y-10 overflow-y-auto">
            <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2 px-1">
                    <Tag className="w-3.5 h-3.5" /> Campaign Code
                </label>
                <input 
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-5 font-bold text-zinc-900 text-lg outline-none focus:bg-white focus:border-zinc-400/20 transition-all uppercase placeholder:text-zinc-200"
                    value={formData.code}
                    placeholder="ALPHA_2024"
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-8">
                <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">
                        Discount Percentage
                    </label>
                    <div className="relative group">
                        <input 
                            type="number"
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-5 font-bold text-zinc-900 text-lg outline-none focus:bg-white focus:border-zinc-400/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={formData.discount}
                            placeholder="0"
                            min="0"
                            max="100"
                            onChange={e => setFormData({ ...formData, discount: e.target.value })}
                            required
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-300 font-bold text-lg select-none pointer-events-none">%</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">
                        Expiration Date
                    </label>
                    <CustomDatePicker 
                        value={formData.expiry}
                        onChange={date => setFormData({ ...formData, expiry: date })}
                    />
                </div>
            </div>

            <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full bg-zinc-900 text-white p-5 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-zinc-200 flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Deploy Campaign <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
            </div>
        </form>
      </div>

      {/* Backdrop */}
      {isAdding && (
        <div 
          onClick={() => setIsAdding(false)}
          className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[90] animate-in fade-in duration-500"
        />
      )}

      {/* Error Toast */}
      {error && error !== 'Syncing Campaigns...' && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-6 duration-500 z-[200]">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{error}</span>
          </div>
      )}
    </div>
  );
};

export default PromoCodesPage;
