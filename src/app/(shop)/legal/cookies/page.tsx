import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Información sobre el uso de cookies en la tienda online de Alma Deco.",
  alternates: {
    canonical: "/legal/cookies",
  },
};

export default function CookiesPage() {
  return (
    <article className="space-y-10 text-ink">
      <header className="space-y-5 text-center">
        <p className="editorial-label text-ink/48">Transparencia digital</p>
        <h1 className="font-display text-4xl font-medium uppercase tracking-[0.18em] text-ink sm:text-5xl">
          POLÍTICA DE COOKIES
        </h1>
        <div className="mx-auto h-px w-24 bg-ink/70" />
      </header>

      <div className="space-y-8 text-[0.98rem] leading-[1.8] text-ink/76">
        <section className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-ink">1. Qué son las cookies</h2>
          <p>
            Las cookies son pequeños archivos de texto que un sitio web almacena en tu dispositivo cuando lo visitás. Sirven
            para permitir funciones técnicas, recordar preferencias y, en algunos casos, obtener información estadística sobre
            la navegación.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-ink">2. Tipos de cookies utilizadas</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong className="text-ink">Técnicas o necesarias:</strong> imprescindibles para el funcionamiento del sitio,
              la gestión de sesión y el mantenimiento del carrito de compra.
            </li>
            <li>
              <strong className="text-ink">Analíticas:</strong> actualmente no se emplean con fines estadísticos avanzados,
              aunque podrían incorporarse en el futuro para conocer el uso del sitio.
            </li>
            <li>
              <strong className="text-ink">De terceros:</strong> determinados servicios integrados, como Stripe o PayPal,
              pueden utilizar cookies propias para procesar pagos o prevenir fraude.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-ink">3. Gestión de cookies en el navegador</h2>
          <p>
            Podés permitir, bloquear o eliminar las cookies desde la configuración de tu navegador. Tené en cuenta que la
            desactivación de cookies necesarias puede afectar al funcionamiento de determinadas funcionalidades de la tienda.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-ink">4. Contacto</h2>
          <p>
            Si tenés dudas sobre el uso de cookies en este sitio, podés escribir a info@almadeco.com para solicitar más
            información.
          </p>
        </section>
      </div>

      <p className="border-t border-line pt-6 text-sm text-ink/48">Última actualización: 30 de marzo de 2026</p>
    </article>
  );
}
