import { AuthError } from "next-auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { auth, signIn } from "@/auth";

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const session = await auth();

  if (session) {
    redirect("/admin");
  }

  const t = await getTranslations("auth");
  const { error } = await searchParams;

  const errorKeyMap: Record<string, string> = {
    credentials: t("errorCredentials"),
    missing_fields: t("errorMissingFields"),
  };

  const errorMessage = error ? (errorKeyMap[error] ?? t("errorDefault")) : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-zinc-500">{t("sectionLabel")}</p>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">{t("loginTitle")}</h1>
            <p className="text-sm leading-6 text-zinc-600">
              {t("loginDescription")}
            </p>
          </div>
        </div>

        <form
          action={async (formData) => {
            "use server";

            const email = String(formData.get("email") ?? "").trim().toLowerCase();
            const password = String(formData.get("password") ?? "");

            if (!email || !password) {
              redirect("/admin/login?error=missing_fields");
            }

            try {
              await signIn("credentials", {
                email,
                password,
                redirectTo: "/admin",
              });
            } catch (error) {
              if (error instanceof AuthError) {
                redirect("/admin/login?error=credentials");
              }

              throw error;
            }
          }}
          className="mt-8 space-y-5"
        >
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-zinc-800">
              {t("fieldEmail")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
              placeholder={t("fieldEmailPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-zinc-800">
              {t("fieldPassword")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
              placeholder="••••••••••••"
            />
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2"
          >
            {t("submitButton")}
          </button>
        </form>
      </div>
    </div>
  );
}
