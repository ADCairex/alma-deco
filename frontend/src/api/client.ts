import type { Product } from "../types/product";
import type { CartValidationResponse } from "../types/cart";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Error ${res.status}`);
  }
  return res.json();
}

// Products
export function getProducts(): Promise<Product[]> {
  return request<Product[]>("/api/products");
}

export function getProduct(id: string): Promise<Product> {
  return request<Product>(`/api/products/${id}`);
}

// Cart validation
export function validateCart(
  items: { product_id: string; quantity: number }[]
): Promise<CartValidationResponse> {
  return request<CartValidationResponse>("/api/cart/validate", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

// Stripe
export function createStripeSession(
  items: { product_id: string; quantity: number }[]
): Promise<{ url: string }> {
  return request<{ url: string }>(
    "/api/payments/stripe/create-checkout-session",
    {
      method: "POST",
      body: JSON.stringify({ items }),
    }
  );
}

// PayPal
export function createPayPalOrder(
  items: { product_id: string; quantity: number }[]
): Promise<{ order_id: string }> {
  return request<{ order_id: string }>(
    "/api/payments/paypal/create-order",
    {
      method: "POST",
      body: JSON.stringify({ items }),
    }
  );
}

export function capturePayPalOrder(
  orderId: string
): Promise<{ status: string; order_id: string }> {
  return request<{ status: string; order_id: string }>(
    "/api/payments/paypal/capture-order",
    {
      method: "POST",
      body: JSON.stringify({ order_id: orderId }),
    }
  );
}
