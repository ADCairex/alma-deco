import { NextResponse } from "next/server";

import { validateCartItems } from "@/lib/cart-validation";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as unknown;
    const validation = await validateCartItems(payload);

    return NextResponse.json(validation, {
      status: validation.valid ? 200 : 409,
    });
  } catch {
    return NextResponse.json({ error: "No se pudo validar el carrito." }, { status: 400 });
  }
}
