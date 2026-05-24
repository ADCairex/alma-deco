"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { useTranslations } from "next-intl";

import type { TaxonomyDto, TaxonomyEntity } from "@/lib/taxonomy";

type TaxonomyFormValues = {
  name: string;
  slug: string;
  description: string;
};

type TaxonomyFormProps = {
  entity: TaxonomyEntity;
  item: TaxonomyDto | null;
  onCancel: () => void;
  onSaved: (item: TaxonomyDto) => void;
};

const INITIAL_VALUES: TaxonomyFormValues = {
  name: "",
  slug: "",
  description: "",
};

function isTaxonomyDto(value: TaxonomyDto | { error?: string }): value is TaxonomyDto {
  return "id" in value && "name" in value && "slug" in value;
}

function getInitialValues(item: TaxonomyDto | null): TaxonomyFormValues {
  if (!item) {
    return INITIAL_VALUES;
  }

  return {
    name: item.name,
    slug: item.slug,
    description: item.description ?? "",
  };
}

export function TaxonomyForm({ entity, item, onCancel, onSaved }: TaxonomyFormProps) {
  const [values, setValues] = useState<TaxonomyFormValues>(getInitialValues(item));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const t = useTranslations("admin.taxonomy.form");

  useEffect(() => {
    setValues(getInitialValues(item));
    setError(null);
  }, [item, entity]);

  const title = useMemo(() => {
    if (item) {
      return entity === "category" ? t("editCategoryTitle") : t("editCollectionTitle");
    }

    return entity === "category" ? t("newCategoryTitle") : t("newCollectionTitle");
  }, [entity, item, t]);

  const endpoint = entity === "category" ? "/api/admin/taxonomy/categories" : "/api/admin/taxonomy/collections";

  function updateField(field: keyof TaxonomyFormValues, value: string) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.name.trim()) {
      setError(t("errorNameRequired"));
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(item ? `${endpoint}/${item.id}` : endpoint, {
        method: item ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as TaxonomyDto | { error?: string };

      if (!response.ok || !isTaxonomyDto(result)) {
        throw new Error("error" in result ? result.error ?? t("errorSave") : t("errorSave"));
      }

      onSaved(result);

      if (!item) {
        setValues(INITIAL_VALUES);
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("errorSave"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">{t("eyebrow")}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{t("description")}</p>
        </div>

        {item ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t("cancelEditButton")}
          </button>
        ) : null}
      </div>

      {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor={`${entity}-name`} className="text-sm font-medium text-zinc-900">
            {t("fieldName")}
          </label>
          <input
            id={`${entity}-name`}
            type="text"
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder={entity === "category" ? t("categoryNamePlaceholder") : t("collectionNamePlaceholder")}
            className="w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor={`${entity}-slug`} className="text-sm font-medium text-zinc-900">
            {t("fieldSlug")}
          </label>
          <input
            id={`${entity}-slug`}
            type="text"
            value={values.slug}
            onChange={(event) => updateField("slug", event.target.value)}
            placeholder={t("slugPlaceholder")}
            className="w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          />
          <p className="text-xs leading-5 text-zinc-500">{t("slugHint")}</p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor={`${entity}-description`} className="text-sm font-medium text-zinc-900">
            {t("fieldDescription")}
          </label>
          <textarea
            id={`${entity}-description`}
            value={values.description}
            onChange={(event) => updateField("description", event.target.value)}
            rows={3}
            placeholder={t("descriptionPlaceholder")}
            className="w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          />
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? t("savingButton") : item ? t("saveButton") : t("createButton")}
        </button>
      </div>
    </form>
  );
}
