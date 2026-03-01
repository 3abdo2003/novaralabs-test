import React from 'react';
import { X } from 'lucide-react';
import { useMessage } from '../context/MessageContext';
import type { Product } from '../products';

interface InquiryModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

const InquiryModal: React.FC<InquiryModalProps> = ({ isOpen, onClose, product }) => {
    const { showMessage } = useMessage();

    if (!isOpen || !product) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // TODO: wire to your backend or email service
        onClose();
        showMessage({
            variant: 'success',
            title: 'Inquiry sent',
            message: "We'll respond within 24 hours.",
            buttonLabel: 'OK',
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
                aria-hidden
            />

            <div
                className="relative bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[94vh] sm:max-h-[90vh]"
                role="dialog"
                aria-modal="true"
                aria-labelledby="inquiry-title"
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors touch-manipulation"
                    aria-label="Close"
                >
                    <X size={22} />
                </button>

                <div className="flex-1 overflow-y-auto overscroll-contain">
                    <div className="p-4 sm:p-6 pt-14 sm:pt-6 border-b border-gray-100">
                        <div className="flex gap-3 sm:gap-4">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                                <img src={product.image} alt="" className="w-full h-full object-contain scale-110" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] sm:text-xs font-semibold tracking-wider text-gray-400 uppercase">{product.series}</p>
                                <h2 id="inquiry-title" className="text-lg sm:text-xl font-bold text-black uppercase tracking-tight mt-0.5 break-words">
                                    {product.name}
                                </h2>
                                <p className="text-xs sm:text-sm font-medium text-gray-600 mt-1">{product.price}</p>
                            </div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mt-3 sm:mt-4">
                            {product.shortDescription}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                        <div>
                            <label htmlFor="inquiry-name" className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 sm:mb-1.5">
                                Name
                            </label>
                            <input
                                id="inquiry-name"
                                type="text"
                                required
                                placeholder="Your name"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label htmlFor="inquiry-email" className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 sm:mb-1.5">
                                Email
                            </label>
                            <input
                                id="inquiry-email"
                                type="email"
                                required
                                placeholder="you@lab.org"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label htmlFor="inquiry-message" className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 sm:mb-1.5">
                                Message
                            </label>
                            <textarea
                                id="inquiry-message"
                                rows={3}
                                placeholder="Quantity, shipping, or questions..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors resize-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-4 bg-orange-500 text-white font-bold uppercase tracking-wider text-sm rounded-xl hover:bg-orange-600 transition-colors touch-manipulation min-h-[48px]"
                        >
                            Send inquiry
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InquiryModal;
