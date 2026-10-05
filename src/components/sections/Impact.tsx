import { impact } from "@/content/site";
import { Reveal } from "../Reveal";

/** Doc section 8: the arc every engagement follows, with no invented numbers. */
export function Impact() {
  return (
    <section aria-labelledby="impact-title" className="relative">
      <div className="mx-auto max-w-7xl px-5 pb-8 sm:px-8">
        <Reveal className="from-signal-red/[0.06] via-brand-500/[0.08] to-bloom-500/[0.1] rounded-[2rem] border border-white/8 bg-gradient-to-r p-8 sm:p-12">
          <p className="font-tech text-brand-300 text-[0.68rem] tracking-[0.3em] uppercase">
            {impact.eyebrow}
          </p>
          <h2
            id="impact-title"
            className="font-display mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl"
          >
            {impact.title}
          </h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {impact.steps.map((step, i) => (
              <li key={step.label} className="relative">
                {i < impact.steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-4 left-10 hidden h-px w-[calc(100%-1rem)] [animation:flow_3s_linear_infinite] bg-[linear-gradient(90deg,rgb(139_124_255/0.7),rgb(101_214_176/0.7),rgb(139_124_255/0.7))] bg-[length:200%_100%] lg:block"
                  />
                )}
                <span className="border-brand-300/50 bg-space-900 font-tech text-brand-200 relative grid h-8 w-8 place-items-center rounded-full border text-xs">
                  {i + 1}
                </span>
                <p className="font-display mt-4 text-lg font-semibold text-white">{step.label}</p>
                <p className="text-text-muted mt-1.5 text-sm leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
