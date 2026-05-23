"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { commerceEnabled } from "@/lib/commerce-config";
import { formatProductPrice } from "@/lib/shop-products";
import { useCart } from "@/store/CartContext";

type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  category: string;
  currency?: string;
};

export function ProductCard({ id, name, price, imageUrl, category, currency = "EUR" }: ProductCardProps) {
  return (
    <article className="group">
      <div className="relative overflow-hidden rounded-[1.6rem] bg-paper">
        <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
          <Link href={`/products/${id}`} className="block h-full focus-visible:outline-offset-[-3px]">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                sizes="(min-width: 1280px) 28vw, (min-width: 768px) 42vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(212,197,169,0.42),transparent_50%),linear-gradient(180deg,#f8f5f0_0%,#efe7db_100%)] px-8 text-center text-[0.72rem] uppercase tracking-[0.22em] text-ink/44">
                Alma Deco
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/24 via-transparent to-transparent" />
          </Link>

          {commerceEnabled ? <ProductCardAddButton id={id} name={name} price={price} imageUrl={imageUrl} /> : null}
        </div>
      </div>

      <div className="pt-5 text-center">
        <p className="editorial-label text-ink/45">{category}</p>
        <h3 className="mt-3">
          <Link href={`/products/${id}`} className="text-[0.82rem] font-medium uppercase tracking-[0.24em] text-ink hover:text-ink/72">
            {name}
          </Link>
        </h3>
        <p className="mt-2 text-[0.88rem] tracking-[0.06em] text-ink">{formatProductPrice(price, currency)}</p>
      </div>
    </article>
  );
}

function ProductCardAddButton({ id, name, price, imageUrl }: Pick<ProductCardProps, "id" | "name" | "price" | "imageUrl">) {
  const tCommon = useTranslations("common");
  const { addItem } = useCart();

  return (
    <button
      type="button"
      onClick={() => {
        addItem({
          productId: id,
          name,
          price,
          imageUrl,
        });
      }}
      className="cart-overlay-button absolute inset-x-5 bottom-5 z-10 justify-center text-center"
    >
      {tCommon("addToCart")}
    </button>
  );
}
