import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-api";
import { formatAdminProduct, parseProductPayload } from "@/lib/admin-products";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { unauthorizedResponse } = await requireAdminSession();

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const products = await prisma.product.findMany({
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
    const { data, error } = parseProductPayload(payload);

    if (error || !data) {
      return NextResponse.json({ error: error ?? "No se pudo validar el producto." }, { status: 400 });
    }

    const product = await prisma.product.create({
      data,
    });

    return NextResponse.json(formatAdminProduct(product), { status: 201 });
  } catch {
    return NextResponse.json({ error: "No se pudo crear el producto." }, { status: 400 });
  }
}
