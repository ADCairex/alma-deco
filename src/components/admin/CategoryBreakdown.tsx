import type { AdminDashboardCategorySales } from "@/types";

type CategoryBreakdownProps = {
  categories: AdminDashboardCategorySales[];
};

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const maxUnits = Math.max(...categories.map((category) => category.unitsSold), 1);

  return (
    <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Mix comercial</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950">Ventas por categoría</h2>
        </div>
        <p className="text-sm text-zinc-500">Unidades vendidas</p>
      </div>

      <div className="mt-6 space-y-4">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category.category} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <p className="font-medium text-zinc-950">{category.category}</p>
                <p className="text-zinc-500">{category.unitsSold} uds.</p>
              </div>
              <div className="h-3 rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500"
                  style={{ width: `${(category.unitsSold / maxUnits) * 100}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-10 text-center text-sm text-zinc-500">
            No hay ventas por categoría para mostrar todavía.
          </div>
        )}
      </div>
    </section>
  );
}
