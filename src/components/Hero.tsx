import { hero } from "@/content/site";
import { ArrowRight, Check } from "./Icons";
import { Reveal } from "./Reveal";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Decorative background: soft brand glow plus a faint grid. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-brand-400/18 dark:bg-brand-500/14 absolute -top-40 left-1/2 h-[36rem] w-[72rem] -translate-x-1/2 rounded-full blur-3xl" />
        <div className="bg-accent-500/14 absolute top-24 -right-32 h-80 w-80 rounded-full blur-3xl" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(18,163,122,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(18,163,122,0.07) 1px, transparent 1px)",
            backgroundSize: "68px 68px",
            maskImage: "radial-gradient(ellipse at 50% 0%, black, transparent 72%)",
            WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, black, transparent 72%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-5 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <Reveal>
              <span className="border-brand-500/25 bg-brand-500/8 text-brand-700 dark:text-brand-300 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-[0.1em] uppercase">
                <span className="bg-brand-500 h-1.5 w-1.5 rounded-full" />
                {hero.eyebrow}
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="font-display mt-6 text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                {hero.headlineLead} <span className="bloom-gradient-text">{hero.headlineAccent}</span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="text-text-muted mt-6 max-w-xl text-lg leading-relaxed">{hero.subhead}</p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={hero.primaryCta.href}
                  className="group bg-brand-600 shadow-brand-600/20 hover:bg-brand-700 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition"
                >
                  {hero.primaryCta.label}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
                <a
                  href={hero.secondaryCta.href}
                  className="border-card-border text-text hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-300 inline-flex items-center gap-2 rounded-full border px-6 py-3.5 text-sm font-semibold transition"
                >
                  {hero.secondaryCta.label}
                </a>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
                {hero.highlights.map((item) => (
                  <li key={item} className="text-text-muted flex items-center gap-2 text-sm font-medium">
                    <Check className="text-brand-500 h-4 w-4 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={200} className="lg:justify-self-end">
            <HeroPanel />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * Abstract illustration standing in for a product screenshot — a mock
 * delivery board, so the hero reads as technical without faking a dashboard.
 */
function HeroPanel() {
  const rows = [
    { label: "Discovery workshop", state: "Done", tone: "done" },
    { label: "Target architecture", state: "Done", tone: "done" },
    { label: "Platform migration", state: "In progress", tone: "active" },
    { label: "Observability rollout", state: "Next", tone: "queued" },
  ] as const;

  const tones = {
    done: "bg-brand-500/12 text-brand-700 dark:text-brand-300",
    active: "bg-accent-500/14 text-accent-600 dark:text-accent-400",
    queued: "bg-text-faint/12 text-text-faint",
  } as const;

  return (
    <div className="relative w-full max-w-md">
      <div className="from-brand-400/25 to-accent-500/25 absolute -inset-3 -z-10 rounded-[28px] bg-gradient-to-br via-transparent blur-xl" />
      <div className="border-card-border bg-card shadow-ink-900/5 rounded-3xl border p-6 shadow-xl dark:shadow-black/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-faint text-xs font-semibold tracking-[0.12em] uppercase">Engagement</p>
            <p className="font-display mt-1 text-lg font-semibold">Cloud modernisation</p>
          </div>
          <span className="bg-brand-500/12 text-brand-700 dark:text-brand-300 rounded-full px-3 py-1 text-xs font-semibold">
            On track
          </span>
        </div>

        <div className="mt-6 space-y-2.5">
          {rows.map((row) => (
            <div
              key={row.label}
              className="border-card-border/80 flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3"
            >
              <span className="text-sm font-medium">{row.label}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tones[row.tone]}`}>
                {row.state}
              </span>
            </div>
          ))}
        </div>

        <div className="border-card-border mt-6 border-t pt-5">
          <div className="flex items-end justify-between text-sm">
            <span className="text-text-muted">Sprint 6 of 10</span>
            <span className="text-brand-600 dark:text-brand-300 font-semibold">60%</span>
          </div>
          <div className="bg-text-faint/15 mt-2.5 h-2 overflow-hidden rounded-full">
            <div className="from-brand-500 to-accent-500 h-full w-[60%] rounded-full bg-gradient-to-r" />
          </div>
        </div>
      </div>
    </div>
  );
}
