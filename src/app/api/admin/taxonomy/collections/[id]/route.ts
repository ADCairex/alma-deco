import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { formatTaxonomyItem, parseTaxonomyPayload } from "@/lib/taxonomy";

export async function GET(_request: Request, context: RouteContext<"/api/admin/taxonomy/collections/[id]">) {
  const { unauthorizedResponse } = await requireAdminSession();

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const { id } = await context.params;
  const collection = await prisma.collection.findUnique({
    where: { id },
  });

  if (!collection) {
    return NextResponse.json({ error: "Colección no encontrada." }, { status: 404 });
  }

  return NextResponse.json(formatTaxonomyItem(collection));
}

export async function PUT(request: Request, context: RouteContext<"/api/admin/taxonomy/collections/[id]">) {
  const { unauthorizedResponse } = await requireAdminSession();

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const { id } = await context.params;
  const existingCollection = await prisma.collection.findUnique({
    where: { id },
  });

  if (!existingCollection) {
    return NextResponse.json({ error: "Colección no encontrada." }, { status: 404 });
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const { data, error } = parseTaxonomyPayload(payload, "collection");

    if (error || !data) {
      return NextResponse.json({ error: error ?? "No se pudo validar la colección." }, { status: 400 });
    }

    const conflictingCollection = await prisma.collection.findFirst({
      where: {
        id: { not: id },
        OR: [{ name: data.name }, { slug: data.slug }],
      },
    });

    if (conflictingCollection) {
      return NextResponse.json({ error: "Ya existe una colección con ese nombre o slug." }, { status: 409 });
    }

    const collection = await prisma.collection.update({
      where: { id },
      data,
    });

    return NextResponse.json(formatTaxonomyItem(collection));
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar la colección." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext<"/api/admin/taxonomy/collections/[id]">) {
  const { unauthorizedResponse } = await requireAdminSession();

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const { id } = await context.params;
  const existingCollection = await prisma.collection.findUnique({
    where: { id },
  });

  if (!existingCollection) {
    return NextResponse.json({ error: "Colección no encontrada." }, { status: 404 });
  }

  const unlinkedProducts = await prisma.$transaction(async (tx) => {
    const linkedProducts = await tx.product.count({
      where: { collectionId: id },
    });

    await tx.product.updateMany({
      where: { collectionId: id },
      data: { collectionId: null },
    });

    await tx.collection.delete({
      where: { id },
    });

    return linkedProducts;
  });

  return NextResponse.json({ success: true, unlinkedProducts });
}
