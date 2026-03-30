import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-api";
import { fetchAdminDashboardMetrics } from "@/lib/admin-data";

export async function GET() {
  const { unauthorizedResponse } = await requireAdminSession();

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const metrics = await fetchAdminDashboardMetrics();

  return NextResponse.json(metrics);
}
