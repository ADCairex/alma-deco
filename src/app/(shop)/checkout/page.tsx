import type { Metadata } from "next";

import { CheckoutPageClient } from "@/components/shop/CheckoutPageClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Finalizá tu pedido de decoración artesanal en Alma Deco de forma segura.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
