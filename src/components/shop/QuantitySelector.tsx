"use client";

type QuantitySelectorProps = {
  value: number;
  onChange: (value: number) => void;
  max: number;
};

export function QuantitySelector({ value, onChange, max }: QuantitySelectorProps) {
  const safeMax = Math.max(max, 1);
  const isMin = value <= 1;
  const isMax = value >= safeMax;

  return (
    <div className="inline-flex items-center rounded-full border border-ink/12 bg-white p-1.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={isMin}
        className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-ink transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Reducir cantidad"
      >
        −
      </button>

      <span className="min-w-12 text-center text-sm font-medium text-ink">{value}</span>

      <button
        type="button"
        onClick={() => onChange(Math.min(safeMax, value + 1))}
        disabled={isMax}
        className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-ink transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Aumentar cantidad"
      >
        +
      </button>
    </div>
  );
}
