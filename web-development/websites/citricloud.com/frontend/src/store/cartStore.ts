import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: number;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: 'completed' | 'processing' | 'pending';
  items: CartItem[];
  invoice?: {
    invoiceNumber: string;
    downloadUrl: string;
  };
}

interface CartState {
  items: CartItem[];
  orders: Order[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  createOrder: (items: CartItem[], total: number) => Order;
}

// Custom storage that uses cookies for cross-subdomain persistence
const cookieStorage = {
  getItem: (name: string) => {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        try {
          return decodeURIComponent(cookie.substring(nameEQ.length));
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  },
  setItem: (name: string, value: string) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const cookieValue = encodeURIComponent(value);
    document.cookie = `${name}=${cookieValue};expires=${expires.toUTCString()};path=/;domain=.citricloud.com`;
  },
  removeItem: (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.citricloud.com`;
  },
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      orders: [],
      
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
      
      createOrder: (items, total) => {
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        const order: Order = {
          id: Date.now().toString(),
          orderNumber,
          date: new Date().toISOString(),
          total,
          status: 'completed',
          items: [...items],
          invoice: {
            invoiceNumber,
            downloadUrl: `/api/invoices/${invoiceNumber}.pdf`,
          },
        };
        
        set((state) => ({
          orders: [order, ...state.orders],
        }));
        
        return order;
      },
    }),
    {
      name: 'citricloud-cart-storage',
      storage: createJSONStorage(() => cookieStorage),
    }
  )
);
