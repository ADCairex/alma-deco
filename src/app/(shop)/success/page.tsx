import type { Metadata } from "next";

import { SuccessPageClient } from "@/components/shop/SuccessPageClient";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Pedido Confirmado",
  description: "Tu pedido en Alma Deco fue confirmado correctamente.",
  robots: {
    index: false,
    follow: false,
  },
};

type SuccessPageProps = {
  searchParams: Promise<{
    order?: string | string[];
    orderId?: string | string[];
    session_id?: string | string[];
    token?: string | string[];
  }>;
};

function getParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const resolvedSearchParams = await searchParams;
  const orderId = getParam(resolvedSearchParams.orderId) ?? getParam(resolvedSearchParams.order);
  const sessionId = getParam(resolvedSearchParams.session_id);
  const paypalToken = getParam(resolvedSearchParams.token);

  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })
    : null;

  return (
    <SuccessPageClient
      order={
        order
          ? {
              id: order.id,
              customerName: order.customerName,
              customerEmail: order.customerEmail,
              status: order.status,
              paymentMethod: order.paymentMethod,
              total: order.total,
              currency: order.currency,
              items: order.items.map((item) => ({
                id: item.id,
                name: item.product.name,
                quantity: item.quantity,
                price: item.price,
              })),
            }
          : null
      }
      orderId={orderId}
      sessionId={sessionId}
      paypalToken={paypalToken}
    />
  );
}
