import { DashboardMetrics } from "@/components/admin/DashboardMetrics";
import { fetchAdminDashboardMetrics } from "@/lib/admin-data";

export default async function AdminDashboardPage() {
  const metrics = await fetchAdminDashboardMetrics();

  return <DashboardMetrics metrics={metrics} />;
}
