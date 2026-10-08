import { Icon, Rosette } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { Section, SectionHeading } from "@/components/Section";
import { aiSection } from "@/content/site";

/** An illustrative assistant: shows how AI sits inside everyday work, without claiming a product. */
function AssistantMock() {
  const { mock } = aiSection;
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="from-brand-200/50 via-bloom-300/30 to-mint-300/30 absolute -inset-6 rounded-[3rem] bg-gradient-to-br blur-2xl"
      />
      <figure className="shadow-lift relative overflow-hidden rounded-[1.75rem] border border-white bg-white/90 backdrop-blur">
        <div className="border-line flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="from-bloom-500 to-brand-600 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br text-white">
              <Icon name="spark" className="h-4.5 w-4.5" />
            </span>
            <span className="font-display text-ink text-sm font-bold">{mock.title}</span>
          </div>
          <span className="bg-mist text-ink-muted rounded-full px-3 py-1 text-xs font-semibold">
            {mock.badge}
          </span>
        </div>
        <div className="space-y-4 p-5">
          <p className="bg-brand-500 ml-auto max-w-[85%] rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed text-white">
            {mock.question}
          </p>
          <div className="bg-mist text-ink max-w-[90%] rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed">
            {mock.answer}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {mock.sources.map((source) => (
                <span
                  key={source}
                  className="text-ink-muted inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs"
                >
                  <Icon name="doc" className="text-brand-500 h-3 w-3" />
                  {source}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            {mock.actions.map((action, index) => (
              <span
                key={action}
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  index === 0 ? "bg-mint-500 text-white" : "border-line text-ink-muted border"
                }`}
              >
                {action}
              </span>
            ))}
          </div>
        </div>
      </figure>
    </div>
  );
}

export function AiSolutions() {
  return (
    <Section id="ai" className="bg-mist overflow-hidden">
      <div className="grid gap-16 lg:grid-cols-[1fr_1.05fr] lg:items-center">
        <div>
          <SectionHeading eyebrow={aiSection.eyebrow} title={aiSection.title} intro={aiSection.intro} />
          <Reveal className="mt-12" delay={120}>
            <AssistantMock />
          </Reveal>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 sm:pb-14 sm:[&>*:nth-child(even)]:translate-y-14">
          {aiSection.items.map((item, index) => (
            <Reveal key={item.title} delay={index * 90}>
              <article className="card-wash shadow-soft h-full rounded-[1.75rem] border border-white p-7">
                <Rosette
                  name={item.icon}
                  tone={index === 1 || index === 2 ? "mint" : "brand"}
                  className="h-24 w-24"
                />
                <h3
                  className={`font-display mt-6 text-[1.35rem] leading-tight font-bold ${
                    index === 1 || index === 2 ? "text-mint-600" : "text-brand-500"
                  }`}
                >
                  {item.title}
                </h3>
                <p className="text-ink-muted mt-3 leading-relaxed">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
