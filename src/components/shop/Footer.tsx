import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { DeerLogo } from "@/components/icons/DeerLogo";

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.7]">
      <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="4.25" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.1" cy="6.9" r="0.85" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.7]">
      <path d="M14 4v9.25a3.75 3.75 0 1 1-3.05-3.69" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 4c0.98 1.97 2.61 3.64 5 4.1v2.72c-2.13 0-3.84-.53-5-1.34" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export async function Footer() {
  const t = await getTranslations("shop.footer");

  return (
    <footer className="bg-bg-dark text-white">
      <div className="site-container grid gap-12 py-16 text-center md:grid-cols-2 md:text-left lg:grid-cols-[1.2fr_1fr_0.8fr_1fr] lg:gap-10 lg:py-20">
        <div className="space-y-6">
          <div className="mx-auto w-fit space-y-4 md:mx-0">
            <div className="flex items-center justify-center gap-4 md:justify-start">
              <DeerLogo className="h-16 w-16" color="currentColor" />
              <div className="thin-frame-inverse inline-flex items-center justify-center px-5 py-3">
                <span className="font-display text-lg uppercase tracking-[0.34em]">{t("brandName")}</span>
              </div>
            </div>
            <p className="max-w-xs text-[0.82rem] leading-6 text-white/66">
              {t("tagline")}
            </p>
          </div>
        </div>

        <div className="space-y-4 text-[0.82rem] text-white/82">
          <Link href="/legal/terminos" className="block hover:opacity-70">
            {t("legalTerms")}
          </Link>
          <Link href="/legal/privacidad" className="block hover:opacity-70">
            {t("legalPrivacy")}
          </Link>
          <Link href="/legal/cookies" className="block hover:opacity-70">
            {t("legalCookies")}
          </Link>
          <Link href="#" className="block hover:opacity-70">
            {t("cookieSettings")}
          </Link>
        </div>

        <div className="space-y-1 text-[0.82rem] uppercase tracking-[0.18em] text-white/88">
          <p>{t("discoverLabel")}</p>
          <p>{t("discoverBrand")}</p>
          <p>{t("discoverSuffix")}</p>
        </div>

        <div className="space-y-5 text-[0.82rem] text-white/82">
          <p className="text-[0.8rem] font-semibold uppercase tracking-[0.24em] text-white">{t("contactTitle")}</p>
          <a href={`mailto:${t("contactEmail")}`} className="block hover:opacity-70">
            {t("contactEmail")}
          </a>
          <div className="space-y-1 leading-6">
            <p>{t("socialCta1")}</p>
            <p>{t("socialCta2")}</p>
          </div>
          <div className="flex items-center justify-center gap-3 text-white md:justify-start">
            <a href="#" aria-label={t("socialInstagram")} className="thin-frame-inverse rounded-full p-2.5 hover:bg-white hover:text-ink">
              <InstagramIcon />
            </a>
            <a href="#" aria-label={t("socialTikTok")} className="thin-frame-inverse rounded-full p-2.5 hover:bg-white hover:text-ink">
              <TikTokIcon />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/12 py-5 text-center text-[0.74rem] uppercase tracking-[0.24em] text-white/70">{t("copyright")}</div>
    </footer>
  );
}
