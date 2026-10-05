import { approach } from "@/content/site";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

export function Approach() {
  return (
    <Section id="approach" eyebrow="How we work" title={approach.title} intro={approach.intro} tinted>
      <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {approach.steps.map((step, index) => (
          <Reveal
            key={step.number}
            delay={index * 90}
            as="li"
            className="border-card-border bg-card relative rounded-2xl border p-6"
          >
            <span className="font-display text-brand-500/35 text-3xl font-semibold">{step.number}</span>
            <h3 className="font-display mt-3 text-lg font-semibold tracking-tight">{step.title}</h3>
            <p className="text-text-muted mt-2.5 text-sm leading-relaxed">{step.body}</p>
            {/* Connector line between steps on wide screens. */}
            {index < approach.steps.length - 1 && (
              <span
                aria-hidden="true"
                className="bg-brand-400/40 absolute top-11 right-0 hidden h-px w-5 translate-x-full lg:block"
              />
            )}
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
