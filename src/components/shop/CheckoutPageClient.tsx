"use client";

import Image from "next/image";
import Link from "next/link";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { formatProductPrice } from "@/lib/shop-products";
import { useCart } from "@/store/CartContext";
import type { CartValidationError, CheckoutPaymentMethod, ValidatedCartItem } from "@/types";

type FormValues = {
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

type FormErrors = Partial<Record<keyof FormValues | "paymentMethod" | "cart", string>>;

type CartValidationResponse = {
  valid: boolean;
  items: ValidatedCartItem[];
  errors: CartValidationError[];
};

type CheckoutResponse = {
  orderId?: string;
  redirectUrl?: string;
  error?: string;
  errors?: CartValidationError[];
};

const COUNTRY_OPTIONS = ["España", "Portugal", "Francia", "Italia", "Alemania"];

const initialFormValues: FormValues = {
  name: "",
  email: "",
  address: "",
  city: "",
  postalCode: "",
  country: "España",
};

function PaymentCard({
  title,
  subtitle,
  selected,
  onClick,
  badge,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  onClick: () => void;
  badge: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-[1.5rem] border px-5 py-4 text-left ${
        selected ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink/30"
      }`}
    >
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.14em]">{title}</p>
        <p className={`mt-2 text-sm ${selected ? "text-white/74" : "text-ink/58"}`}>{subtitle}</p>
      </div>
      <span
        className={`rounded-full px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.18em] ${
          selected ? "bg-white text-ink" : "bg-stone-50 text-ink/58"
        }`}
      >
        {badge}
      </span>
    </button>
  );
}

export function CheckoutPageClient() {
  const router = useRouter();
  const { items, total, clearCart, isHydrated } = useCart();
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<CheckoutPaymentMethod | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = useMemo(() => {
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email);
    return Boolean(
      formValues.name.trim() &&
        formValues.email.trim() &&
        emailIsValid &&
        formValues.address.trim() &&
        formValues.city.trim() &&
        formValues.postalCode.trim() &&
        formValues.country.trim() &&
        selectedPaymentMethod,
    );
  }, [formValues, selectedPaymentMethod]);

  const handleFieldChange = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!formValues.name.trim()) nextErrors.name = "Ingresá tu nombre completo.";
    if (!formValues.email.trim()) nextErrors.email = "Ingresá tu email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) nextErrors.email = "Ingresá un email válido.";
    if (!formValues.address.trim()) nextErrors.address = "Ingresá la dirección de envío.";
    if (!formValues.city.trim()) nextErrors.city = "Ingresá la ciudad.";
    if (!formValues.postalCode.trim()) nextErrors.postalCode = "Ingresá el código postal.";
    if (!selectedPaymentMethod) nextErrors.paymentMethod = "Seleccioná un método de pago.";
    if (items.length === 0) nextErrors.cart = "Tu carrito está vacío.";

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!validateForm() || !selectedPaymentMethod) {
      return;
    }

    setIsSubmitting(true);

    try {
      const cartValidationResponse = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(items),
      });

      const cartValidation = (await cartValidationResponse.json()) as CartValidationResponse | { error?: string };

      if (!cartValidationResponse.ok || !("valid" in cartValidation) || !cartValidation.valid) {
        const apiErrors = "errors" in cartValidation && Array.isArray(cartValidation.errors) ? cartValidation.errors : [];
        setSubmitError(apiErrors[0]?.message ?? "Tu carrito cambió. Revisalo antes de confirmar el pedido.");
        return;
      }

      const checkoutResponse = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formValues,
          paymentMethod: selectedPaymentMethod,
          cartItems: items,
        }),
      });

      const checkoutData = (await checkoutResponse.json()) as CheckoutResponse;

      if (!checkoutResponse.ok || !checkoutData.redirectUrl) {
        setSubmitError(checkoutData.error ?? checkoutData.errors?.[0]?.message ?? "No se pudo crear el pedido.");
        return;
      }

      clearCart();
      router.push(checkoutData.redirectUrl);
    } catch {
      setSubmitError("Ocurrió un error inesperado al procesar tu pedido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isHydrated) {
    return (
      <section className="section-space bg-paper">
        <div className="site-container">
          <div className="rounded-[2rem] border border-line bg-stone-50 px-8 py-20 text-center">
            <p className="editorial-label text-ink/44">Checkout</p>
            <p className="mt-4 text-sm uppercase tracking-[0.18em] text-ink/58">Preparando tu pedido…</p>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="section-space bg-paper">
        <div className="site-container max-w-3xl text-center">
          <p className="editorial-label text-ink/44">Checkout</p>
          <h1 className="section-title mt-5">TU CHECKOUT</h1>
          <div className="mt-12 rounded-[2rem] border border-line bg-stone-50 px-8 py-16 sm:py-18">
            <p className="font-display text-3xl uppercase tracking-[0.14em] text-ink">No hay productos para finalizar</p>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ink/62 sm:text-base">
              Antes de completar tus datos de envío necesitás sumar al menos una pieza al carrito.
            </p>
            <Link href="/products" className="pill-dark mt-8 inline-flex">
              Ir a productos
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-space bg-paper">
      <div className="site-container space-y-10">
        <div className="space-y-4 text-center lg:text-left">
          <p className="editorial-label text-ink/44">Checkout</p>
          <h1 className="section-title">FINALIZAR PEDIDO</h1>
        </div>

        <form className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] xl:gap-12" onSubmit={handleSubmit}>
          <div className="rounded-[2rem] border border-line bg-white px-6 py-8 sm:px-8">
            <div className="border-b border-line pb-6">
              <h2 className="font-display text-[1.8rem] uppercase tracking-[0.12em] text-ink">DATOS DE ENVÍO</h2>
              <p className="mt-3 text-sm leading-7 text-ink/62">Completá la información para preparar y enviar tu pedido.</p>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="text-[0.72rem] uppercase tracking-[0.2em] text-ink/50">Nombre completo</span>
                <input
                  type="text"
                  required
                  value={formValues.name}
                  onChange={(event) => handleFieldChange("name", event.target.value)}
                  placeholder="Nombre y apellidos"
                  className="w-full rounded-[1.2rem] border border-ink/12 bg-stone-50 px-4 py-3.5 text-sm text-ink outline-none focus:border-ink/28"
                />
                {errors.name ? <p className="text-sm text-red-600">{errors.name}</p> : null}
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-[0.72rem] uppercase tracking-[0.2em] text-ink/50">Email</span>
                <input
                  type="email"
                  required
                  value={formValues.email}
                  onChange={(event) => handleFieldChange("email", event.target.value)}
                  placeholder="tu@email.com"
                  className="w-full rounded-[1.2rem] border border-ink/12 bg-stone-50 px-4 py-3.5 text-sm text-ink outline-none focus:border-ink/28"
                />
                {errors.email ? <p className="text-sm text-red-600">{errors.email}</p> : null}
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-[0.72rem] uppercase tracking-[0.2em] text-ink/50">Dirección</span>
                <input
                  type="text"
                  required
                  value={formValues.address}
                  onChange={(event) => handleFieldChange("address", event.target.value)}
                  placeholder="Calle, número, piso"
                  className="w-full rounded-[1.2rem] border border-ink/12 bg-stone-50 px-4 py-3.5 text-sm text-ink outline-none focus:border-ink/28"
                />
                {errors.address ? <p className="text-sm text-red-600">{errors.address}</p> : null}
              </label>

              <label className="space-y-2">
                <span className="text-[0.72rem] uppercase tracking-[0.2em] text-ink/50">Ciudad</span>
                <input
                  type="text"
                  required
                  value={formValues.city}
                  onChange={(event) => handleFieldChange("city", event.target.value)}
                  placeholder="Ciudad"
                  className="w-full rounded-[1.2rem] border border-ink/12 bg-stone-50 px-4 py-3.5 text-sm text-ink outline-none focus:border-ink/28"
                />
                {errors.city ? <p className="text-sm text-red-600">{errors.city}</p> : null}
              </label>

              <label className="space-y-2">
                <span className="text-[0.72rem] uppercase tracking-[0.2em] text-ink/50">Código Postal</span>
                <input
                  type="text"
                  required
                  value={formValues.postalCode}
                  onChange={(event) => handleFieldChange("postalCode", event.target.value)}
                  placeholder="28001"
                  className="w-full rounded-[1.2rem] border border-ink/12 bg-stone-50 px-4 py-3.5 text-sm text-ink outline-none focus:border-ink/28"
                />
                {errors.postalCode ? <p className="text-sm text-red-600">{errors.postalCode}</p> : null}
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-[0.72rem] uppercase tracking-[0.2em] text-ink/50">País</span>
                <select
                  value={formValues.country}
                  required
                  onChange={(event) => handleFieldChange("country", event.target.value)}
                  className="w-full rounded-[1.2rem] border border-ink/12 bg-stone-50 px-4 py-3.5 text-sm text-ink outline-none focus:border-ink/28"
                >
                  {COUNTRY_OPTIONS.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-line bg-stone-50 px-6 py-8 sm:px-8 lg:sticky lg:top-28 lg:self-start">
            <div className="border-b border-line pb-6">
              <h2 className="font-display text-[1.8rem] uppercase tracking-[0.12em] text-ink">RESUMEN DEL PEDIDO</h2>
            </div>

            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 rounded-[1.35rem] bg-white/85 p-3.5">
                  <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-[1rem] bg-stone-100">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[0.6rem] uppercase tracking-[0.2em] text-ink/42">AD</div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium uppercase tracking-[0.14em] text-ink">{item.name}</p>
                    <p className="mt-1 text-sm text-ink/58">
                      {item.quantity} × {formatProductPrice(item.price)}
                    </p>
                  </div>

                  <p className="text-sm font-medium text-ink">{formatProductPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-b border-line py-5 text-sm uppercase tracking-[0.14em] text-ink/66">
              <div className="flex items-center justify-between gap-4">
                <span>Subtotal</span>
                <span className="text-ink">{formatProductPrice(total)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Envío</span>
                <span className="text-ink">Gratis</span>
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between gap-4">
              <span className="font-display text-2xl uppercase tracking-[0.14em] text-ink">Total</span>
              <span className="text-[1.35rem] font-semibold tracking-[0.04em] text-ink">{formatProductPrice(total)}</span>
            </div>

            <div className="mt-8 space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[0.2em] text-ink/50">Método de pago</p>
              <PaymentCard
                title="Pagar con tarjeta"
                subtitle="Preparado para integrar Stripe en F7."
                badge="Stripe"
                selected={selectedPaymentMethod === "stripe"}
                onClick={() => {
                  setSelectedPaymentMethod("stripe");
                  setErrors((current) => {
                    const nextErrors = { ...current };
                    delete nextErrors.paymentMethod;
                    return nextErrors;
                  });
                }}
              />
              <PaymentCard
                title="Pagar con PayPal"
                subtitle="Preparado para integrar PayPal en F8."
                badge="PayPal"
                selected={selectedPaymentMethod === "paypal"}
                onClick={() => {
                  setSelectedPaymentMethod("paypal");
                  setErrors((current) => {
                    const nextErrors = { ...current };
                    delete nextErrors.paymentMethod;
                    return nextErrors;
                  });
                }}
              />
              {errors.paymentMethod ? <p className="text-sm text-red-600">{errors.paymentMethod}</p> : null}
            </div>

            {submitError || errors.cart ? <p className="mt-5 text-sm text-red-600">{submitError ?? errors.cart}</p> : null}

            <button type="submit" disabled={!isFormValid || isSubmitting} className="pill-dark mt-8 flex w-full disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100">
              {isSubmitting ? "Procesando pedido…" : "Confirmar pedido"}
            </button>
          </aside>
        </form>
      </div>
    </section>
  );
}
