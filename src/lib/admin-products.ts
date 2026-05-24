import { parseOptionalId, type TaxonomyRecord } from "@/lib/taxonomy";
import type { Product, ProductTaxonomyItem } from "@/types";

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

export const PRODUCT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024;

export type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  category: string;
  categoryId?: string | null;
  collectionId?: string | null;
  stock: string;
  imageUrl: string;
  images: string[];
  featured: boolean;
};

export type ProductWriteInput = {
  name: string;
  description: string | null;
  price: number;
  category: string;
  categoryId: string | null;
  collectionId: string | null;
  stock: number;
  imageUrl: string | null;
  images: string;
  featured: boolean;
};

export type ParsedProductPayload = {
  data: ProductWriteInput;
};

export const ADMIN_PRODUCT_INCLUDE = {
  categoryRef: true,
  collection: true,
};

export const DEFAULT_PRODUCT_FORM_VALUES: ProductFormValues = {
  name: "",
  description: "",
  price: "",
  category: "",
  categoryId: null,
  collectionId: null,
  stock: "0",
  imageUrl: "",
  images: [],
  featured: false,
};

function sanitizeImageList(images: unknown[]) {
  return images
    .filter((image): image is string => typeof image === "string")
    .map((image) => image.trim())
    .filter(Boolean);
}

export function parseProductImages(value: string | string[] | null | undefined) {
  if (Array.isArray(value)) {
    return sanitizeImageList(value);
  }

  if (typeof value !== "string") {
    return [];
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(trimmedValue) as unknown;
    return Array.isArray(parsedValue) ? sanitizeImageList(parsedValue) : [];
  } catch {
    return sanitizeImageList([trimmedValue]);
  }
}

export function serializeProductImages(value: string | string[] | null | undefined) {
  return JSON.stringify(parseProductImages(value));
}

export function formatAdminProduct(product: PrismaProductRecord): Product {
  const collection: ProductTaxonomyItem | null = product.collection
    ? {
        id: product.collection.id,
        name: product.collection.name,
        slug: product.collection.slug,
      }
    : null;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    currency: product.currency,
    category: product.categoryRef?.name ?? product.category,
    categoryId: product.categoryId ?? null,
    collectionId: product.collectionId ?? null,
    collection,
    stock: product.stock,
    imageUrl: product.imageUrl,
    images: parseProductImages(product.images),
    featured: product.featured,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export function formatAdminPrice(price: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(price);
}

function parseNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : fallback;
  }

  return fallback;
}

function parseBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value === "true";
  }

  return false;
}

export function parseProductPayload(payload: Record<string, unknown>): { data?: ParsedProductPayload; error?: string } {
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const description = typeof payload.description === "string" ? payload.description.trim() : "";
  const category = typeof payload.category === "string" ? payload.category.trim() : "";
  const categoryId = parseOptionalId(payload.categoryId);
  const collectionId = parseOptionalId(payload.collectionId);
  const price = parseNumber(payload.price, Number.NaN);
  const stock = Math.max(0, Math.trunc(parseNumber(payload.stock, 0)));
  const imageUrlValue = typeof payload.imageUrl === "string" ? payload.imageUrl.trim() : "";
  const images = parseProductImages(payload.images as string | string[] | null | undefined);
  const featured = parseBoolean(payload.featured);

  if (!name) {
    return { error: "El nombre es obligatorio." };
  }

  if (!Number.isFinite(price) || price < 0) {
    return { error: "El precio debe ser un número válido mayor o igual a 0." };
  }

  const imageUrl = imageUrlValue || images[0] || null;

  return {
    data: {
      data: {
        name,
        description: description || null,
        price,
        category,
        categoryId,
        collectionId,
        stock,
        imageUrl,
        images: serializeProductImages(images),
        featured,
      },
    },
  };
}

export function getProductImageCandidates(product: Pick<Product, "imageUrl" | "images">) {
  return [product.imageUrl, ...product.images].filter((image): image is string => Boolean(image));
}
