"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { PublicTaxonomyOption } from "@/lib/shop-products";

const ALL_SENTINEL = "__all__";

type ProductsFilterBarProps = {
  categories: readonly PublicTaxonomyOption[];
  activeCategory: string | null;
};

export function ProductsFilterBar({ categories, activeCategory }: ProductsFilterBarProps) {
  const t = useTranslations("shop.products");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categoryItems = [ALL_SENTINEL, ...categories] as const;

  return (
    <div className="space-y-4">
      <FilterGroup label={t("categoryFilterLabel")}>
        {categoryItems.map((item) => {
          const params = new URLSearchParams(searchParams.toString());

          params.delete("categoria");

          if (item === ALL_SENTINEL) {
            params.delete("category");
          } else {
            params.set("category", item.slug);
          }

          const href = params.size ? `${pathname}?${params.toString()}` : pathname;
          const isActive = item === ALL_SENTINEL ? !activeCategory : activeCategory === item.slug;

          return <FilterLink key={item === ALL_SENTINEL ? item : item.slug} href={href} isActive={isActive} label={item === ALL_SENTINEL ? t("filterAll") : item.name} />;
        })}
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2.5">
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-ink/45">{label}</p>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}

function FilterLink({ href, isActive, label }: { href: string; isActive: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "rounded-full border px-5 py-3 text-[0.72rem] font-medium uppercase tracking-[0.22em]",
        "focus-visible:border-clay focus-visible:bg-white focus-visible:text-ink",
        isActive
          ? "border-ink/60 bg-stone-100 text-ink shadow-[inset_0_0_0_1px_rgba(26,26,26,0.16)] hover:border-ink hover:bg-stone-200 hover:text-ink"
          : "border-ink/24 bg-white text-ink hover:border-ink/70 hover:bg-stone-50 hover:text-ink",
      )}
    >
      {label}
    </Link>
  );
}
