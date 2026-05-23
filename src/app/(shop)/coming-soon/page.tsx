import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coming soon",
  description: "Alma Deco is preparing this section.",
  alternates: {
    canonical: "/coming-soon",
  },
};

export default function ComingSoonPage() {
  return (
    <section className="section-space bg-paper">
      <div className="site-container flex min-h-[46vh] items-center justify-center text-center">
        <div className="max-w-xl space-y-6">
          <p className="editorial-label text-ink/48">Alma Deco</p>
          <h1 className="font-display text-4xl font-medium uppercase tracking-[0.18em] text-ink sm:text-5xl">
            Coming soon
          </h1>
          <div className="mx-auto h-px w-24 bg-ink/70" />
          <p className="text-[0.98rem] leading-8 text-ink/70">
            We are preparing this space. Please check back soon.
          </p>
        </div>
      </div>
    </section>
  );
}
