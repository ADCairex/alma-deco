-- Admin taxonomy foundation.
-- Keeps Product.category as the legacy display/rollback field while adding nullable relational taxonomy.

CREATE TABLE IF NOT EXISTS "Category" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Collection" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Collection_name_key" ON "Collection"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Collection_slug_key" ON "Collection"("slug");

ALTER TABLE "Product" ADD COLUMN "categoryId" TEXT REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Product" ADD COLUMN "collectionId" TEXT REFERENCES "Collection" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "Product_collectionId_idx" ON "Product"("collectionId");

-- Backfill categories from the legacy Product.category value. This guard is safe for partial reruns.
INSERT OR IGNORE INTO "Category" ("id", "name", "slug", "createdAt", "updatedAt")
SELECT
  'cat_' || lower(hex(randomblob(12))),
  trimmed."name",
  lower(replace(replace(replace(replace(replace(replace(trimmed."name", 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), ' ', '-')),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM (
  SELECT DISTINCT trim("category") AS "name"
  FROM "Product"
  WHERE "category" IS NOT NULL AND trim("category") <> ''
) AS trimmed;

UPDATE "Product"
SET "categoryId" = (
  SELECT "Category"."id"
  FROM "Category"
  WHERE "Category"."name" = trim("Product"."category")
)
WHERE "categoryId" IS NULL
  AND "category" IS NOT NULL
  AND trim("category") <> '';
