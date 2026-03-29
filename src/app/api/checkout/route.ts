import { NextResponse } from "next/server";

import { calculateCartTotal, parseCheckoutPayload, validateCartItems } from "@/lib/cart-validation";
import { prisma } from "@/lib/prisma";

class CheckoutValidationError extends Error {}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as unknown;
    const { data, error } = parseCheckoutPayload(payload);

    if (error || !data) {
      return NextResponse.json({ error: error ?? "No se pudo procesar el checkout." }, { status: 400 });
    }

    const validation = await validateCartItems(data.cartItems);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Tu carrito cambió. Revisalo antes de continuar.",
          items: validation.items,
          errors: validation.errors,
        },
        { status: 409 },
      );
    }

    const currency = validation.items[0]?.currency ?? "EUR";
    const total = calculateCartTotal(validation.items);

    const order = await prisma.$transaction(async (tx) => {
      for (const item of validation.items) {
        const updateResult = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updateResult.count === 0) {
          throw new CheckoutValidationError(`No hay stock suficiente para ${item.name}.`);
        }
      }

      return tx.order.create({
        data: {
          customerName: data.customer.name,
          customerEmail: data.customer.email,
          shippingAddress: data.customer.address,
          shippingCity: data.customer.city,
          shippingPostal: data.customer.postalCode,
          shippingCountry: data.customer.country,
          paymentMethod: data.paymentMethod,
          status: "pending",
          total,
          currency,
          items: {
            create: validation.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });
    });

    return NextResponse.json({
      orderId: order.id,
    });
  } catch (error) {
    if (error instanceof CheckoutValidationError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json({ error: "No se pudo crear el pedido." }, { status: 400 });
  }
}
