export type TaxonomyEntity = "category" | "collection";

export type TaxonomyRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TaxonomyDto = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaxonomyWriteInput = {
  name: string;
  slug: string;
  description: string | null;
};

export function normalizeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function formatTaxonomyItem(item: TaxonomyRecord): TaxonomyDto {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function parseTaxonomyPayload(
  payload: Record<string, unknown>,
  entity: TaxonomyEntity,
): { data?: TaxonomyWriteInput; error?: string } {
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const slugSource = typeof payload.slug === "string" && payload.slug.trim() ? payload.slug : name;
  const slug = normalizeSlug(slugSource);
  const description = typeof payload.description === "string" ? payload.description.trim() : "";
  const label = entity === "category" ? "categoría" : "colección";

  if (!name) {
    return { error: `El nombre de la ${label} es obligatorio.` };
  }

  if (!slug) {
    return { error: `El slug de la ${label} no es válido.` };
  }

  return {
    data: {
      name,
      slug,
      description: description || null,
    },
  };
}

export function parseOptionalId(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue || null;
}

export function parseIdList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean))];
}
