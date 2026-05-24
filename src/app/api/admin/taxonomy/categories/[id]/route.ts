import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { formatTaxonomyItem, parseTaxonomyPayload } from "@/lib/taxonomy";

export async function GET(_request: Request, context: RouteContext<"/api/admin/taxonomy/categories/[id]">) {
  const { unauthorizedResponse } = await requireAdminSession();

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const { id } = await context.params;
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    return NextResponse.json({ error: "Categoría no encontrada." }, { status: 404 });
  }

  return NextResponse.json(formatTaxonomyItem(category));
}

export async function PUT(request: Request, context: RouteContext<"/api/admin/taxonomy/categories/[id]">) {
  const { unauthorizedResponse } = await requireAdminSession();

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const { id } = await context.params;
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    return NextResponse.json({ error: "Categoría no encontrada." }, { status: 404 });
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const { data, error } = parseTaxonomyPayload(payload, "category");

    if (error || !data) {
      return NextResponse.json({ error: error ?? "No se pudo validar la categoría." }, { status: 400 });
    }

    const conflictingCategory = await prisma.category.findFirst({
      where: {
        id: { not: id },
        OR: [{ name: data.name }, { slug: data.slug }],
      },
    });

    if (conflictingCategory) {
      return NextResponse.json({ error: "Ya existe una categoría con ese nombre o slug." }, { status: 409 });
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    return NextResponse.json(formatTaxonomyItem(category));
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar la categoría." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext<"/api/admin/taxonomy/categories/[id]">) {
  const { unauthorizedResponse } = await requireAdminSession();

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const { id } = await context.params;
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    return NextResponse.json({ error: "Categoría no encontrada." }, { status: 404 });
  }

  const unlinkedProducts = await prisma.$transaction(async (tx) => {
    const updateResult = await tx.product.updateMany({
      where: { categoryId: id },
      data: { category: "", categoryId: null },
    });

    await tx.category.delete({
      where: { id },
    });

    return updateResult.count;
  });

  return NextResponse.json({ success: true, unlinkedProducts });
}
