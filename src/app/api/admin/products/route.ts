import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-api";
import { ADMIN_PRODUCT_INCLUDE, formatAdminProduct, parseProductPayload, type ProductWriteInput } from "@/lib/admin-products";
import { prisma } from "@/lib/prisma";

async function resolveProductTaxonomy(data: ProductWriteInput) {
  const [category, collection] = await Promise.all([
    data.categoryId
      ? prisma.category.findUnique({
          where: { id: data.categoryId },
        })
      : null,
    data.collectionId
      ? prisma.collection.findUnique({
          where: {
            id: data.collectionId,
          },
        })
      : null,
  ]);

  if (data.categoryId && !category) {
    return { error: "La categoría seleccionada no existe." };
  }

  if (data.collectionId && !collection) {
    return { error: "La colección seleccionada no existe." };
  }

  return {
    data: {
      ...data,
      category: category?.name ?? data.category,
      categoryId: category?.id ?? null,
      collectionId: collection?.id ?? null,
    },
  };
}

export async function GET() {
  const { unauthorizedResponse } = await requireAdminSession();

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const products = await prisma.product.findMany({
    include: ADMIN_PRODUCT_INCLUDE,
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(products.map(formatAdminProduct));
}

export async function POST(request: Request) {
  const { unauthorizedResponse } = await requireAdminSession();

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const { data: parsedPayload, error } = parseProductPayload(payload);

    if (error || !parsedPayload) {
      return NextResponse.json({ error: error ?? "No se pudo validar el producto." }, { status: 400 });
    }

    const taxonomy = await resolveProductTaxonomy(parsedPayload.data);

    if (taxonomy.error || !taxonomy.data) {
      return NextResponse.json({ error: taxonomy.error ?? "No se pudo validar la taxonomía del producto." }, { status: 400 });
    }

    const createdProduct = await prisma.product.create({
      data: taxonomy.data,
    });

    const product = await prisma.product.findUniqueOrThrow({
      where: { id: createdProduct.id },
      include: ADMIN_PRODUCT_INCLUDE,
    });

    return NextResponse.json(formatAdminProduct(product), { status: 201 });
  } catch {
    return NextResponse.json({ error: "No se pudo crear el producto." }, { status: 400 });
  }
}
