import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import InquiryModal from '../components/InquiryModal';
import { useRegion } from '../context/RegionContext';
import { useCart } from '../context/CartContext';
import { useMessage } from '../context/MessageContext';
import { peptides, findPeptideByName, type Product } from '../products';
import QuantitySelector from '../components/QuantitySelector';

const Peptides: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [dynamicPeptides, setDynamicPeptides] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { region, setRegion } = useRegion();
    const { addItem, items, setQuantity, removeItem } = useCart();
    const { showMessage } = useMessage();

    useEffect(() => {
        const fetchPeptides = async () => {
            try {
                const res = await fetch('/api/products');
                const json = await res.json();
                if (json.success) setDynamicPeptides(json.data);
                else setDynamicPeptides(peptides); // Fallback to local
            } catch (e) {
                setDynamicPeptides(peptides); // Fallback to local
            } finally {
                setLoading(false);
            }
        };
        fetchPeptides();
    }, []);

    const handleInquiry = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    useEffect(() => {
        const inquiry = searchParams.get('inquiry');
        if (!inquiry || loading) return;
        const product = dynamicPeptides.find(p => p.name === decodeURIComponent(inquiry!)) || findPeptideByName(decodeURIComponent(inquiry));
        if (product) {
            setSelectedProduct(product);
            setIsModalOpen(true);
        }
        setSearchParams({}, { replace: true });
    }, [searchParams, setSearchParams, dynamicPeptides, loading]);

    if (loading) return (
        <div className="bg-white min-h-screen">
            <div className="pt-28 sm:pt-32 lg:pt-40 px-4 sm:px-6 lg:px-12 pb-16 sm:pb-24 lg:pb-32 max-w-screen-2xl mx-auto">
                 <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end mb-10 sm:mb-12 lg:mb-20 gap-6 sm:gap-8 text-center lg:text-left animate-pulse">
                    <div className="max-w-2xl w-full">
                        <div className="h-4 w-32 bg-gray-100 rounded mb-4"></div>
                        <div className="h-16 lg:h-24 w-64 bg-gray-100 rounded-xl mb-6"></div>
                        <div className="h-6 w-full max-w-md bg-gray-100 rounded"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="bg-gray-50 p-4 sm:p-6 lg:p-10 rounded-2xl border border-gray-100 flex flex-col min-h-[460px] animate-pulse">
                            <div className="aspect-square bg-white rounded-xl mb-8 flex items-center justify-center overflow-hidden border border-gray-50">
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50"></div>
                            </div>
                            <div className="space-y-4 flex-1">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2 w-1/2">
                                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                                        <div className="h-6 w-32 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <div className="w-full h-[52px] bg-gray-200 rounded-xl"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white min-h-screen">
            <div className="pt-28 sm:pt-32 lg:pt-40 px-4 sm:px-6 lg:px-12 pb-16 sm:pb-24 lg:pb-32 max-w-screen-2xl mx-auto">
                <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end mb-10 sm:mb-12 lg:mb-20 gap-6 sm:gap-8 text-center lg:text-left">
                    <div className="max-w-2xl">
                        <div className="text-[10px] font-black tracking-[0.4em] text-gray-300 uppercase mb-3 sm:mb-4">Research Catalog 2026</div>
                        <h1 className="text-3xl sm:text-4xl md:text-8xl font-black text-black uppercase tracking-tighter leading-[0.8] mb-6 sm:mb-8">
                            Advanced <br />Peptides
                        </h1>
                        <p className="text-lg md:text-2xl text-gray-400 font-medium leading-relaxed">
                            Synthesized with 99%+ purity profiles for high-precision laboratory environments.
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded-2xl border border-gray-100 backdrop-blur-sm self-center lg:self-end">
                        <button
                            type="button"
                            onClick={() => setRegion('EG')}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${region === 'EG' ? 'bg-white text-orange-500 shadow-xl shadow-black/5' : 'text-gray-400 hover:text-black'}`}
                        >
                            Egypt
                        </button>
                        <button
                            type="button"
                            onClick={() => setRegion('WORLDWIDE')}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${region === 'WORLDWIDE' ? 'bg-white text-orange-500 shadow-xl shadow-black/5' : 'text-gray-400 hover:text-black'}`}
                        >
                            Worldwide
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
                    {dynamicPeptides.map((product) => {
                        const cartItem = items.find(i => i.product.slug === product.slug);

                        return (
                            <div
                                key={product.slug}
                                className="group bg-gray-50 p-3 sm:p-6 lg:p-10 rounded-2xl border border-gray-100 hover:border-black/10 hover:shadow-2xl hover:bg-white transition-all duration-500 flex flex-col"
                            >
                                <Link
                                    to={`/peptides/${product.slug}`}
                                    className="flex-1 flex flex-col"
                                >
                                    <div className="aspect-square bg-white rounded-xl mb-4 lg:mb-10 flex items-center justify-center overflow-hidden border border-gray-50 shadow-inner group-hover:scale-[1.03] transition-all relative p-0">
                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent"></div>
                                        <img 
                                          src={product.image || `/products/${product.slug}.png`} 
                                          alt={product.name} 
                                          className="relative z-10 w-full h-full object-contain scale-[1.3] lg:scale-[1.6]" 
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            if (!target.src.includes(`/products/${product.slug}.png`)) {
                                                target.src = `/products/${product.slug}.png`;
                                            }
                                          }}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                            <div>
                                                <div className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-1">{product.series}</div>
                                                <h4 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">{product.name}</h4>
                                            </div>
                                            <span className="font-black text-black text-sm sm:text-base whitespace-nowrap">
                                                {region === 'EG' ? product.priceEG?.replace(/ L\.E/i, 'L.E') : product.priceWorldwide}
                                            </span>
                                        </div>
                                    </div>
                                </Link>

                                <div className="mt-auto pt-6 border-t border-gray-100">
                                    {region === 'EG' ? (
                                        (product.sizesEG && product.sizesEG.length > 1) ? (
                                            <Link
                                                to={`/peptides/${product.slug}`}
                                                className="w-full py-4 bg-orange-500 text-white rounded-xl font-black uppercase tracking-[0.15em] text-[10px] hover:bg-orange-600 hover:shadow-orange-500/40 transition-all shadow-xl shadow-orange-500/10 flex items-center justify-center"
                                            >
                                                Select Options
                                            </Link>
                                        ) : cartItem ? (
                                            <QuantitySelector
                                                quantity={cartItem.quantity}
                                                onIncrease={() => setQuantity(product.slug, cartItem.quantity + 1, cartItem.selectedSize)}
                                                onDecrease={() => {
                                                    if (cartItem.quantity > 1) {
                                                        setQuantity(product.slug, cartItem.quantity - 1, cartItem.selectedSize);
                                                    } else {
                                                        removeItem(product.slug, cartItem.selectedSize);
                                                    }
                                                }}
                                                className="w-full"
                                            />
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    addItem(product, 1);
                                                }}
                                                className="w-full py-4 bg-orange-500 text-white rounded-xl font-black uppercase tracking-[0.15em] text-[10px] hover:bg-orange-600 hover:shadow-orange-500/40 transition-all shadow-xl shadow-orange-500/10"
                                            >
                                                Add to cart
                                            </button>
                                        )
                                    ) : (
                                        (product.sizesWorldwide && product.sizesWorldwide.length > 1) ? (
                                            <Link
                                                to={`/peptides/${product.slug}`}
                                                className="w-full py-4 bg-zinc-900 text-white rounded-xl font-black uppercase tracking-[0.15em] text-[10px] hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center justify-center"
                                            >
                                                Select Options
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={() => handleInquiry(product)}
                                                className="w-full py-4 bg-zinc-900 text-white rounded-xl font-black uppercase tracking-[0.15em] text-[10px] hover:bg-black transition-all shadow-xl shadow-black/10"
                                            >
                                                Send Inquiry
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Validation CTA Section */}
            <section className="bg-zinc-950 py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-12">
                <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 text-center lg:text-left">
                    <div className="max-w-xl">
                        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-8 leading-[0.9]">
                            Authenticity <br />
                            <span className="text-white/40 italic">Guaranteed.</span>
                        </h2>
                        <p className="text-white/60 text-base md:text-lg font-medium mb-10">
                            Every vial produced by Novara Labs Research Group comes with a unique verification ID. Scan or enter your code to access third-party HPLC analysis reports instantly.
                        </p>
                        <a
                            href="/validate"
                            className="inline-block bg-orange-500 text-white px-10 lg:px-12 py-4 lg:py-5 rounded-xl font-black uppercase tracking-widest text-xs md:text-sm hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20"
                        >
                            Validate Now
                        </a>
                    </div>
                    <div className="w-full max-w-sm lg:max-w-md aspect-square bg-white/[0.03] border border-white/10 rounded-2xl p-10 lg:p-12 flex flex-col items-center justify-center space-y-8 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-20 h-20 lg:w-24 lg:h-24 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-2xl shadow-orange-500/20">
                            <span className="text-2xl lg:text-3xl font-black">ID</span>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="text-white/20 font-mono tracking-widest uppercase text-xs lg:text-base">Batch #88291-B</div>
                            <div className="text-white font-mono text-lg lg:text-xl tracking-[0.3em] lg:tracking-[0.4em]">NOV-00-XXXX</div>
                        </div>
                    </div>
                </div>
            </section>

            <InquiryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
            />
        </div>
    );
};

export default Peptides;
