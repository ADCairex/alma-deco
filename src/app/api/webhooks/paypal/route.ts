import { NextResponse } from "next/server";

import { verifyPayPalWebhookSignature } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PayPalWebhookEvent = {
  event_type?: string;
  resource?: {
    id?: string;
    supplementary_data?: {
      related_ids?: {
        order_id?: string;
      };
    };
    custom_id?: string;
  };
};

async function resolveInternalOrderId(event: PayPalWebhookEvent) {
  const customId = event.resource?.custom_id?.trim();

  if (customId) {
    return customId;
  }

  const externalOrderId = event.resource?.supplementary_data?.related_ids?.order_id?.trim();

  if (!externalOrderId) {
    return null;
  }

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: externalOrderId }, { paymentId: externalOrderId }],
    },
    select: {
      id: true,
    },
  });

  return order?.id ?? null;
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const event = JSON.parse(body) as PayPalWebhookEvent;
    const isValid = await verifyPayPalWebhookSignature(event, request.headers);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid PayPal webhook signature." }, { status: 400 });
    }

    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const orderId = await resolveInternalOrderId(event);

      if (orderId) {
        await prisma.order.updateMany({
          where: { id: orderId },
          data: {
            status: "paid",
            paymentMethod: "paypal",
            paymentId: event.resource?.id ?? undefined,
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PayPal webhook error", error);
    return NextResponse.json({ error: "Webhook verification failed." }, { status: 400 });
  }
}
