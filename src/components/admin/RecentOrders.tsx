import Link from "next/link";

import { formatProductPrice } from "@/lib/shop-products";
import type { AdminDashboardRecentOrder } from "@/types";

import { OrderStatusBadge } from "./OrderStatusBadge";

type RecentOrdersProps = {
  orders: AdminDashboardRecentOrder[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Actividad reciente</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950">Pedidos recientes</h2>
        </div>
        <Link href="/admin/orders" className="text-sm font-semibold text-zinc-700 transition hover:text-zinc-950">
          Ver todos
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              <tr>
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="text-zinc-700">
                    <td className="px-4 py-3 font-semibold text-zinc-950">#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-4 py-3">{order.customerName}</td>
                    <td className="px-4 py-3 font-medium text-zinc-950">{formatProductPrice(order.total, order.currency)}</td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-zinc-500">
                    No hay pedidos recientes para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
