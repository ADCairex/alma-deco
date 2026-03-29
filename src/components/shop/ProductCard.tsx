import Image from "next/image";

interface ProductCardProps {
  name: string;
  price: string;
  image: string;
}

export function ProductCard({ name, price, image }: ProductCardProps) {
  return (
    <article className="group">
      <div className="relative overflow-hidden">
        <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(min-width: 1280px) 28vw, (min-width: 768px) 42vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/28 via-black/0 to-transparent" />
        </div>

        <button type="button" className="cart-overlay-button absolute inset-x-5 bottom-5 justify-center text-center">
          Añadir al carrito
        </button>
      </div>

      <div className="pt-5 text-center">
        <h3 className="text-[0.78rem] font-medium uppercase tracking-[0.22em] text-ink">{name}</h3>
        <p className="mt-2 text-[0.82rem] tracking-[0.08em] text-ink">{price}</p>
      </div>
    </article>
  );
}
