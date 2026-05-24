import type { ReactNode } from "react";

import { ShopProviders } from "@/app/(shop)/ShopProviders";
import { Footer } from "@/components/shop/Footer";
import { Navbar } from "@/components/shop/Navbar";
import { prisma } from "@/lib/prisma";
import { buildPublicCollectionOptions } from "@/lib/shop-products";

export default async function ShopLayout({ children }: { children: ReactNode }) {
  const collections = await prisma.collection.findMany({ orderBy: { name: "asc" } });

  return (
    <ShopProviders>
      <div className="min-h-screen flex flex-col bg-paper text-ink">
        <Navbar collections={buildPublicCollectionOptions(collections)} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </ShopProviders>
  );
}
