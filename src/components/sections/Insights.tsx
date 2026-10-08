import { Reveal } from "@/components/Reveal";
import { Section, SectionHeading } from "@/components/Section";
import { insights } from "@/content/site";

const art = [
  "from-brand-500 via-bloom-500 to-bloom-300",
  "from-mint-500 via-mint-400 to-brand-300",
  "from-brand-700 via-brand-500 to-mint-400",
];

export function Insights() {
  return (
    <Section id="insights">
      <SectionHeading eyebrow={insights.eyebrow} title={insights.title} intro={insights.intro} />
      <ul className="mt-14 grid gap-6 md:grid-cols-3">
        {insights.items.map((item, index) => (
          <Reveal as="li" key={item.title} delay={index * 90}>
            <article className="border-line shadow-soft h-full overflow-hidden rounded-[1.75rem] border bg-white">
              <div
                aria-hidden="true"
                className={`relative h-40 overflow-hidden bg-gradient-to-br ${art[index]}`}
              >
                <div className="absolute -right-10 -bottom-16 h-48 w-48 rounded-full bg-white/20" />
                <div className="absolute top-6 -left-8 h-28 w-28 rounded-full bg-white/15" />
                <div className="absolute right-12 bottom-6 h-16 w-16 rounded-full border-2 border-white/40" />
              </div>
              <div className="p-7">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-brand-500 text-sm font-semibold">{item.topic}</p>
                  <span className="bg-mist text-ink-muted rounded-full px-3 py-1 text-xs font-semibold">
                    {insights.status}
                  </span>
                </div>
                <h3 className="font-display text-ink mt-3 text-xl leading-snug font-bold">{item.title}</h3>
              </div>
            </article>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
