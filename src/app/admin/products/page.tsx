import { AdminProductsManager } from "@/components/admin/AdminProductsManager";
import { ADMIN_PRODUCT_INCLUDE, formatAdminProduct } from "@/lib/admin-products";
import { prisma } from "@/lib/prisma";
import { formatTaxonomyItem } from "@/lib/taxonomy";

export default async function AdminProductsPage() {
  const [products, categories, collections] = await Promise.all([
    prisma.product.findMany({
      include: ADMIN_PRODUCT_INCLUDE,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.collection.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return (
    <AdminProductsManager
      initialProducts={products.map(formatAdminProduct)}
      initialCategories={categories.map(formatTaxonomyItem)}
      initialCollections={collections.map(formatTaxonomyItem)}
    />
  );
}
