import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useCartStore } from "../store/cartStore";
import Logo from "../assets/Logo";
import { resolveImageUrl } from "../utils/imageUrl";

export default function Home() {
  const { products } = useProducts();
  const addItem = useCartStore((s) => s.addItem);
  const topProducts = products.slice(0, 3);

  return (
    <div>
      {/* ====== SECTION A — Hero Video ====== */}
      <section className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden">
        <video
          src="/hero.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center h-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight text-shadow-hero whitespace-pre-line">
            NUEVA{"\n"}COLECCIÓN
          </h1>
          <Link
            to="/products"
            className="mt-8 inline-block w-fit border-2 border-white text-white text-xs sm:text-sm font-semibold tracking-widest2 uppercase py-3 px-8 rounded-full hover:bg-white hover:text-black transition-all duration-300"
          >
            DESCÚBRELA AQUÍ
          </Link>
        </div>
      </section>

      {/* ====== SECTION B — Top Ventas ====== */}
      <section className="py-14 md:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-center tracking-widest uppercase mb-2">
            TOP VENTAS
          </h2>
          <div className="w-16 h-[2px] bg-black mx-auto mb-10" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
            {topProducts.length > 0
              ? topProducts.map((product) => (
                  <div key={product.id} className="group flex flex-col">
                    {/* Image with overlay button */}
                    <Link to={`/products/${product.id}`} state={{ product }} className="relative aspect-[3/4] overflow-hidden bg-stone-100 block">
                      <img
                        src={resolveImageUrl(product.image_url)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addItem({
                            product_id: product.id,
                            name: product.name,
                            price: product.price,
                            image_url: product.image_url,
                          });
                        }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 border border-white text-white text-[10px] sm:text-xs font-medium tracking-widest uppercase py-2.5 px-6 rounded-full hover:bg-white hover:text-black transition-all duration-300 whitespace-nowrap"
                      >
                        AÑADIR AL CARRITO
                      </button>
                    </Link>
                    {/* Info */}
                    <Link to={`/products/${product.id}`} state={{ product }} className="text-center py-4 px-2 block hover:opacity-70 transition-opacity">
                      <p className="text-xs font-medium tracking-wider uppercase text-stone-700">
                        {product.name}
                      </p>
                      <p className="text-xs text-stone-500 mt-1">
                        {product.price.toFixed(2)}€
                      </p>
                    </Link>
                  </div>
                ))
              : /* Placeholder cards while loading */
                [1, 2, 3].map((n) => (
                  <div key={n} className="flex flex-col">
                    <div className="aspect-[3/4] bg-stone-200 animate-pulse" />
                    <div className="text-center py-4">
                      <p className="text-xs font-medium tracking-wider uppercase text-stone-400">
                        NOMBRE DEL PRODUCTO
                      </p>
                      <p className="text-xs text-stone-400 mt-1">00.00€</p>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* ====== SECTION C — Inspirational Banner ====== */}
      <section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1616137466211-f939a420be84?w=1600&h=800&fit=crop"
          alt="Interior inspirador"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 w-full">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-6xl font-bold text-white text-shadow-hero tracking-wider uppercase">
              CREA UN ESPACIO ÚNICO
            </h2>
          </div>
        </div>
      </section>

      {/* ====== SECTION D — Brand Story ====== */}
      <section className="bg-stone-100">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 min-h-[600px]">
          {/* Left — text */}
          <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-16">
            <div className="flex justify-center md:justify-start mb-8">
              <Logo className="h-24 w-auto" />
            </div>
            <blockquote className="font-serif italic text-base md:text-lg text-stone-700 mb-6 leading-relaxed">
              &ldquo;Lorem ipsum dolor sit amet, consectetuer adipiscing elit,
              sed diam nonummy.&rdquo;
            </blockquote>
            <div className="space-y-4 text-xs leading-relaxed text-stone-500">
              <p>
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed
                diam nonummy nibh euismod tincidunt ut laoreet dolore magna
                aliquam erat volutpat. Ut wisi enim ad minim veniam, quis
                nostrud exerci tation ullamcorper suscipit lobortis nisl ut
                aliquip ex ea commodo consequat.
              </p>
              <p>
                Duis autem vel eum iriure dolor in hendrerit in vulputate velit
                esse molestie consequat, vel illum dolore eu feugiat nulla
                facilisis at vero eros et accumsan et iusto odio dignissim qui
                blandit praesent luptatum zzril delenit augue duis dolore te
                feugait nulla facilisi.
              </p>
              <p>
                Lorem ipsum dolor sit amet, cons ectetuer adipiscing elit, sed
                diam nonummy nibh euismod tincidunt ut laoreet dolore magna
                aliquam erat volutpat. Ut wisi enim ad minim veniam, quis
                nostrud exerci tation ullamcorper suscipit lobortis nisl ut
                aliquip ex ea commodo consequat.
              </p>
            </div>
          </div>

          {/* Right — image */}
          <div className="relative min-h-[400px] md:min-h-0">
            <img
              src="https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=800&h=1000&fit=crop"
              alt="Decoración de interiores"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
