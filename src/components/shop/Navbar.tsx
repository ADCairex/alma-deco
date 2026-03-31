"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { DeerLogo } from "@/components/icons/DeerLogo";
import { useCart } from "@/store/CartContext";

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.75 4.75" strokeLinecap="round" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="M6.5 8.25h11l-.9 10.1a1.5 1.5 0 0 1-1.49 1.37H8.89A1.5 1.5 0 0 1 7.4 18.35z" />
      <path d="M9 9V7.75a3 3 0 0 1 6 0V9" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
      {open ? <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}
    </svg>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCart();
  const t = useTranslations("shop.nav");

  const navLinks = [
    { href: "/products?tag=rebajas", label: t("links.rebajas") },
    { href: "/products?nueva=1", label: t("links.nuevaColeccion"), featured: true },
    { href: "/products?coleccion=origenes", label: t("links.coleccionOrigenes") },
    { href: "/products?categoria=cocina", label: t("links.cocina") },
    { href: "/products?categoria=decoracion", label: t("links.decoracion") },
    { href: "/products?categoria=oficina", label: t("links.oficina") },
    { href: "/products?temporada=verano-deco", label: t("links.veranoDeco") },
  ];

  return (
    <header className="sticky top-0 z-50 bg-bg-dark text-white">
      <div className="border-b border-white/8">
        <div className="site-container flex min-h-20 items-center justify-between gap-4 lg:min-h-24">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              aria-label={isOpen ? t("closeMenu") : t("openMenu")}
              aria-expanded={isOpen}
              onClick={() => setIsOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/16 text-white hover:bg-white/8"
            >
              <MenuIcon open={isOpen} />
            </button>
          </div>

          <Link href="/" className="flex items-center gap-3 text-white">
            <DeerLogo className="h-11 w-11 sm:h-12 sm:w-12" color="currentColor" />
            <div className="flex flex-col leading-none">
              <span className="font-display text-[0.95rem] uppercase tracking-[0.42em] sm:text-[1.05rem]">Alma Deco</span>
              <span className="mt-1 text-[0.56rem] uppercase tracking-[0.34em] text-white/62">Rustic Living</span>
            </div>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-5 lg:flex xl:gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-[0.81rem] uppercase tracking-[0.18em] text-white/88 hover:text-white ${link.featured ? "font-semibold" : "font-normal"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="hidden items-center lg:flex">
              <div
                className={`overflow-hidden rounded-full border border-white/18 bg-white/4 transition-all duration-300 ${searchOpen ? "w-56 opacity-100" : "w-10 opacity-90"}`}
              >
                <div className="flex items-center">
                  <button
                    type="button"
                    aria-label={t("search")}
                    aria-expanded={searchOpen}
                    onClick={() => setSearchOpen((value) => !value)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center text-white hover:bg-white/8"
                  >
                    <SearchIcon />
                  </button>
                  <input
                    type="search"
                    placeholder={t("searchPlaceholder")}
                    className={`h-10 bg-transparent pr-4 text-[0.76rem] uppercase tracking-[0.16em] text-white placeholder:text-white/45 focus:outline-none ${searchOpen ? "w-full opacity-100" : "w-0 opacity-0"}`}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              aria-label={t("search")}
              onClick={() => setSearchOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/18 text-white hover:bg-white/8 lg:hidden"
            >
              <SearchIcon />
            </button>

            <Link href="/cart" aria-label={t("cart")} className="relative flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/8">
              <BagIcon />
              {itemCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[0.58rem] font-semibold text-ink">
                  {itemCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </div>

      {searchOpen ? (
        <div className="border-b border-white/10 bg-bg-dark lg:hidden">
          <div className="site-container py-3">
            <div className="flex items-center rounded-full border border-white/18 bg-white/4 pl-3">
              <SearchIcon />
              <input
                type="search"
                placeholder={t("searchProductsPlaceholder")}
                className="h-11 w-full bg-transparent px-3 text-[0.76rem] uppercase tracking-[0.16em] text-white placeholder:text-white/45 focus:outline-none"
              />
            </div>
          </div>
        </div>
      ) : null}

      {isOpen ? (
        <div className="border-b border-white/10 bg-bg-dark lg:hidden">
          <nav className="site-container flex flex-col gap-4 py-5">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`w-fit text-[0.82rem] uppercase tracking-[0.18em] text-white/88 hover:text-white ${link.featured ? "font-semibold" : "font-normal"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
