import { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { getProduct } from "../api/client";
import type { Product } from "../types/product";
import { useCartStore } from "../store/cartStore";
import { resolveImageUrl } from "../utils/imageUrl";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const addItem = useCartStore((s) => s.addItem);

  // Si venimos desde la lista, los datos ya están en el state de navegación
  const stateProduct = (location.state as { product?: Product } | null)?.product;

  const [product, setProduct] = useState<Product | null>(stateProduct ?? null);
  const [loading, setLoading] = useState(!stateProduct);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    // Si ya tenemos los datos del producto (desde la navegación), no llamamos a la API
    if (stateProduct) return;
    if (!id) return;

    setLoading(true);
    setError(null);
    getProduct(encodeURIComponent(id))
      .then((p) => {
        setProduct(p);
        setActiveImage(0);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, stateProduct]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-black border-t-transparent" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-20 text-center">
        <p className="text-stone-500 mb-6">{error ?? "Producto no encontrado"}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm underline underline-offset-4 text-stone-600 hover:text-black"
        >
          Volver
        </button>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.image_url];

  function handleAdd() {
    if (!product) return;
    for (let i = 0; i < qty; i++) {
      addItem({
        product_id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      {/* Breadcrumb */}
      <nav className="text-xs text-stone-400 mb-8 flex items-center gap-1.5 uppercase tracking-wider">
        <Link to="/" className="hover:text-black transition-colors">Inicio</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-black transition-colors">Productos</Link>
        <span>/</span>
        <span className="text-stone-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* ---- Galería ---- */}
        <div className="flex flex-col gap-3">
          {/* Imagen principal */}
          <div className="relative w-full aspect-[4/5] overflow-hidden bg-stone-100 rounded-xl">
            <img
              src={resolveImageUrl(images[activeImage])}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Miniaturas (solo si hay más de 1) */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((url, i) => (
                <button
                  key={url + i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === activeImage ? "border-stone-800" : "border-transparent"
                  }`}
                >
                  <img
                    src={resolveImageUrl(url)}
                    alt={`Vista ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ---- Info ---- */}
        <div className="flex flex-col justify-center">
          <span className="text-xs font-medium tracking-widest uppercase text-stone-400 mb-2">
            {product.category}
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 uppercase tracking-wide mb-4">
            {product.name}
          </h1>
          <p className="text-2xl font-semibold text-stone-800 mb-6">
            {product.price.toFixed(2)} €
          </p>

          <p className="text-sm text-stone-600 leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Stock */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <span className="text-xs text-green-700 bg-green-50 px-3 py-1 rounded-full font-medium">
                En stock ({product.stock} disponibles)
              </span>
            ) : (
              <span className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full font-medium">
                Agotado
              </span>
            )}
          </div>

          {/* Cantidad + botón */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center border border-stone-300 rounded-full overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors text-lg"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-medium text-stone-800 select-none">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors text-lg"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                className={`flex-1 py-3 px-6 rounded-full text-sm font-semibold uppercase tracking-widest transition-all duration-300 ${
                  added
                    ? "bg-green-600 text-white"
                    : "bg-stone-900 text-white hover:bg-stone-700"
                }`}
              >
                {added ? "¡Añadido!" : "Añadir al carrito"}
              </button>
            </div>
          )}

          <Link
            to="/cart"
            className="text-xs text-stone-400 hover:text-black underline underline-offset-4 transition-colors self-start mt-1"
          >
            Ver carrito
          </Link>
        </div>
      </div>
    </div>
  );
}
