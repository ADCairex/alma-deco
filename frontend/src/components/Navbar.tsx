import { useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import Logo from "../assets/Logo";

const navLinks = [
  { label: "REBAJAS", to: "/products?cat=rebajas" },
  { label: "Nueva Colección", to: "/products?cat=nueva" },
  { label: "Colección Orígenes", to: "/products?cat=origenes" },
  { label: "Cocina", to: "/products?cat=cocina" },
  { label: "Decoración", to: "/products?cat=decoracion" },
  { label: "Oficina", to: "/products?cat=oficina" },
  { label: "VERANO DECO", to: "/products?cat=verano" },
];

export default function Navbar() {
  const totalItems = useCartStore((s) => s.totalItems());
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <nav className="bg-black text-white sticky top-0 z-50">
      {/* Main row */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <Logo className="h-24 w-auto brightness-0 invert" />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-[11px] xl:text-xs font-medium tracking-widest2 text-white/90 hover:text-white transition-colors whitespace-nowrap uppercase"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Buscar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>

            {/* Language toggle */}
            <button className="text-[11px] font-medium tracking-wider text-white/80 hover:text-white transition-colors uppercase">
              ES/EN
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative text-white/80 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-white/80 hover:text-white transition-colors"
              aria-label="Menú"
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t border-white/10 bg-black">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="relative max-w-md ml-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full bg-white/10 border border-white/20 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                autoFocus
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-black">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-medium tracking-widest text-white/80 hover:text-white transition-colors uppercase"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
