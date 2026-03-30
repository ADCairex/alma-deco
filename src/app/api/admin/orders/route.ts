import { NextResponse } from "next/server";

import { fetchAdminOrders } from "@/lib/admin-data";
import { requireAdminSession } from "@/lib/admin-api";

export async function GET(request: Request) {
  const { unauthorizedResponse } = await requireAdminSession();

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const orders = await fetchAdminOrders(status);

  return NextResponse.json(orders);
}
