"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type ProductsFilterBarProps = {
  categories: readonly string[];
  activeCategory: string | null;
};

export function ProductsFilterBar({ categories, activeCategory }: ProductsFilterBarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const items = ["Todos", ...categories];

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => {
        const params = new URLSearchParams(searchParams.toString());

        params.delete("categoria");

        if (item === "Todos") {
          params.delete("category");
        } else {
          params.set("category", item);
        }

        const href = params.size ? `${pathname}?${params.toString()}` : pathname;
        const isActive = item === "Todos" ? !activeCategory : activeCategory === item;

        return (
          <Link
            key={item}
            href={href}
            className={`rounded-full border px-5 py-3 text-[0.72rem] font-medium uppercase tracking-[0.22em] ${
              isActive
                ? "border-ink bg-ink text-white"
                : "border-ink/12 bg-white text-ink/72 hover:border-ink/30 hover:text-ink"
            }`}
          >
            {item}
          </Link>
        );
      })}
    </div>
  );
}
