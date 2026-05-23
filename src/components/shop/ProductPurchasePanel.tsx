"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { QuantitySelector } from "@/components/shop/QuantitySelector";
import { commerceEnabled, instagramHref } from "@/lib/commerce-config";
import { useCart } from "@/store/CartContext";

type ProductPurchasePanelProps = {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  stock: number;
};

export function ProductPurchasePanel({ productId, name, price, imageUrl, stock }: ProductPurchasePanelProps) {
  const t = useTranslations("shop.product");

  if (!commerceEnabled) {
    return (
      <div className="space-y-4 rounded-[1.75rem] border border-line bg-white px-6 py-6">
        <p className="text-sm leading-7 text-ink/66">{t("catalogModeDescription")}</p>
        <a href={instagramHref} target="_blank" rel="noopener noreferrer" className="pill-dark flex w-full">
          {t("contactInstagramButton")}
        </a>
      </div>
    );
  }

  return <AddToCartControls productId={productId} name={name} price={price} imageUrl={imageUrl} stock={stock} />;
}

function AddToCartControls({ productId, name, price, imageUrl, stock }: ProductPurchasePanelProps) {
  const tCommon = useTranslations("common");
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-[0.72rem] uppercase tracking-[0.24em] text-ink/48">{tCommon("quantity")}</p>
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
        className="inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-4 text-[0.78rem] font-medium uppercase tracking-[0.22em] text-white hover:scale-[1.01] hover:bg-ink/92 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
      >
        {tCommon("addToCart")}
      </button>
    </div>
  );
}
