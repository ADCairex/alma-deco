import { getTranslations } from "next-intl/server";

import { CheckoutPageClient } from "@/components/shop/CheckoutPageClient";

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
  return <CheckoutPageClient />;
}
