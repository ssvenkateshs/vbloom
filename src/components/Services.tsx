import { services } from "@/content/site";
import { Check, Icon, type IconName } from "./Icons";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

export function Services() {
  return (
    <Section
      id="services"
      eyebrow="What we do"
      title="Services built around outcomes, not billable hours"
      intro="Six practices that cover the full life of a system — from the decision to build it to keeping it healthy years later."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => (
          <Reveal
            key={service.id}
            delay={index * 70}
            as="article"
            className="group border-card-border bg-card hover:border-brand-400/60 hover:shadow-brand-600/8 flex flex-col rounded-2xl border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <span className="bg-brand-500/10 text-brand-600 group-hover:bg-brand-500 dark:text-brand-300 grid h-12 w-12 place-items-center rounded-xl transition group-hover:text-white">
              <Icon name={service.icon as IconName} />
            </span>
            <h3 className="font-display mt-5 text-xl font-semibold tracking-tight">{service.title}</h3>
            <p className="text-text-muted mt-3 text-sm leading-relaxed">{service.summary}</p>
            <ul className="border-card-border mt-5 space-y-2 border-t pt-5">
              {service.points.map((point) => (
                <li key={point} className="text-text-muted flex items-start gap-2 text-sm">
                  <Check className="text-brand-500 mt-0.5 h-4 w-4 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
