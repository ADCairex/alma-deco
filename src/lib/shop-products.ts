import { parseProductImages } from "@/lib/admin-products";
import type { TaxonomyRecord } from "@/lib/taxonomy";
import type { Product } from "@/types";

export type ProductSort = "newest" | "price_asc" | "price_desc";

type QueryValue = string | string[] | undefined;

export type PublicProductQuery = {
  category: string | null;
  collection: string | null;
  featured: boolean;
  search: string;
  sort: ProductSort;
};

export type PublicTaxonomyOption = {
  name: string;
  slug: string;
};

type PrismaProductRecord = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  category: string;
  categoryId?: string | null;
  categoryRef?: TaxonomyRecord | null;
  collectionId?: string | null;
  collection?: TaxonomyRecord | null;
  stock: number;
  imageUrl: string | null;
  images: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const DEFAULT_DESCRIPTION = "Descubrí piezas editoriales de Alma Deco para transformar tu casa con calidez y carácter.";

export const PUBLIC_PRODUCT_INCLUDE = {
  categoryRef: true,
  collection: true,
};

function readQueryValue(value: QueryValue) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeTaxonomyValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

export function normalizePublicTaxonomySlug(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const slug = normalizeTaxonomyValue(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
  return slug || null;
}

export function normalizePublicProductQuery(query: Record<string, QueryValue>): PublicProductQuery {
  const category = normalizePublicTaxonomySlug(readQueryValue(query.category) ?? readQueryValue(query.categoria));
  const collection = normalizePublicTaxonomySlug(readQueryValue(query.collection) ?? readQueryValue(query.coleccion));
  const featuredValue = readQueryValue(query.featured);
  const search = (readQueryValue(query.search) ?? "").trim();
  const sortValue = readQueryValue(query.sort);
  const sort: ProductSort =
    sortValue === "price_asc" || sortValue === "price_desc" || sortValue === "newest"
      ? sortValue
      : readQueryValue(query.nueva) === "1"
        ? "newest"
        : "newest";

  return {
    category,
    collection,
    featured: featuredValue === "true" || readQueryValue(query.nueva) === "1",
    search,
    sort,
  };
}

export function buildPublicProductsWhere(filters: PublicProductQuery) {
  return {
    stock: {
      gt: 0,
    },
    ...(filters.category
      ? {
          categoryRef: {
            slug: filters.category,
          },
        }
      : {}),
    ...(filters.collection
      ? {
          collection: {
            slug: filters.collection,
          },
        }
      : {}),
    ...(filters.featured ? { featured: true } : {}),
    ...(filters.search
      ? {
          name: {
            contains: filters.search,
          },
        }
      : {}),
  };
}

export function buildPublicCategoryOptions(categories: TaxonomyRecord[]): PublicTaxonomyOption[] {
  return categories.map((category) => ({ name: category.name, slug: category.slug })).sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function buildPublicCollectionOptions(collections: TaxonomyRecord[]): PublicTaxonomyOption[] {
  return collections.map((collection) => ({ name: collection.name, slug: collection.slug })).sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function buildPublicProductsOrderBy(sort: ProductSort) {
  switch (sort) {
    case "price_asc":
      return [{ price: "asc" as const }, { createdAt: "desc" as const }];
    case "price_desc":
      return [{ price: "desc" as const }, { createdAt: "desc" as const }];
    case "newest":
    default:
      return [{ createdAt: "desc" as const }];
  }
}

export function formatPublicProduct(product: PrismaProductRecord): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    currency: product.currency,
    category: product.categoryRef?.name ?? product.category,
    categoryId: product.categoryId ?? null,
    collectionId: product.collectionId ?? null,
    collection: product.collection
      ? {
          id: product.collection.id,
          name: product.collection.name,
          slug: product.collection.slug,
        }
      : null,
    stock: product.stock,
    imageUrl: product.imageUrl,
    images: parseProductImages(product.images),
    featured: product.featured,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export function formatProductPrice(price: number, currency = "EUR") {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

export function getProductGalleryImages(product: Pick<Product, "imageUrl" | "images">) {
  const uniqueImages = new Set<string>();

  for (const image of [product.imageUrl, ...product.images]) {
    if (typeof image === "string" && image.trim()) {
      uniqueImages.add(image.trim());
    }
  }

  return [...uniqueImages];
}

export function getProductSeoDescription(product: Pick<Product, "description" | "name" | "category">) {
  const categoryCopy = product.category?.trim() ? ` en la colección de ${product.category}` : "";
  return product.description?.trim() || `${product.name}${categoryCopy} de Alma Deco. ${DEFAULT_DESCRIPTION}`;
}

export function getStockStatus(stock: number) {
  if (stock <= 0) {
    return { label: "Agotado", tone: "text-red-600" };
  }

  if (stock < 5) {
    return { label: "Últimas unidades", tone: "text-orange-500" };
  }

  return { label: "En stock", tone: "text-emerald-600" };
}
