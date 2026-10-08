import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

type HeadingProps = {
  eyebrow: string;
  title: string;
  intro?: string;
  centered?: boolean;
  dark?: boolean;
};

/** Eyebrow, headline and intro used by every section. */
export function SectionHeading({ eyebrow, title, intro, centered, dark }: HeadingProps) {
  return (
    <Reveal className={centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <p
        className={`flex items-center gap-3 text-sm font-semibold ${dark ? "text-bloom-300" : "text-brand-500"} ${
          centered ? "justify-center" : ""
        }`}
      >
        <span className={`h-px w-8 ${dark ? "bg-bloom-400/60" : "bg-brand-300"}`} />
        {eyebrow}
      </p>
      <h2
        className={`font-display mt-4 text-3xl leading-[1.12] font-extrabold tracking-tight text-balance sm:text-[2.8rem] ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {intro && (
        <p className={`mt-5 text-lg leading-relaxed ${dark ? "text-on-dark-muted" : "text-ink-muted"}`}>
          {intro}
        </p>
      )}
    </Reveal>
  );
}

export function Section({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`relative ${className}`}>
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">{children}</div>
    </section>
  );
}
