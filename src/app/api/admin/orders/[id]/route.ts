import { NextResponse } from "next/server";

import { fetchAdminOrderById } from "@/lib/admin-data";
import { formatAdminOrder, isAdminOrderStatus, normalizeOrderStatus, validateOrderStatusTransition } from "@/lib/admin-orders";
import { requireAdminSession } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

type UpdateOrderBody = {
  status?: unknown;
};

type OrderRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: OrderRouteContext) {
  const { unauthorizedResponse } = await requireAdminSession();

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const { id } = await context.params;
  const order = await fetchAdminOrderById(id);

  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PUT(request: Request, context: OrderRouteContext) {
  const { unauthorizedResponse } = await requireAdminSession();

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const { id } = await context.params;
  const existingOrder = await prisma.order.findUnique({
    where: { id },
  });

  if (!existingOrder) {
    return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
  }

  try {
    const body = (await request.json()) as UpdateOrderBody;
    const nextStatus = body.status;

    if (!isAdminOrderStatus(nextStatus)) {
      return NextResponse.json({ error: "El estado indicado no es válido." }, { status: 400 });
    }

    const currentStatus = normalizeOrderStatus(existingOrder.status);
    const transition = validateOrderStatusTransition(currentStatus, nextStatus);

    if (!transition.valid) {
      return NextResponse.json({ error: transition.error ?? "No se pudo actualizar el estado del pedido." }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: nextStatus,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(formatAdminOrder(updatedOrder));
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar el pedido." }, { status: 400 });
  }
}
