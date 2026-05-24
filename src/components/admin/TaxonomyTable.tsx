"use client";

import { useTranslations } from "next-intl";

import type { TaxonomyDto, TaxonomyEntity } from "@/lib/taxonomy";

type TaxonomyTableProps = {
  entity: TaxonomyEntity;
  items: TaxonomyDto[];
  deletingItemId: string | null;
  onEdit: (item: TaxonomyDto) => void;
  onDelete: (item: TaxonomyDto) => void;
};

export function TaxonomyTable({ entity, items, deletingItemId, onEdit, onDelete }: TaxonomyTableProps) {
  const t = useTranslations("admin.taxonomy.table");
  const emptyTitle = entity === "category" ? t("emptyCategoriesTitle") : t("emptyCollectionsTitle");
  const emptyDescription = entity === "category" ? t("emptyCategoriesDescription") : t("emptyCollectionsDescription");

  if (!items.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center">
        <h3 className="text-xl font-semibold text-zinc-950">{emptyTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-500">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
              <th className="px-6 py-4">{t("nameColumn")}</th>
              <th className="px-6 py-4">{t("slugColumn")}</th>
              <th className="px-6 py-4">{t("descriptionColumn")}</th>
              <th className="px-6 py-4">{t("actionsColumn")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.map((item) => (
              <tr key={item.id} className="align-middle text-sm text-zinc-700">
                <td className="px-6 py-4 font-semibold text-zinc-950">{item.name}</td>
                <td className="px-6 py-4">
                  <code className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">{item.slug}</code>
                </td>
                <td className="max-w-md px-6 py-4 text-zinc-500">{item.description || t("noDescription")}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50"
                    >
                      {t("editButton")}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      disabled={deletingItemId === item.id}
                      className="inline-flex items-center justify-center rounded-2xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingItemId === item.id ? t("deletingButton") : t("deleteButton")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
