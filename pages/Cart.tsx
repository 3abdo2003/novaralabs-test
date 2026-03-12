import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useRegion } from '../context/RegionContext';
import { useMessage } from '../context/MessageContext';
import { parsePrice } from '../products';
import QuantitySelector from '../components/QuantitySelector';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { showMessage } = useMessage();
  const { region } = useRegion();
  const { items, setQuantity, removeItem, updateItemSize } = useCart();

  if (region !== 'EG') {
    return (
      <div className="bg-white min-h-screen pt-28 sm:pt-32 lg:pt-40 px-4 sm:px-6 lg:px-12 pb-16">
        <div className="max-w-screen-lg mx-auto">
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 sm:p-12 text-center">
            <h1 className="text-2xl font-bold text-black uppercase tracking-tight">Cart Access</h1>
            <p className="text-gray-500 mt-4 text-sm leading-relaxed">
              Cart checkout is currently available for <span className="font-semibold text-orange-500">Egypt</span> only. Please switch your region in the navbar to continue.
            </p>
            <div className="mt-8">
              <Link to="/peptides" className="inline-block px-8 py-4 bg-zinc-900 text-white rounded-lg font-bold uppercase tracking-widest text-[10px] hover:bg-black transition-all">
                Browse Peptides
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce((sum, i) => {
    const pStr = region === 'EG' ? (i.selectedPrice || i.product.priceEG) : i.product.priceWorldwide;
    const p = parsePrice(pStr);
    if (p == null) return sum;
    return sum + p * i.quantity;
  }, 0);

  return (
    <div className="bg-white min-h-screen pt-28 sm:pt-32 lg:pt-40 px-4 sm:px-6 lg:px-12 pb-16 sm:pb-24">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <div className="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase">Your Selection</div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-black uppercase tracking-tight leading-[1]">Your Cart</h1>
          </div>
          <Link
            to="/peptides"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 transition-all rounded-lg font-bold uppercase tracking-widest text-[10px] text-zinc-600 border border-gray-100 group"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Continue discovery
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-12 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6 text-gray-300">
              <ShoppingBag size={28} />
            </div>
            <h2 className="text-xl font-bold text-black uppercase tracking-tight">Your cart is empty</h2>
            <p className="text-gray-500 mt-3 text-sm">Add peptides to your selection to proceed with your inquiry.</p>
            <div className="mt-8">
              <Link to="/peptides" className="inline-flex items-center gap-2 px-10 py-4 bg-orange-500 text-white rounded-lg font-bold uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-all">
                Browse Peptides
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const { product } = item;
                return (
                  <div key={`${product.slug}-${item.selectedSize}`} className="bg-gray-50 border border-gray-100 rounded-xl p-5 flex gap-5 items-center transition-all hover:border-gray-200">
                    <div className="w-20 h-20 rounded-lg bg-white border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img src={product.image} alt="" className="w-16 h-16 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="text-[9px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-1">{product.series}</div>
                          <h3 className="text-lg font-bold text-black uppercase tracking-tight truncate leading-tight">{product.name}</h3>
                          <div className="flex flex-col gap-1 mt-1">
                            <div className="text-sm font-semibold text-gray-500">
                              {region === 'EG' ? (item.selectedPrice || product.priceEG) : product.priceWorldwide}
                            </div>
                            {region === 'EG' && product.sizesEG && product.sizesEG.length > 0 ? (
                              <select
                                value={item.selectedSize || product.sizesEG[0].size}
                                onChange={(e) => {
                                  const newSize = e.target.value;
                                  const newPrice = product.sizesEG?.find(s => s.size === newSize)?.price || product.priceEG;
                                  updateItemSize(product.slug, item.selectedSize || '', newSize, newPrice);
                                }}
                                className="text-[10px] font-bold uppercase tracking-widest text-orange-500 bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
                              >
                                {product.sizesEG.map(s => (
                                  <option key={s.size} value={s.size}>{s.size}</option>
                                ))}
                              </select>
                            ) : (
                              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                {region === 'EG' ? (item.selectedSize || product.size) : product.size}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4 ml-auto sm:ml-0">
                          <div className="w-28 sm:w-32">
                            <QuantitySelector
                              size="sm"
                              quantity={item.quantity}
                              onIncrease={() => {
                                if (item.availableStock !== undefined && item.quantity >= item.availableStock) {
                                  showMessage({ variant: 'info', title: 'Stock Limit', message: `Only ${item.availableStock} units available.`, buttonLabel: 'OK' });
                                  return;
                                }
                                setQuantity(product.slug, item.quantity + 1, item.selectedSize).catch(err => {
                                  showMessage({ variant: 'error', title: 'Error', message: err.message, buttonLabel: 'OK' });
                                });
                              }}
                              onDecrease={() => {
                                if (item.quantity > 1) {
                                  setQuantity(product.slug, item.quantity - 1, item.selectedSize).catch(err => {
                                    showMessage({ variant: 'error', title: 'Error', message: err.message, buttonLabel: 'OK' });
                                  });
                                } else {
                                  removeItem(product.slug, item.selectedSize);
                                }
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(product.slug, item.selectedSize)}
                            className="p-2 sm:p-2.5 rounded-lg bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all"
                            aria-label={`Remove ${product.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:sticky lg:top-32 h-fit">
              <div className="bg-zinc-950 text-white rounded-xl p-8 shadow-2xl shadow-black/10">
                <div className="text-[10px] font-bold tracking-[0.3em] text-white/30 uppercase mb-6">Order Summary</div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Subtotal</span>
                    <span className="text-xl font-bold">{subtotal > 0 ? (region === 'EG' ? `${subtotal.toLocaleString()}L.E` : `€${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`) : '—'}</span>
                  </div>
                  <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-widest pb-6 border-b border-white/5">
                    Shipping and final logistics will be confirmed by support after order placement.
                  </p>

                  <div className="pt-2 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (items.length === 0) return;
                        navigate('/checkout');
                      }}
                      className="w-full bg-orange-500 hover:bg-orange-600 transition-all rounded-lg py-4 font-bold uppercase tracking-widest text-[10px] text-white"
                    >
                      Proceed to checkout
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        showMessage({
                          variant: 'info',
                          title: 'Payment options',
                          message: 'Cash on Delivery is currently the primary method. Instapay and Card are coming soon.',
                          buttonLabel: 'OK',
                        });
                      }}
                      className="w-full bg-white/5 hover:bg-white/10 transition-all rounded-lg py-3 font-bold uppercase tracking-widest text-[9px] text-white/60 border border-white/5"
                    >
                      Payment Details
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Secure Research Fulfillment
                </p>
              </div>
            </div>
          </div >
        )}
      </div >
    </div >
  );
};

export default Cart;
