import { ORDER_STATUS_LABELS } from "@/lib/admin-orders";
import type { AdminOrderStatus } from "@/types";

type OrderStatusBadgeProps = {
  status: AdminOrderStatus;
};

const statusClasses: Record<AdminOrderStatus, string> = {
  pending: "border-yellow-200 bg-yellow-50 text-yellow-700",
  paid: "border-sky-200 bg-sky-50 text-sky-700",
  shipped: "border-violet-200 bg-violet-50 text-violet-700",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-red-200 bg-red-50 text-red-700",
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusClasses[status]}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
