"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export function AdminSidebar() {
  const pathname = usePathname();
  const t = useTranslations("admin.sidebar");

  const links = [
    { href: "/admin", label: t("dashboard") },
    { href: "/admin/products", label: t("products") },
    { href: "/admin/orders", label: t("orders") },
  ];

  return (
    <aside className="flex min-h-screen w-full max-w-64 flex-col border-r border-zinc-200 bg-zinc-50 px-5 py-8">
      <div className="mb-10 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">{t("panelLabel")}</p>
        <h2 className="text-2xl font-semibold text-zinc-900">{t("brandName")}</h2>
      </div>

      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
              pathname === link.href
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-zinc-700 hover:bg-white hover:text-zinc-950"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
