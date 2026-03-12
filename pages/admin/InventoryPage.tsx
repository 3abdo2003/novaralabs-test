import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ImageIcon, Hash, AlertCircle, Loader2, DollarSign, Info, Package, CheckCircle2, X, Tag } from 'lucide-react';

interface Product {
  _id?: string;
  name: string;
  series: string;
  priceEG: string;
  priceWorldwide: string;
  stock: number;
  slug: string;
  image: string;
  sizesEG?: { size: string; price: string; stock?: number }[];
  sizesWorldwide?: { size: string; price: string }[];
  description: string;
}

const InventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string } | null>(null);
  
  const initialFormData: Product = {
    name: '',
    series: 'Peptides',
    priceEG: '',
    priceWorldwide: '',
    stock: 0,
    slug: '',
    image: '',
    sizesEG: [{ size: '', price: '', stock: 0 }],
    sizesWorldwide: [{ size: '', price: '' }],
    description: ''
  };

  const [formData, setFormData] = useState<Product>(initialFormData);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert("File size must be less than 20MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/inventory');
      const json = await res.json();
      if (json.success) setProducts(json.data);
      else setError('Failed to retrieve catalog data');
    } catch (err) {
      setError('Connection failure');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const method = editingItem ? 'PUT' : 'POST';
      
      let finalImage = formData.image;
      if (finalImage && !finalImage.startsWith('data:') && !finalImage.startsWith('/products/')) {
          finalImage = `/products/${finalImage}`;
      }
      
      const payloadSlug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      // Ensure base prices exist
      const basePriceEG = formData.sizesEG && formData.sizesEG.length > 0 ? formData.sizesEG[0].price : formData.priceEG;
      const basePriceWorldwide = formData.sizesWorldwide && formData.sizesWorldwide.length > 0 ? formData.sizesWorldwide[0].price : formData.priceWorldwide;

      const payload = { ...formData, image: finalImage, slug: payloadSlug, priceEG: basePriceEG, priceWorldwide: basePriceWorldwide };
      if (editingItem) payload._id = editingItem._id;
      
      const res = await fetch('/api/admin/inventory', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      if (json.success) {
        setIsAdding(false);
        setEditingItem(null);
        setFormData(initialFormData);
        fetchProducts();
        setSuccessMsg(`Successfully ${editingItem ? 'updated' : 'added'} ${payload.name}`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`/api/admin/inventory?id=${itemToDelete.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchProducts();
        setSuccessMsg(`Successfully deleted ${itemToDelete.name}`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setItemToDelete(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Syncing Catalog...</p>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 pb-20 max-w-[1600px] mx-auto relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-10 gap-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-1.5 tracking-tight">Catalog Management</h1>
          <p className="text-zinc-400 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.25em]">Master Inventory & Global Specifications</p>
        </div>
        <button 
          onClick={() => { setFormData(initialFormData); setEditingItem(null); setIsAdding(true); }}
          className="w-full sm:w-auto bg-zinc-900 text-white px-6 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2.5 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-95"
        >
          <Plus className="w-4 h-4" /> New Entry
        </button>
      </div>

      <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse hidden lg:table">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest w-[400px]">Product & Info</th>
                <th className="px-6 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Series & Size</th>
                <th className="px-6 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pricing (EG / Intl)</th>
                <th className="px-6 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest w-[200px]">Inventory Hub</th>
                <th className="px-6 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 text-sm">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-zinc-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-zinc-50 border border-zinc-100 overflow-hidden flex items-center justify-center group-hover:bg-white transition-all shadow-sm">
                          {product.image ? (
                              <img src={product.image} alt="" className="w-10 h-10 object-contain mix-blend-multiply" />
                          ) : (
                              <ImageIcon className="w-5 h-5 text-zinc-200" />
                          )}
                      </div>
                      <div>
                          <p className="font-bold text-zinc-900 text-sm mb-0.5">{product.name}</p>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1.5 leading-none">
                              <Hash className="w-3 h-3" /> {product.slug}
                          </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                      <div className="space-y-1">
                          <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-100">{product.series}</span>
                          <p className="text-[11px] font-medium text-zinc-400 pt-1">
                              {product.sizesEG && product.sizesEG.length > 0 ? product.sizesEG[0].size : (product.sizesWorldwide && product.sizesWorldwide.length > 0 ? product.sizesWorldwide[0].size : 'No Size specified')}
                          </p>
                          {product.sizesEG && product.sizesEG.length > 0 && (
                              <p className="text-[10px] text-orange-500 font-bold mt-1">{product.sizesEG.length} Variants</p>
                          )}
                      </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-zinc-900">{product.priceEG}</p>
                      <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-tighter">{product.priceWorldwide}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {(product.sizesEG && product.sizesEG.length > 0) ? (
                      <div className="space-y-2">
                         {product.sizesEG.map((v, i) => (
                             <div key={i} className={`flex justify-between items-center text-[10px] uppercase font-bold tracking-widest border-b border-zinc-50 pb-1 last:border-0 last:pb-0 ${v.stock !== undefined && v.stock < 10 ? 'text-red-500 bg-red-50/50 -mx-1 px-1 rounded' : 'text-zinc-400'}`}>
                                 <span>{v.size} {v.stock !== undefined && v.stock < 10 && <AlertCircle className="w-3 h-3 inline ml-1 -translate-y-[1px]" />}</span>
                                 <span className={(v.stock || 0) < 10 ? 'text-red-600' : 'text-zinc-900'}>{v.stock || 0} Units</span>
                             </div>
                         ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                            <span>Available</span>
                            <span className={product.stock < 10 ? 'text-red-500' : 'text-zinc-900'}>{product.stock} Units</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ${product.stock < 10 ? 'bg-red-500' : 'bg-orange-500'}`}
                                style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }}
                            />
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => {
                          setEditingItem(product);
                          setFormData(product);
                          setIsAdding(true);
                        }}
                        className="p-2.5 text-zinc-300 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setItemToDelete({ id: product._id!, name: product.name })}
                        className="p-2.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card View for Mobile */}
        <div className="lg:hidden divide-y divide-zinc-50">
          {products.map((product) => (
            <div key={product._id} className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                    {product.image ? (
                      <img src={product.image} alt="" className="w-8 h-8 object-contain mix-blend-multiply" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-zinc-200" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 text-sm leading-tight">{product.name}</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">{product.series}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => {
                      setEditingItem(product);
                      setFormData(product);
                      setIsAdding(true);
                    }}
                    className="p-2.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setItemToDelete({ id: product._id!, name: product.name })}
                    className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">EGP Price</p>
                  <p className="text-xs font-bold text-zinc-900">{product.priceEG}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Global Price</p>
                  <p className="text-xs font-bold text-zinc-900">{product.priceWorldwide}</p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest mb-2">Inventory Status</p>
                {(product.sizesEG && product.sizesEG.length > 0) ? (
                  <div className="flex flex-wrap gap-2">
                    {product.sizesEG.map((v, i) => (
                      <div key={i} className={`flex items-center gap-2 text-[9px] uppercase font-bold tracking-widest px-2.5 py-1.5 rounded-lg border ${v.stock !== undefined && v.stock < 10 ? 'bg-red-50 border-red-100 text-red-500' : 'bg-zinc-50 border-zinc-100 text-zinc-500'}`}>
                        <span>{v.size}: {v.stock || 0}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${product.stock < 10 ? 'text-red-500' : 'text-zinc-500'}`}>{product.stock} Units Available</span>
                    <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-orange-500 rounded-full`} style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-6 transition-all duration-300">
          <div className="bg-white rounded-none sm:rounded-2xl max-w-2xl w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] shadow-2xl overflow-hidden border border-zinc-100 relative animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            <div className="px-6 sm:px-10 py-6 sm:py-8 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">{editingItem ? 'Specifications Update' : 'Master Catalog Entry'}</h2>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1">Technical & Financial Parameters</p>
              </div>
              <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="text-zinc-400 hover:text-zinc-900 p-2.5 rounded-xl hover:bg-zinc-100 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form id="inventory-form" onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 bg-zinc-50/50">
              <div className="p-4 sm:p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
              
              {/* Core Information Card */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-6">
                <div className="flex items-center gap-2 mb-4 border-b border-zinc-50 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                    <Tag className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-widest">Base Identity</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Product Name</label>
                    <input 
                      className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl p-3.5 text-sm font-bold text-zinc-900 outline-none focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-zinc-300 placeholder:font-medium"
                      placeholder="e.g. RETATRUTIDE"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') })}
                      required
                    />
                    {formData.name && (
                      <p className="text-[9px] font-medium text-zinc-400 ml-1 flex items-center gap-1 mt-1.5"><Hash className="w-3 h-3"/> Auto-generated slug: <span className="text-zinc-700 font-bold">{formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}</span></p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Series Category</label>
                      <input 
                          className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl p-3.5 text-sm font-bold text-zinc-900 outline-none focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-zinc-300 placeholder:font-medium"
                          placeholder="e.g. METABOLIC"
                          value={formData.series}
                          onChange={e => setFormData({ ...formData, series: e.target.value })}
                          required
                      />
                  </div>
                  
                </div>
              </div>

              {/* Pricing & Stock Card */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-10 opacity-50"></div>
                <div className="flex items-center justify-between mb-4 border-b border-zinc-50 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-widest">Pricing & Variants</h3>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, sizesEG: [...(p.sizesEG || []), { size: '', price: '', stock: 0 }] }))}
                    className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Variant
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500 ring-2 ring-orange-500/20"></span> EGYPTIAN MARKET
                  </div>
                  
                  <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 space-y-3">
                      {(formData.sizesEG || []).map((sz, idx) => (
                        <div key={idx} className={`flex flex-col sm:flex-row gap-3 items-start sm:items-end bg-white p-3 rounded-xl border shadow-sm relative group ${sz.stock !== undefined && sz.stock < 10 ? 'border-red-200' : 'border-zinc-100'}`}>
                          <div className="w-full sm:flex-1 space-y-1.5">
                             {idx === 0 && <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Variant Size</label>}
                             <input 
                               className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-500/10 transition-all placeholder:text-zinc-300"
                               placeholder="ex: 10 mg / vial"
                               value={sz.size}
                               onChange={e => {
                                 const newSizes = [...formData.sizesEG!];
                                 newSizes[idx].size = e.target.value;
                                 setFormData({ ...formData, sizesEG: newSizes });
                               }}
                               required
                             />
                          </div>
                          <div className="w-full sm:flex-1 space-y-1.5">
                             {idx === 0 && <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Price (EGP)</label>}
                             <div className="relative flex items-center">
                               <input 
                                 className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 pr-8 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-500/10 transition-all placeholder:text-zinc-300"
                                 placeholder="ex: 4,500"
                                 value={sz.price.replace(/ L\.E/i, '').replace(/L\.E/i, '').trim()}
                                 onChange={e => {
                                   const newSizes = [...(formData.sizesEG || [])];
                                   const cleanVal = e.target.value;
                                   const formatted = cleanVal ? `${cleanVal}L.E` : '';
                                   newSizes[idx].price = formatted;
                                   setFormData({ ...formData, sizesEG: newSizes, priceEG: idx === 0 ? formatted : formData.priceEG });
                                 }}
                                 required
                               />
                               <span className="absolute right-3 text-[10px] font-bold text-zinc-400 pointer-events-none">L.E</span>
                             </div>
                          </div>
                          <div className="w-[100px] space-y-1.5">
                             {idx === 0 && <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Stock</label>}
                             <input 
                               type="number"
                               className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-500/10 transition-all placeholder:text-zinc-300 text-center"
                               placeholder="0"
                               value={sz.stock || 0}
                               onChange={e => {
                                 const newSizes = [...formData.sizesEG!];
                                 newSizes[idx].stock = parseInt(e.target.value) || 0;
                                 setFormData({ ...formData, sizesEG: newSizes });
                               }}
                             />
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              const newSizes = formData.sizesEG!.filter((_, i) => i !== idx);
                              setFormData({ ...formData, sizesEG: newSizes });
                            }}
                            className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 flex-shrink-0"
                            title="Remove Variant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                  
                  {/* WORLDWIDE MARKET SECTION */}
                  <div className="mt-8">
                      <div className="flex items-center justify-between mb-3">
                          <div className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-100 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-indigo-500/20"></span> WORLDWIDE MARKET
                          </div>
                          <button 
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, sizesWorldwide: [...(p.sizesWorldwide || []), { size: '', price: '' }] }))}
                            className="text-zinc-400 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                          >
                            <Plus className="w-3 h-3" /> Add Int. Variant
                          </button>
                      </div>
                      <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 space-y-3">
                          {(formData.sizesWorldwide || []).map((sz, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end bg-white p-3 rounded-xl border border-zinc-100 shadow-sm relative group">
                              <div className="w-full sm:flex-1 space-y-1.5">
                                 {idx === 0 && <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Variant Size</label>}
                                 <input 
                                   className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-zinc-300"
                                   placeholder="ex: 10 mg / vial"
                                   value={sz.size}
                                   onChange={e => {
                                     const newSizes = [...formData.sizesWorldwide!];
                                     newSizes[idx].size = e.target.value;
                                     setFormData({ ...formData, sizesWorldwide: newSizes });
                                   }}
                                   required
                                 />
                              </div>
                              <div className="w-full sm:flex-1 space-y-1.5">
                                 {idx === 0 && <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Price</label>}
                                 <div className="relative flex items-center">
                                   <input 
                                     className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-zinc-300 pl-8"
                                     placeholder="ex: 120.00"
                                     value={sz.price.replace(/€/g, '').replace(/\$/g, '').trim()}
                                     onChange={e => {
                                       const newSizes = [...formData.sizesWorldwide!];
                                       const val = e.target.value ? `€${e.target.value}` : '';
                                       newSizes[idx].price = val;
                                       setFormData({ ...formData, sizesWorldwide: newSizes, priceWorldwide: idx === 0 ? val : formData.priceWorldwide });
                                     }}
                                     required
                                   />
                                   <span className="absolute left-3 text-[10px] font-bold text-zinc-400 pointer-events-none">€</span>
                                 </div>
                              </div>
                              <button 
                                type="button"
                                onClick={() => {
                                  const newSizes = formData.sizesWorldwide!.filter((_, i) => i !== idx);
                                  setFormData({ ...formData, sizesWorldwide: newSizes });
                                }}
                                className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 flex-shrink-0"
                                title="Remove Variant"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                      </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-6">
                <div className="flex items-center gap-2 mb-4 border-b border-zinc-50 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-widest">Media & Info</h3>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Product Media</label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 bg-zinc-50 rounded-xl border border-zinc-200 border-dashed">
                        <div className="w-20 h-20 bg-white rounded-xl border border-zinc-100 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                           {formData.image ? 
                              <img src={formData.image} className="w-full h-full object-contain p-2" alt="Preview" /> : 
                              <ImageIcon className="w-6 h-6 text-zinc-300" />
                           }
                        </div>
                        <div className="flex-1 space-y-2">
                           <input 
                             type="file"
                             accept="image/*"
                             className="block w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-zinc-900 file:text-white hover:file:bg-zinc-800 transition-all cursor-pointer"
                             onChange={handleImageUpload}
                           />
                           <p className="text-[9px] font-medium text-zinc-400 tracking-wider">Accepted formats: PNG, JPG, WEBP. Max size: 2MB.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-1.5"><Package className="w-3 h-3" /> Full Narrative</label>
                  <textarea 
                    className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl p-4 text-sm font-medium text-zinc-700 outline-none focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 transition-all min-h-[160px] custom-scrollbar"
                    placeholder="Detailed product information and research guidelines..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
              </div>
              </div>
            </form>

            <div className="bg-white border-t border-zinc-100 px-6 py-4 sm:px-10 sm:py-6">
              <button 
                type="submit" 
                form="inventory-form"
                disabled={isSubmitting} 
                className="w-full bg-zinc-900 text-white p-4 sm:p-5 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-zinc-300/50 flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> SYNCHRONIZING...</>
                ) : editingItem ? (
                    'Synchronize Record'
                ) : (
                    'Deploy Master Entry'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900">Confirm Deletion</h3>
              <p className="text-sm text-zinc-500 font-medium">
                Are you sure you want to permanently delete <strong className="text-zinc-900">{itemToDelete.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex gap-3">
              <button 
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-3 text-sm font-bold text-zinc-600 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 py-3 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/20 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed bottom-8 right-8 z-[70] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-zinc-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
             <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
             </div>
             <p className="text-sm font-bold">{successMsg}</p>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f4f4f5;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4d4d8;
        }
      `}</style>
    </div>
  );
};

export default InventoryPage;
