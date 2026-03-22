import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import CartSummary from "../components/CartSummary";
import PayPalButton from "../components/PayPalButton";
import { createStripeSession } from "../api/client";

const TAX_RATE = 0.21;
const SHIPPING = 5.99;

export default function Checkout() {
  const items = useCartStore((s) => s.items);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<"stripe" | "paypal">("stripe");

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const shipping = SHIPPING;
  const total = subtotal + tax + shipping;

  const cartItems = items.map((i) => ({
    product_id: i.product_id,
    quantity: i.quantity,
  }));

  const handleStripe = async () => {
    setLoading(true);
    setError(null);
    try {
      const { url } = await createStripeSession(cartItems);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar pago");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/cart"
        className="text-stone-600 hover:text-black font-medium text-sm mb-6 inline-block"
      >
        ← Volver al carrito
      </Link>

      <h1 className="font-serif text-3xl font-bold text-stone-800 mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Payment method */}
        <div>
          <h2 className="font-semibold text-lg text-stone-800 mb-4">
            Método de pago
          </h2>

          {/* Method tabs */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setMethod("stripe")}
              className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                method === "stripe"
                  ? "border-black bg-stone-50 text-black"
                  : "border-stone-200 text-stone-500 hover:border-stone-300"
              }`}
            >
              💳 Stripe
            </button>
            <button
              onClick={() => setMethod("paypal")}
              className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                method === "paypal"
                  ? "border-black bg-stone-50 text-black"
                  : "border-stone-200 text-stone-500 hover:border-stone-300"
              }`}
            >
              🅿️ PayPal
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
              <p>{error}</p>
            </div>
          )}

          {method === "stripe" && (
            <div className="space-y-4">
              <p className="text-stone-500 text-sm">
                Serás redirigido a Stripe para completar el pago de forma
                segura. No almacenamos datos de tu tarjeta.
              </p>
              <button
                onClick={handleStripe}
                disabled={loading}
                className="w-full bg-black hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-xs font-semibold tracking-widest uppercase py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Procesando...
                  </>
                ) : (
                  "Pagar con Stripe"
                )}
              </button>
            </div>
          )}

          {method === "paypal" && (
            <div className="space-y-4">
              <p className="text-stone-500 text-sm">
                Usa tu cuenta de PayPal para completar el pago de forma segura.
              </p>
              <PayPalButton />
            </div>
          )}
        </div>

        {/* Order summary */}
        <div>
          <h2 className="font-semibold text-lg text-stone-800 mb-4">
            Resumen
          </h2>

          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div
                key={item.product_id}
                className="flex items-center gap-3 bg-white p-3 rounded-lg"
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-stone-500">x{item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-stone-800">
                  {(item.price * item.quantity).toFixed(2)} €
                </p>
              </div>
            ))}
          </div>

          <CartSummary
            subtotal={subtotal}
            tax={tax}
            shipping={shipping}
            total={total}
          />
        </div>
      </div>
    </div>
  );
}
