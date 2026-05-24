import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-api";
import { deleteProductImageFiles } from "@/lib/admin-product-files";
import { ADMIN_PRODUCT_INCLUDE, formatAdminProduct, getProductImageCandidates, parseProductPayload, type ProductWriteInput } from "@/lib/admin-products";
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

async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: ADMIN_PRODUCT_INCLUDE,
  });
}

export async function GET(_request: Request, context: RouteContext<"/api/admin/products/[id]">) {
  const { unauthorizedResponse } = await requireAdminSession();

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const { id } = await context.params;
  const product = await getProductById(id);

  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
  }

  return NextResponse.json(formatAdminProduct(product));
}

export async function PUT(request: Request, context: RouteContext<"/api/admin/products/[id]">) {
  const { unauthorizedResponse } = await requireAdminSession();

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const { id } = await context.params;
  const existingProduct = await getProductById(id);

  if (!existingProduct) {
    return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
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

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: taxonomy.data,
    });

    const product = await prisma.product.findUniqueOrThrow({
      where: { id: updatedProduct.id },
      include: ADMIN_PRODUCT_INCLUDE,
    });

    return NextResponse.json(formatAdminProduct(product));
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar el producto." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext<"/api/admin/products/[id]">) {
  const { unauthorizedResponse } = await requireAdminSession();

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const { id } = await context.params;
  const existingProduct = await getProductById(id);

  if (!existingProduct) {
    return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
  }

  const normalizedProduct = formatAdminProduct(existingProduct);

  await prisma.product.delete({
    where: { id },
  });

  await deleteProductImageFiles(getProductImageCandidates(normalizedProduct));

  return NextResponse.json({ success: true });
}
