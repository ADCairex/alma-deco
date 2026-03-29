import { prisma } from "@/lib/prisma";
import type { CartItem, CartValidationError, CheckoutPaymentMethod, ValidatedCartItem } from "@/types";

type RawCartItem = {
  productId: string;
  quantity: number;
};

type CheckoutCustomerInput = {
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

type ParsedCheckoutPayload = {
  customer: CheckoutCustomerInput;
  cartItems: RawCartItem[];
  paymentMethod: CheckoutPaymentMethod;
};

type CartValidationResult = {
  valid: boolean;
  items: ValidatedCartItem[];
  errors: CartValidationError[];
};

const VALID_PAYMENT_METHODS: CheckoutPaymentMethod[] = ["stripe", "paypal"];
const VALID_COUNTRIES = ["España", "Portugal", "Francia", "Italia", "Alemania"];

function normalizeCartItems(input: unknown) {
  const rawItems = Array.isArray(input)
    ? input
    : typeof input === "object" && input !== null && "items" in input && Array.isArray(input.items)
      ? input.items
      : null;

  if (!rawItems) {
    return [] as RawCartItem[];
  }

  const mergedItems = new Map<string, number>();

  for (const rawItem of rawItems) {
    if (typeof rawItem !== "object" || rawItem === null) {
      continue;
    }

    const item = rawItem as Record<string, unknown>;

    const productId = typeof item.productId === "string" ? item.productId.trim() : "";
    const quantity = typeof item.quantity === "number" && Number.isFinite(item.quantity) ? Math.trunc(item.quantity) : 0;

    if (!productId || quantity <= 0) {
      continue;
    }

    mergedItems.set(productId, (mergedItems.get(productId) ?? 0) + quantity);
  }

  return [...mergedItems.entries()].map(([productId, quantity]) => ({ productId, quantity }));
}

export async function validateCartItems(input: unknown): Promise<CartValidationResult> {
  const normalizedItems = normalizeCartItems(input);

  if (normalizedItems.length === 0) {
    return {
      valid: false,
      items: [],
      errors: [
        {
          productId: "cart",
          code: "empty_cart",
          message: "Tu carrito está vacío.",
        },
      ],
    };
  }

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: normalizedItems.map((item) => item.productId),
      },
    },
  });

  const productMap = new Map(products.map((product) => [product.id, product]));
  const validatedItems: ValidatedCartItem[] = [];
  const errors: CartValidationError[] = [];

  for (const item of normalizedItems) {
    const product = productMap.get(item.productId);

    if (!product) {
      errors.push({
        productId: item.productId,
        code: "product_removed",
        message: "Uno de los productos ya no está disponible.",
      });
      continue;
    }

    if (product.stock <= 0) {
      errors.push({
        productId: item.productId,
        code: "out_of_stock",
        message: `${product.name} está agotado en este momento.`,
      });
      continue;
    }

    if (product.stock < item.quantity) {
      errors.push({
        productId: item.productId,
        code: "insufficient_stock",
        message: `${product.name} solo tiene ${product.stock} unidad${product.stock === 1 ? "" : "es"} disponible${product.stock === 1 ? "" : "s"}.`,
      });
      continue;
    }

    validatedItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: item.quantity,
      currency: product.currency,
      stockAvailable: product.stock,
    });
  }

  return {
    valid: errors.length === 0,
    items: validatedItems,
    errors,
  };
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function parseCheckoutPayload(payload: unknown): { data?: ParsedCheckoutPayload; error?: string } {
  if (typeof payload !== "object" || payload === null) {
    return { error: "No se pudo leer la información del checkout." };
  }

  const body = payload as Record<string, unknown>;

  const name = readString(body.name);
  const email = readString(body.email);
  const address = readString(body.address);
  const city = readString(body.city);
  const postalCode = readString(body.postalCode);
  const country = readString(body.country);
  const paymentMethod = readString(body.paymentMethod) as CheckoutPaymentMethod;
  const cartItems = normalizeCartItems(body.cartItems);

  if (!name || !email || !address || !city || !postalCode || !country) {
    return { error: "Completá todos los datos de envío antes de confirmar el pedido." };
  }

  if (!isValidEmail(email)) {
    return { error: "Ingresá un email válido para continuar." };
  }

  if (!VALID_COUNTRIES.includes(country)) {
    return { error: "Seleccioná un país de envío válido." };
  }

  if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    return { error: "Seleccioná un método de pago válido." };
  }

  if (cartItems.length === 0) {
    return { error: "Tu carrito está vacío." };
  }

  return {
    data: {
      customer: {
        name,
        email,
        address,
        city,
        postalCode,
        country,
      },
      cartItems,
      paymentMethod,
    },
  };
}

export function calculateCartTotal(items: Pick<CartItem, "price" | "quantity">[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}
