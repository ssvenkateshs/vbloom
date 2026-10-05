import { scenarios } from "@/content/site";
import { Reveal } from "../Reveal";
import { Section } from "../Section";

/** Doc section 5: stories rather than service lists, explicitly illustrative. */
export function Scenarios() {
  return (
    <Section id="industries" eyebrow={scenarios.eyebrow} title={scenarios.title} intro={scenarios.intro}>
      <div className="grid gap-5 lg:grid-cols-3">
        {scenarios.items.map((item, index) => (
          <Reveal
            key={item.title}
            delay={index * 90}
            as="article"
            className="flex flex-col overflow-hidden rounded-3xl border border-white/8 bg-white/[0.025]"
          >
            <div className="border-b border-white/8 px-7 pt-7 pb-6">
              <p className="font-tech text-brand-300 text-[0.62rem] tracking-[0.28em] uppercase">
                {item.industry}
              </p>
              <h3 className="font-display mt-2 text-2xl font-semibold tracking-tight text-white">
                {item.title}
              </h3>
            </div>
            <div className="grid flex-1 grid-rows-2">
              <div className="px-7 py-6">
                <p className="text-signal-red text-xs font-semibold tracking-[0.18em] uppercase">
                  Without AI
                </p>
                <ul className="mt-3 space-y-2">
                  {item.without.map((line) => (
                    <li key={line} className="text-text-muted flex gap-2.5 text-sm">
                      <span aria-hidden="true" className="text-signal-red">
                        ✕
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-bloom-400/20 from-bloom-500/[0.09] border-t bg-gradient-to-b to-transparent px-7 py-6">
                <p className="text-bloom-300 text-xs font-semibold tracking-[0.18em] uppercase">
                  With VBloom
                </p>
                <ul className="mt-3 space-y-2">
                  {item.with.map((line) => (
                    <li key={line} className="flex gap-2.5 text-sm text-white">
                      <span aria-hidden="true" className="text-bloom-300">
                        ✓
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-10 flex flex-wrap items-center gap-2.5">
        <span className="text-text-faint mr-2 text-sm">Built for</span>
        {scenarios.industries.map((industry) => (
          <span
            key={industry}
            className="text-text-muted rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm"
          >
            {industry}
          </span>
        ))}
      </Reveal>
    </Section>
  );
}
