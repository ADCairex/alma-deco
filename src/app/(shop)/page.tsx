import Image from "next/image";

import { DeerLogo } from "@/components/icons/DeerLogo";
import { Hero } from "@/components/shop/Hero";
import { ProductCard } from "@/components/shop/ProductCard";
import { prisma } from "@/lib/prisma";
import { formatPublicProduct } from "@/lib/shop-products";
import type { Product } from "@/types";

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    where: {
      featured: true,
      stock: {
        gt: 0,
      },
    },
    orderBy: [{ createdAt: "desc" }],
    take: 6,
  });

  const fallbackProducts =
    featuredProducts.length === 0
      ? await prisma.product.findMany({
          where: {
            stock: {
              gt: 0,
            },
          },
          orderBy: [{ createdAt: "desc" }],
          take: 6,
        })
      : [];

  const topVentas: Product[] = (featuredProducts.length > 0 ? featuredProducts : fallbackProducts).map(formatPublicProduct);

  return (
    <>
      <Hero />

      <section className="section-space bg-paper">
        <div className="site-container">
          <div className="mb-12 flex flex-col items-center gap-4 text-center sm:mb-14">
            <h2 className="section-title">Top Ventas</h2>
            <span className="h-px w-28 bg-ink/70" />
          </div>

          {topVentas.length > 0 ? (
            <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
              {topVentas.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-line bg-stone-50 px-8 py-14 text-center">
              <p className="editorial-label text-ink/46">Top Ventas</p>
              <p className="mt-4 text-lg text-ink/72">Todavía no hay productos destacados cargados para mostrar.</p>
            </div>
          )}
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-bg-dark">
        <Image
          src="https://images.unsplash.com/photo-1616137466211-f939a420be84?w=1600&q=80&auto=format&fit=crop"
          alt="Salón Alma Deco"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,16,16,0.48)_0%,rgba(16,16,16,0.22)_42%,rgba(16,16,16,0.4)_100%)]" />
        <div className="site-container relative flex min-h-[350px] items-center py-16">
          <div className="max-w-3xl">
            <h2 className="text-shadow-hero font-display text-[2.2rem] leading-[0.94] tracking-[0.1em] uppercase text-white sm:text-[2.8rem] lg:text-[3.35rem]">
              Crea un espacio único
            </h2>
          </div>
        </div>
      </section>

      <section className="bg-paper py-0">
        <div className="site-container grid gap-0 lg:grid-cols-[0.94fr_1.06fr] lg:items-stretch">
          <div className="flex flex-col justify-center bg-bg-dark px-8 py-14 text-white sm:px-12 lg:px-16 lg:py-16">
            <div className="mb-10 flex flex-col items-center lg:items-start">
              <div className="flex items-center gap-4">
                <DeerLogo className="h-[72px] w-[72px] text-white" color="currentColor" />
                <div className="thin-frame-inverse inline-flex items-center justify-center px-6 py-3">
                  <span className="font-display text-lg uppercase tracking-[0.34em] text-white">Alma Deco</span>
                </div>
              </div>
            </div>

            <blockquote className="font-display text-[1.55rem] leading-[1.45] text-white italic sm:text-[1.85rem]">
              “Cada rincón merece una pieza capaz de contar una historia serena, cálida y vivida.”
            </blockquote>

            <p className="mt-3 text-[0.76rem] uppercase tracking-[0.22em] text-white/56">Alma Deco Studio</p>

            <div className="mt-8 space-y-5 text-[0.95rem] leading-8 text-white/74">
              <p>
                Diseñamos y curamos decoración artesanal inspirada en la calidez mediterránea, los oficios lentos y la belleza imperfecta de los materiales naturales.
              </p>
              <p>
                Desde cerámicas, fibras y maderas nobles hasta pequeños objetos con alma, cada colección busca transformar la casa en un refugio con identidad propia y sensibilidad española.
              </p>
            </div>
          </div>

          <div className="relative min-h-[420px] overflow-hidden sm:min-h-[540px]">
            <Image
              src="https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=1200&q=80&auto=format&fit=crop"
              alt="Persona decorando una estancia con piezas Alma Deco"
              fill
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </>
  );
}
