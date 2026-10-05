import { services } from "@/content/site";
import { Check, Icon, type IconName } from "../Icons";
import { Reveal } from "../Reveal";
import { Section } from "../Section";

export function Services() {
  return (
    <Section id="services" eyebrow={services.eyebrow} title={services.title} intro={services.intro}>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.items.map((service, index) => (
          <Reveal
            key={service.id}
            delay={index * 70}
            as="article"
            className="group hover:border-brand-400/40 relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-7 transition duration-500 hover:-translate-y-1"
          >
            <div
              aria-hidden="true"
              className="bg-brand-500/20 pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
            />
            <span className="border-brand-400/30 bg-brand-500/10 text-brand-300 grid h-12 w-12 place-items-center rounded-2xl border shadow-[0_0_24px_rgb(109_94_252/0.25)]">
              <Icon name={service.icon as IconName} />
            </span>
            <h3 className="font-display mt-6 text-xl font-semibold tracking-tight text-white">
              {service.title}
            </h3>
            <p className="text-text-muted mt-3 text-sm leading-relaxed">{service.summary}</p>
            <ul className="mt-6 space-y-2.5 border-t border-white/8 pt-5">
              {service.points.map((point) => (
                <li key={point} className="text-text-muted flex items-start gap-2.5 text-sm">
                  <Check className="text-bloom-300 mt-0.5 h-4 w-4 shrink-0" />
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
