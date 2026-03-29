import "server-only";

import { NextResponse } from "next/server";

import { auth } from "@/auth";

export async function requireAdminSession() {
  const session = await auth();

  if (!session) {
    return {
      session: null,
      unauthorizedResponse: NextResponse.json({ error: "No autorizado." }, { status: 401 }),
    };
  }

  return {
    session,
    unauthorizedResponse: null,
  };
}
