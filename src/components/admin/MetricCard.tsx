import type { ReactNode } from "react";

type MetricCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
};

export function MetricCard({ icon, label, value, hint }: MetricCardProps) {
  return (
    <article className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">{value}</p>
          {hint ? <p className="mt-3 text-sm text-zinc-500">{hint}</p> : null}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-xl">{icon}</div>
      </div>
    </article>
  );
}
