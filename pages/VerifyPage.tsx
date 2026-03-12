import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, AlertTriangle, Shield, ArrowRight, Loader2, Package, Calendar, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VerifyPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [status, setStatus] = useState<'loading' | 'verified' | 'expired' | 'invalid' | 'error'>('loading');
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        if (token) {
            verifyToken();
        } else {
            setStatus('error');
        }
    }, [token]);

    const verifyToken = async () => {
        // Check if we already verified this token in this session to prevent refresh double-counting
        const cached = sessionStorage.getItem(`verified_${token}`);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                setData(parsed);
                setStatus(parsed.status);
                return;
            } catch (e) {
                sessionStorage.removeItem(`verified_${token}`);
            }
        }

        setStatus('loading');
        try {
            const res = await fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });
            const json = await res.json();
            
            if (json.success) {
                setStatus(json.status);
                setData(json);
                // Cache result for this session
                sessionStorage.setItem(`verified_${token}`, JSON.stringify(json));
            } else {
                setStatus(json.status || 'invalid');
            }
        } catch (error) {
            console.error('Verification failed:', error);
            setStatus('error');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" } as any
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-50/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-50/30 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-lg relative z-10">
                <Link to="/" className="flex justify-center mb-12">
                    <img src="/logo.png" alt="Novara Labs" className="h-10 w-auto" />
                </Link>

                <AnimatePresence mode="wait">
                    {status === 'loading' && (
                        <motion.div 
                            key="loading"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="text-center space-y-6"
                        >
                            <div className="relative w-24 h-24 mx-auto">
                                <div className="absolute inset-0 border-4 border-zinc-100 rounded-full" />
                                <div className="absolute inset-0 border-4 border-zinc-900 rounded-full border-t-transparent animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Shield className="w-8 h-8 text-zinc-300" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-zinc-900 uppercase tracking-widest mb-2">Authenticating</h1>
                                <p className="text-zinc-400 text-sm font-medium">Verifying security token with central distribution hub...</p>
                            </div>
                        </motion.div>
                    )}

                    {status === 'verified' && (
                        <motion.div 
                            key="verified"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-zinc-100 overflow-hidden"
                        >
                            <div className={`${data?.scanCount === 2 ? 'bg-orange-500' : 'bg-emerald-500'} p-12 text-center relative transition-colors duration-500`}>
                                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
                                    <div className="absolute animate-pulse bg-white/30 rounded-full w-64 h-64 -top-32 -right-32" />
                                </div>
                                <ShieldCheck className="w-20 h-20 text-white mx-auto relative z-10" />
                            </div>
                            
                            <div className="p-10 text-center space-y-8">
                                <div className="space-y-3">
                                    <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">
                                        {data?.scanCount === 2 ? 'Second Verification' : 'Product Verified'}
                                    </h2>
                                    <p className="text-zinc-500 font-medium leading-relaxed">
                                        {data?.scanCount === 2 ? (
                                            <>This is the <strong>second and final</strong> scan for this product. Further scans will result in an expired status for security purposes.</>
                                        ) : (
                                            <>This compound has been successfully authenticated against our master distribution catalog. You have acquired a genuine <strong>Novara Labs</strong> product.</>
                                        )}
                                    </p>
                                </div>

                                <div className="bg-zinc-50 rounded-3xl p-6 text-left space-y-4 border border-zinc-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-zinc-400 border border-zinc-100 shadow-sm">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Official Product</p>
                                            <p className="text-sm font-bold text-zinc-900">{data?.productName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-zinc-400 border border-zinc-100 shadow-sm">
                                            <RefreshCcw className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Scan Status</p>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-24 bg-zinc-200 rounded-full overflow-hidden">
                                                    <div className={`h-full ${data?.scanCount === 2 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: data?.scanCount === 1 ? '50%' : '100%' }} />
                                                </div>
                                                <p className="text-xs font-bold text-zinc-900">{data?.scanCount} / 2</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Link to="/" className="inline-flex items-center gap-3 bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all active:scale-[0.98]">
                                    Enter Official Store <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    {status === 'expired' && (
                        <motion.div 
                            key="expired"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-zinc-100 overflow-hidden"
                        >
                            <div className="bg-red-500 p-12 text-center relative">
                                <AlertTriangle className="w-20 h-20 text-white mx-auto" />
                            </div>
                            
                            <div className="p-10 text-center space-y-8">
                                <div className="space-y-3">
                                    <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">QR Code Expired</h2>
                                    <p className="text-zinc-500 font-medium leading-relaxed">
                                        This authentication token has reached its security scan limit (2/2) and is no longer valid for new verifications.
                                    </p>
                                </div>

                                <div className="bg-red-50/50 rounded-3xl p-6 text-left border border-red-100 space-y-4">
                                    <p className="text-xs font-bold text-red-900 leading-relaxed text-center">
                                        If you just scanned this for the second time, this is normal. If you've never scanned this before, please contact our support team.
                                    </p>
                                    <div className="pt-4 border-t border-red-100 flex items-center justify-between">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-red-400">Product Name</p>
                                        <p className="text-xs font-bold text-red-900 uppercase">{data?.productName}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Link to="/" className="inline-flex items-center justify-center gap-3 bg-zinc-900 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all">
                                        Return to Store
                                    </Link>
                                    <a href="mailto:support@novaralabs.eu" className="text-zinc-400 text-xs font-bold uppercase tracking-widest hover:text-zinc-900 transition-colors">
                                        Contact Technical Support
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {status === 'invalid' && (
                        <motion.div 
                            key="invalid"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="text-center space-y-8"
                        >
                            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-100">
                                <ShieldAlert className="w-12 h-12 text-red-500" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Authenticity Failure</h2>
                                <p className="text-zinc-500 font-medium leading-relaxed px-4">
                                    Warning: The token provided does not match any official Novara Labs compound record. Please exercise extreme caution as this product cannot be authenticated.
                                </p>
                            </div>
                            <div className="flex flex-col gap-4">
                                <Link to="/" className="inline-flex items-center justify-center gap-3 bg-zinc-900 text-white py-4 px-8 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all mx-auto">
                                    Secure Official Store
                                </Link>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">Ref: {token?.toUpperCase()}</p>
                            </div>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div 
                            key="error"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="text-center space-y-6"
                        >
                            <AlertTriangle className="w-16 h-16 text-zinc-300 mx-auto" />
                            <div>
                                <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-widest">Connection Error</h2>
                                <p className="text-zinc-500 text-sm">Synchronizing with the neural link failed. Please retry verification.</p>
                            </div>
                            <button 
                                onClick={verifyToken}
                                className="inline-flex items-center gap-2 text-orange-500 font-black uppercase tracking-widest text-[10px] hover:text-orange-600 transition-colors mx-auto"
                            >
                                <RefreshCcw className="w-3 h-3" /> Reconnect Link
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-20 pt-8 border-t border-zinc-100 w-full max-w-lg text-center opacity-30">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-900">&copy; {new Date().getFullYear()} Novara Labs Official Authentication Protocol</p>
            </div>
        </div>
    );
};

export default VerifyPage;
