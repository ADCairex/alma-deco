import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ImageGallery } from "@/components/shop/ImageGallery";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductPurchasePanel } from "@/components/shop/ProductPurchasePanel";
import { prisma } from "@/lib/prisma";
import { formatProductPrice, formatPublicProduct, getProductGalleryImages, getProductSeoDescription, getStockStatus } from "@/lib/shop-products";
import type { Product } from "@/types";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getNormalizedProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  return product ? formatPublicProduct(product) : null;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getNormalizedProduct(id);

  if (!product) {
    return {
      title: "Producto | Alma Deco",
      description: "Descubrí la colección editorial de Alma Deco.",
    };
  }

  return {
    title: `${product.name} | Alma Deco`,
    description: getProductSeoDescription(product),
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getNormalizedProduct(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      id: {
        not: product.id,
      },
      category: product.category,
      stock: {
        gt: 0,
      },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 4,
  });

  const galleryImages = getProductGalleryImages(product);
  const stockStatus = getStockStatus(product.stock);
  const relatedProductsNormalized: Product[] = relatedProducts.map(formatPublicProduct);

  return (
    <>
      <section className="section-space bg-paper">
        <div className="site-container grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] lg:gap-16 xl:gap-20">
          <div>
            <ImageGallery mainImage={galleryImages[0] ?? ""} images={galleryImages.slice(1)} productName={product.name} />
          </div>

          <div className="flex flex-col justify-center">
            <div className="space-y-6 lg:space-y-8">
              <div className="space-y-4 border-b border-line pb-6">
                <p className="editorial-label text-ink/44">{product.category}</p>
                <h1 className="font-display text-[2.4rem] leading-[1.04] text-ink sm:text-[3rem] xl:text-[3.55rem]">{product.name}</h1>
                <p className="text-[1.4rem] font-medium tracking-[0.04em] text-ink sm:text-[1.65rem]">
                  {formatProductPrice(product.price, product.currency)}
                </p>
              </div>

              <div className="space-y-5">
                <p className="text-sm uppercase tracking-[0.22em] text-ink/50">Descripción</p>
                <p className="max-w-xl text-[0.98rem] leading-8 text-ink/72">
                  {product.description?.trim() || "Una pieza seleccionada para sumar textura, calidez y una presencia serena a tu casa."}
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-line bg-stone-50 px-6 py-5">
                <p className="text-[0.72rem] uppercase tracking-[0.24em] text-ink/45">Disponibilidad</p>
                <p className={`mt-3 text-sm font-medium uppercase tracking-[0.16em] ${stockStatus.tone}`}>{stockStatus.label}</p>
              </div>

              <ProductPurchasePanel stock={product.stock} />
            </div>
          </div>
        </div>
      </section>

      {relatedProductsNormalized.length > 0 ? (
        <section className="section-space border-t border-line bg-stone-50/65">
          <div className="site-container">
            <div className="mb-12 flex flex-col items-center gap-4 text-center sm:mb-14">
              <p className="editorial-label text-ink/48">Selección Alma Deco</p>
              <h2 className="section-title">También te puede interesar</h2>
              <span className="h-px w-28 bg-ink/70" />
            </div>

            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-4">
              {relatedProductsNormalized.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} {...relatedProduct} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
