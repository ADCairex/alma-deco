"use client";

import { useMemo, useState } from "react";

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
        const message = Array.isArray(result) ? "No se pudo actualizar la lista de productos." : (result.error ?? "No se pudo actualizar la lista de productos.");
        throw new Error(message);
      }

      setProducts(result);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "No se pudo actualizar la lista de productos.");
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
    const confirmed = window.confirm(`¿Seguro que querés eliminar “${product.name}”? Esta acción no se puede deshacer.`);

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
        throw new Error(result.error ?? "No se pudo eliminar el producto.");
      }

      await refreshProducts();
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "No se pudo eliminar el producto.");
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
            <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
              F2 · Admin Products CRUD
            </span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">Gestión de productos</h1>
              <p className="max-w-3xl text-sm leading-6 text-zinc-600 sm:text-base">
                Creá, editá y eliminá productos del catálogo. Subí imágenes, actualizá precios y mantené el stock ordenado desde un solo lugar.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="min-w-[240px] flex-1">
              <label htmlFor="product-search" className="sr-only">
                Buscar producto por nombre
              </label>
              <input
                id="product-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar por nombre..."
                className="w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
              />
            </div>

            <button
              type="button"
              onClick={handleCreateProduct}
              className="inline-flex items-center justify-center rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
            >
              Nuevo producto
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Total de productos</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-950">{products.length}</p>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Productos destacados</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-950">{products.filter((product) => product.featured).length}</p>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Estado</p>
            <p className="mt-2 text-sm font-medium text-zinc-700">{isRefreshing ? "Actualizando catálogo..." : "Catálogo sincronizado"}</p>
          </div>
        </div>
      </div>

      {pageError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pageError}</div>
      ) : null}

      {!hasProducts ? (
        <div className="rounded-[32px] border border-dashed border-zinc-300 bg-zinc-50 px-6 py-14 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-zinc-950">No hay productos. ¡Crea el primero!</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-500">Arrancá cargando la ficha inicial del catálogo para empezar a gestionar tu tienda.</p>
          <button
            type="button"
            onClick={handleCreateProduct}
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Crear primer producto
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
          <h2 className="text-2xl font-semibold text-zinc-950">No encontramos productos con ese nombre</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-500">Probá con otro término o limpiá la búsqueda para ver todo el catálogo.</p>
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
