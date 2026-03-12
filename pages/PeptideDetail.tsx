import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import InquiryModal from '../components/InquiryModal';
import { useRegion } from '../context/RegionContext';
import { useCart } from '../context/CartContext';
import { useMessage } from '../context/MessageContext';
import { findPeptideBySlug, peptides, type Product } from '../products';
import QuantitySelector from '../components/QuantitySelector';
import FormattedText from '../components/FormattedText';
import ProductImage from '../components/ProductImage';

const PeptideDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { region } = useRegion();
  const { addItem, items, setQuantity, removeItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedPrice, setSelectedPrice] = useState<string>('');
  const { showMessage } = useMessage();

  useEffect(() => {
    if (!slug) return;
    
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/products');
        const json = await res.json();
        
        let productsList = peptides;
        if (json.success) {
           productsList = json.data;
        }
        setAllProducts(productsList);
        
        const found = productsList.find((p: Product) => p.slug === slug) || findPeptideBySlug(slug);
        if (!found) {
          navigate('/peptides', { replace: true });
        } else {
          setProduct(found);
        }
      } catch (e) {
        console.error(e);
        const found = findPeptideBySlug(slug);
        if (!found) navigate('/peptides', { replace: true });
        else setProduct(found);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [slug, navigate]);

  useEffect(() => {
    if (!product) return;

    if (region === 'EG' && product.sizesEG && product.sizesEG.length > 0) {
      setSelectedSize(product.sizesEG[0].size);
      setSelectedPrice(product.sizesEG[0].price);
    } else if (region === 'WORLDWIDE' && product.sizesWorldwide && product.sizesWorldwide.length > 0) {
      setSelectedSize(product.sizesWorldwide[0].size);
      setSelectedPrice(product.sizesWorldwide[0].price);
    } else {
      setSelectedSize(product.size || '');
      setSelectedPrice(region === 'EG' ? product.priceEG : product.priceWorldwide);
    }
  }, [product, region]);

  if (loading) {
    return (
        <div className="bg-white min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-zinc-100 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
    );
  }

  if (!product) {
    return null;
  }

  const cartItem = items.find((i) => i.product.slug === product.slug && (region !== 'EG' || i.selectedSize === selectedSize));

  const currentVariantStock = (() => {
    if (region !== 'EG') return 99; // Assume unlimited for worldwide inquiries
    if (product.sizesEG && product.sizesEG.length > 0) {
      const variant = product.sizesEG.find(s => s.size === selectedSize);
      return variant ? (variant.stock || 0) : 0;
    }
    return product.stock || 0;
  })();

  const relatedProducts = (() => {
    const listToUse = allProducts.length > 0 ? allProducts : peptides;
    const sameSeries = listToUse.filter(
      (p) => p.slug !== product.slug && p.series === product.series,
    );
    if (sameSeries.length >= 3) return sameSeries.slice(0, 3);

    const others = listToUse.filter(
      (p) => p.slug !== product.slug && p.series !== product.series,
    );

    return [...sameSeries, ...others].slice(0, 3);
  })();

  return (
    <div className="bg-white min-h-screen">
      <div className="pt-28 sm:pt-32 lg:pt-40 px-4 sm:px-6 lg:px-12 pb-20 sm:pb-28 lg:pb-32 max-w-screen-2xl mx-auto">
        <button
          type="button"
          onClick={() => navigate('/peptides')}
          className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400 mb-6 hover:text-black transition-colors"
        >
          ← Back to Peptides
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 shadow-inner relative p-0">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent" />
            <div className="absolute w-64 h-64 lg:w-80 lg:h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full blur-3xl opacity-60" />
            <ProductImage
              src={product.image}
              imagePath={product.imagePath}
              fallbackSlug={product.slug}
              alt={product.name}
              className="relative z-10 w-full h-full object-contain scale-[1.4] lg:scale-[1.6]"
            />
          </div>

          <div className="space-y-6 lg:space-y-8">
            <div className="space-y-3">
              <div className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase">
                {product.series} SERIES
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-black uppercase tracking-tighter leading-[0.9]">
                {product.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm sm:text-base font-medium text-gray-600">
              <div>
                <div className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-1">
                  Price
                </div>
                <div className="text-xl sm:text-2xl font-black text-black">
                  {region === 'EG' ? selectedPrice : product.priceWorldwide}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-1">
                  Size
                </div>
                <div className="text-base sm:text-lg font-semibold text-black">{selectedSize}</div>
              </div>
              {region === 'EG' && currentVariantStock <= 5 && currentVariantStock > 0 && (
                <div>
                  <div className="text-[10px] font-black tracking-[0.2em] text-red-400 uppercase mb-1">
                    Stock
                  </div>
                  <div className="text-sm font-bold text-red-500">Only {currentVariantStock} left</div>
                </div>
              )}
            </div>

            {region === 'EG' && product.sizesEG && product.sizesEG.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xs font-black tracking-[0.25em] text-gray-400 uppercase">
                  Select Dosage
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {product.sizesEG.map((s) => (
                    <button
                      key={s.size}
                      onClick={() => {
                        setSelectedSize(s.size);
                        setSelectedPrice(s.price);
                      }}
                      className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${selectedSize === s.size
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg shadow-zinc-900/10'
                        : 'bg-white text-zinc-500 border-gray-100 hover:border-gray-300'
                        }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {region === 'WORLDWIDE' && product.sizesWorldwide && product.sizesWorldwide.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xs font-black tracking-[0.25em] text-gray-400 uppercase">
                  Select Dosage
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {product.sizesWorldwide.map((s) => (
                    <button
                      key={s.size}
                      onClick={() => {
                        setSelectedSize(s.size);
                        setSelectedPrice(s.price);
                      }}
                      className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${selectedSize === s.size
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg shadow-zinc-900/10'
                        : 'bg-white text-zinc-500 border-gray-100 hover:border-gray-300'
                        }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xs font-black tracking-[0.25em] text-gray-400 uppercase mb-3">
                Research Overview
              </h2>
              <FormattedText
                text={product.description}
                className="text-sm sm:text-base text-gray-600"
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              {region === 'EG' ? (
                <>
                  <h3 className="text-xs font-black tracking-[0.25em] text-gray-400 uppercase mb-3 text-orange-500">
                    Egypt Checkout
                  </h3>
                  <p className="text-sm text-gray-500 mb-6 max-w-sm">
                    Add this item to your cart, then checkout with Instapay or Cash on Delivery.
                  </p>

                  {currentVariantStock <= 0 ? (
                    <button
                      disabled
                      className="w-full sm:w-auto px-10 lg:px-12 py-4 lg:py-5 bg-gray-100 text-gray-400 rounded-xl font-black uppercase tracking-[0.18em] text-[10px] sm:text-xs cursor-not-allowed"
                    >
                      Out of Stock
                    </button>
                  ) : cartItem ? (
                    <div className="w-full sm:w-64">
                      <QuantitySelector
                        quantity={cartItem.quantity}
                        onIncrease={() => {
                          if (cartItem.availableStock !== undefined && cartItem.quantity >= cartItem.availableStock) {
                            showMessage({ variant: 'info', title: 'Stock Limit', message: `Only ${cartItem.availableStock} units available.`, buttonLabel: 'OK' });
                            return;
                          }
                          setQuantity(product.slug, cartItem.quantity + 1, selectedSize).catch(err => {
                            showMessage({ variant: 'error', title: 'Error', message: err.message, buttonLabel: 'OK' });
                          });
                        }}
                        onDecrease={() => {
                          if (cartItem.quantity > 1) {
                            setQuantity(product.slug, cartItem.quantity - 1, selectedSize).catch(err => showMessage({ variant: 'error', title: 'Error', message: err.message, buttonLabel: 'OK' }));
                          } else {
                            removeItem(product.slug, selectedSize);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        addItem(product, 1, selectedSize, selectedPrice).catch(err => {
                          showMessage({ variant: 'error', title: 'Stock Error', message: err.message, buttonLabel: 'OK' });
                        });
                      }}
                      className="w-full sm:w-auto px-10 lg:px-12 py-4 lg:py-5 bg-orange-500 text-white rounded-xl font-black uppercase tracking-[0.18em] text-[10px] sm:text-xs hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/10 hover:shadow-orange-500/30"
                    >
                      Add to cart
                    </button>
                  )}
                </>
              ) : (
                <>
                  <h3 className="text-xs font-black tracking-[0.25em] text-gray-400 uppercase mb-3">
                    Send Inquiry
                  </h3>
                  <p className="text-sm text-gray-500 mb-6 max-w-sm">
                    Provide your lab details, desired quantity, and any protocol considerations.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto px-10 lg:px-12 py-4 lg:py-5 bg-zinc-900 text-white rounded-xl font-black uppercase tracking-[0.18em] text-[10px] sm:text-xs hover:bg-black transition-all shadow-xl shadow-black/10"
                  >
                    Send Inquiry
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-16 lg:mt-24 border-t border-gray-100 pt-16 lg:pt-20">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-10">
              <div>
                <h2 className="text-xs font-black tracking-[0.3em] text-gray-400 uppercase mb-3">
                  Related Products
                </h2>
                <p className="text-sm sm:text-base text-gray-500 max-w-xl">
                  Explore additional compounds that complement this peptide in research protocols.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
              {relatedProducts.map((rp) => (
                <div
                  key={rp.slug}
                  className="group bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100 hover:border-black/5 hover:bg-white hover:shadow-2xl transition-all duration-500 flex flex-col"
                >
                  <Link to={`/peptides/${rp.slug}`} className="flex-1 flex flex-col">
                    <div className="aspect-square bg-white rounded-xl mb-6 flex items-center justify-center overflow-hidden border border-gray-100 shadow-inner relative group-hover:scale-[1.03] transition-all">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent" />
                      <ProductImage
                        src={rp.image}
                        imagePath={rp.imagePath}
                        fallbackSlug={rp.slug}
                        alt={rp.name}
                        className="relative z-10 w-full h-full object-contain scale-[1.3]"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="text-[9px] font-black tracking-[0.2em] text-gray-400 uppercase">
                        {rp.series}
                      </div>
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="text-xl font-black text-black uppercase tracking-tight">
                          {rp.name}
                        </h3>
                        <span className="text-base font-black text-black whitespace-nowrap">
                          {region === 'EG' ? rp.priceEG : rp.priceWorldwide}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <InquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
      />
    </div>
  );
};

export default PeptideDetail;
