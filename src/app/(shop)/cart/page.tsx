import { getTranslations } from "next-intl/server";

import { CatalogModeNotice } from "@/components/shop/CatalogModeNotice";
import { CartPageClient } from "@/components/shop/CartPageClient";
import { commerceEnabled } from "@/lib/commerce-config";

export async function generateMetadata() {
  const t = await getTranslations("metadata.pages");
  return {
    title: t("cartTitle"),
    description: t("cartDescription"),
    alternates: {
      canonical: "/cart",
    },
  };
}

export default function CartPage() {
  if (!commerceEnabled) {
    return <CatalogModeNotice />;
  }

  return <CartPageClient />;
}
