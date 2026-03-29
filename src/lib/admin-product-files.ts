import "server-only";

import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

import { MAX_PRODUCT_IMAGE_SIZE, PRODUCT_IMAGE_TYPES } from "@/lib/admin-products";

const PRODUCT_UPLOAD_DIRECTORY = path.join(process.cwd(), "public", "uploads", "products");

const FILE_EXTENSION_BY_MIME_TYPE: Record<(typeof PRODUCT_IMAGE_TYPES)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

export async function ensureProductUploadDirectory() {
  await fs.mkdir(PRODUCT_UPLOAD_DIRECTORY, { recursive: true });
}

export function validateProductImageFile(file: File) {
  if (!PRODUCT_IMAGE_TYPES.includes(file.type as (typeof PRODUCT_IMAGE_TYPES)[number])) {
    throw new Error("Solo se permiten imágenes JPG, PNG o WEBP.");
  }

  if (file.size > MAX_PRODUCT_IMAGE_SIZE) {
    throw new Error("Cada imagen debe pesar menos de 5 MB.");
  }
}

export async function saveProductImageFile(file: File) {
  validateProductImageFile(file);
  await ensureProductUploadDirectory();

  const extension = FILE_EXTENSION_BY_MIME_TYPE[file.type as keyof typeof FILE_EXTENSION_BY_MIME_TYPE];
  const filename = `${randomUUID()}.${extension}`;
  const filePath = path.join(PRODUCT_UPLOAD_DIRECTORY, filename);
  const bytes = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(filePath, bytes);

  return `/uploads/products/${filename}`;
}

export function resolveProductUploadPath(fileUrl: string) {
  if (!fileUrl.startsWith("/uploads/products/")) {
    return null;
  }

  const relativeFilePath = fileUrl.replace(/^\/+/, "");
  const absoluteFilePath = path.join(process.cwd(), "public", relativeFilePath);
  const normalizedBasePath = path.normalize(PRODUCT_UPLOAD_DIRECTORY);
  const normalizedFilePath = path.normalize(absoluteFilePath);
  const relativeToBase = path.relative(normalizedBasePath, normalizedFilePath);

  if (relativeToBase.startsWith("..") || path.isAbsolute(relativeToBase)) {
    return null;
  }

  return normalizedFilePath;
}

export async function deleteProductImageFiles(fileUrls: string[]) {
  const uniqueFilePaths = [...new Set(fileUrls)]
    .map((fileUrl) => resolveProductUploadPath(fileUrl))
    .filter((filePath): filePath is string => Boolean(filePath));

  await Promise.all(
    uniqueFilePaths.map(async (filePath) => {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        if (isErrnoException(error) && error.code === "ENOENT") {
          return;
        }

        throw error;
      }
    }),
  );
}
