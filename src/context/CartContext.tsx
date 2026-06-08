"use client";

import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/services/supabase';

export interface CartItem {
  id: string;
  name: string;
  mrp: number;
  quantity: number;
  category?: string;
  image?: string;
  selectedSize?: string;
  wholesale_discount?: number;
  min_wholesale_qty?: number;
  [key: string]: unknown;
}

interface CartState {
  items: CartItem[];
}

interface ToastMessage {
  id: number;
  message: string;
  hiding?: boolean;
}

type CartAction =
  | { type: 'INIT_CART'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

export interface CartContextType {
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  itemCount: number;
  addItem: (product: Omit<CartItem, 'quantity'> & { quantity?: number }, quantity?: number) => void;
  addToCart: (product: Omit<CartItem, 'quantity'> & { quantity?: number }, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  discountPercent: number;
  DISCOUNT_PERCENT: number;
  wholesaleItemsCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'INIT_CART':
      return { ...state, items: action.payload };
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + (action.payload.quantity || 1) }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }],
      };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
        ).filter((i) => i.quantity > 0),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(5);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hanuman-cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.items) {
          dispatch({ type: 'INIT_CART', payload: parsed.items });
        }
      }
    } catch (e) {}
    setTimeout(() => setIsMounted(true), 0);
  }, []);

  // Save to local storage on changes (only after mount)
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('hanuman-cart', JSON.stringify(state));
    }
  }, [state, isMounted]);

  useEffect(() => {
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'default_discount')
      .single()
      .then(({ data }) => {
        if (data) {
          const value = Number(data.value);
          if (Number.isFinite(value)) setDiscountPercent(value);
        }
      });
  }, []);

  const subtotal = state.items.reduce((sum: number, item: CartItem) => sum + item.mrp * item.quantity, 0);
  
  // Calculate wholesale discounts
  let wholesaleDiscountAmount = 0;
  let wholesaleItemsCount = 0;
  
  state.items.forEach((item: CartItem) => {
    if (item.min_wholesale_qty && item.quantity >= item.min_wholesale_qty) {
      wholesaleItemsCount++;
      const wDiscount = item.wholesale_discount || 10;
      wholesaleDiscountAmount += (item.mrp * item.quantity * wDiscount) / 100;
    }
  });

  // Regular discount applies to non-wholesale items (or all items, depending on logic. Usually wholesale overrides regular)
  // Let's assume the regular discount applies to the remaining amount or we just add them.
  const regularDiscountAmount = Math.round((subtotal - wholesaleDiscountAmount) * discountPercent / 100);
  
  const discountAmount = Math.round(wholesaleDiscountAmount + regularDiscountAmount);
  const total = subtotal - discountAmount;
  const itemCount = state.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.map((t) => t.id === id ? { ...t, hiding: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter((t) => t.id !== id));
      }, 300);
    }, 2000);
  }, []);

  const addItem = (product: Omit<CartItem, 'quantity'> & { quantity?: number }, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { ...product, quantity } as CartItem });
    showToast(`Added ${product.name} to cart`);
  };

  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id });

  const updateQuantity = (id: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });

  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  // Don't render children until mounted to prevent hydration errors,
  // or just render but return empty cart state initially.
  // We'll render children normally but cart will be empty on first render.

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        subtotal,
        discountAmount,
        total,
        itemCount,
        addItem,
        addToCart: addItem,
        removeItem,
        updateQuantity,
        clearCart,
        discountPercent,
        DISCOUNT_PERCENT: discountPercent,
        wholesaleItemsCount,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="toast-container fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className={`bg-black text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 transition-opacity duration-300 ${toast.hiding ? 'opacity-0' : 'opacity-100'}`}>
            <span style={{ color: '#10B981' }}>✔</span>
            {toast.message}
          </div>
        ))}
      </div>
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
