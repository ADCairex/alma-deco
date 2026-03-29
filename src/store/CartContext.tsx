"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";

import type { CartItem } from "@/types";

const CART_STORAGE_KEY = "alma-deco-cart";
const emptyCartItems: CartItem[] = [];

const cartListeners = new Set<() => void>();

let cartCache = emptyCartItems;
let hasLoadedCart = false;

type CartProductInput = {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string | null;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  total: number;
  isHydrated: boolean;
  addItem: (product: CartProductInput, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function mergeCartItems(items: CartItem[]) {
  const mergedItems = new Map<string, CartItem>();

  for (const item of items) {
    if (!item.productId || item.quantity <= 0) {
      continue;
    }

    const existingItem = mergedItems.get(item.productId);

    if (existingItem) {
      mergedItems.set(item.productId, {
        ...existingItem,
        quantity: existingItem.quantity + item.quantity,
      });
      continue;
    }

    mergedItems.set(item.productId, {
      productId: item.productId,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      quantity: item.quantity,
    });
  }

  return [...mergedItems.values()];
}

function parseStoredCart(value: string | null) {
  if (!value) {
    return [] as CartItem[];
  }

  try {
    const parsedValue = JSON.parse(value) as unknown;

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    const normalizedItems = parsedValue.flatMap((item): CartItem[] => {
      if (typeof item !== "object" || item === null) {
        return [];
      }

      const cartItem = item as Record<string, unknown>;

      const productId = typeof cartItem.productId === "string" ? cartItem.productId.trim() : "";
      const name = typeof cartItem.name === "string" ? cartItem.name.trim() : "";
      const imageUrl = typeof cartItem.imageUrl === "string" && cartItem.imageUrl.trim() ? cartItem.imageUrl.trim() : null;
      const price = typeof cartItem.price === "number" && Number.isFinite(cartItem.price) ? cartItem.price : Number.NaN;
      const quantity = typeof cartItem.quantity === "number" && Number.isFinite(cartItem.quantity) ? Math.trunc(cartItem.quantity) : 0;

      if (!productId || !name || !Number.isFinite(price) || quantity <= 0) {
        return [];
      }

      return [
        {
          productId,
          name,
          price,
          imageUrl,
          quantity,
        },
      ];
    });

    return mergeCartItems(normalizedItems);
  } catch {
    return [];
  }
}

function emitCartChange() {
  for (const listener of cartListeners) {
    listener();
  }
}

function subscribeToCart(listener: () => void) {
  cartListeners.add(listener);

  return () => {
    cartListeners.delete(listener);
  };
}

function readCartSnapshot() {
  if (typeof window === "undefined") {
    return emptyCartItems;
  }

  if (!hasLoadedCart) {
    cartCache = parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY));
    hasLoadedCart = true;
  }

  return cartCache;
}

function getServerCartSnapshot() {
  return emptyCartItems;
}

function writeCartSnapshot(updater: (items: CartItem[]) => CartItem[]) {
  const nextItems = updater(readCartSnapshot());
  cartCache = nextItems;
  hasLoadedCart = true;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextItems));
  }

  emitCartChange();
}

function subscribeToHydration() {
  return () => undefined;
}

function getHydrationSnapshot() {
  return true;
}

function getHydrationServerSnapshot() {
  return false;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribeToCart, readCartSnapshot, getServerCartSnapshot);
  const isHydrated = useSyncExternalStore(subscribeToHydration, getHydrationSnapshot, getHydrationServerSnapshot);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== CART_STORAGE_KEY) {
        return;
      }

      cartCache = parseStoredCart(event.newValue);
      hasLoadedCart = true;
      emitCartChange();
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const addItem = useCallback((product: CartProductInput, quantity = 1) => {
    const safeQuantity = Math.max(1, Math.trunc(quantity));

    writeCartSnapshot((currentItems) => {
      const existingItem = currentItems.find((item) => item.productId === product.productId);

      if (existingItem) {
        return currentItems.map((item) =>
          item.productId === product.productId
            ? {
                ...item,
                quantity: item.quantity + safeQuantity,
              }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          productId: product.productId,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: safeQuantity,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    writeCartSnapshot((currentItems) => currentItems.filter((item) => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const safeQuantity = Math.trunc(quantity);

    writeCartSnapshot((currentItems) => {
      if (safeQuantity <= 0) {
        return currentItems.filter((item) => item.productId !== productId);
      }

      return currentItems.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: safeQuantity,
            }
          : item,
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    writeCartSnapshot(() => []);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((totalCount, item) => totalCount + item.quantity, 0);
    const total = items.reduce((totalPrice, item) => totalPrice + item.price * item.quantity, 0);

    return {
      items,
      itemCount,
      total,
      isHydrated,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    };
  }, [addItem, clearCart, isHydrated, items, removeItem, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }

  return context;
}
