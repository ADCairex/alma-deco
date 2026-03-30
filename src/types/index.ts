export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  category: string;
  stock: number;
  imageUrl?: string | null;
  images: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  imageUrl?: string | null;
}

export type CheckoutPaymentMethod = "stripe" | "paypal";

export interface CartValidationError {
  productId: string;
  code: "empty_cart" | "product_removed" | "out_of_stock" | "insufficient_stock";
  message: string;
}

export interface ValidatedCartItem extends CartItem {
  currency: string;
  stockAvailable: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
}

export type AdminOrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export interface AdminOrderItem {
  id: string;
  quantity: number;
  price: number;
  productId: string;
  lineTotal: number;
  product: {
    id: string;
    name: string;
    category: string;
  };
}

export interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostal: string;
  shippingCountry: string;
  status: AdminOrderStatus;
  paymentMethod: string | null;
  paymentId: string | null;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
}

export interface AdminDashboardMonthlySales {
  monthKey: string;
  label: string;
  total: number;
}

export interface AdminDashboardTopProduct {
  productId: string;
  name: string;
  category: string;
  unitsSold: number;
}

export interface AdminDashboardCategorySales {
  category: string;
  unitsSold: number;
}

export interface AdminDashboardRecentOrder {
  id: string;
  customerName: string;
  total: number;
  currency: string;
  status: AdminOrderStatus;
  createdAt: string;
}

export interface AdminDashboardMetrics {
  totalSales: number;
  ordersToday: number;
  ordersThisMonth: number;
  activeProducts: number;
  outOfStockProducts: number;
  salesByCategory: AdminDashboardCategorySales[];
  topProducts: AdminDashboardTopProduct[];
  monthlySales: AdminDashboardMonthlySales[];
  recentOrders: AdminDashboardRecentOrder[];
}
