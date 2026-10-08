"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, PlayPause } from "@/components/Icons";
import { company, story } from "@/content/site";
import { StoryScene } from "./StoryScene";

const chapters = story.chapters;

const reducedQuery = "(prefers-reduced-motion: reduce)";
function subscribeReduced(onChange: () => void) {
  const query = window.matchMedia(reducedQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Experience A of the brief: a 30-second story in six chapters that plays like a short
 * film, loops, and can be paused or jumped. The timeline's CSS animation is the clock,
 * so pausing is a single class and nothing re-renders between chapters.
 */
export function Hero() {
  const [chapter, setChapter] = useState(0);
  // Null until the visitor chooses; reduced motion then means the story starts paused.
  const [choice, setChoice] = useState<boolean | null>(null);
  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(reducedQuery).matches,
    () => false,
  );
  const playing = choice ?? !reduced;
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [cycle, setCycle] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const running = playing && inView && pageVisible;

  useEffect(() => {
    const onVisibility = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);

    const node = sectionRef.current;
    const observer =
      node && typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 })
        : undefined;
    if (node) observer?.observe(node);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      observer?.disconnect();
    };
  }, []);

  const goTo = (index: number) => {
    setChapter(index);
    setCycle((value) => value + 1);
  };

  const advance = () => {
    setChapter((current) => (current + 1) % chapters.length);
    setCycle((value) => value + 1);
  };

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-roledescription="carousel"
      aria-label={`${company.name} in six chapters`}
      className={`story night-glow text-on-dark relative overflow-hidden ${running ? "" : "is-paused"}`}
    >
      <h1 className="sr-only">
        {company.name}: {company.tagline}
      </h1>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(rgb(255_255_255/0.18)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_70%_45%,black,transparent_70%)] [background-size:28px_28px] opacity-[0.35]"
      />

      <div className="relative mx-auto grid max-w-7xl gap-6 px-5 pt-28 pb-10 sm:px-8 lg:min-h-[min(100svh,880px)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-10 lg:pt-24 lg:pb-32">
        <div className="grid">
          {chapters.map((item, index) => {
            const active = index === chapter;
            const finale = index === chapters.length - 1;
            return (
              <article
                key={item.id}
                aria-hidden={!active}
                inert={!active}
                aria-roledescription="slide"
                aria-label={`${item.step} of 0${chapters.length}: ${item.label}`}
                className={`col-start-1 row-start-1 transition duration-700 ease-[var(--ease-out-soft)] ${
                  active
                    ? "translate-y-0 opacity-100 delay-200"
                    : "pointer-events-none translate-y-3 opacity-0"
                }`}
              >
                <p className="text-bloom-300 flex items-center gap-3 text-sm font-semibold tracking-wide">
                  <span className="font-display text-brand-300">{item.step}</span>
                  <span className="bg-brand-400/60 h-px w-8" />
                  {item.label}
                </p>
                <h2 className="font-display mt-5 max-w-[13ch] text-[2.35rem] leading-[1.06] font-bold tracking-tight text-white sm:text-5xl lg:text-[3.6rem]">
                  {item.title}
                </h2>
                <p className="text-on-dark-muted mt-5 max-w-md text-lg leading-relaxed">{item.body}</p>
                {finale && (
                  <div className="mt-8 hidden lg:block">
                    <p className="font-display text-2xl font-bold text-white">
                      {company.name}
                      <span className="text-gradient-light mt-1 block text-base font-semibold">
                        {company.tagline}
                      </span>
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <a
                        href={story.finale.primary.href}
                        className="group bg-brand-500 shadow-brand-500/30 hover:bg-brand-400 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition"
                      >
                        {story.finale.primary.label}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </a>
                      <a
                        href={story.finale.secondary.href}
                        className="inline-flex items-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
                      >
                        {story.finale.secondary.label}
                      </a>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div className="relative mx-auto aspect-[56/52] w-full max-w-[620px]">
          <StoryScene chapter={chapter} paused={!running} />
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:absolute lg:inset-x-0 lg:bottom-24 lg:pb-0">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setChoice(!playing)}
            aria-label={playing ? story.controls.pause : story.controls.play}
            aria-pressed={!playing}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-white transition hover:border-white/35 hover:bg-white/5"
          >
            <PlayPause playing={playing} className="h-3.5 w-3.5" />
          </button>
          <ol className="grid flex-1 grid-cols-6 gap-2 sm:gap-3">
            {chapters.map((item, index) => {
              const done = index < chapter;
              const active = index === chapter;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    aria-current={active ? "step" : undefined}
                    aria-label={`${story.controls.chapter} ${item.step}: ${item.label}`}
                    className="group block w-full pt-1 text-left"
                  >
                    <span className="relative block h-[3px] overflow-hidden rounded-full bg-white/15">
                      {(done || active) && (
                        <span
                          key={active ? `${index}-${cycle}` : `${index}-done`}
                          className={`story-fill from-brand-400 to-bloom-400 absolute inset-0 origin-left rounded-full bg-gradient-to-r ${active ? "" : "scale-x-100"}`}
                          style={
                            active
                              ? { animation: `story-progress ${story.chapterSeconds}s linear forwards` }
                              : undefined
                          }
                          onAnimationEnd={active ? advance : undefined}
                        />
                      )}
                    </span>
                    <span
                      className={`mt-3 hidden text-xs font-semibold tracking-wide transition sm:block ${
                        active ? "text-white" : "text-on-dark-faint group-hover:text-on-dark-muted"
                      }`}
                    >
                      <span className="text-brand-300 mr-1.5">{item.step}</span>
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <svg
        aria-hidden="true"
        className="absolute inset-x-0 -bottom-px h-16 w-full sm:h-24"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <path
          style={{ fill: "var(--color-brand-500)" }}
          d="M0 64C220 18 420 18 640 52s440 70 800 6v62H0Z"
          fillOpacity="0.35"
        />
        <path style={{ fill: "var(--color-paper)" }} d="M0 84C260 40 480 46 720 74s460 44 720-6v52H0Z" />
      </svg>
    </section>
  );
}
