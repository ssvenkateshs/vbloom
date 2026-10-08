import { Check, Rosette } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { Section, SectionHeading } from "@/components/Section";
import { services } from "@/content/site";

export function Services() {
  return (
    <Section id="services">
      <SectionHeading eyebrow={services.eyebrow} title={services.title} intro={services.intro} />
      {/* The middle column sits lower, a quiet stagger borrowed from the reference designs. */}
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:pb-12 lg:[&>*:nth-child(3n+2)]:translate-y-12">
        {services.items.map((service, index) => (
          <Reveal key={service.title} delay={(index % 3) * 90}>
            <article className="group card-wash border-line shadow-soft hover:shadow-lift h-full rounded-[1.75rem] border p-7 transition duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between">
                <Rosette
                  name={service.icon}
                  tone={index % 2 ? "mint" : "violet"}
                  className="h-[4.5rem] w-[4.5rem]"
                />
                <span className="font-display text-brand-300 text-sm font-bold">{service.step}</span>
              </div>
              <h3 className="font-display text-ink mt-6 text-xl font-bold">{service.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {service.points.map((point) => (
                  <li key={point} className="text-ink-muted flex items-start gap-2.5 text-[0.95rem]">
                    <Check className="text-mint-500 mt-1 h-3.5 w-3.5 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
