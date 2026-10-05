import { differentiators, industries } from "@/content/site";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

export function WhyUs() {
  return (
    <Section id="why" eyebrow="Why VBloom" title={differentiators.title} intro={differentiators.intro}>
      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {differentiators.items.map((item, index) => (
          <Reveal key={item.title} delay={index * 60}>
            <div className="from-brand-500 to-accent-500 h-1 w-10 rounded-full bg-gradient-to-r" />
            <h3 className="font-display mt-4 text-lg font-semibold tracking-tight">{item.title}</h3>
            <p className="text-text-muted mt-2.5 text-sm leading-relaxed">{item.body}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className="border-card-border bg-page-alt mt-16 rounded-2xl border p-7 sm:p-9">
        <h3 className="font-display text-lg font-semibold tracking-tight">Industries we work across</h3>
        <p className="text-text-muted mt-2 text-sm">
          Our team&apos;s production experience spans regulated and high-volume environments.
        </p>
        <ul className="mt-5 flex flex-wrap gap-2.5">
          {industries.map((industry) => (
            <li
              key={industry}
              className="border-card-border bg-card text-text-muted rounded-full border px-3.5 py-1.5 text-sm font-medium"
            >
              {industry}
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
