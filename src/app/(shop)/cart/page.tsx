import { getTranslations } from "next-intl/server";

import { CartPageClient } from "@/components/shop/CartPageClient";

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
  return <CartPageClient />;
}
