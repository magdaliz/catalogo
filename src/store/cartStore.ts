// src/store/cartStore.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem, Product } from "@/types/product";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // Acciones
  addItem: (
    producto: Product,
    cantidad?: number,
    color?: string,
    size?: string,
  ) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, cantidad: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Getters
  getTotal: () => number;
  getItemCount: () => number;
  getItemQuantity: (productId: string) => number;
  isInCart: (productId: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (producto, cantidad = 1, color, size) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) =>
              item.productId === producto.id &&
              item.selectedColor === color &&
              item.selectedSize === size,
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.productId === producto.id &&
                item.selectedColor === color &&
                item.selectedSize === size
                  ? { ...item, cantidad: item.cantidad + cantidad }
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                productId: producto.id,
                producto,
                cantidad,
                selectedColor: color,
                selectedSize: size,
              },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      updateQuantity: (productId, cantidad) => {
        if (cantidad <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, cantidad } : item,
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      getTotal: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.producto.precio * item.cantidad,
          0,
        );
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.cantidad, 0);
      },

      getItemQuantity: (productId) => {
        const { items } = get();
        const item = items.find((item) => item.productId === productId);
        return item?.cantidad || 0;
      },

      isInCart: (productId) => {
        const { items } = get();
        return items.some((item) => item.productId === productId);
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
