import { pillars } from "@/content/site";
import { Reveal } from "../Reveal";
import { Section } from "../Section";

const ACCENTS = ["#8b7cff", "#c06bff", "#33bf92"];

/** Doc section 9: a transformation partner, not a vendor. */
export function Pillars() {
  return (
    <Section id="about" eyebrow={pillars.eyebrow} title={pillars.title} intro={pillars.intro}>
      <div className="grid gap-5 md:grid-cols-3">
        {pillars.items.map((pillar, index) => (
          <Reveal
            key={pillar.name}
            delay={index * 90}
            className="relative rounded-3xl border border-white/8 bg-white/[0.025] p-8"
          >
            <span className="font-tech text-xs tracking-[0.3em]" style={{ color: ACCENTS[index] }}>
              0{index + 1}
            </span>
            <h3 className="font-tech mt-4 text-3xl font-semibold tracking-[0.08em] text-white">
              {pillar.name}
            </h3>
            <p className="mt-1 text-sm font-semibold" style={{ color: ACCENTS[index] }}>
              {pillar.subtitle}
            </p>
            <p className="text-text-muted mt-4 text-sm leading-relaxed">{pillar.body}</p>
            <span
              aria-hidden="true"
              className="absolute right-8 bottom-0 left-8 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${ACCENTS[index]}, transparent)` }}
            />
          </Reveal>
        ))}
      </div>
      <Reveal className="text-text-muted mt-10 max-w-3xl text-base leading-relaxed">{pillars.about}</Reveal>
    </Section>
  );
}
