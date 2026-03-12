import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldCheck } from 'lucide-react';

const ValidationSearch: React.FC = () => {
    const [productId, setProductId] = useState('');
    const navigate = useNavigate();

    const handleValidate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!productId.trim()) return;
        
        // Clean the input and navigate to the verify page
        const token = productId.trim().toUpperCase();
        navigate(`/verify/${token}`);
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-5 sm:p-8 md:p-12 border border-gray-100 shadow-2xl shadow-gray-200/50">
                <form onSubmit={handleValidate} className="space-y-6 sm:space-y-8">
                    <div className="text-center space-y-3 sm:space-y-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 mx-auto border border-gray-100">
                            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">Batch Validation</h3>
                        <p className="text-xs sm:text-sm text-gray-400 font-medium px-2">Enter your 16-character alphanumeric security token below.</p>
                    </div>

                    <div className="relative group">
                        <input
                            type="text"
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            placeholder="e.g. A1B2C3D4E5F6G7H8"
                            className="w-full bg-white border-2 border-gray-200 rounded-xl px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg font-mono tracking-[0.2em] text-center focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all uppercase placeholder:normal-case placeholder:tracking-normal"
                            required
                        />
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-orange-500 transition-colors">
                            <Search size={24} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!productId.trim()}
                        className="w-full bg-black text-white rounded-xl py-4 sm:py-6 font-black uppercase tracking-widest text-sm flex items-center justify-center space-x-3 hover:bg-zinc-800 transition-colors min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 active:translate-y-0 duration-300 shadow-xl shadow-black/10"
                    >
                        <span>Authenticate Product</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ValidationSearch;
