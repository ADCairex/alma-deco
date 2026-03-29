"use client";

import { signOut, useSession } from "next-auth/react";
import { useTransition } from "react";

export function AdminHeader() {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();

  return (
    <header className="border-b border-zinc-200 bg-white px-6 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">Administración</p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-950">Alma Deco Admin</h1>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Sesión</p>
            <p className="mt-1 text-sm font-medium text-zinc-800">{session?.user?.email ?? "Administrador"}</p>
          </div>

          <button
            type="button"
            onClick={() =>
              startTransition(() => {
                void signOut({ callbackUrl: "/admin/login" });
              })
            }
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Saliendo..." : "Cerrar sesión"}
          </button>
        </div>
      </div>
    </header>
  );
}
