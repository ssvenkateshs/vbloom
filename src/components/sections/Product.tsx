import Image from "next/image";
import { product } from "@/content/site";
import { ArrowRight } from "../Icons";
import { Reveal } from "../Reveal";

/** The AI product, presented like the NOVA-7 card in the reference designs. */
export function Product() {
  return (
    <section id="products" className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-[30%] h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(232_228_255/0.22),transparent_62%)]" />
        <div className="absolute top-1/2 left-[30%] h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/15" />
        <div className="absolute top-1/2 left-[30%] h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/[0.07]" />
      </div>
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal className="relative mx-auto w-full max-w-md lg:max-w-lg">
          <Image
            src="/robot-portrait.png"
            alt="The VBloom robot, rendered in glossy black with violet LED eyes and a dotted V on its chest"
            width={900}
            height={900}
            className="h-auto w-full [mask-image:radial-gradient(closest-side,black_62%,transparent_100%)]"
          />
        </Reveal>
        <Reveal delay={120}>
          <p className="font-tech text-brand-300 flex items-center gap-3 text-[0.68rem] tracking-[0.3em] uppercase">
            <span className="bg-brand-400 h-px w-8" />
            {product.eyebrow}
          </p>
          <div className="glass mt-6 rounded-[2rem] p-8 sm:p-10">
            <h2 className="font-tech text-3xl font-semibold tracking-[0.06em] text-white sm:text-4xl">
              {product.name}
            </h2>
            <p className="text-text-muted mt-5 text-base leading-relaxed sm:text-lg">{product.summary}</p>
            <p className="text-text-faint mt-8 text-xs font-semibold tracking-[0.2em] uppercase">
              Learns from
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {product.capabilities.map((capability) => (
                <li
                  key={capability}
                  className="border-brand-400/25 bg-brand-500/10 text-brand-200 rounded-full border px-3.5 py-1.5 text-sm"
                >
                  {capability}
                </li>
              ))}
            </ul>
            <a
              href={product.cta.href}
              className="group text-space-950 hover:bg-brand-200 mt-9 inline-flex items-center gap-3 rounded-full bg-white py-2 pr-2 pl-6 text-sm font-semibold transition"
            >
              {product.cta.label}
              <span className="bg-brand-500 grid h-9 w-9 place-items-center rounded-full text-white transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
