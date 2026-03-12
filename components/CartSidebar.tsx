import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import QuantitySelector from './QuantitySelector';

import { useRegion } from '../context/RegionContext';
import { useMessage } from '../context/MessageContext';
import { parsePrice } from '../products';

const CartSidebar: React.FC = () => {
    const { isCartOpen, closeCart, items, removeItem, setQuantity, itemCount } = useCart();
    const { region } = useRegion();
    const { showMessage } = useMessage();
    const navigate = useNavigate();

    const total = items.reduce((sum, item) => {
        const pStr = region === 'EG'
            ? (item.selectedPrice || item.product.priceEG)
            : item.product.priceWorldwide;
        const price = pStr ? (parsePrice(pStr) || 0) : 0;
        return sum + price * item.quantity;
    }, 0);

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCart}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="w-5 h-5 text-orange-500" />
                                <h2 className="text-xl font-black uppercase tracking-tight">Your Cart</h2>
                                <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded-lg">
                                    {itemCount}
                                </span>
                            </div>
                            <button
                                onClick={closeCart}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center">
                                        <ShoppingBag className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase">Cart is empty</h3>
                                        <p className="text-sm text-gray-400">Add some research compounds to get started.</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            closeCart();
                                            navigate('/peptides');
                                        }}
                                        className="px-8 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                                    >
                                        Browse Catalog
                                    </button>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={`${item.product.slug}-${item.selectedSize}`} className="flex gap-4 group">
                                        <div className="w-20 h-20 bg-gray-50 rounded-2xl flex-shrink-0 overflow-hidden border border-gray-100 p-2">
                                            <img
                                                src={item.product.image}
                                                alt={item.product.name}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                                                        {item.product.series}
                                                    </div>
                                                    <h4 className="font-black uppercase tracking-tight text-sm">
                                                        {item.product.name}
                                                    </h4>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                                        {region === 'EG' ? (item.selectedSize || item.product.size) : item.product.size}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.product.slug, item.selectedSize)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <QuantitySelector
                                                    size="sm"
                                                    quantity={item.quantity}
                                                    onIncrease={() => {
                                                        if (item.availableStock !== undefined && item.quantity >= item.availableStock) {
                                                            showMessage({ variant: 'info', title: 'Stock Limit', message: `Only ${item.availableStock} units available in stock.`, buttonLabel: 'OK' });
                                                            return;
                                                        }
                                                        setQuantity(item.product.slug, item.quantity + 1, item.selectedSize).catch(err => {
                                                            showMessage({ variant: 'error', title: 'Error', message: err.message, buttonLabel: 'OK' });
                                                        });
                                                    }}
                                                    onDecrease={() => {
                                                        if (item.quantity > 1) {
                                                            setQuantity(item.product.slug, item.quantity - 1, item.selectedSize).catch(err => {
                                                                showMessage({ variant: 'error', title: 'Error', message: err.message, buttonLabel: 'OK' });
                                                            });
                                                        } else {
                                                            removeItem(item.product.slug, item.selectedSize);
                                                        }
                                                    }}
                                                />
                                                <span className="font-black text-sm text-black">
                                                    {region === 'EG' ? (item.selectedPrice || item.product.priceEG) : item.product.priceWorldwide}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Subtotal</span>
                                    <span className="text-2xl font-black text-black">
                                        {region === 'EG' ? `${total.toLocaleString()}L.E` : `€${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        onClick={() => {
                                            closeCart();
                                            navigate('/cart');
                                        }}
                                        className="w-full py-4 bg-white border border-gray-200 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-black transition-all flex items-center justify-center gap-2"
                                    >
                                        View Full Cart
                                    </button>
                                    <button
                                        onClick={() => {
                                            closeCart();
                                            navigate('/checkout');
                                        }}
                                        className="w-full py-4 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2"
                                    >
                                        Proceed to Checkout
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartSidebar;
