import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

type SectionProps = {
  id: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  children: ReactNode;
  tinted?: boolean;
  /** Centre the heading block instead of left-aligning it. */
  centered?: boolean;
};

export function Section({ id, eyebrow, title, intro, children, tinted, centered }: SectionProps) {
  return (
    <section id={id} className={tinted ? "bg-page-alt" : undefined}>
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
          {eyebrow && (
            <p className="text-brand-600 dark:text-brand-400 text-xs font-semibold tracking-[0.14em] uppercase">
              {eyebrow}
            </p>
          )}
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
          {intro && <p className="text-text-muted mt-4 text-lg leading-relaxed">{intro}</p>}
        </Reveal>
        <div className="mt-14">{children}</div>
      </div>
    </section>
  );
}
