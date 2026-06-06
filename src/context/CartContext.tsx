"use client";

import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/services/supabase';

const CartContext = createContext<any>(null);

const cartReducer = (state: any, action: any) => {
  switch (action.type) {
    case 'INIT_CART':
      return { ...state, items: action.payload };
    case 'ADD_ITEM': {
      const existing = state.items.find((i: any) => i.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i: any) =>
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
      return { ...state, items: state.items.filter((i: any) => i.id !== action.payload) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((i: any) =>
          i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
        ).filter((i: any) => i.quantity > 0),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [toasts, setToasts] = useState<any[]>([]);
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
    setIsMounted(true);
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

  const subtotal = state.items.reduce((sum: number, item: any) => sum + item.mrp * item.quantity, 0);
  const discountAmount = Math.round(subtotal * discountPercent / 100);
  const total = subtotal - discountAmount;
  const itemCount = state.items.reduce((sum: number, item: any) => sum + item.quantity, 0);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.map((t: any) => t.id === id ? { ...t, hiding: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter((t: any) => t.id !== id));
      }, 300);
    }, 2000);
  }, []);

  const addItem = (product: any, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { ...product, quantity } });
    showToast(`Added ${product.name} to cart`);
  };

  const removeItem = (id: any) => dispatch({ type: 'REMOVE_ITEM', payload: id });

  const updateQuantity = (id: any, quantity: number) =>
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
        removeItem,
        updateQuantity,
        clearCart,
        discountPercent,
        DISCOUNT_PERCENT: discountPercent,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="toast-container fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast: any) => (
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
