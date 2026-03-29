import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-api";
import { deleteProductImageFiles } from "@/lib/admin-product-files";
import { formatAdminProduct, getProductImageCandidates, parseProductPayload } from "@/lib/admin-products";
import { prisma } from "@/lib/prisma";

async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
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
    const { data, error } = parseProductPayload(payload);

    if (error || !data) {
      return NextResponse.json({ error: error ?? "No se pudo validar el producto." }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data,
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
