"use client";

import type { ReactNode } from "react";

import { CartProvider } from "@/store/CartContext";

export function ShopProviders({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
