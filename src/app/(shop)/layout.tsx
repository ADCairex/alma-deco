import type { ReactNode } from "react";

import { Footer } from "@/components/shop/Footer";
import { Navbar } from "@/components/shop/Navbar";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
