import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Información sobre el tratamiento de datos personales en Alma Deco conforme al RGPD.",
  alternates: {
    canonical: "/legal/privacidad",
  },
};

export default function PrivacidadPage() {
  return (
    <article className="space-y-10 text-ink">
      <header className="space-y-5 text-center">
        <p className="editorial-label text-ink/48">Protección de datos</p>
        <h1 className="font-display text-4xl font-medium uppercase tracking-[0.18em] text-ink sm:text-5xl">
          POLÍTICA DE PRIVACIDAD
        </h1>
        <div className="mx-auto h-px w-24 bg-ink/70" />
      </header>

      <div className="space-y-8 text-[0.98rem] leading-[1.8] text-ink/76">
        <section className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-ink">1. Responsable del tratamiento</h2>
          <p>
            El responsable del tratamiento de tus datos personales es Alma Deco, CIF: XXXXXXXXX, con domicilio en [Dirección
            fiscal], España. Para cualquier cuestión relativa a privacidad, podés contactar en info@almadeco.com.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-ink">2. Datos que se recogen</h2>
          <p>Podemos tratar las siguientes categorías de datos personales:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Datos identificativos, como nombre y apellidos.</li>
            <li>Datos de contacto, como correo electrónico.</li>
            <li>Datos de envío y facturación, como dirección postal.</li>
            <li>Datos necesarios para la gestión del pago, procesados a través de Stripe o PayPal.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-ink">3. Finalidad del tratamiento</h2>
          <p>Los datos se utilizan para:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Gestionar pedidos, pagos, envíos y devoluciones.</li>
            <li>Comunicarnos con vos sobre el estado de tu pedido o incidencias relacionadas.</li>
            <li>Cumplir obligaciones legales, contables y fiscales.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-ink">4. Base legal</h2>
          <p>
            La base jurídica principal para el tratamiento es la ejecución del contrato de compraventa. En determinados
            supuestos, el tratamiento podrá basarse en tu consentimiento o en el cumplimiento de obligaciones legales
            aplicables a Alma Deco.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-ink">5. Destinatarios</h2>
          <p>Los datos podrán comunicarse, cuando resulte necesario, a:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Pasarelas de pago como Stripe y PayPal.</li>
            <li>Empresas de transporte encargadas de la entrega del pedido.</li>
            <li>Proveedores tecnológicos o de servicios que actúen como encargados del tratamiento.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-ink">6. Derechos del usuario</h2>
          <p>
            Podés ejercer en cualquier momento tus derechos de acceso, rectificación, supresión, portabilidad, limitación del
            tratamiento y oposición, así como retirar el consentimiento otorgado cuando corresponda.
          </p>
          <p>
            Para ejercer estos derechos, escribinos a info@almadeco.com indicando tu solicitud y un medio para verificar tu
            identidad. También podés presentar una reclamación ante la autoridad de control competente.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-ink">7. Plazo de conservación</h2>
          <p>
            Conservaremos tus datos durante el tiempo necesario para gestionar la relación contractual y, posteriormente,
            durante los plazos exigidos por la normativa fiscal, contable y de defensa frente a posibles reclamaciones.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-ink">8. Cookies</h2>
          <p>
            Este sitio puede utilizar cookies técnicas necesarias para su funcionamiento y, en su caso, otras cookies
            analíticas o de terceros. Podés obtener más información en nuestra Política de Cookies.
          </p>
        </section>
      </div>

      <p className="border-t border-line pt-6 text-sm text-ink/48">Última actualización: 30 de marzo de 2026</p>
    </article>
  );
}
