"use client";

import { useState } from "react";

import { QuantitySelector } from "@/components/shop/QuantitySelector";
import { useCart } from "@/store/CartContext";

type ProductPurchasePanelProps = {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  stock: number;
};

export function ProductPurchasePanel({ productId, name, price, imageUrl, stock }: ProductPurchasePanelProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-[0.72rem] uppercase tracking-[0.24em] text-ink/48">Cantidad</p>
        <QuantitySelector value={quantity} onChange={setQuantity} max={stock} />
      </div>

      <button
        type="button"
        disabled={stock <= 0}
        onClick={() => {
          addItem(
            {
              productId,
              name,
              price,
              imageUrl,
            },
            quantity,
          );
        }}
        className="inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-4 text-[0.78rem] font-medium uppercase tracking-[0.22em] text-white hover:scale-[1.01] hover:bg-ink/92 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
      >
        Añadir al carrito
      </button>
    </div>
  );
}
