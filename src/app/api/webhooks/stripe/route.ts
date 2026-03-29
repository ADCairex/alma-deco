import { NextResponse } from "next/server";

import Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  try {
    const body = await request.text();
    const event = getStripe().webhooks.constructEvent(body, signature, getStripeWebhookSecret());

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          await prisma.order.updateMany({
            where: { id: orderId },
            data: {
              status: "paid",
              paymentId: typeof session.payment_intent === "string" ? session.payment_intent : session.id,
            },
          });
        }
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          await prisma.order.updateMany({
            where: { id: orderId },
            data: {
              status: "cancelled",
            },
          });
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error", error);
    return NextResponse.json({ error: "Webhook verification failed." }, { status: 400 });
  }
}
