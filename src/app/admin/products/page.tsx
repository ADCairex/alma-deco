import { AdminProductsManager } from "@/components/admin/AdminProductsManager";
import { formatAdminProduct } from "@/lib/admin-products";
import { prisma } from "@/lib/prisma";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return <AdminProductsManager initialProducts={products.map(formatAdminProduct)} />;
}
