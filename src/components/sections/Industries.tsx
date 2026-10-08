import { Icon } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { Section, SectionHeading } from "@/components/Section";
import { industries } from "@/content/site";

export function Industries() {
  return (
    <Section id="industries">
      <SectionHeading
        eyebrow={industries.eyebrow}
        title={industries.title}
        intro={industries.intro}
        centered
      />
      <ul className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {industries.items.map((industry, index) => (
          <Reveal as="li" key={industry.name} delay={(index % 3) * 80}>
            <div className="group border-line hover:border-brand-200 hover:shadow-soft flex h-full items-start gap-5 rounded-3xl border bg-white p-6 transition duration-300">
              <span className="from-brand-50 to-brand-100 text-brand-500 group-hover:from-brand-500 group-hover:to-bloom-500 grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br transition group-hover:text-white">
                <Icon name={industry.icon} className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-display text-ink text-lg font-bold">{industry.name}</h3>
                <p className="text-ink-muted mt-1.5 text-sm leading-relaxed">{industry.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
