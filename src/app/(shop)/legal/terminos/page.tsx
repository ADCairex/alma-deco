import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Condiciones generales de compra de Alma Deco para pedidos realizados en España.",
  alternates: {
    canonical: "/legal/terminos",
  },
};

export default function TerminosPage() {
  return (
    <article className="space-y-10 text-ink">
      <header className="space-y-5 text-center">
        <p className="editorial-label text-ink/48">Información legal</p>
        <h1 className="font-display text-4xl font-medium uppercase tracking-[0.18em] text-ink sm:text-5xl">
          TÉRMINOS Y CONDICIONES
        </h1>
        <div className="mx-auto h-px w-24 bg-ink/70" />
      </header>

      <div className="space-y-8 text-[0.98rem] leading-[1.8] text-ink/76">
        <section className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-ink">1. Identificación del vendedor</h2>
          <p>
            El presente sitio web es titularidad de Alma Deco, CIF: XXXXXXXXX, con domicilio en [Dirección fiscal], España
            (en adelante, "Alma Deco"). Para cualquier consulta relacionada con estas condiciones, podés escribir a
            info@almadeco.com.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-ink">2. Objeto</h2>
          <p>
            Estas condiciones regulan la venta online de artículos de decoración rústica artesanal, accesorios para el hogar
            y piezas decorativas comercializadas por Alma Deco a través de su tienda online para clientes ubicados en España.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-ink">3. Proceso de compra</h2>
          <p>
            La compra se formaliza una vez que la persona usuaria selecciona los productos deseados, completa los datos de
            facturación y envío, elige el método de pago y confirma el pedido. Antes de finalizar la compra podrá revisar el
            detalle completo del pedido y corregir posibles errores.
          </p>
          <p>
            Tras la confirmación, Alma Deco enviará una comunicación de recepción del pedido al correo electrónico facilitado.
            Dicha comunicación no implica aceptación definitiva en caso de incidencias de stock, errores manifiestos en el
            precio o imposibilidad de suministro.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-ink">4. Precios y forma de pago</h2>
          <p>
            Todos los precios se muestran en euros (EUR) e incluyen los impuestos indirectos que resulten legalmente
            aplicables, salvo indicación expresa en contrario. Los gastos de envío se informarán antes de finalizar el pedido.
          </p>
          <p>El pago podrá realizarse mediante las pasarelas habilitadas en cada momento, incluyendo Stripe y PayPal.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-ink">5. Envíos</h2>
          <p>
            Alma Deco realiza envíos en España peninsular. Salvo que se indique otro plazo específico para un producto, el
            plazo estimado de entrega es de 3 a 5 días laborables desde la confirmación del pago.
          </p>
          <p>
            Los plazos son orientativos y pueden verse alterados por causas ajenas a Alma Deco, como incidencias logísticas,
            campañas de alta demanda o circunstancias de fuerza mayor.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-ink">6. Derecho de desistimiento</h2>
          <p>
            De conformidad con la normativa europea y española de defensa de consumidores y usuarios, disponés de un plazo de
            14 días naturales desde la recepción del pedido para desistir de la compra sin necesidad de justificación.
          </p>
          <p>
            Para ejercer este derecho, deberás comunicar tu decisión de forma inequívoca a través de info@almadeco.com,
            indicando el número de pedido y los productos afectados.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-ink">7. Devoluciones y reembolsos</h2>
          <p>
            Los productos deberán devolverse en perfecto estado, sin usar y con su embalaje original, salvo que la naturaleza
            del producto no lo permita. Una vez verificada la devolución, el reembolso se realizará por el mismo medio de pago
            utilizado en la compra, dentro de un plazo razonable y, en todo caso, dentro de los plazos legales aplicables.
          </p>
          <p>
            Los costes directos de devolución podrán ser asumidos por la persona consumidora, salvo cuando la devolución traiga
            causa de un producto defectuoso, dañado o incorrectamente enviado.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-ink">8. Garantía</h2>
          <p>
            Todos los productos cuentan con las garantías legales aplicables conforme a la normativa española. En caso de falta
            de conformidad, la persona compradora podrá solicitar la reparación, sustitución, rebaja del precio o resolución
            del contrato en los términos previstos por la ley.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-ink">9. Responsabilidad</h2>
          <p>
            Alma Deco no será responsable por interrupciones del servicio, errores técnicos o daños indirectos que no le sean
            imputables, sin perjuicio de los derechos que asisten a consumidores y usuarios conforme a la legislación vigente.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-ink">10. Ley aplicable y jurisdicción</h2>
          <p>
            Estas condiciones se rigen por la legislación española. En caso de conflicto o controversia, las partes se someten
            a los juzgados y tribunales que correspondan conforme a la normativa de consumidores y usuarios aplicable.
          </p>
        </section>
      </div>

      <p className="border-t border-line pt-6 text-sm text-ink/48">Última actualización: 30 de marzo de 2026</p>
    </article>
  );
}
