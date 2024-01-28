import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Product = {
  stock: number;
  size: string;
  name: string;
  imgUrl: string;
  price: number;
  currency: string;
  id: number;
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
  decreaseQuantity: (id: number, size: string) => void;
  removeFromCart: (id: number, size: string) => void;
  removeAllCart: () => void;
  getAggregatedCart: () => void;
};

const useCart = create(
  persist<CartState>(
    (set) => ({
      cart: [],
      count: 0,
      addToCart: (object) =>
        set((state) => {
          const newCart = [...state.cart, object];
          const newAggregatedCart = aggregateCartItems(newCart);
          return {
            count: state.count + 1,
            cart: newCart,
            aggregatedCart: newAggregatedCart,
          };
        }),
      decreaseQuantity: (id: number, size: string) =>
        set((state) => {
          let found = false;
          const newCart = state.cart.reduce((acc: Product[], item) => {
            if (item.id === id && item.size === size && !found) {
              found = true;
              return acc;
            }
            return [...acc, item];
          }, [] as Product[]);

          // Recalculate the aggregated cart
          const newAggregatedCart = aggregateCartItems(newCart);

          return { ...state, cart: newCart, aggregatedCart: newAggregatedCart };
        }),
      removeFromCart: (id: number, size: string) =>
        set((state) => {
          const newCart = state.cart.filter(
            (item) => !(item.id === id && item.size === size),
          );
          return { ...state, cart: newCart, count: state.count - 1 };
        }),
      removeAllCart: () =>
        set((state) => {
          return { ...state, cart: [], count: 0 };
        }),
      aggregatedCart: [],
      getAggregatedCart: () => {
        set((state) => ({
          aggregatedCart: aggregateCartItems(state.cart),
        }));
      },
    }),
    {
      name: "cart-storage", // unique name
      // (optional) by default the 'localStorage' is used
    },
  ),
);
export default useCart;
