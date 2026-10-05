import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  children: ReactNode;
  /** Centre the heading block instead of left-aligning it. */
  centered?: boolean;
  className?: string;
};

export function Section({ id, eyebrow, title, intro, children, centered, className = "" }: SectionProps) {
  return (
    <section id={id} className={`relative ${className}`}>
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <Reveal className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
          {eyebrow && (
            <p
              className={`font-tech text-brand-300 flex items-center gap-3 text-[0.68rem] tracking-[0.3em] uppercase ${centered ? "justify-center" : ""}`}
            >
              <span className="bg-brand-400 h-px w-8" />
              {eyebrow}
            </p>
          )}
          <h2 className="font-display mt-5 text-3xl leading-[1.1] font-semibold tracking-tight text-white sm:text-5xl">
            {title}
          </h2>
          {intro && <p className="text-text-muted mt-5 text-lg leading-relaxed">{intro}</p>}
        </Reveal>
        <div className="mt-16">{children}</div>
      </div>
    </section>
  );
}
