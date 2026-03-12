import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useMessage } from '../context/MessageContext';
import type { Product } from '../products';
import FormattedText from './FormattedText';

interface InquiryModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

const InquiryModal: React.FC<InquiryModalProps> = ({ isOpen, onClose, product }) => {
    const { showMessage } = useMessage();
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !product) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isSubmitting) return;

        const form = e.currentTarget;
        const formData = new FormData(form);
        const name = (formData.get('name') as string)?.trim();
        const email = (formData.get('email') as string)?.trim();
        const phone = (formData.get('phone') as string)?.trim();
        const message = (formData.get('message') as string)?.trim();

        if (!name || !email || !message) {
            showMessage({
                variant: 'error',
                title: 'Missing information',
                message: 'Please fill in your name, email, and message before sending your inquiry.',
                buttonLabel: 'OK',
            });
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch('/api/send-inquiry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    message,
                    product: {
                        name: product.name,
                        slug: product.slug,
                        series: product.series,
                        price: product.priceEG,
                        shortDescription: product.shortDescription,
                    },
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send inquiry');
            }

            onClose();
            showMessage({
                variant: 'success',
                title: 'Inquiry sent',
                message: "We've received your inquiry and will respond within 24 hours.",
                buttonLabel: 'OK',
            });
            form.reset();
        } catch (error) {
            console.error(error);
            showMessage({
                variant: 'error',
                title: 'Unable to send inquiry',
                message: 'There was a problem sending your inquiry. Please try again in a moment or email support@novaralabs.eu directly.',
                buttonLabel: 'OK',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
                aria-hidden
            />

            <div
                className="relative bg-white w-full max-w-lg rounded-t-xl sm:rounded-xl shadow-xl flex flex-col max-h-[94vh] sm:max-h-[90vh]"
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
                                {product.shortDescription && (
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2 leading-tight">
                                        {product.shortDescription}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                        <div>
                            <label htmlFor="inquiry-name" className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 sm:mb-1.5">
                                Name
                            </label>
                            <input
                                id="inquiry-name"
                                name="name"
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
                                name="email"
                                type="email"
                                required
                                placeholder="you@lab.org"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label htmlFor="inquiry-phone" className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 sm:mb-1.5">
                                Phone Number (Optional)
                            </label>
                            <input
                                id="inquiry-phone"
                                name="phone"
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label htmlFor="inquiry-message" className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 sm:mb-1.5">
                                Message
                            </label>
                            <textarea
                                id="inquiry-message"
                                name="message"
                                rows={3}
                                placeholder="Quantity, shipping, or questions..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors resize-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            aria-busy={isSubmitting}
                            className={`w-full py-4 text-white font-bold uppercase tracking-wider text-sm rounded-xl transition-colors touch-manipulation min-h-[48px] flex items-center justify-center gap-2 ${isSubmitting
                                ? 'bg-orange-400 cursor-not-allowed opacity-80'
                                : 'bg-orange-500 hover:bg-orange-600'
                                }`}
                        >
                            {isSubmitting && (
                                <span
                                    className="inline-block w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin"
                                    aria-hidden="true"
                                />
                            )}
                            <span>{isSubmitting ? 'Sending…' : 'Send inquiry'}</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InquiryModal;
