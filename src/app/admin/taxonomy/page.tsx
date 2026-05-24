import { TaxonomyManager } from "@/components/admin/TaxonomyManager";
import { prisma } from "@/lib/prisma";
import { formatTaxonomyItem } from "@/lib/taxonomy";

export default async function AdminTaxonomyPage() {
  const [categories, collections] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.collection.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <TaxonomyManager
      initialCategories={categories.map(formatTaxonomyItem)}
      initialCollections={collections.map(formatTaxonomyItem)}
    />
  );
}
