import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { formatTaxonomyItem, parseTaxonomyPayload } from "@/lib/taxonomy";

export async function GET() {
  const { unauthorizedResponse } = await requireAdminSession();

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(categories.map(formatTaxonomyItem));
}

export async function POST(request: Request) {
  const { unauthorizedResponse } = await requireAdminSession();

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const { data, error } = parseTaxonomyPayload(payload, "category");

    if (error || !data) {
      return NextResponse.json({ error: error ?? "No se pudo validar la categoría." }, { status: 400 });
    }

    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [{ name: data.name }, { slug: data.slug }],
      },
    });

    if (existingCategory) {
      return NextResponse.json({ error: "Ya existe una categoría con ese nombre o slug." }, { status: 409 });
    }

    const category = await prisma.category.create({ data });

    return NextResponse.json(formatTaxonomyItem(category), { status: 201 });
  } catch {
    return NextResponse.json({ error: "No se pudo crear la categoría." }, { status: 400 });
  }
}
