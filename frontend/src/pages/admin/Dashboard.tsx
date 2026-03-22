import { useEffect, useState } from "react";
import { getAdminMetrics, getAdminOrders, type Metrics, type Order } from "../../api/adminClient";

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100">
      <p className="text-sm text-stone-500 mb-1">{label}</p>
      <p className="text-3xl font-semibold text-stone-800">{value}</p>
      {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
    </div>
  );
}

function formatCurrency(value: number) {
  return `${value.toFixed(2)} €`;
}

function formatMonth(month: string) {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1);
  return date.toLocaleDateString("es-ES", { month: "short", year: "2-digit" });
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getAdminMetrics(), getAdminOrders()])
      .then(([m, o]) => {
        setMetrics(m);
        setOrders(o.slice(0, 10));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-stone-500">Cargando métricas...</div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-600">Error: {error}</div>
    );
  }

  const maxRevenue = metrics
    ? Math.max(...metrics.monthly.map((m) => m.revenue), 1)
    : 1;

  const maxCatRevenue = metrics
    ? Math.max(...metrics.by_category.map((c) => c.revenue), 1)
    : 1;

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-serif text-stone-800">Dashboard</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Ingresos totales"
          value={formatCurrency(metrics!.total_revenue)}
        />
        <StatCard
          label="Total pedidos"
          value={String(metrics!.total_orders)}
        />
        <StatCard
          label="Ticket medio"
          value={formatCurrency(metrics!.avg_order_value)}
        />
        <StatCard
          label="Este mes"
          value={formatCurrency(metrics!.revenue_this_month)}
          sub={`${metrics!.orders_this_month} pedidos`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100">
          <h3 className="font-medium text-stone-700 mb-4">Ingresos mensuales</h3>
          {metrics!.monthly.length === 0 || metrics!.monthly.every((m) => m.revenue === 0) ? (
            <p className="text-stone-400 text-sm">Sin datos aún</p>
          ) : (
            <div className="space-y-3">
              {metrics!.monthly.map((m) => (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="text-xs text-stone-500 w-14 shrink-0">
                    {formatMonth(m.month)}
                  </span>
                  <div className="flex-1 bg-stone-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-stone-700 rounded-full transition-all"
                      style={{ width: `${(m.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-stone-600 w-20 text-right shrink-0">
                    {formatCurrency(m.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100">
          <h3 className="font-medium text-stone-700 mb-4">Ventas por categoría</h3>
          {metrics!.by_category.length === 0 ? (
            <p className="text-stone-400 text-sm">Sin datos aún</p>
          ) : (
            <div className="space-y-3">
              {metrics!.by_category.map((c) => (
                <div key={c.category} className="flex items-center gap-3">
                  <span className="text-xs text-stone-500 w-24 shrink-0 truncate">
                    {c.category}
                  </span>
                  <div className="flex-1 bg-stone-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-stone-400 rounded-full transition-all"
                      style={{ width: `${(c.revenue / maxCatRevenue) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-stone-600 w-20 text-right shrink-0">
                    {formatCurrency(c.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders table */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h3 className="font-medium text-stone-700">Pedidos recientes</h3>
        </div>
        {orders.length === 0 ? (
          <p className="px-6 py-8 text-stone-400 text-sm">No hay pedidos todavía.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-6 py-3">ID</th>
                <th className="text-left px-6 py-3">Fecha</th>
                <th className="text-left px-6 py-3">Método</th>
                <th className="text-left px-6 py-3">Estado</th>
                <th className="text-right px-6 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50">
                  <td className="px-6 py-3 text-stone-600 font-mono text-xs truncate max-w-[180px]">
                    {order.id}
                  </td>
                  <td className="px-6 py-3 text-stone-600">
                    {new Date(order.created_at).toLocaleDateString("es-ES")}
                  </td>
                  <td className="px-6 py-3 capitalize text-stone-600">
                    {order.payment_method}
                  </td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-medium text-stone-800">
                    {formatCurrency(order.total_amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
