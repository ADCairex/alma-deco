import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

function ChevronIcon({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-4 w-4 fill-none stroke-current stroke-[1.8] ${direction === "left" ? "rotate-180" : ""}`}
    >
      <path d="M8 4l8 8-8 8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export async function Hero() {
  const t = await getTranslations("shop.home");

  return (
    <section className="relative isolate min-h-[70vh] overflow-hidden bg-bg-dark sm:min-h-[74vh]">
      <Image
        src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80&auto=format&fit=crop"
        alt={t("heroImageAlt")}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,15,15,0.76)_0%,rgba(15,15,15,0.48)_26%,rgba(15,15,15,0.18)_46%,rgba(15,15,15,0.08)_60%,rgba(15,15,15,0.18)_100%)]" />
      <div className="absolute inset-y-0 left-0 w-full bg-[radial-gradient(circle_at_14%_34%,rgba(255,255,255,0.1),transparent_28%)]" />

      <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col gap-3 text-white lg:flex">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/24 bg-black/18 backdrop-blur-sm">
          <ChevronIcon direction="left" />
        </span>
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-white/14 backdrop-blur-sm">
          <ChevronIcon />
        </span>
      </div>

      <div className="site-container relative flex min-h-[70vh] items-center py-16 sm:min-h-[74vh] sm:py-20 lg:py-24">
        <div className="max-w-xl space-y-6 text-white sm:space-y-8">
          <h1 className="text-shadow-hero font-display text-[3.3rem] leading-[0.88] tracking-[0.1em] uppercase text-white sm:text-[4.5rem] lg:text-[5.6rem]">
            <span className="block">{t("heroTitle1")}</span>
            <span className="block">{t("heroTitle2")}</span>
          </h1>

          <Link href="/products?nueva=1" className="pill-light-outline w-fit">
            {t("heroCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
