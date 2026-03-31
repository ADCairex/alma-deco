"use client";

import { useMemo, useState } from "react";

import { useTranslations } from "next-intl";

import type { Product } from "@/types";

import { ProductForm } from "./ProductForm";
import { ProductTable } from "./ProductTable";

type AdminProductsManagerProps = {
  initialProducts: Product[];
};

export function AdminProductsManager({ initialProducts }: AdminProductsManagerProps) {
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const t = useTranslations("admin.products");

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) => product.name.toLowerCase().includes(normalizedSearch));
  }, [products, searchQuery]);

  async function refreshProducts() {
    setIsRefreshing(true);
    setPageError(null);

    try {
      const response = await fetch("/api/admin/products", { cache: "no-store" });
      const result = (await response.json()) as Product[] | { error?: string };

      if (!response.ok || !Array.isArray(result)) {
        const message = Array.isArray(result) ? t("errorRefresh") : (result.error ?? t("errorRefresh"));
        throw new Error(message);
      }

      setProducts(result);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : t("errorRefresh"));
    } finally {
      setIsRefreshing(false);
    }
  }

  function handleCreateProduct() {
    setSelectedProduct(null);
    setIsFormOpen(true);
  }

  function handleEditProduct(product: Product) {
    setSelectedProduct(product);
    setIsFormOpen(true);
  }

  async function handleDeleteProduct(product: Product) {
    const confirmed = window.confirm(t("deleteConfirm", { name: product.name }));

    if (!confirmed) {
      return;
    }

    setDeletingProductId(product.id);
    setPageError(null);

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? t("errorDelete"));
      }

      await refreshProducts();
    } catch (error) {
      setPageError(error instanceof Error ? error.message : t("errorDelete"));
    } finally {
      setDeletingProductId(null);
    }
  }

  const hasProducts = products.length > 0;
  const hasFilteredProducts = filteredProducts.length > 0;

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-zinc-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">{t("title")}</h1>
              <p className="max-w-3xl text-sm leading-6 text-zinc-600 sm:text-base">
                {t("description")}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="min-w-[240px] flex-1">
              <label htmlFor="product-search" className="sr-only">
                {t("searchLabel")}
              </label>
              <input
                id="product-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
              />
            </div>

            <button
              type="button"
              onClick={handleCreateProduct}
              className="inline-flex items-center justify-center rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
            >
              {t("newProductButton")}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">{t("statsTotalLabel")}</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-950">{products.length}</p>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">{t("statsFeaturedLabel")}</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-950">{products.filter((product) => product.featured).length}</p>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">{t("statsStatusLabel")}</p>
            <p className="mt-2 text-sm font-medium text-zinc-700">{isRefreshing ? t("statusUpdating") : t("statusSynced")}</p>
          </div>
        </div>
      </div>

      {pageError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pageError}</div>
      ) : null}

      {!hasProducts ? (
        <div className="rounded-[32px] border border-dashed border-zinc-300 bg-zinc-50 px-6 py-14 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-zinc-950">{t("emptyTitle")}</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-500">{t("emptyDescription")}</p>
          <button
            type="button"
            onClick={handleCreateProduct}
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            {t("emptyCreateButton")}
          </button>
        </div>
      ) : hasFilteredProducts ? (
        <ProductTable
          products={filteredProducts}
          deletingProductId={deletingProductId}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />
      ) : (
        <div className="rounded-[32px] border border-zinc-200 bg-white px-6 py-14 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-zinc-950">{t("noResultsTitle")}</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-500">{t("noResultsDescription")}</p>
        </div>
      )}

      <ProductForm
        open={isFormOpen}
        product={selectedProduct}
        onClose={() => setIsFormOpen(false)}
        onSuccess={async () => {
          setIsFormOpen(false);
          await refreshProducts();
        }}
      />
    </section>
  );
}
