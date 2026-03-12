import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Product } from '../products';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedPrice?: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, size?: string, price?: string) => void;
  removeItem: (slug: string, size?: string) => void;
  setQuantity: (slug: string, quantity: number, size?: string) => void;
  updateItemSize: (slug: string, oldSize: string, newSize: string, newPrice: string) => void;
  clear: () => void;
  itemCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'novara_cart';

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((x) => x && typeof x === 'object')
        .map((x: any) => ({
          product: x.product,
          quantity: clampInt(Number(x.quantity), 1, 99),
          selectedSize: x.selectedSize,
          selectedPrice: x.selectedPrice,
        }))
        .filter((x) => x.product && typeof x.product.slug === 'string' && typeof x.product.name === 'string');
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      const current = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
      if (JSON.stringify(current) !== JSON.stringify(items)) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      }
    } catch {
      // ignore
    }
  }, [items]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addItem = useCallback((product: Product, quantity: number = 1, size?: string, price?: string) => {
    // Ensure we have a default size/price if not provided (Egypt region logic)
    let finalSize = size;
    let finalPrice = price;

    if (!finalSize && product.sizesEG && product.sizesEG.length > 0) {
      finalSize = product.sizesEG[0].size;
      finalPrice = product.sizesEG[0].price;
    } else if (!finalSize) {
      finalSize = product.size;
      finalPrice = product.priceEG;
    }

    // Determine max available stock for this variant or product
    let maxStock = product.stock || 0;
    if (finalSize && product.sizesEG) {
      const variant = product.sizesEG.find(s => s.size === finalSize);
      if (variant && variant.stock !== undefined) {
        maxStock = variant.stock;
      }
    }

    const qty = clampInt(quantity, 1, Math.max(1, maxStock));

    setItems((prev) => {
      const existing = prev.find((i) => i.product.slug === product.slug && (i.selectedSize || '') === (finalSize || ''));
      
      if (!existing) {
        // If not existing, just check against maxStock
        const safeQty = Math.min(qty, maxStock);
        if (safeQty <= 0) return prev; // Cannot add out of stock
        return [...prev, { product, quantity: safeQty, selectedSize: finalSize, selectedPrice: finalPrice }];
      }

      // If existing, check total quantity against maxStock
      const newTotal = clampInt(existing.quantity + qty, 1, maxStock);
      return prev.map((i) =>
        i.product.slug === product.slug && (i.selectedSize || '') === (finalSize || '')
          ? { ...i, quantity: newTotal }
          : i,
      );
    });
    openCart();
  }, [openCart]);

  const removeItem = useCallback((slug: string, size?: string) => {
    setItems((prev) => prev.filter((i) => !(i.product.slug === slug && (i.selectedSize || '') === (size || ''))));
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number, size?: string) => {
    setItems((prev) => prev.map((i) => {
      if (i.product.slug === slug && (i.selectedSize || '') === (size || '')) {
        // Determine stock limit
        let maxStock = i.product.stock || 0;
        if (i.selectedSize && i.product.sizesEG) {
          const variant = i.product.sizesEG.find(s => s.size === i.selectedSize);
          if (variant && variant.stock !== undefined) {
            maxStock = variant.stock;
          }
        }
        
        const qty = clampInt(quantity, 1, Math.max(1, maxStock));
        return { ...i, quantity: qty };
      }
      return i;
    }));
  }, []);

  const updateItemSize = useCallback((slug: string, oldSize: string, newSize: string, newPrice: string) => {
    setItems((prev) => {
      const target = prev.find(i => i.product.slug === slug && (i.selectedSize || '') === (oldSize || ''));
      if (!target) return prev;

      // Check if the new size already exists in the cart to merge them
      const existingNewSize = prev.find(i => i.product.slug === slug && (i.selectedSize || '') === (newSize || ''));

      if (existingNewSize) {
        return prev.filter(i => i !== target).map(i =>
          (i.product.slug === slug && (i.selectedSize || '') === (newSize || ''))
            ? { ...i, quantity: clampInt(i.quantity + target.quantity, 1, 99) }
            : i
        );
      }

      return prev.map((i) =>
        (i.product.slug === slug && (i.selectedSize || '') === (oldSize || ''))
          ? { ...i, selectedSize: newSize, selectedPrice: newPrice }
          : i
      );
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      setQuantity,
      updateItemSize,
      clear,
      itemCount,
      isCartOpen,
      openCart,
      closeCart
    }),
    [items, addItem, removeItem, setQuantity, updateItemSize, clear, itemCount, isCartOpen, openCart, closeCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}

