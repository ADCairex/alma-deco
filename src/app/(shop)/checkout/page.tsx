import { getTranslations } from "next-intl/server";

import { CatalogModeNotice } from "@/components/shop/CatalogModeNotice";
import { CheckoutPageClient } from "@/components/shop/CheckoutPageClient";
import { commerceEnabled } from "@/lib/commerce-config";

export async function generateMetadata() {
  const t = await getTranslations("metadata.pages");
  return {
    title: t("checkoutTitle"),
    description: t("checkoutDescription"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function CheckoutPage() {
  if (!commerceEnabled) {
    return <CatalogModeNotice />;
  }

  return <CheckoutPageClient />;
}
