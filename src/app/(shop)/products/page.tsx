import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { ProductCard } from "@/components/shop/ProductCard";
import { ProductsFilterBar } from "@/components/shop/ProductsFilterBar";
import { PRODUCT_CATEGORIES } from "@/lib/admin-products";
import { prisma } from "@/lib/prisma";
import { buildPublicProductsOrderBy, buildPublicProductsWhere, formatPublicProduct, normalizePublicProductQuery } from "@/lib/shop-products";
import type { Product } from "@/types";

type ProductsPageProps = {
  searchParams: Promise<{
    category?: string | string[];
    categoria?: string | string[];
    featured?: string | string[];
    nueva?: string | string[];
    search?: string | string[];
    sort?: string | string[];
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.pages");
  return {
    title: t("productsTitle"),
    description: t("productsDescription"),
    alternates: {
      canonical: "/products",
    },
    openGraph: {
      title: t("productsTitle"),
      description: t("productsDescription"),
      url: "/products",
    },
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const t = await getTranslations("shop.products");
  const resolvedSearchParams = await searchParams;
  const filters = normalizePublicProductQuery(resolvedSearchParams);

  const sortLabels = {
    newest: t("sortNewest"),
    price_asc: t("sortPriceAsc"),
    price_desc: t("sortPriceDesc"),
  } as const;

  const products = await prisma.product.findMany({
    where: buildPublicProductsWhere(filters),
    orderBy: buildPublicProductsOrderBy(filters.sort),
  });

  const normalizedProducts: Product[] = products.map(formatPublicProduct);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-bg-dark">
        <Image
          src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1800&q=80&auto=format&fit=crop"
          alt={t("pageHeroImageAlt")}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,17,17,0.72)_0%,rgba(17,17,17,0.4)_40%,rgba(17,17,17,0.56)_100%)]" />

        <div className="site-container relative flex min-h-[230px] items-end py-14 sm:min-h-[250px]">
          <div className="max-w-2xl space-y-5 text-white">
            <p className="editorial-label text-white/72">{t("pageHeroBreadcrumb")}</p>
            <h1 className="font-display text-[2.2rem] uppercase tracking-[0.14em] text-shadow-hero sm:text-[3rem]">
              {t("pageHeroTitle")}
            </h1>
            <p className="max-w-xl text-sm leading-7 text-white/76 sm:text-base">
              {t("pageHeroDescription")}
            </p>
          </div>
        </div>
      </section>

      <section className="section-space bg-paper">
        <div className="site-container space-y-8">
          <div className="flex flex-col gap-5 border-b border-line pb-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <ProductsFilterBar categories={PRODUCT_CATEGORIES} activeCategory={filters.category} />

              <div className="flex flex-wrap gap-3 text-[0.75rem] uppercase tracking-[0.18em] text-ink/52">
                <span>{t("count", { count: normalizedProducts.length })}</span>
                <span>•</span>
                <span>{sortLabels[filters.sort]}</span>
                {filters.featured ? (
                  <>
                    <span>•</span>
                    <span>{t("featured")}</span>
                  </>
                ) : null}
                {filters.search ? (
                  <>
                    <span>•</span>
                    <span>{t("searchLabel", { term: filters.search })}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {normalizedProducts.length > 0 ? (
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
              {normalizedProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-line bg-stone-50 px-8 py-16 text-center">
              <p className="font-display text-2xl uppercase tracking-[0.16em] text-ink">{t("emptyTitle")}</p>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-ink/62 sm:text-base">
                {t("emptyDescription")}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
