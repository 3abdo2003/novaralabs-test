import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Product } from '../products';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedPrice?: string;
  availableStock?: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, size?: string, price?: string) => Promise<void>;
  removeItem: (slug: string, size?: string) => void;
  setQuantity: (slug: string, quantity: number, size?: string) => Promise<void>;
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
          availableStock: typeof x.availableStock === 'number' ? x.availableStock : 99,
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

  const addItem = useCallback(async (product: Product, quantity: number = 1, size?: string, price?: string) => {
    const qty = clampInt(quantity, 1, 99);

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

    // We need to know current quantity for total requested
    const currentItem = items.find((i) => i.product.slug === product.slug && (i.selectedSize || '') === (finalSize || ''));
    const requestedTotal = (currentItem ? currentItem.quantity : 0) + qty;

    const res = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: product.slug, size: finalSize, quantity: requestedTotal })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to add item');
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.product.slug === product.slug && (i.selectedSize || '') === (finalSize || ''));
      if (!existing) return [...prev, { product, quantity: clampInt(qty, 1, data.availableStock), selectedSize: finalSize, selectedPrice: finalPrice, availableStock: data.availableStock }];
      return prev.map((i) =>
        i.product.slug === product.slug && (i.selectedSize || '') === (finalSize || '')
          ? { ...i, quantity: clampInt(i.quantity + qty, 1, data.availableStock), availableStock: data.availableStock }
          : i,
      );
    });
    openCart();
  }, [openCart, items]);

  const removeItem = useCallback((slug: string, size?: string) => {
    setItems((prev) => prev.filter((i) => !(i.product.slug === slug && (i.selectedSize || '') === (size || ''))));
  }, []);

  const setQuantity = useCallback(async (slug: string, quantity: number, size?: string) => {
    const qty = Math.max(1, quantity); // Backend sets max clamps

    const res = await fetch('/api/cart/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, size, quantity: qty })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update quantity');
    }

    setItems((prev) => prev.map((i) => (i.product.slug === slug && (i.selectedSize || '') === (size || '') ? { ...i, quantity: data.quantity, availableStock: data.availableStock } : i)));
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

