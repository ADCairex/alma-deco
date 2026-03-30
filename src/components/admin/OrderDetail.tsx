"use client";

import { useMemo, useState } from "react";

import { ORDER_STATUS_SELECT_OPTIONS, ORDER_STATUS_LABELS } from "@/lib/admin-orders";
import { formatProductPrice } from "@/lib/shop-products";
import type { AdminOrder, AdminOrderStatus } from "@/types";

import { OrderStatusBadge } from "./OrderStatusBadge";

type OrderDetailProps = {
  order: AdminOrder;
  onOrderUpdated: (order: AdminOrder) => void;
};

function isAdminOrderResponse(value: AdminOrder | { error?: string }): value is AdminOrder {
  return "id" in value;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatOrderId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export function OrderDetail({ order, onOrderUpdated }: OrderDetailProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shippingAddress = useMemo(
    () => [order.shippingAddress, `${order.shippingPostal} · ${order.shippingCity}`, order.shippingCountry].filter(Boolean),
    [order.shippingAddress, order.shippingCity, order.shippingCountry, order.shippingPostal],
  );

  async function handleStatusChange(nextStatus: string) {
    const normalizedStatus = nextStatus as AdminOrderStatus;

    if (normalizedStatus === order.status) {
      return;
    }

    const confirmed = window.confirm(
      `¿Querés cambiar el pedido #${formatOrderId(order.id)} de ${ORDER_STATUS_LABELS[order.status].toLowerCase()} a ${ORDER_STATUS_LABELS[normalizedStatus].toLowerCase()}?`,
    );

    if (!confirmed) {
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: normalizedStatus }),
      });

      const data = (await response.json()) as AdminOrder | { error?: string };

      if (!response.ok || !isAdminOrderResponse(data)) {
        throw new Error(!isAdminOrderResponse(data) ? data.error ?? "No se pudo actualizar el pedido." : "No se pudo actualizar el pedido.");
      }

      onOrderUpdated(data);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "No se pudo actualizar el pedido.");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="rounded-[28px] border border-zinc-200 bg-zinc-50/70 p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Pedido #{formatOrderId(order.id)}</p>
                <h3 className="mt-2 text-xl font-semibold text-zinc-950">Datos del cliente</h3>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-zinc-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Cliente</dt>
                <dd className="mt-2 text-sm font-medium text-zinc-950">{order.customerName}</dd>
              </div>
              <div className="rounded-2xl bg-zinc-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Email</dt>
                <dd className="mt-2 break-all text-sm font-medium text-zinc-950">{order.customerEmail}</dd>
              </div>
              <div className="rounded-2xl bg-zinc-50 p-4 sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Dirección de envío</dt>
                <dd className="mt-2 space-y-1 text-sm text-zinc-700">
                  {shippingAddress.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Artículos</p>
                <h3 className="mt-2 text-xl font-semibold text-zinc-950">Detalle del pedido</h3>
              </div>
              <p className="text-sm font-medium text-zinc-500">{order.items.length} líneas</p>
            </div>

            <div className="mt-5 overflow-hidden rounded-3xl border border-zinc-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-200 text-sm">
                  <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    <tr>
                      <th className="px-4 py-3">Producto</th>
                      <th className="px-4 py-3">Cantidad</th>
                      <th className="px-4 py-3">Precio</th>
                      <th className="px-4 py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 bg-white">
                    {order.items.map((item) => (
                      <tr key={item.id} className="align-top text-zinc-700">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-zinc-950">{item.product.name}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500">{item.product.category}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-zinc-950">{item.quantity}</td>
                        <td className="px-4 py-3">{formatProductPrice(item.price, order.currency)}</td>
                        <td className="px-4 py-3 font-semibold text-zinc-950">{formatProductPrice(item.lineTotal, order.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Gestión</p>
            <h3 className="mt-2 text-xl font-semibold text-zinc-950">Estado del pedido</h3>

            <div className="mt-5 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-zinc-800">Cambiar estado</span>
                <select
                  value={order.status}
                  onChange={(event) => void handleStatusChange(event.target.value)}
                  disabled={isUpdating}
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-100"
                >
                  {ORDER_STATUS_SELECT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {error ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
              {isUpdating ? <p className="text-sm font-medium text-zinc-500">Actualizando estado...</p> : null}
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Pago</p>
            <h3 className="mt-2 text-xl font-semibold text-zinc-950">Resumen económico</h3>

            <dl className="mt-5 space-y-4 text-sm text-zinc-700">
              <div className="flex items-center justify-between gap-3">
                <dt>Método</dt>
                <dd className="font-medium uppercase text-zinc-950">{order.paymentMethod ?? "Sin definir"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt>Referencia</dt>
                <dd className="max-w-[220px] truncate text-right font-medium text-zinc-950">{order.paymentId ?? "Pendiente"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-zinc-200 pt-4 text-base">
                <dt className="font-semibold text-zinc-950">Total</dt>
                <dd className="font-semibold text-zinc-950">{formatProductPrice(order.total, order.currency)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Trazabilidad</p>
            <h3 className="mt-2 text-xl font-semibold text-zinc-950">Fechas</h3>

            <dl className="mt-5 space-y-4 text-sm text-zinc-700">
              <div className="flex items-start justify-between gap-3">
                <dt>Creado</dt>
                <dd className="text-right font-medium text-zinc-950">{formatDateTime(order.createdAt)}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt>Última actualización</dt>
                <dd className="text-right font-medium text-zinc-950">{formatDateTime(order.updatedAt)}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
