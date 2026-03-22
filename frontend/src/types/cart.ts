export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

export interface ValidatedCartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  image_url: string;
}

export interface CartValidationResponse {
  items: ValidatedCartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}
