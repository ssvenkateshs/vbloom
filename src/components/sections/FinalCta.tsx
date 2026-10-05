import { finalCta } from "@/content/site";
import { ArrowRight } from "../Icons";
import { Reveal } from "../Reveal";

/** Doc section 10: the full-screen ending. */
export function FinalCta() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-[-30rem] left-1/2 h-[52rem] w-[52rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(51_191_146/0.22),rgb(109_94_252/0.12)_45%,transparent_70%)]" />
      </div>
      <Reveal className="relative mx-auto max-w-4xl px-5 py-28 text-center sm:px-8 sm:py-36">
        <h2 className="font-display text-4xl leading-[1.05] font-semibold tracking-tight text-white sm:text-6xl">
          {finalCta.titleLead} <span className="text-gradient">{finalCta.titleAccent}</span>{" "}
          {finalCta.titleTail}
        </h2>
        <p className="text-text-muted mx-auto mt-6 max-w-2xl text-lg leading-relaxed">{finalCta.subhead}</p>
        <a
          href={finalCta.cta.href}
          className="group text-space-950 hover:bg-bloom-300 mt-10 inline-flex items-center gap-3 rounded-full bg-white py-2.5 pr-2.5 pl-7 text-base font-semibold transition"
        >
          {finalCta.cta.label}
          <span className="bg-bloom-500 grid h-10 w-10 place-items-center rounded-full text-white transition-transform group-hover:translate-x-0.5">
            <ArrowRight className="h-4 w-4" />
          </span>
        </a>
      </Reveal>
    </section>
  );
}
