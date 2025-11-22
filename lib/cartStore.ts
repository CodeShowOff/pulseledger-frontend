import { create } from "zustand";
import { persist, createJSONStorage, PersistOptions } from "zustand/middleware";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  coachId: string;
  quantity: number;
};

interface CartState {
  items: CartItem[];
  coachId: string | null;
  selectedVoucherCode: string | null;
  selectedVoucherPercent: number | null;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  setVoucher: (code: string | null, percent: number | null) => void;
}

type CartPersistedState = Pick<CartState, "items" | "coachId" | "selectedVoucherCode" | "selectedVoucherPercent">;

const persistConfig: PersistOptions<CartState, CartPersistedState> = {
  name: "cart-storage",
  partialize: (state) => ({
    items: state.items,
    coachId: state.coachId,
    selectedVoucherCode: state.selectedVoucherCode,
    selectedVoucherPercent: state.selectedVoucherPercent,
  }),
};

if (typeof window !== "undefined") {
  persistConfig.storage = createJSONStorage<CartPersistedState>(() => window.localStorage);
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      coachId: null,
      selectedVoucherCode: null,
      selectedVoucherPercent: null,
      addItem: (item, quantity = 1) => {
        if (quantity <= 0) return;
        set((state) => {
          const { items, coachId } = state;
          if (coachId && coachId !== item.coachId) {
            return state; // guard; caller should handle this scenario
          }
          const existing = items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              ...state,
              items: items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return {
            ...state,
            coachId: coachId ?? item.coachId,
            items: [...items, { ...item, quantity }],
          };
        });
      },
      updateQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            const filtered = state.items.filter((i) => i.productId !== productId);
            return {
              ...state,
              items: filtered,
              coachId: filtered.length ? state.coachId : null,
            };
          }
          return {
            ...state,
            items: state.items.map((i) =>
              i.productId === productId ? { ...i, quantity } : i
            ),
          };
        });
      },
      removeItem: (productId) => {
        set((state) => {
          const filtered = state.items.filter((i) => i.productId !== productId);
          return {
            ...state,
            items: filtered,
            coachId: filtered.length ? state.coachId : null,
          };
        });
      },
      clearCart: () => set({ items: [], coachId: null, selectedVoucherCode: null, selectedVoucherPercent: null }),
      setVoucher: (code, percent) =>
        set((state) => ({
          ...state,
          selectedVoucherCode: code,
          selectedVoucherPercent: percent,
        })),
    }),
    persistConfig
  )
);
