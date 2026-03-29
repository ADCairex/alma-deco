import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-api";
import { saveProductImageFile } from "@/lib/admin-product-files";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { unauthorizedResponse } = await requireAdminSession();

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter((value): value is File => value instanceof File);

    if (!files.length) {
      return NextResponse.json({ error: "Debés adjuntar al menos una imagen." }, { status: 400 });
    }

    const urls = await Promise.all(files.map((file) => saveProductImageFile(file)));

    return NextResponse.json(urls);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudieron subir las imágenes.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
