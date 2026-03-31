"use client";

import { useMemo, useState } from "react";

import { useTranslations } from "next-intl";

import { ORDER_STATUS_LABELS } from "@/lib/admin-orders";
import type { AdminOrder, AdminOrderStatus } from "@/types";

import { OrderTable } from "./OrderTable";

type OrdersManagerProps = {
  initialOrders: AdminOrder[];
};

type OrderFilter = "all" | AdminOrderStatus;

export function OrdersManager({ initialOrders }: OrdersManagerProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(initialOrders[0]?.id ?? null);
  const t = useTranslations("admin.orders");

  const FILTERS: Array<{ value: OrderFilter; label: string }> = [
    { value: "all", label: t("filterAll") },
    { value: "pending", label: t("filterPending") },
    { value: "paid", label: t("filterPaid") },
    { value: "shipped", label: t("filterShipped") },
    { value: "delivered", label: t("filterDelivered") },
    { value: "cancelled", label: t("filterCancelled") },
  ];

  const filteredOrders = useMemo(() => {
    if (activeFilter === "all") {
      return orders;
    }

    return orders.filter((order) => order.status === activeFilter);
  }, [activeFilter, orders]);

  const hasOrders = orders.length > 0;

  const statusSummary = useMemo(
    () =>
      FILTERS.filter((filter) => filter.value !== "all").map((filter) => ({
        value: filter.value,
        label: ORDER_STATUS_LABELS[filter.value as AdminOrderStatus],
        count: orders.filter((order) => order.status === filter.value).length,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orders],
  );

  function handleOrderUpdated(updatedOrder: AdminOrder) {
    setOrders((currentOrders) => currentOrders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)));
  }

  function handleToggleOrder(orderId: string) {
    setExpandedOrderId((currentOrderId) => (currentOrderId === orderId ? null : orderId));
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-zinc-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">{t("title")}</h1>
              <p className="max-w-3xl text-sm leading-6 text-zinc-600 sm:text-base">
                {t("description")}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:min-w-[460px]">
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">{t("statsTotalLabel")}</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-950">{orders.length}</p>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">{t("statsPendingLabel")}</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-950">{orders.filter((order) => order.status === "pending").length}</p>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">{t("statsPaidLabel")}</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-950">{orders.filter((order) => order.status === "paid").length}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.value;
            const count = filter.value === "all" ? orders.length : orders.filter((order) => order.status === filter.value).length;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 hover:bg-white"
                }`}
              >
                <span>{filter.label}</span>
                <span
                  className={`inline-flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 text-xs ${
                    isActive ? "bg-white/15 text-white" : "bg-white text-zinc-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {statusSummary.map((status) => (
            <div key={status.value} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{status.label}</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-950">{status.count}</p>
            </div>
          ))}
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <OrderTable
          orders={filteredOrders}
          expandedOrderId={expandedOrderId}
          onToggleOrder={handleToggleOrder}
          onOrderUpdated={handleOrderUpdated}
        />
      ) : (
        <div className="rounded-[32px] border border-dashed border-zinc-300 bg-zinc-50 px-6 py-16 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-zinc-950">{hasOrders ? t("emptyFilterTitle") : t("emptyNoOrders")}</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            {hasOrders ? t("emptyFilterDescription") : t("emptyNoOrdersDescription")}
          </p>
        </div>
      )}
    </section>
  );
}
