"use client";

import { Fragment, type KeyboardEvent } from "react";

import { formatProductPrice } from "@/lib/shop-products";
import type { AdminOrder } from "@/types";

import { OrderDetail } from "./OrderDetail";
import { OrderStatusBadge } from "./OrderStatusBadge";

type OrderTableProps = {
  orders: AdminOrder[];
  expandedOrderId: string | null;
  onToggleOrder: (orderId: string) => void;
  onOrderUpdated: (order: AdminOrder) => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function truncateOrderId(id: string) {
  return `#${id.slice(0, 8).toUpperCase()}`;
}

function handleRowKeyboardToggle(event: KeyboardEvent<HTMLTableRowElement>, toggle: () => void) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    toggle();
  }
}

export function OrderTable({ orders, expandedOrderId, onToggleOrder, onOrderUpdated }: OrderTableProps) {
  return (
    <div className="space-y-4">
      <div className="hidden overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm xl:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                <th className="px-6 py-4">Pedido #</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Total (€)</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Método pago</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;

                return (
                  <Fragment key={order.id}>
                    <tr
                      className="cursor-pointer text-sm text-zinc-700 transition hover:bg-zinc-50/80 focus-within:bg-zinc-50/80"
                      onClick={() => onToggleOrder(order.id)}
                      onKeyDown={(event) => handleRowKeyboardToggle(event, () => onToggleOrder(order.id))}
                      tabIndex={0}
                    >
                      <td className="px-6 py-4 font-semibold text-zinc-950">{truncateOrderId(order.id)}</td>
                      <td className="px-6 py-4">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4 font-medium text-zinc-950">{order.customerName}</td>
                      <td className="px-6 py-4">{order.customerEmail}</td>
                      <td className="px-6 py-4 font-semibold text-zinc-950">{formatProductPrice(order.total, order.currency)}</td>
                      <td className="px-6 py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 uppercase">{order.paymentMethod ?? "—"}</td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onToggleOrder(order.id);
                          }}
                          className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50"
                        >
                          {isExpanded ? "Ocultar" : "Ver detalle"}
                        </button>
                      </td>
                    </tr>

                    {isExpanded ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-5">
                          <OrderDetail order={order} onOrderUpdated={onOrderUpdated} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 xl:hidden">
        {orders.map((order) => {
          const isExpanded = expandedOrderId === order.id;

          return (
            <article key={order.id} className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
              <button type="button" onClick={() => onToggleOrder(order.id)} className="block w-full text-left">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">{truncateOrderId(order.id)}</p>
                    <h3 className="text-lg font-semibold text-zinc-950">{order.customerName}</h3>
                    <p className="text-sm text-zinc-500">{order.customerEmail}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="mt-4 grid gap-3 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Fecha</p>
                    <p className="mt-1 font-medium text-zinc-950">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Total</p>
                    <p className="mt-1 font-medium text-zinc-950">{formatProductPrice(order.total, order.currency)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Pago</p>
                    <p className="mt-1 font-medium uppercase text-zinc-950">{order.paymentMethod ?? "—"}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm font-semibold text-zinc-800">{isExpanded ? "Ocultar detalle" : "Ver detalle"}</p>
              </button>

              {isExpanded ? <div className="mt-5"><OrderDetail order={order} onOrderUpdated={onOrderUpdated} /></div> : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
