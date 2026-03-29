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
