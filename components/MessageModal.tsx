import React from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type MessageVariant = 'success' | 'error' | 'warning' | 'info';

export interface MessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    variant: MessageVariant;
    title: string;
    message: string;
    buttonLabel?: string;
}

const variantConfig = {
    success: {
        icon: CheckCircle2,
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        border: 'border-emerald-100',
        button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        ring: 'focus:ring-emerald-500/30',
    },
    error: {
        icon: AlertCircle,
        iconBg: 'bg-red-50',
        iconColor: 'text-red-600',
        border: 'border-red-100',
        button: 'bg-red-600 hover:bg-red-700 text-white',
        ring: 'focus:ring-red-500/30',
    },
    warning: {
        icon: AlertTriangle,
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
        border: 'border-amber-100',
        button: 'bg-amber-500 hover:bg-amber-600 text-white',
        ring: 'focus:ring-amber-500/30',
    },
    info: {
        icon: Info,
        iconBg: 'bg-sky-50',
        iconColor: 'text-sky-600',
        border: 'border-sky-100',
        button: 'bg-sky-600 hover:bg-sky-700 text-white',
        ring: 'focus:ring-sky-500/30',
    },
} as const;

const MessageModal: React.FC<MessageModalProps> = ({
    isOpen,
    onClose,
    variant,
    title,
    message,
    buttonLabel = 'OK',
}) => {
    if (!isOpen) return null;

    const config = variantConfig[variant];
    const Icon = config.icon;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="message-modal-title"
            aria-describedby="message-modal-desc"
        >
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
                onClick={onClose}
                aria-hidden
            />

            <div
                className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-3 right-3 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors touch-manipulation"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                <div className="p-6 sm:p-8 pt-14 sm:pt-8 text-center">
                    <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-xl flex items-center justify-center ${config.iconBg} ${config.iconColor} border ${config.border}`}
                    >
                        <Icon className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2} />
                    </div>
                    <h2
                        id="message-modal-title"
                        className="mt-4 sm:mt-5 text-lg sm:text-xl font-black text-black uppercase tracking-tight"
                    >
                        {title}
                    </h2>
                    <p
                        id="message-modal-desc"
                        className="mt-2 text-sm sm:text-base text-gray-500 leading-relaxed max-w-xs mx-auto"
                    >
                        {message}
                    </p>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`mt-6 sm:mt-8 w-full py-3.5 sm:py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-colors touch-manipulation min-h-[48px] ${config.button}`}
                    >
                        {buttonLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageModal;
