import { OrdersManager } from "@/components/admin/OrdersManager";
import { fetchAdminOrders } from "@/lib/admin-data";

export default async function AdminOrdersPage() {
  const orders = await fetchAdminOrders();

  return <OrdersManager initialOrders={orders} />;
}
