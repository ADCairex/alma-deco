import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

const footerLogo = "/brand/alma-deco-logo-02.png";
const comingSoonHref = "/coming-soon";
const instagramHref = "https://www.instagram.com/almadeco.es/";

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.7]">
      <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="4.25" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.1" cy="6.9" r="0.85" fill="currentColor" stroke="none" />
    </svg>
  );
}

export async function Footer() {
  const t = await getTranslations("shop.footer");

  return (
    <footer className="bg-bg-dark text-white">
      <div className="site-container grid items-center justify-items-center gap-12 py-16 text-center md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_0.8fr_1fr] lg:gap-10 lg:py-20">
        <div className="flex h-full w-full flex-col items-center justify-center space-y-6">
          <div className="mx-auto flex max-w-xs flex-col items-center space-y-3">
            <Image
              src={footerLogo}
              alt={t("brandLogoAlt")}
              width={3508}
              height={2481}
              className="mx-auto h-auto w-40 object-contain brightness-0 invert sm:w-[10.5rem]"
              sizes="(min-width: 640px) 168px, 160px"
            />
            <p className="text-sm leading-6 text-white/68">
              {t("tagline")}
            </p>
          </div>
        </div>

        <div className="flex h-full w-full flex-col items-center justify-center space-y-4 text-center text-sm text-white/82">
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

        <div className="flex h-full w-full flex-col items-center justify-center text-center text-sm uppercase tracking-[0.18em] text-white/88">
          <Link href={comingSoonHref} target="_blank" rel="noopener noreferrer" className="block space-y-1 text-center hover:opacity-70">
            <span className="block">{t("discoverLabel")}</span>
            <span className="block">{t("discoverBrand")}</span>
            <span className="block">{t("discoverSuffix")}</span>
          </Link>
        </div>

        <div className="flex h-full w-full flex-col items-center justify-center space-y-5 text-center text-sm text-white/82">
          <p className="text-[0.82rem] font-semibold uppercase tracking-[0.24em] text-white">{t("contactTitle")}</p>
          <a href={`mailto:${t("contactEmail")}`} className="block hover:opacity-70">
            {t("contactEmail")}
          </a>
          <div className="space-y-1 leading-6">
            <p>{t("socialCta1")}</p>
            <p>{t("socialCta2")}</p>
          </div>
          <div className="flex items-center justify-center gap-3 text-white">
            <a href={instagramHref} target="_blank" rel="noopener noreferrer" aria-label={t("socialInstagram")} className="thin-frame-inverse rounded-full p-2.5 hover:bg-white hover:text-ink">
              <InstagramIcon />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/12 py-5 text-center text-[0.74rem] uppercase tracking-[0.24em] text-white/70">{t("copyright")}</div>
    </footer>
  );
}
