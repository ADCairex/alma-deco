import type { Product } from "../types/product";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "alma-admin-2024";

async function adminRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Token": ADMIN_TOKEN,
    },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  created_at: string;
  status: string;
  payment_method: string;
  total_amount: number;
  items: OrderItem[];
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
  units_sold: number;
}

export interface Metrics {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  orders_this_month: number;
  revenue_this_month: number;
  monthly: MonthlyRevenue[];
  by_category: CategoryRevenue[];
}

export function getAdminMetrics(): Promise<Metrics> {
  return adminRequest<Metrics>("/api/admin/metrics");
}

export function getAdminOrders(): Promise<Order[]> {
  return adminRequest<Order[]>("/api/admin/orders");
}

export function getAdminProducts(): Promise<Product[]> {
  return adminRequest<Product[]>("/api/admin/products");
}

export function createAdminProduct(data: Omit<Product, "id"> & { id: string }): Promise<Product> {
  return adminRequest<Product>("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAdminProduct(id: string, data: Partial<Product>): Promise<Product> {
  return adminRequest<Product>(`/api/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteAdminProduct(id: string): Promise<void> {
  return adminRequest<void>(`/api/admin/products/${id}`, { method: "DELETE" });
}

export async function uploadProductImages(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  const res = await fetch(`${API_BASE}/api/admin/upload`, {
    method: "POST",
    headers: { "X-Admin-Token": ADMIN_TOKEN },
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Error ${res.status}`);
  }
  const data = await res.json();
  return data.urls as string[];
}
