import { Link } from "react-router-dom";
import type { CartItem as CartItemType } from "../types/cart";
import { useCartStore } from "../store/cartStore";
import { resolveImageUrl } from "../utils/imageUrl";

interface Props {
  item: CartItemType;
}

export default function CartItemRow({ item }: Props) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
      <Link to={`/products/${item.product_id}`} className="flex-shrink-0">
        <img
          src={resolveImageUrl(item.image_url)}
          alt={item.name}
          className="w-20 h-20 object-cover rounded-md hover:opacity-80 transition-opacity"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/products/${item.product_id}`} className="hover:underline underline-offset-2">
          <h4 className="font-semibold text-stone-800 truncate">{item.name}</h4>
        </Link>
        <p className="text-brand-600 font-medium">{item.price.toFixed(2)} €</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-stone-300 hover:bg-stone-100 transition-colors text-stone-600"
        >
          −
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-stone-300 hover:bg-stone-100 transition-colors text-stone-600"
        >
          +
        </button>
      </div>
      <p className="font-bold text-stone-800 w-24 text-right">
        {(item.price * item.quantity).toFixed(2)} €
      </p>
      <button
        onClick={() => removeItem(item.product_id)}
        className="text-stone-400 hover:text-red-500 transition-colors ml-2"
        title="Eliminar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );
}
