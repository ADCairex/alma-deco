"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import type { TaxonomyDto, TaxonomyEntity } from "@/lib/taxonomy";

import { TaxonomyForm } from "./TaxonomyForm";
import { TaxonomyTable } from "./TaxonomyTable";

type TaxonomyManagerProps = {
  initialCategories: TaxonomyDto[];
  initialCollections: TaxonomyDto[];
};

type DeleteResult = {
  success?: boolean;
  unlinkedProducts?: number;
  error?: string;
};

function getEndpoint(entity: TaxonomyEntity) {
  return entity === "category" ? "/api/admin/taxonomy/categories" : "/api/admin/taxonomy/collections";
}

function sortByName(items: TaxonomyDto[]) {
  return [...items].sort((first, second) => first.name.localeCompare(second.name, "es"));
}

export function TaxonomyManager({ initialCategories, initialCollections }: TaxonomyManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [collections, setCollections] = useState(initialCollections);
  const [activeEntity, setActiveEntity] = useState<TaxonomyEntity>("category");
  const [editingItem, setEditingItem] = useState<TaxonomyDto | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [pageMessage, setPageMessage] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const t = useTranslations("admin.taxonomy");

  const activeItems = activeEntity === "category" ? categories : collections;
  const setActiveItems = activeEntity === "category" ? setCategories : setCollections;
  const categoryCount = categories.length;
  const collectionCount = collections.length;

  function handleSaved(item: TaxonomyDto) {
    setActiveItems((currentItems) => {
      const existingItem = currentItems.some((currentItem) => currentItem.id === item.id);
      return sortByName(existingItem ? currentItems.map((currentItem) => (currentItem.id === item.id ? item : currentItem)) : [...currentItems, item]);
    });
    setEditingItem(null);
    setPageError(null);
    setPageMessage(activeEntity === "category" ? t("categorySavedMessage") : t("collectionSavedMessage"));
  }

  async function handleDelete(item: TaxonomyDto) {
    const confirmed = window.confirm(
      activeEntity === "category"
        ? t("deleteCategoryConfirm", { name: item.name })
        : t("deleteCollectionConfirm", { name: item.name }),
    );

    if (!confirmed) {
      return;
    }

    setDeletingItemId(item.id);
    setPageError(null);
    setPageMessage(null);

    try {
      const response = await fetch(`${getEndpoint(activeEntity)}/${item.id}`, { method: "DELETE" });
      const result = (await response.json()) as DeleteResult;

      if (!response.ok) {
        throw new Error(result.error ?? t("errorDelete"));
      }

      setActiveItems((currentItems) => currentItems.filter((currentItem) => currentItem.id !== item.id));
      setEditingItem((currentItem) => (currentItem?.id === item.id ? null : currentItem));
      setPageMessage(
        activeEntity === "category"
          ? t("categoryDeletedMessage", { count: result.unlinkedProducts ?? 0 })
          : t("collectionDeletedMessage", { count: result.unlinkedProducts ?? 0 }),
      );
    } catch (deleteError) {
      setPageError(deleteError instanceof Error ? deleteError.message : t("errorDelete"));
    } finally {
      setDeletingItemId(null);
    }
  }

  function handleEntityChange(entity: TaxonomyEntity) {
    setActiveEntity(entity);
    setEditingItem(null);
    setPageError(null);
    setPageMessage(null);
  }

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-sm">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(120,113,108,0.18),_transparent_36%),linear-gradient(135deg,_#fff,_#f4f4f5)] p-6 lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">{t("featureBadge")}</p>
          <div className="mt-3 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">{t("title")}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600 sm:text-base">{t("description")}</p>
            </div>
            <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
              <span className="font-semibold">{t("deletePolicyTitle")}</span> {t("deletePolicyDescription")}
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-t border-zinc-200 p-6 md:grid-cols-2 lg:p-8">
          <button
            type="button"
            onClick={() => handleEntityChange("category")}
            className={`rounded-3xl border p-5 text-left transition ${
              activeEntity === "category" ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-zinc-50 text-zinc-950 hover:bg-white"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">{t("categoriesTab")}</p>
            <p className="mt-2 text-3xl font-semibold">{categoryCount}</p>
            <p className="mt-2 text-sm opacity-75">{t("categoriesTabDescription")}</p>
          </button>
          <button
            type="button"
            onClick={() => handleEntityChange("collection")}
            className={`rounded-3xl border p-5 text-left transition ${
              activeEntity === "collection" ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-zinc-50 text-zinc-950 hover:bg-white"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">{t("collectionsTab")}</p>
            <p className="mt-2 text-3xl font-semibold">{collectionCount}</p>
            <p className="mt-2 text-sm opacity-75">{t("collectionsTabDescription")}</p>
          </button>
        </div>
      </div>

      {pageMessage ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{pageMessage}</div> : null}
      {pageError ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pageError}</div> : null}

      <TaxonomyForm entity={activeEntity} item={editingItem} onCancel={() => setEditingItem(null)} onSaved={handleSaved} />

      <TaxonomyTable
        entity={activeEntity}
        items={activeItems}
        deletingItemId={deletingItemId}
        onEdit={setEditingItem}
        onDelete={handleDelete}
      />
    </section>
  );
}
