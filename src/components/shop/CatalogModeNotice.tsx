import { useTranslations } from "next-intl";
import Link from "next/link";

import { instagramHref } from "@/lib/commerce-config";

export function CatalogModeNotice() {
  const t = useTranslations("shop.catalogMode");

  return (
    <section className="section-space bg-paper">
      <div className="site-container max-w-3xl text-center">
        <p className="editorial-label text-ink/44">{t("label")}</p>
        <h1 className="section-title mt-5">{t("pageTitle")}</h1>
        <div className="mt-12 rounded-[2rem] border border-line bg-stone-50 px-8 py-16 sm:py-18">
          <p className="font-display text-3xl uppercase tracking-[0.14em] text-ink">{t("title")}</p>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ink/62 sm:text-base">{t("description")}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href={instagramHref} target="_blank" rel="noopener noreferrer" className="pill-dark">
              {t("instagramButton")}
            </a>
            <Link href="/products" className="inline-flex text-[0.8rem] uppercase tracking-[0.2em] text-ink/58 hover:text-ink">
              {t("productsButton")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
