import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://almadeco.com";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Alma Deco | Decoración Rústica Artesanal España",
    template: "%s | Alma Deco",
  },
  description:
    "Tienda online de decoración rústica artesanal. Piezas únicas para crear espacios con alma. Envíos a toda España.",
  keywords: [
    "decoración rústica",
    "decoración artesanal",
    "decoración España",
    "decoración hogar",
    "alma deco",
    "decoración natural",
    "muebles rústicos",
    "jarrones artesanales",
    "velas artesanales",
  ],
  authors: [{ name: "Alma Deco" }],
  creator: "Alma Deco",
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Alma Deco",
    title: "Alma Deco | Decoración Rústica Artesanal España",
    description: "Tienda online de decoración rústica artesanal. Piezas únicas para crear espacios con alma.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alma Deco | Decoración Rústica Artesanal",
    description: "Piezas únicas de decoración rústica artesanal. Envíos a toda España.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${playfairDisplay.variable} h-full scroll-smooth`}>
      <body className="min-h-full bg-paper font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
