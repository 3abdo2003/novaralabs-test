import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, MapPin, CreditCard, Wallet, Banknote, ShieldCheck, ChevronRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useRegion } from '../context/RegionContext';
import { useMessage } from '../context/MessageContext';
import { parsePrice } from '../products';

type PaymentMethod = 'INSTAPAY' | 'COD' | 'CARD';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { showMessage } = useMessage();
  const { region } = useRegion();
  const { items, clear } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; type: string } | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const subtotal = useMemo(() => items.reduce((sum, i) => {
    const pStr = region === 'EG' ? (i.selectedPrice || i.product.priceEG) : i.product.priceWorldwide;
    const p = parsePrice(pStr);
    if (p == null) return sum;
    return sum + p * i.quantity;
  }, 0), [items, region]);

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === 'PERCENTAGE') {
      return subtotal * (appliedPromo.discount / 100);
    }
    return appliedPromo.discount;
  }, [subtotal, appliedPromo]);

  const total = subtotal - discountAmount;

  if (region !== 'EG') {
    return (
      <div className="bg-white min-h-screen pt-28 sm:pt-32 lg:pt-40 px-4 sm:px-6 lg:px-12 pb-16">
        <div className="max-w-screen-lg mx-auto">
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 sm:p-12 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6 text-gray-400">
              <MapPin size={28} />
            </div>
            <h1 className="text-2xl font-bold text-black uppercase tracking-tight">Regional Limitation</h1>
            <p className="text-gray-500 mt-4 max-w-sm mx-auto text-sm leading-relaxed">
              Checkout is currently available for <span className="font-semibold text-orange-500">Egypt</span> inquiries only.
            </p>
            <div className="mt-8">
              <Link to="/peptides" className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white rounded-lg font-bold uppercase tracking-widest text-[10px] hover:bg-black transition-all">
                <ArrowLeft size={14} />
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white min-h-screen pt-28 sm:pt-32 lg:pt-40 px-4 sm:px-6 lg:px-12 pb-16">
        <div className="max-w-screen-lg mx-auto">
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 sm:p-12 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6 text-gray-400">
              <Wallet size={28} />
            </div>
            <h1 className="text-2xl font-bold text-black uppercase tracking-tight">Empty Cart</h1>
            <p className="text-gray-500 mt-4 text-sm">Your selection is currently empty.</p>
            <div className="mt-8">
              <Link to="/peptides" className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-lg font-bold uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-all">
                Start Selection
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-28 sm:pt-32 lg:pt-40 px-4 sm:px-6 lg:px-12 pb-16 sm:pb-24">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <div className="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase">Secure Checkout • Region: EG</div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-black uppercase tracking-tight leading-[1]">
              Checkout
            </h1>
          </div>
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 transition-all rounded-lg font-bold uppercase tracking-widest text-[10px] text-black border border-gray-100 group"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Modify Cart
          </Link>
        </div>

        <form
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
          onSubmit={async (e) => {
            e.preventDefault();
            if (isSubmitting) return;

            const form = e.currentTarget;
            const fd = new FormData(form);

            const name = String(fd.get('name') || '').trim();
            const email = String(fd.get('email') || '').trim();
            const phone = String(fd.get('phone') || '').trim();
            const address1 = String(fd.get('address1') || '').trim();
            const address2 = String(fd.get('address2') || '').trim();
            const city = String(fd.get('city') || '').trim();
            const governorate = String(fd.get('governorate') || '').trim();
            const notes = String(fd.get('notes') || '').trim();

            if (!name || !email || !phone || !address1 || !city || !governorate) {
              showMessage({
                variant: 'error',
                title: 'Missing information',
                message: 'Please fill in all required fields.',
                buttonLabel: 'OK',
              });
              return;
            }

            try {
              setIsSubmitting(true);

              // 1. Initial Stock Pre-check (Frontend)
              // This is a quick UI-side check, but the server will do the authoritative check
              
              const response = await fetch('/api/place-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  region: 'EG',
                  customer: { name, email, phone },
                  shipping: { address1, address2, city, governorate },
                  payment: {
                    method: paymentMethod,
                  },
                  notes,
                  promoCode: appliedPromo?.code || null,
                  discount: discountAmount,
                  total: total,
                  items: items.map((i) => ({
                    slug: i.product.slug,
                    name: i.product.name,
                    series: i.product.series,
                    size: region === 'EG' ? (i.selectedSize || i.product.size) : i.product.size,
                    price: region === 'EG' ? (i.selectedPrice || i.product.priceEG) : i.product.priceWorldwide,
                    quantity: i.quantity,
                  })),
                }),
              });

              const data = await response.json().catch(() => ({}));
              if (!response.ok || !data?.success) {
                // Specific stock error message from backend
                const errorMsg = data?.error || 'Failed to place order';
                throw new Error(errorMsg);
              }

              clear();
              showMessage({
                variant: 'success',
                title: 'Order Completed',
                message: 'We sent a confirmation email. Support will follow up for delivery.',
                buttonLabel: 'OK',
              });
              navigate('/peptides');
            } catch (err: any) {
              console.error(err);
              showMessage({
                variant: 'error',
                title: err.message.includes('Stock') || err.message.includes('sold out') ? 'Availability Issue' : 'Order Failed',
                message: err.message || 'Could not complete your request. Please try again later.',
                buttonLabel: 'OK',
              });
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          {/* Main Form Area */}
          <div className="lg:col-span-7 space-y-8 lg:space-y-10">
            {/* Contact Information */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-black">
                <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-900">
                  <User size={16} />
                </div>
                <h2 className="text-lg font-bold uppercase tracking-tight">Contact</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-gray-300"
                    placeholder="Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-gray-300"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Phone</label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-gray-300"
                    placeholder="+20 1X XXX XXXX"
                  />
                </div>
              </div>
            </section>

            {/* Shipping Details */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-black">
                <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-900">
                  <MapPin size={16} />
                </div>
                <h2 className="text-lg font-bold uppercase tracking-tight">Delivery</h2>
              </div>
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Address line 1</label>
                  <input
                    name="address1"
                    type="text"
                    required
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-gray-300"
                    placeholder="Street, Building, Flat"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px) font-bold uppercase tracking-widest text-gray-400 ml-1">Address line 2 (Optional)</label>
                  <input
                    name="address2"
                    type="text"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-gray-300"
                    placeholder="Landmark, Floor"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">City</label>
                    <input
                      name="city"
                      type="text"
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-gray-300"
                      placeholder="e.g. Nasr City"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Governorate</label>
                    <input
                      name="governorate"
                      type="text"
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-gray-300"
                      placeholder="e.g. Cairo"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Order Notes (Optional)</label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:border-orange-500/50 transition-all resize-none placeholder:text-gray-300"
                    placeholder="Any special instructions for delivery..."
                  />
                </div>
              </div>
            </section>

            {/* Payment Methods */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-black">
                <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-900">
                  <Wallet size={16} />
                </div>
                <h2 className="text-lg font-bold uppercase tracking-tight">Payment</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {/* COD Option (Default/Only for now) */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex items-center justify-between p-5 rounded-xl border transition-all cursor-pointer ${paymentMethod === 'COD'
                    ? 'bg-zinc-950 border-zinc-950 text-white'
                    : 'bg-gray-50 border-gray-100 hover:border-gray-200 text-gray-900'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg ${paymentMethod === 'COD' ? 'bg-white/10' : 'bg-white border border-gray-100'}`}>
                      <Banknote size={20} className={paymentMethod === 'COD' ? 'text-white' : 'text-zinc-400'} />
                    </div>
                    <div>
                      <div className="font-bold uppercase tracking-tight text-sm">Cash on delivery</div>
                      <div className={`text-[10px] ${paymentMethod === 'COD' ? 'text-white/50' : 'text-gray-500'}`}>Pay on delivery</div>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-white' : 'border-gray-200'}`}>
                    {paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>

                {/* Coming Soon Options */}
                <div className="flex items-center justify-between p-5 rounded-xl border border-gray-50 bg-gray-25 opacity-40 grayscale cursor-not-allowed">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-white border border-gray-100">
                      <Wallet size={20} className="text-gray-300" />
                    </div>
                    <div>
                      <div className="font-bold uppercase tracking-tight text-sm">Instapay</div>
                      <div className="text-[10px] text-gray-500 font-medium">Coming soon</div>
                    </div>
                  </div>
                  <div className="px-2 py-0.5 bg-gray-100 rounded text-[7px] font-bold uppercase text-gray-400 tracking-widest">SOON</div>
                </div>

                <div className="flex items-center justify-between p-5 rounded-xl border border-gray-50 bg-gray-25 opacity-40 grayscale cursor-not-allowed">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-white border border-gray-100">
                      <CreditCard size={20} className="text-gray-300" />
                    </div>
                    <div>
                      <div className="font-bold uppercase tracking-tight text-sm">Credit Card</div>
                      <div className="text-[10px] text-gray-500 font-medium">Coming soon</div>
                    </div>
                  </div>
                  <div className="px-2 py-0.5 bg-gray-100 rounded text-[7px] font-bold uppercase text-gray-400 tracking-widest">SOON</div>
                </div>
              </div>
            </section>
          </div>

          {/* Minimal Summary Sidebar */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-6">
            <div className="bg-zinc-950 text-white rounded-2xl p-8 shadow-2xl shadow-black/10">
              <div className="space-y-6">
                <div>
                  <div className="text-[9px] font-bold tracking-[0.3em] text-white/30 uppercase mb-4">Summary</div>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {items.map((i) => (
                      <div key={`${i.product.slug}-${i.selectedSize}`} className="flex items-start justify-between gap-4">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img src={i.product.image} alt="" className="w-8 h-8 object-contain" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-[10px] font-bold uppercase tracking-tight text-white leading-tight mb-0.5">{i.product.name}</h4>
                            <div className="flex flex-col gap-0.5">
                              <p className="text-[8px] font-medium text-white/30 uppercase tracking-widest">{productSeriesMap[i.product.series] || i.product.series}</p>
                              <p className="text-[7px] font-bold text-orange-500 uppercase tracking-widest">
                                {region === 'EG' ? (i.selectedSize || i.product.size) : i.product.size}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-bold text-white">x{i.quantity}</span>
                          <span className="text-[8px] font-medium text-white/30">
                            {region === 'EG' ? (i.selectedPrice || i.product.priceEG) : i.product.priceWorldwide}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Promo Code</label>
                    {!appliedPromo ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                          placeholder="ENTER CODE"
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-bold text-white uppercase focus:outline-none focus:border-orange-500/50"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (!promoInput || isValidatingPromo) return;
                            try {
                              setIsValidatingPromo(true);
                              const res = await fetch('/api/validate-promo', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ code: promoInput })
                              });
                              const data = await res.json();
                              if (data.success) {
                                setAppliedPromo({ code: promoInput, discount: data.discount, type: data.type });
                                showMessage({ variant: 'success', title: 'Code Applied', message: `You saved ${data.type === 'PERCENTAGE' ? `${data.discount}%` : `${data.discount} L.E`}`, buttonLabel: 'Great' });
                              } else {
                                setAppliedPromo(null);
                                showMessage({ variant: 'error', title: 'Invalid Code', message: data.error || 'Code not found', buttonLabel: 'OK' });
                              }
                            } catch (err) {
                              console.error(err);
                            } finally {
                              setIsValidatingPromo(false);
                            }
                          }}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors"
                        >
                          {isValidatingPromo ? '...' : 'Apply'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{appliedPromo.code}</span>
                          <span className="text-[8px] font-bold text-orange-500/60 uppercase">Applied</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAppliedPromo(null);
                            setPromoInput('');
                          }}
                          className="text-[9px] font-bold text-orange-500 hover:text-orange-400 uppercase tracking-tighter"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    {appliedPromo && (
                      <div className="flex items-center justify-between text-[10px] font-bold text-orange-500">
                        <span className="uppercase tracking-widest">Discount ({appliedPromo.code})</span>
                        <span>-{appliedPromo.type === 'PERCENTAGE' ? `${appliedPromo.discount}%` : `${appliedPromo.discount} L.E`}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Subtotal</span>
                    <span className="text-sm font-bold text-white/60">{subtotal > 0 ? (region === 'EG' ? `${subtotal.toLocaleString()}L.E` : `€${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`) : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total</span>
                    <span className="text-xl font-bold">{total > 0 ? (region === 'EG' ? `${total.toLocaleString()}L.E` : `€${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`) : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Shipping</span>
                    <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">Pending</span>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-4 rounded-xl font-bold uppercase tracking-[0.15em] text-[10px] transition-all ${isSubmitting
                        ? 'bg-orange-500/50 cursor-not-allowed text-white/50'
                        : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/10'
                        }`}
                    >
                      {isSubmitting ? 'Processing...' : 'Place Order'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <ShieldCheck size={14} className="text-white/20" />
                  <p className="text-[8px] font-medium text-white/20 uppercase tracking-widest">
                    Safe & Secure Transmission
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper for series naming consistency
const productSeriesMap: Record<string, string> = {
  'METABOLIC': 'Metabolic',
  'REPAIR': 'Repair',
  'RESEARCH': 'Research'
};

export default Checkout;
