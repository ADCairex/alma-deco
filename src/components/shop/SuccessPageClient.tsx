"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { useCart } from "@/store/CartContext";

type SuccessOrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type SuccessOrder = {
  id: string;
  customerName: string;
  customerEmail: string;
  status: string;
  paymentMethod: string | null;
  total: number;
  currency: string;
  items: SuccessOrderItem[];
};

type SuccessPageClientProps = {
  order: SuccessOrder | null;
  orderId?: string;
  sessionId?: string;
  paypalToken?: string;
};

type PayPalCaptureResponse = {
  success?: boolean;
  error?: string;
  order?: SuccessOrder;
};

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" className="h-12 w-12 fill-none stroke-current stroke-[1.8]">
      <circle cx="32" cy="32" r="29" className="stroke-current opacity-20" />
      <path d="M20 33.5l8 8L45 24.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(amount);
}

export function SuccessPageClient({ order, orderId, sessionId, paypalToken }: SuccessPageClientProps) {
  const t = useTranslations("shop.success");
  const tCommon = useTranslations("common");
  const { clearCart } = useCart();
  const [currentOrder, setCurrentOrder] = useState(order);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(Boolean(paypalToken && orderId));
  const shouldAutoCapturePayPal = useMemo(
    () => Boolean(paypalToken && orderId && currentOrder?.paymentMethod === "paypal" && currentOrder.status !== "paid"),
    [currentOrder?.paymentMethod, currentOrder?.status, orderId, paypalToken],
  );

  useEffect(() => {
    if (!sessionId && !currentOrder) {
      return;
    }

    if (sessionId || currentOrder?.status === "paid") {
      clearCart();
    }
  }, [clearCart, currentOrder, sessionId]);

  useEffect(() => {
    if (!shouldAutoCapturePayPal || !orderId || !paypalToken) {
      setIsCapturing(false);
      return;
    }

    let cancelled = false;

    const capture = async () => {
      setCaptureError(null);
      setIsCapturing(true);

      try {
        const response = await fetch("/api/payments/paypal", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "capture",
            orderId,
            paypalOrderId: paypalToken,
          }),
        });

        const data = (await response.json()) as PayPalCaptureResponse;

        if (!response.ok || !data.success) {
          throw new Error(data.error ?? t("errorPaypalCapture"));
        }

        if (!cancelled) {
          setCurrentOrder(data.order ?? currentOrder);
          clearCart();
        }
      } catch (error) {
        if (!cancelled) {
          setCaptureError(error instanceof Error ? error.message : t("errorPaypalCapture"));
        }
      } finally {
        if (!cancelled) {
          setIsCapturing(false);
        }
      }
    };

    void capture();

    return () => {
      cancelled = true;
    };
  }, [clearCart, currentOrder, orderId, paypalToken, shouldAutoCapturePayPal]);

  const isPaid = Boolean(sessionId) || currentOrder?.status === "paid";
  const title = captureError ? t("titleFailed") : isCapturing ? t("titleConfirming") : t("title");
  const description = captureError
    ? captureError
    : isCapturing
      ? t("descriptionConfirming")
      : t("description");

  return (
    <section className="section-space bg-paper">
      <div className="site-container max-w-4xl">
        <div className="rounded-[2.25rem] border border-line bg-stone-50 px-8 py-16 sm:px-12 sm:py-20">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-ink/10 bg-white text-ink">
              <CheckIcon />
            </div>

            <p className="editorial-label mt-8 text-ink/44">{t("editorialLabel")}</p>
            <h1 className="section-title mt-5">{title}</h1>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-ink/66 sm:text-base">{description}</p>

            {orderId ? (
              <p className="mt-6 text-[0.82rem] uppercase tracking-[0.24em] text-ink/56">
                {t("orderNumber", { orderId })}
              </p>
            ) : null}
          </div>

          {currentOrder ? (
            <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
              <div className="rounded-[1.75rem] border border-line bg-white p-6">
                <h2 className="font-display text-[1.5rem] uppercase tracking-[0.12em] text-ink">{t("orderDetailTitle")}</h2>
                <div className="mt-6 space-y-4">
                  {currentOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 border-b border-line/70 pb-4 last:border-b-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium uppercase tracking-[0.12em] text-ink">{item.name}</p>
                        <p className="mt-1 text-sm text-ink/58">{t("itemQuantityAndPrice", { quantity: item.quantity, price: formatPrice(item.price, currentOrder.currency) })}</p>
                      </div>
                      <p className="text-sm font-medium text-ink">{formatPrice(item.price * item.quantity, currentOrder.currency)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="rounded-[1.75rem] border border-line bg-white p-6">
                <h2 className="font-display text-[1.5rem] uppercase tracking-[0.12em] text-ink">{t("summaryTitle")}</h2>
                <dl className="mt-6 space-y-4 text-sm text-ink/70">
                  <div className="flex items-start justify-between gap-4">
                    <dt>{t("summaryCustomer")}</dt>
                    <dd className="text-right font-medium text-ink">{currentOrder.customerName}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt>{t("summaryEmail")}</dt>
                    <dd className="text-right font-medium text-ink">{currentOrder.customerEmail}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt>{t("summaryPayment")}</dt>
                    <dd className="text-right font-medium uppercase text-ink">{currentOrder.paymentMethod ?? t("summaryPaymentUndefined")}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt>{t("summaryStatus")}</dt>
                    <dd className="text-right font-medium text-ink">{currentOrder.status === "paid" ? t("statusPaid") : currentOrder.status === "cancelled" ? t("statusCancelled") : currentOrder.status === "pending" ? t("statusPending") : currentOrder.status}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 border-t border-line pt-4 text-base">
                    <dt className="font-semibold uppercase tracking-[0.12em] text-ink">{tCommon("total")}</dt>
                    <dd className="text-right font-semibold text-ink">{formatPrice(currentOrder.total, currentOrder.currency)}</dd>
                  </div>
                </dl>
              </aside>
            </div>
          ) : (
            <div className="mt-12 rounded-[1.75rem] border border-line bg-white p-6 text-center text-sm text-ink/66">
              {t("noOrderDetails")}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link href="/" className="pill-dark">
              {t("backToStoreButton")}
            </Link>
            {!isPaid && !captureError ? (
              <p className="mt-4 text-sm text-ink/58">{t("syncingPayment")}</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
