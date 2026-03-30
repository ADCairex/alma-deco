import { formatProductPrice } from "@/lib/shop-products";
import type { AdminDashboardMonthlySales } from "@/types";

type SalesChartProps = {
  data: AdminDashboardMonthlySales[];
};

export function SalesChart({ data }: SalesChartProps) {
  const maxValue = Math.max(...data.map((item) => item.total), 1);

  return (
    <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Tendencia</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950">Ventas por mes</h2>
        </div>
        <p className="text-sm text-zinc-500">Últimos 6 meses</p>
      </div>

      <div className="mt-8 grid min-h-72 grid-cols-6 items-end gap-3">
        {data.map((item) => {
          const height = `${Math.max((item.total / maxValue) * 100, item.total > 0 ? 12 : 4)}%`;

          return (
            <div key={item.monthKey} className="flex h-full flex-col justify-end gap-3">
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-2 text-center text-[11px] font-medium text-zinc-500">
                {formatProductPrice(item.total, "EUR")}
              </div>
              <div className="relative flex-1 rounded-[28px] bg-zinc-100 p-2">
                <div
                  className="absolute inset-x-2 bottom-2 rounded-[20px] bg-gradient-to-t from-zinc-950 via-zinc-800 to-zinc-600 transition-all"
                  style={{ height }}
                />
              </div>
              <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{item.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
