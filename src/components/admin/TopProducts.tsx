import type { AdminDashboardTopProduct } from "@/types";

type TopProductsProps = {
  products: AdminDashboardTopProduct[];
};

export function TopProducts({ products }: TopProductsProps) {
  const maxUnits = Math.max(...products.map((product) => product.unitsSold), 1);

  return (
    <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Ranking</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950">Productos más vendidos</h2>
        </div>
        <p className="text-sm text-zinc-500">Top 5</p>
      </div>

      <div className="mt-6 space-y-4">
        {products.length > 0 ? (
          products.map((product, index) => (
            <div key={product.productId} className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">#{index + 1}</p>
                  <h3 className="mt-2 truncate text-base font-semibold text-zinc-950">{product.name}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{product.category}</p>
                </div>
                <p className="text-lg font-semibold text-zinc-950">{product.unitsSold}</p>
              </div>

              <div className="mt-4 h-3 rounded-full bg-white">
                <div className="h-full rounded-full bg-zinc-900" style={{ width: `${(product.unitsSold / maxUnits) * 100}%` }} />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-10 text-center text-sm text-zinc-500">
            Todavía no hay productos vendidos para mostrar.
          </div>
        )}
      </div>
    </section>
  );
}
