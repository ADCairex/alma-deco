import { Link } from "react-router-dom";

export default function Cancel() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="bg-amber-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
      <h1 className="font-serif text-3xl font-bold text-stone-800 mb-3">
        Pago cancelado
      </h1>
      <p className="text-stone-500 mb-8 max-w-md mx-auto">
        El pago ha sido cancelado. No se ha realizado ningún cargo. Tu carrito
        sigue disponible si deseas intentarlo de nuevo.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/checkout"
          className="bg-black hover:bg-stone-800 text-white text-xs font-semibold tracking-widest uppercase py-3 px-8 rounded-full transition-colors"
        >
          Reintentar Pago
        </Link>
        <Link
          to="/cart"
          className="bg-white hover:bg-stone-50 text-stone-700 font-semibold py-3 px-8 rounded-lg border border-stone-300 transition-colors"
        >
          Ver Carrito
        </Link>
      </div>
    </div>
  );
}
