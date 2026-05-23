"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

const ALL_SENTINEL = "__all__";

type ProductsFilterBarProps = {
  categories: readonly string[];
  activeCategory: string | null;
};

export function ProductsFilterBar({ categories, activeCategory }: ProductsFilterBarProps) {
  const t = useTranslations("shop.products");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const items = [ALL_SENTINEL, ...categories];

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => {
        const params = new URLSearchParams(searchParams.toString());

        params.delete("categoria");

        if (item === ALL_SENTINEL) {
          params.delete("category");
        } else {
          params.set("category", item);
        }

        const href = params.size ? `${pathname}?${params.toString()}` : pathname;
        const isActive = item === ALL_SENTINEL ? !activeCategory : activeCategory === item;

        return (
          <Link
            key={item}
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
            {item === ALL_SENTINEL ? t("filterAll") : item}
          </Link>
        );
      })}
    </div>
  );
}
