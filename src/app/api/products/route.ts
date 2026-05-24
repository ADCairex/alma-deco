import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { buildPublicProductsOrderBy, buildPublicProductsWhere, formatPublicProduct, normalizePublicProductQuery, PUBLIC_PRODUCT_INCLUDE } from "@/lib/shop-products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const filters = normalizePublicProductQuery({
    category: searchParams.get("category") ?? undefined,
    categoria: searchParams.get("categoria") ?? undefined,
    collection: searchParams.get("collection") ?? undefined,
    coleccion: searchParams.get("coleccion") ?? undefined,
    featured: searchParams.get("featured") ?? undefined,
    nueva: searchParams.get("nueva") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
  });

  const products = await prisma.product.findMany({
    where: buildPublicProductsWhere(filters),
    include: PUBLIC_PRODUCT_INCLUDE,
    orderBy: buildPublicProductsOrderBy(filters.sort),
  });

  return NextResponse.json(products.map(formatPublicProduct));
}
