import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
    quantity: number;
    onIncrease: () => void;
    onDecrease: () => void;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
    quantity,
    onIncrease,
    onDecrease,
    className = '',
    size = 'md',
}) => {
    const sizeClasses = {
        sm: 'h-8 px-2 text-[10px]',
        md: 'h-10 px-3 text-xs',
        lg: 'h-12 px-4 text-sm',
    };

    const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16;

    return (
        <div
            className={`flex items-center bg-gray-50 border border-gray-100 rounded-xl overflow-hidden ${sizeClasses[size]} ${className}`}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDecrease();
                }}
                className="p-1 hover:text-orange-500 transition-colors"
                aria-label="Decrease quantity"
            >
                <Minus size={iconSize} />
            </button>
            <span className="flex-1 text-center font-black tabular-nums min-w-[2rem]">
                {quantity}
            </span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onIncrease();
                }}
                className="p-1 hover:text-orange-500 transition-colors"
                aria-label="Increase quantity"
            >
                <Plus size={iconSize} />
            </button>
        </div>
    );
};

export default QuantitySelector;
