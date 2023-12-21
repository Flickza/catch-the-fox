import { create } from "zustand";

type Product = {
  stock: number;
  size: string;
  name: string;
  imgUrl: string;
  price: number;
  currency: string;
  id: BigInt;
};

const aggregateCartItems = (cartItems: Product[]): AggregatedProduct[] => {
  const aggregationMap = new Map<string, AggregatedProduct>();

  cartItems.forEach((item) => {
    const key = `${item.id}-${item.size}`;
    const existing = aggregationMap.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      aggregationMap.set(key, { ...item, count: 1 });
    }
  });

  return Array.from(aggregationMap.values());
};

export type AggregatedProduct = Product & { count: number };

export type CartState = {
  count: number;
  cart: Product[];
  aggregatedCart: AggregatedProduct[];
  addToCart: (object: Product) => void;
  removeFromCart: (id: BigInt, size: string) => void;
  removeAllCart: () => void;
  getAggregatedCart: () => void;
};

const useCart = create<CartState>((set) => ({
  count: 0,
  cart: [],
  addToCart: (object) =>
    set((state) => ({ count: state.count + 1, cart: [...state.cart, object] })),
  removeFromCart: (id: BigInt, size: string) =>
    set((state) => {
      const newCart = state.cart.filter(
        (item) => !(item.id === id && item.size === size),
      );
      return { ...state, cart: newCart, count: state.count - 1 };
    }),
  removeAllCart: () => set({ count: 0 }),
  aggregatedCart: [],
  getAggregatedCart: () => {
    set((state) => ({
      aggregatedCart: aggregateCartItems(state.cart),
    }));
  },
}));

export default useCart;
