import type { Metadata } from "next";

import { CartPageClient } from "@/components/shop/CartPageClient";

export const metadata: Metadata = {
  title: "Tu Carrito",
  description: "Revisá los productos seleccionados antes de finalizar tu compra en Alma Deco.",
  alternates: {
    canonical: "/cart",
  },
};

export default function CartPage() {
  return <CartPageClient />;
}
