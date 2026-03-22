import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useNavigate } from "react-router-dom";
import { createPayPalOrder, capturePayPalOrder } from "../api/client";
import { useCartStore } from "../store/cartStore";

const PAYPAL_CLIENT_ID =
  import.meta.env.VITE_PAYPAL_CLIENT_ID || "test";

export default function PayPalButton() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const navigate = useNavigate();

  const cartItems = items.map((i) => ({
    product_id: i.product_id,
    quantity: i.quantity,
  }));

  return (
    <PayPalScriptProvider
      options={{
        clientId: PAYPAL_CLIENT_ID,
        currency: "EUR",
        intent: "capture",
      }}
    >
      <PayPalButtons
        style={{
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
        }}
        createOrder={async () => {
          const { order_id } = await createPayPalOrder(cartItems);
          return order_id;
        }}
        onApprove={async (data) => {
          const result = await capturePayPalOrder(data.orderID);
          if (result.status === "COMPLETED") {
            clearCart();
            navigate("/success?method=paypal");
          }
        }}
        onError={(err) => {
          console.error("PayPal error:", err);
        }}
      />
    </PayPalScriptProvider>
  );
}
