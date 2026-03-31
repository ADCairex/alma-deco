"use client";

import { useTranslations } from "next-intl";

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
  const t = useTranslations("admin.dashboard");

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-zinc-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">{t("title")}</h1>
              <p className="max-w-3xl text-sm leading-6 text-zinc-600 sm:text-base">
                {t("description")}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">{t("outOfStockLabel")}</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-950">{metrics.outOfStockProducts}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon="💰" label={t("metricTotalSales")} value={formatProductPrice(metrics.totalSales, "EUR")} hint={t("metricTotalSalesHint")} />
        <MetricCard icon="📦" label={t("metricOrdersToday")} value={String(metrics.ordersToday)} hint={t("metricOrdersTodayHint")} />
        <MetricCard icon="📅" label={t("metricOrdersThisMonth")} value={String(metrics.ordersThisMonth)} hint={t("metricOrdersThisMonthHint")} />
        <MetricCard icon="📋" label={t("metricActiveProducts")} value={String(metrics.activeProducts)} hint={t("metricActiveProductsHint")} />
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
