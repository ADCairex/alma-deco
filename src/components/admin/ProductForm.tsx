"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import {
  DEFAULT_PRODUCT_FORM_VALUES,
  PRODUCT_CATEGORIES,
  type ProductFormValues,
} from "@/lib/admin-products";
import type { Product } from "@/types";

import { ImageUploader } from "./ImageUploader";

type ProductFormProps = {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
};

type FormErrors = Partial<Record<keyof ProductFormValues, string>>;

function getInitialValues(product: Product | null): ProductFormValues {
  if (!product) {
    return DEFAULT_PRODUCT_FORM_VALUES;
  }

  return {
    name: product.name,
    description: product.description ?? "",
    price: String(product.price),
    category: product.category,
    stock: String(product.stock),
    imageUrl: product.imageUrl ?? "",
    images: product.images,
    featured: product.featured,
  };
}

export function ProductForm({ open, product, onClose, onSuccess }: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(DEFAULT_PRODUCT_FORM_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setValues(getInitialValues(product));
    setErrors({});
    setFormError(null);
  }, [open, product]);

  const modeLabel = useMemo(() => (product ? "Editar producto" : "Nuevo producto"), [product]);

  if (!open) {
    return null;
  }

  function updateField<K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!values.name.trim()) {
      nextErrors.name = "Ingresá el nombre del producto.";
    }

    if (!values.price.trim()) {
      nextErrors.price = "Ingresá el precio en euros.";
    } else if (Number(values.price) < 0 || Number.isNaN(Number(values.price))) {
      nextErrors.price = "Ingresá un precio válido mayor o igual a 0.";
    }

    if (!values.category.trim()) {
      nextErrors.category = "Seleccioná una categoría.";
    }

    if (values.stock.trim() && (Number(values.stock) < 0 || Number.isNaN(Number(values.stock)))) {
      nextErrors.stock = "Ingresá un stock válido mayor o igual a 0.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const endpoint = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
      const method = product ? "PUT" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          price: Number(values.price),
          category: values.category,
          stock: values.stock ? Number(values.stock) : 0,
          imageUrl: values.imageUrl,
          images: JSON.stringify(values.images),
          featured: values.featured,
        }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "No se pudo guardar el producto.");
      }

      await onSuccess();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No se pudo guardar el producto.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/45 backdrop-blur-[2px]">
      <div className="flex h-full w-full max-w-3xl flex-col overflow-hidden border-l border-zinc-200 bg-zinc-50 shadow-2xl">
        <div className="flex items-start justify-between border-b border-zinc-200 bg-white px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">Gestión de productos</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">{modeLabel}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Completá la información del producto y subí las imágenes para dejarlo listo en el catálogo.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-300 bg-white text-xl text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Cerrar formulario"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
            <div className="space-y-6">
              {formError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>
              ) : null}

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="name" className="text-sm font-medium text-zinc-900">
                    Nombre *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={values.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Ej. Jarrón de cerámica mate"
                    className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
                  />
                  {errors.name ? <p className="text-sm text-red-600">{errors.name}</p> : null}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="description" className="text-sm font-medium text-zinc-900">
                    Descripción
                  </label>
                  <textarea
                    id="description"
                    value={values.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    rows={4}
                    placeholder="Contá materiales, estilo, medidas o detalles importantes."
                    className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium text-zinc-900">
                    Precio (€) *
                  </label>
                  <input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={values.price}
                    onChange={(event) => updateField("price", event.target.value)}
                    placeholder="49.90"
                    className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
                  />
                  {errors.price ? <p className="text-sm text-red-600">{errors.price}</p> : null}
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium text-zinc-900">
                    Categoría *
                  </label>
                  <select
                    id="category"
                    value={values.category}
                    onChange={(event) => updateField("category", event.target.value)}
                    className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
                  >
                    {PRODUCT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category ? <p className="text-sm text-red-600">{errors.category}</p> : null}
                </div>

                <div className="space-y-2">
                  <label htmlFor="stock" className="text-sm font-medium text-zinc-900">
                    Stock
                  </label>
                  <input
                    id="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={values.stock}
                    onChange={(event) => updateField("stock", event.target.value)}
                    placeholder="0"
                    className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
                  />
                  {errors.stock ? <p className="text-sm text-red-600">{errors.stock}</p> : null}
                </div>

                <div className="flex items-center justify-between rounded-3xl border border-zinc-200 bg-white px-4 py-4 md:col-span-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Destacado</p>
                    <p className="mt-1 text-sm text-zinc-500">Marcá este producto para resaltarlo dentro del panel y el catálogo.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => updateField("featured", !values.featured)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                      values.featured ? "bg-zinc-900" : "bg-zinc-300"
                    }`}
                    aria-pressed={values.featured}
                  >
                    <span
                      className={`inline-block h-6 w-6 rounded-full bg-white shadow-sm transition ${
                        values.featured ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="rounded-[28px] border border-zinc-200 bg-white p-5 sm:p-6">
                <ImageUploader
                  label="Imagen principal"
                  buttonLabel="Subir imagen principal"
                  hint="Se usa como miniatura principal del producto. Si subís una nueva, reemplaza la actual."
                  value={values.imageUrl ? [values.imageUrl] : []}
                  onChange={(images) => updateField("imageUrl", images[0] ?? "")}
                  disabled={isSaving}
                />
              </div>

              <div className="rounded-[28px] border border-zinc-200 bg-white p-5 sm:p-6">
                <ImageUploader
                  label="Imágenes adicionales"
                  buttonLabel="Subir imágenes adicionales"
                  hint="Podés subir varias fotos para mostrar diferentes ángulos o ambientes."
                  value={values.images}
                  onChange={(images) => updateField("images", images)}
                  multiple
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-200 bg-white px-6 py-4 sm:px-8">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Guardando..." : product ? "Guardar cambios" : "Crear producto"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
