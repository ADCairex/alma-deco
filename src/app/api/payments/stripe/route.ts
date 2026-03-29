import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

type StripePaymentRequest = {
  orderId?: string;
};

function toStripeAmount(amount: number) {
  return Math.round(amount * 100);
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as StripePaymentRequest;
    const orderId = typeof payload.orderId === "string" ? payload.orderId.trim() : "";

    if (!orderId) {
      return NextResponse.json({ error: "Falta el identificador del pedido." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "No encontramos el pedido solicitado." }, { status: 404 });
    }

    const origin = new URL(request.url).origin;
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: order.items.map((item) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.product.name,
          },
          unit_amount: toStripeAmount(item.price),
        },
        quantity: item.quantity,
      })),
      success_url: `${origin}/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?cancelled=true`,
      metadata: {
        orderId: order.id,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentMethod: "stripe",
      },
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout session error", error);

    return NextResponse.json(
      { error: "No pudimos iniciar el pago con Stripe. Revisá la configuración e intentá de nuevo." },
      { status: 500 },
    );
  }
}
