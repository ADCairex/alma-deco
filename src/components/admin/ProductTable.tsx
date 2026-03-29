"use client";

import Image from "next/image";

import { formatAdminPrice } from "@/lib/admin-products";
import type { Product } from "@/types";

type ProductTableProps = {
  products: Product[];
  deletingProductId: string | null;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

function ProductThumbnail({ product }: { product: Product }) {
  const imageUrl = product.imageUrl || product.images[0] || null;

  if (!imageUrl) {
    return (
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
        Sin foto
      </div>
    );
  }

  return (
    <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
      <Image src={imageUrl} alt={product.name} fill className="object-cover" sizes="56px" />
    </div>
  );
}

function FeaturedBadge({ featured }: { featured: boolean }) {
  if (!featured) {
    return <span className="text-sm text-zinc-400">—</span>;
  }

  return (
    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
      Destacado
    </span>
  );
}

export function ProductTable({ products, deletingProductId, onEdit, onDelete }: ProductTableProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                <th className="px-6 py-4">Imagen</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Destacado</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {products.map((product) => (
                <tr key={product.id} className="align-middle text-sm text-zinc-700">
                  <td className="px-6 py-4">
                    <ProductThumbnail product={product} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-zinc-950">{product.name}</p>
                      <p className="max-w-xs text-sm leading-6 text-zinc-500 line-clamp-2">{product.description || "Sin descripción"}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4 font-semibold text-zinc-950">{formatAdminPrice(product.price)}</td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4">
                    <FeaturedBadge featured={product.featured} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(product)}
                        disabled={deletingProductId === product.id}
                        className="inline-flex items-center justify-center rounded-2xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingProductId === product.id ? "Eliminando..." : "Eliminar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:hidden">
        {products.map((product) => (
          <article key={product.id} className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <ProductThumbnail product={product} />
              <div className="min-w-0 flex-1 space-y-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-zinc-950">{product.name}</h3>
                    <FeaturedBadge featured={product.featured} />
                  </div>
                  <p className="text-sm text-zinc-500">{product.category}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-2xl bg-zinc-50 p-3 text-sm text-zinc-600">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Precio</p>
                    <p className="mt-1 font-semibold text-zinc-950">{formatAdminPrice(product.price)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Stock</p>
                    <p className="mt-1 font-semibold text-zinc-950">{product.stock}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(product)}
                    disabled={deletingProductId === product.id}
                    className="inline-flex items-center justify-center rounded-2xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingProductId === product.id ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
