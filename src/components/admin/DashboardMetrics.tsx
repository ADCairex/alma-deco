"use client";

import { formatProductPrice } from "@/lib/shop-products";
import type { AdminDashboardMetrics } from "@/types";

import { CategoryBreakdown } from "./CategoryBreakdown";
import { MetricCard } from "./MetricCard";
import { RecentOrders } from "./RecentOrders";
import { SalesChart } from "./SalesChart";
import { TopProducts } from "./TopProducts";

type DashboardMetricsProps = {
  metrics: AdminDashboardMetrics;
};

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-zinc-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
              F10 · Admin Dashboard with Metrics
            </span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">Dashboard comercial</h1>
              <p className="max-w-3xl text-sm leading-6 text-zinc-600 sm:text-base">
                Vista ejecutiva de ventas, ritmo de pedidos y performance de catálogo para tomar decisiones rápidas sin salir del panel.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Productos agotados</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-950">{metrics.outOfStockProducts}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon="💰" label="Ventas Totales" value={formatProductPrice(metrics.totalSales, "EUR")} hint="Pedidos pagados, enviados y entregados" />
        <MetricCard icon="📦" label="Pedidos Hoy" value={String(metrics.ordersToday)} hint="Entradas registradas en el día" />
        <MetricCard icon="📅" label="Pedidos Este Mes" value={String(metrics.ordersThisMonth)} hint="Actividad acumulada mensual" />
        <MetricCard icon="📋" label="Productos Activos" value={String(metrics.activeProducts)} hint="Productos con stock disponible" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
        <SalesChart data={metrics.monthlySales} />
        <TopProducts products={metrics.topProducts} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <CategoryBreakdown categories={metrics.salesByCategory} />
        <RecentOrders orders={metrics.recentOrders} />
      </div>
    </section>
  );
}
