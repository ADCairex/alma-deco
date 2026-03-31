"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { QuantitySelector } from "@/components/shop/QuantitySelector";
import { formatProductPrice } from "@/lib/shop-products";
import { useCart } from "@/store/CartContext";

const REMOVE_ANIMATION_MS = 180;

export function CartPageClient() {
  const t = useTranslations("shop.cart");
  const tCommon = useTranslations("common");
  const { items, total, removeItem, updateQuantity, isHydrated } = useCart();
  const [removingIds, setRemovingIds] = useState<string[]>([]);

  const visibleItems = useMemo(() => items, [items]);

  const handleRemove = (productId: string) => {
    if (removingIds.includes(productId)) {
      return;
    }

    setRemovingIds((current) => [...current, productId]);

    window.setTimeout(() => {
      removeItem(productId);
      setRemovingIds((current) => current.filter((id) => id !== productId));
    }, REMOVE_ANIMATION_MS);
  };

  if (!isHydrated) {
    return (
      <section className="section-space bg-paper">
        <div className="site-container">
          <div className="rounded-[2rem] border border-line bg-stone-50 px-8 py-20 text-center">
            <p className="editorial-label text-ink/44">Alma Deco</p>
            <p className="mt-4 text-sm uppercase tracking-[0.18em] text-ink/58">{t("loadingLabel")}</p>
          </div>
        </div>
      </section>
    );
  }

  if (visibleItems.length === 0) {
    return (
      <section className="section-space bg-paper">
        <div className="site-container max-w-3xl text-center">
          <p className="editorial-label text-ink/44">{t("editorialLabel")}</p>
          <h1 className="section-title mt-5">{t("title")}</h1>
          <div className="mt-12 rounded-[2rem] border border-line bg-stone-50 px-8 py-16 sm:py-18">
            <p className="font-display text-3xl uppercase tracking-[0.14em] text-ink">{t("emptyTitle")}</p>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ink/62 sm:text-base">
              {t("emptyDescription")}
            </p>
            <Link href="/products" className="pill-dark mt-8">
              {t("continueShoppingButton")}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-space bg-paper">
      <div className="site-container space-y-12 lg:space-y-16">
        <div className="space-y-4 text-center">
          <p className="editorial-label text-ink/44">{t("editorialLabel")}</p>
          <h1 className="section-title">{t("title")}</h1>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)] lg:items-start">
          <div className="space-y-4">
            {visibleItems.map((item) => {
              const isRemoving = removingIds.includes(item.productId);

              return (
                <article
                  key={item.productId}
                  className={`rounded-[1.9rem] border border-line bg-white p-4 transition-all duration-200 sm:p-5 ${
                    isRemoving ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
                  }`}
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <Link href={`/products/${item.productId}`} className="relative mx-auto aspect-[4/5] w-full max-w-[120px] overflow-hidden rounded-[1.25rem] bg-stone-100 sm:mx-0 sm:w-[100px]">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill sizes="100px" className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[0.62rem] uppercase tracking-[0.24em] text-ink/42">Alma Deco</div>
                      )}
                    </Link>

                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2 text-center sm:text-left">
                          <Link href={`/products/${item.productId}`} className="font-display text-[1.45rem] uppercase tracking-[0.08em] text-ink hover:text-ink/72">
                            {item.name}
                          </Link>
                          <p className="text-sm uppercase tracking-[0.18em] text-ink/46">{t("unitPrice", { price: formatProductPrice(item.price) })}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(item.productId)}
                          className="self-center rounded-full border border-ink/12 px-4 py-2 text-[0.7rem] uppercase tracking-[0.18em] text-ink/64 hover:border-ink/28 hover:text-ink sm:self-start"
                          aria-label={t("removeItemAriaLabel", { name: item.name })}
                        >
                          {t("removeButton")}
                        </button>
                      </div>

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <QuantitySelector value={item.quantity} onChange={(value) => updateQuantity(item.productId, value)} max={99} />
                        <p className="text-center text-sm font-medium uppercase tracking-[0.18em] text-ink sm:text-right">
                          {t("itemTotal", { price: formatProductPrice(item.price * item.quantity) })}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="rounded-[2rem] border border-line bg-stone-50 px-6 py-7 sm:px-8 sm:py-8 lg:sticky lg:top-28">
            <p className="editorial-label text-ink/46">{t("summaryLabel")}</p>
            <div className="mt-7 space-y-4 border-b border-line pb-6 text-sm uppercase tracking-[0.14em] text-ink/66">
              <div className="flex items-center justify-between gap-4">
                <span>{tCommon("subtotal")}</span>
                <span className="text-ink">{formatProductPrice(total)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>{tCommon("shipping")}</span>
                <span className="text-right text-ink/58">{t("shippingCalculated")}</span>
              </div>
            </div>

            <div className="mt-6 flex items-end justify-between gap-4">
              <span className="font-display text-2xl uppercase tracking-[0.14em] text-ink">{tCommon("total")}</span>
              <span className="text-[1.35rem] font-semibold tracking-[0.04em] text-ink">{formatProductPrice(total)}</span>
            </div>

            <div className="mt-8 space-y-4">
              <Link href="/checkout" className="pill-dark flex w-full">
                {t("checkoutButton")}
              </Link>
              <Link href="/products" className="inline-flex text-[0.8rem] uppercase tracking-[0.2em] text-ink/58 hover:text-ink">
                {t("continueShoppingButton")}
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
