import Image from "next/image";

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

const sortLabels = {
  newest: "Más recientes",
  price_asc: "Precio ascendente",
  price_desc: "Precio descendente",
} as const;

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = normalizePublicProductQuery(resolvedSearchParams);

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
          alt="Colección Alma Deco"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,17,17,0.72)_0%,rgba(17,17,17,0.4)_40%,rgba(17,17,17,0.56)_100%)]" />

        <div className="site-container relative flex min-h-[230px] items-end py-14 sm:min-h-[250px]">
          <div className="max-w-2xl space-y-5 text-white">
            <p className="editorial-label text-white/72">Alma Deco Collection</p>
            <h1 className="font-display text-[2.2rem] uppercase tracking-[0.14em] text-shadow-hero sm:text-[3rem]">
              Nuestros productos
            </h1>
            <p className="max-w-xl text-sm leading-7 text-white/76 sm:text-base">
              Una selección de piezas con mirada editorial, materiales cálidos y una presencia serena para habitar cada rincón.
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
                <span>{normalizedProducts.length} productos</span>
                <span>•</span>
                <span>{sortLabels[filters.sort]}</span>
                {filters.featured ? (
                  <>
                    <span>•</span>
                    <span>Destacados</span>
                  </>
                ) : null}
                {filters.search ? (
                  <>
                    <span>•</span>
                    <span>Búsqueda: “{filters.search}”</span>
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
              <p className="font-display text-2xl uppercase tracking-[0.16em] text-ink">No se encontraron productos en esta categoría</p>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-ink/62 sm:text-base">
                Probá cambiar la categoría o volver a la colección completa para descubrir otras piezas de la casa.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
