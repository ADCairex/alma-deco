import { Link } from "react-router-dom";
import type { Product } from "../types/product";
import { useCartStore } from "../store/cartStore";
import { resolveImageUrl } from "../utils/imageUrl";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    });
  };

  return (
    <div className="group flex flex-col overflow-hidden">
      {/* Image with overlay button */}
      <Link to={`/products/${product.id}`} state={{ product }} className="relative aspect-square overflow-hidden bg-stone-100 block">
        <img
          src={resolveImageUrl(product.image_url)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <button
          onClick={(e) => { e.preventDefault(); handleAdd(); }}
          disabled={product.stock <= 0}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 border border-white text-white text-[10px] font-medium tracking-widest uppercase py-2 px-5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          AÑADIR AL CARRITO
        </button>
      </Link>
      {/* Info */}
      <Link to={`/products/${product.id}`} state={{ product }} className="py-4 px-1 block hover:opacity-80 transition-opacity">
        <span className="text-[10px] font-medium tracking-wider uppercase text-stone-400">
          {product.category}
        </span>
        <h3 className="text-sm font-medium text-stone-800 mt-1 leading-tight uppercase tracking-wide">
          {product.name}
        </h3>
        <p className="text-xs text-stone-500 mt-1 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm font-semibold text-stone-800">
            {product.price.toFixed(2)}€
          </span>
          {product.stock > 0 ? (
            <span className="text-[10px] text-green-600 font-medium">
              En stock
            </span>
          ) : (
            <span className="text-[10px] text-red-500 font-medium">
              Agotado
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
