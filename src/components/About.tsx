import { about, company } from "@/content/site";
import { Reveal } from "./Reveal";

export function About() {
  return (
    <section id="about" className="bg-page-alt">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-14 lg:grid-cols-[1fr_0.85fr]">
          <Reveal>
            <p className="text-brand-600 dark:text-brand-400 text-xs font-semibold tracking-[0.14em] uppercase">
              Who we are
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {about.title}
            </h2>
            <div className="text-text-muted mt-6 space-y-5 text-lg leading-relaxed">
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:pt-20">
            <div className="border-card-border bg-card rounded-2xl border p-7">
              <h3 className="font-display text-lg font-semibold tracking-tight">How we can engage</h3>
              <dl className="mt-5 space-y-5">
                {about.engagementModels.map((model) => (
                  <div key={model.title} className="border-brand-500/40 border-l-2 pl-4">
                    <dt className="text-sm font-semibold">{model.title}</dt>
                    <dd className="text-text-muted mt-1 text-sm">{model.body}</dd>
                  </div>
                ))}
              </dl>
              <a
                href="#contact"
                className="bg-brand-600 hover:bg-brand-700 mt-7 inline-block w-full rounded-full px-5 py-3 text-center text-sm font-semibold text-white transition"
              >
                Discuss your requirement
              </a>
              <p className="text-text-faint mt-4 text-center text-xs">
                Based in {company.location} · working with clients remotely
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
