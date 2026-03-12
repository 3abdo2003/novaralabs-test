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
  updateItemSize: (slug: string, oldSize: string, newSize: string, newPrice: string) => Promise<void>;
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

    let finalSize = size;
    let finalPrice = price;

    if (!finalSize && product.sizesEG && product.sizesEG.length > 0) {
      finalSize = product.sizesEG[0].size;
      finalPrice = product.sizesEG[0].price;
    } else if (!finalSize) {
      finalSize = product.size;
      finalPrice = product.priceEG;
    }

    const currentItem = items.find((i) => i.product.slug === product.slug && (i.selectedSize || '') === (finalSize || ''));
    const requestedTotal = (currentItem ? currentItem.quantity : 0) + qty;

    // Optimistic UI update
    let previousState: CartItem[] = [];
    setItems((prev) => {
      previousState = prev;
      const existing = prev.find((i) => i.product.slug === product.slug && (i.selectedSize || '') === (finalSize || ''));
      if (!existing) return [...prev, { product, quantity: qty, selectedSize: finalSize, selectedPrice: finalPrice, availableStock: 99 }];
      return prev.map((i) =>
        i.product.slug === product.slug && (i.selectedSize || '') === (finalSize || '')
          ? { ...i, quantity: i.quantity + qty }
          : i,
      );
    });
    openCart();

    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: product.slug, size: finalSize, quantity: requestedTotal })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add item');
      }

      // Sync exact available stock clamps from server
      setItems((prev) => {
        const existing = prev.find((i) => i.product.slug === product.slug && (i.selectedSize || '') === (finalSize || ''));
        if (!existing) return [...prev, { product, quantity: clampInt(qty, 1, data.availableStock), selectedSize: finalSize, selectedPrice: finalPrice, availableStock: data.availableStock }];
        return prev.map((i) =>
          i.product.slug === product.slug && (i.selectedSize || '') === (finalSize || '')
            ? { ...i, quantity: clampInt(i.quantity, 1, data.availableStock), availableStock: data.availableStock }
            : i,
        );
      });
    } catch (err) {
      // Rollback on failure safely targeting only this item
      setItems((prev) => {
        const existingInPrevious = previousState.find(p => p.product.slug === product.slug && (p.selectedSize || '') === (finalSize || ''));
        if (!existingInPrevious) {
          return prev.filter(p => !(p.product.slug === product.slug && (p.selectedSize || '') === (finalSize || '')));
        }
        return prev.map(i => {
          if (i.product.slug === product.slug && (i.selectedSize || '') === (finalSize || '')) {
            return { ...i, quantity: existingInPrevious.quantity };
          }
          return i;
        });
      });
      throw err;
    }
  }, [openCart, items]);

  const removeItem = useCallback((slug: string, size?: string) => {
    setItems((prev) => prev.filter((i) => !(i.product.slug === slug && (i.selectedSize || '') === (size || ''))));
  }, []);

  const setQuantity = useCallback(async (slug: string, quantity: number, size?: string) => {
    const qty = Math.max(1, quantity);

    // Optimistic UI update
    let previousState: CartItem[] = [];
    setItems((prev) => {
      previousState = prev;
      return prev.map((i) => (i.product.slug === slug && (i.selectedSize || '') === (size || '') ? { ...i, quantity: qty } : i));
    });

    try {
      const res = await fetch('/api/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, size, quantity: qty })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update quantity');
      }

      // Sync available stock limits from server without unconditionally overwriting newer optimistic updates
      setItems((prev) => prev.map((i) => {
        if (i.product.slug === slug && (i.selectedSize || '') === (size || '')) {
          return { ...i, quantity: clampInt(i.quantity, 1, data.availableStock), availableStock: data.availableStock };
        }
        return i;
      }));
    } catch (err) {
      // Rollback on failure by restoring the previous specific quantity
      setItems((prev) => prev.map((i) => {
        const oldItem = previousState.find(p => p.product.slug === slug && (p.selectedSize || '') === (size || ''));
        if (i.product.slug === slug && (i.selectedSize || '') === (size || '') && oldItem) {
            return { ...i, quantity: oldItem.quantity };
        }
        return i;
      }));
      throw err;
    }
  }, []);

  const updateItemSize = useCallback(async (slug: string, oldSize: string, newSize: string, newPrice: string) => {
    let previousState: CartItem[] = [];
    let targetQuantity = 1;

    setItems((prev) => {
      previousState = prev;
      const target = prev.find(i => i.product.slug === slug && (i.selectedSize || '') === (oldSize || ''));
      if (!target) return prev;
      targetQuantity = target.quantity;

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

    try {
      const res = await fetch('/api/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, size: newSize, quantity: targetQuantity })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error === 'OUT_OF_STOCK' ? 'This variant is currently out of stock.' : data.error || 'Failed to update item size');
      }

      setItems((prev) => prev.map((i) => {
        if (i.product.slug === slug && (i.selectedSize || '') === (newSize || '')) {
          return { ...i, quantity: clampInt(i.quantity, 1, data.availableStock), availableStock: data.availableStock };
        }
        return i;
      }));
    } catch (err) {
      setItems(previousState);
      throw err;
    }
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

