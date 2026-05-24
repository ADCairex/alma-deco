import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { formatTaxonomyItem, parseTaxonomyPayload } from "@/lib/taxonomy";

export async function GET() {
  const { unauthorizedResponse } = await requireAdminSession();

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const collections = await prisma.collection.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(collections.map(formatTaxonomyItem));
}

export async function POST(request: Request) {
  const { unauthorizedResponse } = await requireAdminSession();

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const { data, error } = parseTaxonomyPayload(payload, "collection");

    if (error || !data) {
      return NextResponse.json({ error: error ?? "No se pudo validar la colección." }, { status: 400 });
    }

    const existingCollection = await prisma.collection.findFirst({
      where: {
        OR: [{ name: data.name }, { slug: data.slug }],
      },
    });

    if (existingCollection) {
      return NextResponse.json({ error: "Ya existe una colección con ese nombre o slug." }, { status: 409 });
    }

    const collection = await prisma.collection.create({ data });

    return NextResponse.json(formatTaxonomyItem(collection), { status: 201 });
  } catch {
    return NextResponse.json({ error: "No se pudo crear la colección." }, { status: 400 });
  }
}
