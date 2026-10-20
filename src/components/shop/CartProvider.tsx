"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  currency: string;
  image_url: string | null;
  stock_quantity: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  increaseItem: (id: string) => void;
  decreaseItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "ussx-kreativ-cart";

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // Ignore malformed local cart data.
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items)
    );
  }, [items, loaded]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">) => {
      setItems((current) => {
        const existing = current.find(
          (entry) => entry.id === item.id
        );

        if (existing) {
          return current.map((entry) =>
            entry.id === item.id
              ? {
                  ...entry,
                  quantity: Math.min(
                    entry.quantity + 1,
                    Math.max(item.stock_quantity, 1)
                  ),
                }
              : entry
          );
        }

        return [
          ...current,
          {
            ...item,
            quantity: 1,
          },
        ];
      });
    },
    []
  );

  const increaseItem = useCallback((id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.min(
                item.quantity + 1,
                Math.max(item.stock_quantity, 1)
              ),
            }
          : item
      )
    );
  }, []);

  const decreaseItem = useCallback((id: string) => {
    setItems((current) =>
      current
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) =>
      current.filter((item) => item.id !== id)
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
    [items]
  );

  const subtotalCents = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + item.price_cents * item.quantity,
        0
      ),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      subtotalCents,
      addItem,
      increaseItem,
      decreaseItem,
      removeItem,
      clearCart,
    }),
    [
      items,
      itemCount,
      subtotalCents,
      addItem,
      increaseItem,
      decreaseItem,
      removeItem,
      clearCart,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider."
    );
  }

  return context;
}
