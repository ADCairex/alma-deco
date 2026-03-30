import "server-only";

import { prisma } from "@/lib/prisma";
import {
  buildMonthlySalesSeries,
  buildOrdersWhere,
  formatAdminOrder,
  formatRecentOrder,
  getSalesStatuses,
  toDashboardMetrics,
} from "@/lib/admin-orders";

export async function fetchAdminOrders(status?: string | null) {
  const orders = await prisma.order.findMany({
    where: buildOrdersWhere(status ?? null),
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders.map(formatAdminOrder);
}

export async function fetchAdminOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
      },
    },
  });

  return order ? formatAdminOrder(order) : null;
}

export async function fetchAdminDashboardMetrics() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const salesStatuses = getSalesStatuses();

  const [totalSalesAggregate, ordersToday, ordersThisMonth, activeProducts, outOfStockProducts, soldItems, recentOrders, paidOrders] =
    await Promise.all([
      prisma.order.aggregate({
        where: {
          status: {
            in: salesStatuses,
          },
        },
        _sum: {
          total: true,
        },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: todayStart,
            lt: tomorrowStart,
          },
        },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: monthStart,
          },
        },
      }),
      prisma.product.count({
        where: {
          stock: {
            gt: 0,
          },
        },
      }),
      prisma.product.count({
        where: {
          stock: 0,
        },
      }),
      prisma.orderItem.findMany({
        where: {
          order: {
            status: {
              in: salesStatuses,
            },
          },
        },
        select: {
          quantity: true,
          productId: true,
          product: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          customerName: true,
          total: true,
          currency: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.order.findMany({
        where: {
          status: {
            in: salesStatuses,
          },
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0),
          },
        },
        select: {
          createdAt: true,
          total: true,
        },
      }),
    ]);

  const topProductsMap = new Map<string, { productId: string; name: string; category: string; unitsSold: number }>();
  const categorySalesMap = new Map<string, number>();

  for (const item of soldItems) {
    const currentProduct = topProductsMap.get(item.productId);

    topProductsMap.set(item.productId, {
      productId: item.product.id,
      name: item.product.name,
      category: item.product.category,
      unitsSold: (currentProduct?.unitsSold ?? 0) + item.quantity,
    });

    categorySalesMap.set(item.product.category, (categorySalesMap.get(item.product.category) ?? 0) + item.quantity);
  }

  const topProducts = [...topProductsMap.values()].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 5);

  const salesByCategory = [...categorySalesMap.entries()]
    .map(([category, unitsSold]) => ({ category, unitsSold }))
    .sort((a, b) => b.unitsSold - a.unitsSold);

  return toDashboardMetrics({
    totalSales: totalSalesAggregate._sum.total ?? 0,
    ordersToday,
    ordersThisMonth,
    activeProducts,
    outOfStockProducts,
    salesByCategory,
    topProducts,
    monthlySales: buildMonthlySalesSeries(paidOrders),
    recentOrders: recentOrders.map(formatRecentOrder),
  });
}
