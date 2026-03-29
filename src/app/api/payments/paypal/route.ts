import { NextResponse } from "next/server";

import { capturePayPalOrder, createPayPalOrder, formatPayPalAmount, PayPalApiError } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";

type PayPalRequestBody = {
  action?: "create" | "capture";
  orderId?: string;
  paypalOrderId?: string;
};

function getApprovalUrl(links?: Array<{ href: string; rel: string }>) {
  return links?.find((link) => link.rel === "approve")?.href ?? null;
}

async function getOrder(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}

function serializeOrder(
  order: {
    id: string;
    customerName: string;
    customerEmail: string;
    status: string;
    paymentMethod: string | null;
    total: number;
    currency: string;
    items: Array<{
      id: string;
      quantity: number;
      price: number;
      product: {
        name: string;
      };
    }>;
  },
) {
  return {
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
  };
}

async function createOrderPayment(request: Request, body: PayPalRequestBody) {
  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";

  if (!orderId) {
    return NextResponse.json({ error: "Falta el identificador del pedido." }, { status: 400 });
  }

  const order = await getOrder(orderId);

  if (!order) {
    return NextResponse.json({ error: "No encontramos el pedido solicitado." }, { status: 404 });
  }

  const origin = new URL(request.url).origin;
  const paypalOrder = await createPayPalOrder({
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: order.id,
        custom_id: order.id,
        items: order.items.map((item) => ({
          name: item.product.name,
          quantity: String(item.quantity),
          unit_amount: {
            currency_code: "EUR",
            value: formatPayPalAmount(item.price),
          },
        })),
        amount: {
          currency_code: "EUR",
          value: formatPayPalAmount(order.total),
          breakdown: {
            item_total: {
              currency_code: "EUR",
              value: formatPayPalAmount(order.total),
            },
          },
        },
      },
    ],
    application_context: {
      return_url: `${origin}/success?orderId=${order.id}`,
      cancel_url: `${origin}/checkout?cancelled=true`,
      user_action: "PAY_NOW",
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentMethod: "paypal",
    },
  });

  const approvalUrl = getApprovalUrl(paypalOrder.links);

  if (!approvalUrl) {
    throw new Error("PayPal did not return an approval URL.");
  }

  return NextResponse.json({
    paypalOrderId: paypalOrder.id,
    approvalUrl,
  });
}

async function captureOrderPayment(body: PayPalRequestBody) {
  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  const paypalOrderId = typeof body.paypalOrderId === "string" ? body.paypalOrderId.trim() : "";

  if (!orderId || !paypalOrderId) {
    return NextResponse.json({ error: "Faltan datos para capturar el pago de PayPal." }, { status: 400 });
  }

  const order = await getOrder(orderId);

  if (!order) {
    return NextResponse.json({ error: "No encontramos el pedido solicitado." }, { status: 404 });
  }

  if (order.status === "paid") {
    return NextResponse.json({
      success: true,
      order: serializeOrder(order),
    });
  }

  const capture = await capturePayPalOrder(paypalOrderId);
  const captureStatus = capture.status === "COMPLETED" || capture.status === "APPROVED";

  if (!captureStatus) {
    return NextResponse.json({ error: "PayPal no confirmó la captura del pago." }, { status: 400 });
  }

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "paid",
      paymentMethod: "paypal",
      paymentId: paypalOrderId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    order: serializeOrder(updatedOrder),
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PayPalRequestBody;
    const action = body.action ?? "create";

    if (action === "capture") {
      return captureOrderPayment(body);
    }

    return createOrderPayment(request, body);
  } catch (error) {
    console.error("PayPal payment error", error);

    if (error instanceof PayPalApiError) {
      return NextResponse.json(
        { error: "No pudimos iniciar el pago con PayPal. Revisá la configuración e intentá de nuevo." },
        { status: error.status >= 400 && error.status < 600 ? error.status : 500 },
      );
    }

    return NextResponse.json(
      { error: "No pudimos procesar el pago con PayPal en este momento." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  return POST(request);
}
