import { useProducts } from "../hooks/useProducts";
import ProductCard from "../components/ProductCard";

export default function Products() {
  const { products, loading, error } = useProducts();

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 className="font-serif text-2xl md:text-3xl font-bold text-center tracking-widest uppercase mb-2">
        Nuestros Productos
      </h1>
      <div className="w-16 h-[2px] bg-black mx-auto mb-4" />
      <p className="text-stone-500 text-center text-sm mb-10">
        Descubre nuestra selección de artículos de decoración.
      </p>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-black border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p>Error al cargar productos: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
