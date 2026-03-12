import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import { ShieldCheck, Handshake, Award, MessageCircle, FlaskConical, CheckCircle2 } from 'lucide-react';
import { findPeptideByName } from '../products';
import { useRegion } from '../context/RegionContext';

const Home: React.FC = () => {
    const { region } = useRegion();
    const revealProps = {
        initial: { opacity: 0, y: 50 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-100px" },
        transition: { duration: 0.8, ease: "easeOut" }
    } as const;

    const [featuredProducts, setFeaturedProducts] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchPeptides = async () => {
            try {
                const res = await fetch('/api/products');
                const json = await res.json();
                if (json.success && json.data.length > 0) {
                    setFeaturedProducts(json.data.slice(0, 4));
                } else {
                    setFeaturedProducts([
                        { name: 'CJC-IPAMORELIN', series: 'GROWTH', priceWorldwide: '€102.00', image: '/products/CJC-IPAMORELIN-removebg-preview.png', slug: 'cjc-ipamorelin' },
                        { name: 'MOTS-C', series: 'METABOLIC', priceWorldwide: '€90.00', image: '/products/MOTS-C-removebg-preview.png', slug: 'mots-c' },
                        { name: 'RETATRUTIDE', series: 'METABOLIC', priceWorldwide: '€95.00', image: '/products/RETATRUTIDE-removebg-preview.png', slug: 'retatrutide' },
                        { name: 'BPC157_TB500', series: 'REPAIR', priceWorldwide: '€107.00', image: '/products/BPC157_TB500-removebg-preview.png', slug: 'bpc157-tb500' }
                    ]);
                }
            } catch (e) {
                setFeaturedProducts([
                    { name: 'CJC-IPAMORELIN', series: 'GROWTH', priceWorldwide: '€102.00', image: '/products/CJC-IPAMORELIN-removebg-preview.png', slug: 'cjc-ipamorelin' },
                    { name: 'MOTS-C', series: 'METABOLIC', priceWorldwide: '€90.00', image: '/products/MOTS-C-removebg-preview.png', slug: 'mots-c' },
                    { name: 'RETATRUTIDE', series: 'METABOLIC', priceWorldwide: '€95.00', image: '/products/RETATRUTIDE-removebg-preview.png', slug: 'retatrutide' },
                    { name: 'BPC157_TB500', series: 'REPAIR', priceWorldwide: '€107.00', image: '/products/BPC157_TB500-removebg-preview.png', slug: 'bpc157-tb500' }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchPeptides();
    }, []);

    return (
        <div className="overflow-hidden">
            <Hero />

            {/* Quality Section - Free delivery, Highest quality, Online support */}
            <motion.section
                {...revealProps}
                className="bg-gray-100 py-16 sm:py-20 lg:py-32 px-4 sm:px-6 lg:px-12 border-t border-gray-200 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-orange-50/30 to-transparent pointer-events-none"></div>
                <div className="max-w-screen-2xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
                        <div className="flex gap-6 text-left items-start group">
                            <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shadow-inner border border-orange-100">
                                <Handshake className="w-10 h-10" aria-hidden />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight mb-2">Join Our Distribution Network</h2>
                                <p className="text-gray-500 leading-relaxed font-medium">Work directly with us as an authorized distributor and access bulk pricing, priority inventory, and branding support.</p>
                            </div>
                        </div>
                        <div className="flex gap-6 text-left items-start group">
                            <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shadow-inner border border-orange-100">
                                <Award className="w-10 h-10" aria-hidden />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight mb-2">Highest quality peptides</h2>
                                <p className="text-gray-500 leading-relaxed font-medium">Our products are scientifically-formulated and produced in cGMP facilities.</p>
                            </div>
                        </div>
                        <div className="flex gap-6 text-left items-start group">
                            <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shadow-inner border border-orange-100">
                                <MessageCircle className="w-10 h-10" aria-hidden />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight mb-2">Online support</h2>
                                <p className="text-gray-500 leading-relaxed font-medium">
                                    Have questions? We can help. Email us or connect with us via our{' '}
                                    <a href="/contact" className="text-orange-500 font-semibold hover:underline focus:underline">Contact</a>
                                    {' '}page.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Products Section */}
            <motion.section
                {...revealProps}
                className="bg-white py-16 sm:py-20 lg:py-32 px-4 sm:px-6 lg:px-12"
            >
                <div className="max-w-screen-2xl mx-auto">
                    <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end mb-10 sm:mb-12 lg:mb-20 gap-6 sm:gap-8 text-center lg:text-left">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl sm:text-4xl md:text-7xl font-black text-black uppercase tracking-tighter mb-4 sm:mb-6 lg:mb-8 leading-[0.9]">Featured<br />Research Compounds</h2>
                            <p className="text-lg md:text-xl text-gray-500 font-medium">Research-grade peptides with verified purity.</p>
                        </div>
                        <a
                            href="/peptides"
                            className="w-full lg:w-auto px-10 lg:px-12 py-4 lg:py-5 bg-orange-500 text-white rounded-xl font-black uppercase tracking-widest text-xs md:text-sm hover:bg-orange-600 transition-colors text-center min-h-[48px] flex items-center justify-center"
                        >
                            View All Peptides
                        </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                        {loading ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-gray-50 p-6 lg:p-10 rounded-2xl border border-gray-100 flex flex-col min-h-[420px] animate-pulse">
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
                            ))
                        ) : (
                            featuredProducts.map((product, i) => {
                                const href = `/peptides/${product.slug}`;

                                return (
                                    <div key={i} className="group bg-gray-50 p-6 lg:p-10 rounded-2xl border border-gray-100 hover:border-black/10 hover:shadow-2xl hover:bg-white transition-all duration-500 flex flex-col">
                                        <div className="aspect-square bg-white rounded-xl mb-8 lg:mb-10 flex items-center justify-center overflow-hidden border border-gray-50 shadow-inner group-hover:scale-[1.05] transition-all relative p-0">
                                            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent"></div>
                                            <div className="absolute w-48 h-48 lg:w-64 lg:h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                            <img 
                                              src={product.image || `/products/${product.slug}.png`} 
                                              alt={product.name} 
                                              className="relative z-10 w-full h-full object-contain scale-[1.4] lg:scale-[1.6]" 
                                              onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                if (!target.src.includes(`/products/${product.slug}.png`)) {
                                                    target.src = `/products/${product.slug}.png`;
                                                }
                                              }}
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-1">{product.series}</div>
                                                    <h4 className="text-2xl font-black text-black uppercase tracking-tight">{product.name}</h4>
                                                </div>
                                                <span className="font-black text-black">
                                                    {region === 'EG' ? (product.priceEG?.replace(' L.E', 'L.E') || product.priceWorldwide) : product.priceWorldwide}
                                                </span>
                                            </div>
                                            <div className="mt-auto pt-6 border-t border-gray-100">
                                                <Link
                                                    to={href}
                                                    className="block w-full py-4 bg-orange-500 text-white rounded-xl font-black uppercase tracking-[0.15em] text-[10px] hover:bg-orange-600 transition-colors shadow-xl shadow-orange-500/5 text-center"
                                                >
                                                    View product
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </motion.section>

            {/* About Summary */}
            <motion.section
                {...revealProps}
                className="bg-zinc-950 py-16 sm:py-24 lg:py-40 px-4 sm:px-6 lg:px-12 relative overflow-hidden"
            >
                <div className="max-w-screen-2xl mx-auto flex flex-col items-center text-center relative z-10">
                    <h2 className="text-xs lg:text-sm font-black tracking-[0.4em] text-orange-500 uppercase mb-8 sm:mb-12 lg:mb-16 underline decoration-orange-500 decoration-2 underline-offset-8">The Novara Labs Mission</h2>
                    <p className="text-2xl sm:text-3xl md:text-6xl font-black text-white max-w-5xl leading-tight uppercase tracking-tighter px-2 sm:px-4 lg:px-0">
                        We support <span className="text-white/40 italic">peak research performance</span> through <span className="text-white/40 italic">advanced peptide science</span>.
                    </p>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] lg:w-[800px] h-[300px] lg:h-[800px] bg-white/[0.03] blur-[100px] lg:blur-[150px] rounded-full pointer-events-none"></div>
            </motion.section>

            {/* Validation Section */}
            <motion.section
                {...revealProps}
                className="bg-white py-16 sm:py-24 lg:py-40 px-4 sm:px-6 lg:px-12 relative overflow-hidden border-t border-gray-100"
            >
                <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-24 items-center relative z-10">
                    <div className="space-y-6 sm:space-y-8 lg:space-y-12 text-center lg:text-left">
                        <div className="text-[10px] font-black tracking-[0.4em] text-gray-400 uppercase">Enterprise Security</div>
                        <h2 className="text-3xl sm:text-4xl md:text-8xl font-black text-black uppercase tracking-tighter leading-[0.8]">
                            Verify Your <br />
                            <span className="text-gray-300 italic">Batch.</span>
                        </h2>
                        <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                            Every product comes with a 12-digit code on the box. Scratch to verify authenticity.
                        </p>
                        <div className="flex items-center justify-center lg:justify-start space-x-6 lg:space-x-8">
                            <div className="flex -space-x-3">
                                {[
                                    { image: '/eu_ce.png', color: 'bg-white', label: 'EU CE Certified', scale: 'scale-[1.3]' },
                                    { image: '/IsoCert.png', color: 'bg-white', label: 'ISO 9001:2015', scale: 'scale-[1.5]' },
                                    { image: '/cgmp-GOL.png', color: 'bg-white', label: 'cGMP Certified', scale: 'scale-[2.6]' },
                                ].map((badge, i) => (
                                    <div
                                        key={i}
                                        className={`w-9 h-9 lg:w-11 lg:h-11 rounded-full ${badge.color} border-2 border-white flex items-center justify-center text-white shadow-lg relative overflow-hidden`}
                                        title={badge.label}
                                    >
                                        <img
                                            src={badge.image}
                                            alt={badge.label}
                                            className={`w-full h-full object-contain ${badge.scale || 'scale-100'}`}
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Quality verified by international standards</p>
                        </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 sm:p-8 md:p-16 shadow-2xl shadow-gray-200/50">
                        <div className="space-y-8 lg:space-y-10">
                            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-2xl shadow-orange-500/20 mb-8 lg:mb-10 mx-auto">
                                <ShieldCheck className="w-8 h-8 lg:w-10 lg:h-10" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl lg:text-2xl font-black text-black uppercase tracking-tight mb-4">Quick Validation</h3>
                            </div>
                            <button
                                onClick={() => window.location.href = '/validate'}
                                className="w-full bg-orange-500 text-white rounded-xl py-5 lg:py-6 font-black uppercase tracking-widest text-xs md:text-sm hover:bg-orange-600 transition-colors shadow-2xl shadow-orange-500/10"
                            >
                                Go to Validation Center
                            </button>
                        </div>
                    </div>
                </div>
                <div className="absolute -bottom-1/2 -left-1/4 w-[500px] lg:w-[1000px] h-[500px] lg:h-[1000px] bg-gray-100 blur-[100px] lg:blur-[150px] rounded-full pointer-events-none opacity-50"></div>
            </motion.section>

            {/* Contact CTA */}
            <motion.section
                {...revealProps}
                className="bg-black py-12 sm:py-20 lg:py-32 px-4 sm:px-6 lg:px-12"
            >
                <div className="max-w-screen-2xl mx-auto bg-white rounded-2xl p-6 sm:p-10 lg:p-32 text-center text-black relative overflow-hidden group shadow-2xl shadow-white/5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <h2 className="text-2xl sm:text-3xl md:text-8xl font-black uppercase tracking-tighter mb-6 sm:mb-8 lg:mb-12 leading-none relative z-10 px-2 sm:px-4">
                        Ready to Launch<br className="hidden md:block" />Your Peptide Brand?
                    </h2>
                    <p className="text-gray-500 mb-8 sm:mb-10 lg:mb-16 text-base sm:text-lg lg:text-xl max-w-xl mx-auto font-medium relative z-10 px-2">
                        Partner with us for bulk supply, private labeling, and exclusive distribution opportunities.
                    </p>
                    <a
                        href="/contact"
                        className="relative z-10 inline-block px-8 sm:px-10 lg:px-16 py-4 lg:py-6 bg-orange-500 text-white rounded-xl font-black uppercase tracking-widest text-sm lg:text-lg hover:bg-orange-600 transition-colors shadow-2xl shadow-orange-500/20 min-h-[48px] flex items-center justify-center"
                    >
                        Apply Now
                    </a>
                </div>
            </motion.section>
        </div>
    );
};

export default Home;
