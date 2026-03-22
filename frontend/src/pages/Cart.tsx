import { Link } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import CartItemRow from "../components/CartItemRow";
import CartSummary from "../components/CartSummary";

const TAX_RATE = 0.21;
const SHIPPING = 5.99;

export default function Cart() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const shipping = subtotal > 0 ? SHIPPING : 0;
  const total = subtotal + tax + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20 mx-auto text-stone-300 mb-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
          />
        </svg>
        <h1 className="font-serif text-3xl font-bold text-stone-800 mb-2">
          Tu carrito está vacío
        </h1>
        <p className="text-stone-500 mb-6">
          Añade artículos de decoración para empezar.
        </p>
        <Link
          to="/products"
          className="inline-block bg-black hover:bg-stone-800 text-white text-xs font-semibold tracking-widest uppercase py-3 px-8 rounded-full transition-colors"
        >
          Ver Productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl font-bold text-stone-800">
          Carrito de Compras
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-stone-500 hover:text-red-500 transition-colors underline"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItemRow key={item.product_id} item={item} />
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <CartSummary
            subtotal={subtotal}
            tax={tax}
            shipping={shipping}
            total={total}
          />
          <Link
            to="/checkout"
            className="block w-full text-center bg-black hover:bg-stone-800 text-white text-xs font-semibold tracking-widest uppercase py-3 px-6 rounded-full transition-colors"
          >
            Ir a Checkout
          </Link>
          <Link
            to="/products"
            className="block w-full text-center text-stone-600 hover:text-black font-medium text-sm py-2 transition-colors"
          >
            ← Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
