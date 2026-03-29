import Link from "next/link";

type SuccessPageProps = {
  searchParams: Promise<{
    order?: string | string[];
  }>;
};

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" className="h-12 w-12 fill-none stroke-current stroke-[1.8]">
      <circle cx="32" cy="32" r="29" className="stroke-current opacity-20" />
      <path d="M20 33.5l8 8L45 24.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const resolvedSearchParams = await searchParams;
  const orderId = Array.isArray(resolvedSearchParams.order) ? resolvedSearchParams.order[0] : resolvedSearchParams.order;

  return (
    <section className="section-space bg-paper">
      <div className="site-container max-w-3xl text-center">
        <div className="rounded-[2.25rem] border border-line bg-stone-50 px-8 py-16 sm:px-12 sm:py-20">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-ink/10 bg-white text-ink">
            <CheckIcon />
          </div>

          <p className="editorial-label mt-8 text-ink/44">Pedido confirmado</p>
          <h1 className="section-title mt-5">¡PEDIDO REALIZADO!</h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-ink/66 sm:text-base">
            Gracias por tu compra. Recibirás un email de confirmación en breve.
          </p>

          {orderId ? (
            <p className="mt-6 text-[0.82rem] uppercase tracking-[0.24em] text-ink/56">
              Número de pedido · <span className="font-semibold text-ink">{orderId}</span>
            </p>
          ) : null}

          <Link href="/" className="pill-dark mt-10">
            Volver a la tienda
          </Link>
        </div>
      </div>
    </section>
  );
}
