"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { useTranslations } from "next-intl";

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
  const t = useTranslations("admin.products.form");

  useEffect(() => {
    if (!open) {
      return;
    }

    setValues(getInitialValues(product));
    setErrors({});
    setFormError(null);
  }, [open, product]);

  const modeLabel = useMemo(() => (product ? t("titleEdit") : t("titleCreate")), [product, t]);

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
      nextErrors.name = t("errorNameRequired");
    }

    if (!values.price.trim()) {
      nextErrors.price = t("errorPriceRequired");
    } else if (Number(values.price) < 0 || Number.isNaN(Number(values.price))) {
      nextErrors.price = t("errorPriceInvalid");
    }

    if (!values.category.trim()) {
      nextErrors.category = t("errorCategoryRequired");
    }

    if (values.stock.trim() && (Number(values.stock) < 0 || Number.isNaN(Number(values.stock)))) {
      nextErrors.stock = t("errorStockInvalid");
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
        throw new Error(result.error ?? t("errorSave"));
      }

      await onSuccess();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t("errorSave"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/45 backdrop-blur-[2px]">
      <div className="flex h-full w-full max-w-3xl flex-col overflow-hidden border-l border-zinc-200 bg-zinc-50 shadow-2xl">
        <div className="flex items-start justify-between border-b border-zinc-200 bg-white px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">{t("sectionLabel")}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">{modeLabel}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              {t("description")}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-300 bg-white text-xl text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={t("closeAriaLabel")}
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
                    {t("fieldName")}
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={values.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder={t("fieldNamePlaceholder")}
                    className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
                  />
                  {errors.name ? <p className="text-sm text-red-600">{errors.name}</p> : null}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="description" className="text-sm font-medium text-zinc-900">
                    {t("fieldDescription")}
                  </label>
                  <textarea
                    id="description"
                    value={values.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    rows={4}
                    placeholder={t("fieldDescriptionPlaceholder")}
                    className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium text-zinc-900">
                    {t("fieldPrice")}
                  </label>
                  <input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={values.price}
                    onChange={(event) => updateField("price", event.target.value)}
                    placeholder={t("fieldPricePlaceholder")}
                    className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
                  />
                  {errors.price ? <p className="text-sm text-red-600">{errors.price}</p> : null}
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium text-zinc-900">
                    {t("fieldCategory")}
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
                    {t("fieldStock")}
                  </label>
                  <input
                    id="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={values.stock}
                    onChange={(event) => updateField("stock", event.target.value)}
                    placeholder={t("fieldStockPlaceholder")}
                    className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
                  />
                  {errors.stock ? <p className="text-sm text-red-600">{errors.stock}</p> : null}
                </div>

                <div className="flex items-center justify-between rounded-3xl border border-zinc-200 bg-white px-4 py-4 md:col-span-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{t("fieldFeaturedTitle")}</p>
                    <p className="mt-1 text-sm text-zinc-500">{t("fieldFeaturedDescription")}</p>
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
                  label={t("imageMainLabel")}
                  buttonLabel={t("imageMainButton")}
                  hint={t("imageMainHint")}
                  value={values.imageUrl ? [values.imageUrl] : []}
                  onChange={(images) => updateField("imageUrl", images[0] ?? "")}
                  disabled={isSaving}
                />
              </div>

              <div className="rounded-[28px] border border-zinc-200 bg-white p-5 sm:p-6">
                <ImageUploader
                  label={t("imageExtraLabel")}
                  buttonLabel={t("imageExtraButton")}
                  hint={t("imageExtraHint")}
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
                {t("cancelButton")}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? t("savingButton") : product ? t("saveButton") : t("createButton")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
