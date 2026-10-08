import { ArrowRight } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { finalCta } from "@/content/site";

export function FinalCta() {
  return (
    <section className="px-5 pb-8 sm:px-8">
      <Reveal className="from-brand-600 via-brand-500 to-bloom-500 relative mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] bg-gradient-to-br px-6 py-16 text-center text-white sm:px-12 sm:py-24">
        <svg
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-40 w-full"
          viewBox="0 0 1200 160"
          preserveAspectRatio="none"
        >
          <path d="M0 80C200 30 400 30 600 70s400 60 600 0v90H0Z" fill="#fff" fillOpacity="0.08" />
          <path d="M0 110C240 70 480 80 720 105s340 30 480-10v65H0Z" fill="#fff" fillOpacity="0.08" />
        </svg>
        <div aria-hidden="true" className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/10" />
        <div className="relative">
          <p className="text-sm font-semibold tracking-wide text-white/80">{finalCta.eyebrow}</p>
          <h2 className="font-display mx-auto mt-4 max-w-3xl text-3xl leading-tight font-extrabold tracking-tight text-balance sm:text-5xl">
            {finalCta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/85">{finalCta.body}</p>
          <a
            href={finalCta.cta.href}
            className="group text-brand-600 shadow-brand-900/20 hover:bg-brand-50 mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold shadow-xl transition"
          >
            {finalCta.cta.label}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </Reveal>
    </section>
  );
}
