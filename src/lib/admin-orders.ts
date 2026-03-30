import type { AdminDashboardMetrics, AdminDashboardRecentOrder, AdminDashboardTopProduct, AdminOrder, AdminOrderStatus } from "@/types";

const ORDER_STATUS_FLOW: AdminOrderStatus[] = ["pending", "paid", "shipped", "delivered"];

const COUNTED_SALES_STATUSES: AdminOrderStatus[] = ["paid", "shipped", "delivered"];

const ORDER_STATUS_TRANSITIONS: Record<AdminOrderStatus, AdminOrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

type PrismaOrderRecord = {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostal: string;
  shippingCountry: string;
  status: string;
  paymentMethod: string | null;
  paymentId: string | null;
  total: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    productId: string;
    product: {
      id: string;
      name: string;
      category: string;
    };
  }>;
};

export const ADMIN_ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"] as const satisfies readonly AdminOrderStatus[];

export const ORDER_STATUS_LABELS: Record<AdminOrderStatus, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export const ORDER_STATUS_SELECT_OPTIONS = ADMIN_ORDER_STATUSES.map((status) => ({
  value: status,
  label: ORDER_STATUS_LABELS[status],
}));

export function isAdminOrderStatus(value: unknown): value is AdminOrderStatus {
  return typeof value === "string" && ADMIN_ORDER_STATUSES.includes(value as AdminOrderStatus);
}

export function formatAdminOrder(order: PrismaOrderRecord): AdminOrder {
  return {
    id: order.id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    shippingAddress: order.shippingAddress,
    shippingCity: order.shippingCity,
    shippingPostal: order.shippingPostal,
    shippingCountry: order.shippingCountry,
    status: normalizeOrderStatus(order.status),
    paymentMethod: order.paymentMethod,
    paymentId: order.paymentId,
    total: order.total,
    currency: order.currency,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      productId: item.productId,
      lineTotal: item.price * item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        category: item.product.category,
      },
    })),
  };
}

export function normalizeOrderStatus(status: string): AdminOrderStatus {
  if (isAdminOrderStatus(status)) {
    return status;
  }

  return "pending";
}

export function validateOrderStatusTransition(currentStatus: AdminOrderStatus, nextStatus: AdminOrderStatus) {
  if (currentStatus === nextStatus) {
    return { valid: true };
  }

  if (currentStatus === "cancelled" || currentStatus === "delivered") {
    return { valid: false, error: `No se puede cambiar un pedido ${ORDER_STATUS_LABELS[currentStatus].toLowerCase()}.` };
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(currentStatus);
  const nextIndex = ORDER_STATUS_FLOW.indexOf(nextStatus);

  if (currentIndex !== -1 && nextIndex !== -1 && nextIndex < currentIndex) {
    return { valid: false, error: "No podés retroceder el estado del pedido." };
  }

  if (!ORDER_STATUS_TRANSITIONS[currentStatus].includes(nextStatus)) {
    return {
      valid: false,
      error: `Transición inválida: de ${ORDER_STATUS_LABELS[currentStatus].toLowerCase()} a ${ORDER_STATUS_LABELS[nextStatus].toLowerCase()}.`,
    };
  }

  return { valid: true };
}

export function buildOrdersWhere(status: string | null) {
  const normalizedStatus = status?.trim().toLowerCase() ?? "";

  if (!isAdminOrderStatus(normalizedStatus)) {
    return {};
  }

  return {
    status: normalizedStatus,
  };
}

export function getSalesStatuses() {
  return COUNTED_SALES_STATUSES;
}

export function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    month: "short",
    year: "2-digit",
  }).format(date);
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1, 0, 0, 0, 0);
}

export function buildMonthlySalesSeries(
  orders: Array<{ createdAt: Date; total: number }> | Array<{ createdAt: string; total: number }>,
) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => addMonths(startOfMonth(now), index - 5));

  return months.map((monthStart) => {
    const monthKey = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`;
    const total = orders.reduce((sum, order) => {
      const createdAt = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
      const createdMonthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
      return createdMonthKey === monthKey ? sum + order.total : sum;
    }, 0);

    return {
      monthKey,
      label: formatMonthLabel(monthStart),
      total,
    };
  });
}

export function formatRecentOrder(order: {
  id: string;
  customerName: string;
  total: number;
  currency: string;
  status: string;
  createdAt: Date;
}): AdminDashboardRecentOrder {
  return {
    id: order.id,
    customerName: order.customerName,
    total: order.total,
    currency: order.currency,
    status: normalizeOrderStatus(order.status),
    createdAt: order.createdAt.toISOString(),
  };
}

export function toDashboardMetrics(input: {
  totalSales: number;
  ordersToday: number;
  ordersThisMonth: number;
  activeProducts: number;
  outOfStockProducts: number;
  salesByCategory: Array<{ category: string; unitsSold: number }>;
  topProducts: AdminDashboardTopProduct[];
  monthlySales: Array<{ monthKey: string; label: string; total: number }>;
  recentOrders: AdminDashboardRecentOrder[];
}): AdminDashboardMetrics {
  return input;
}
