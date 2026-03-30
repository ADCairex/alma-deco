import type { ReactNode } from "react";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-paper">
      <section className="section-space">
        <div className="mx-auto w-full max-w-[800px] px-6 sm:px-8">{children}</div>
      </section>
    </div>
  );
}
