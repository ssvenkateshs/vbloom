"use client";

import { useEffect, useRef, useState } from "react";
import { hero, journey } from "@/content/site";
import type { World } from "@/world/createWorld";
import { activeScene, buildLayout, heroOpacity, launchProgress, panelOpacity } from "@/world/layout";
import { ArrowRight } from "../Icons";

const layout = buildLayout();

type Mode = "loading" | "webgl" | "fallback";

/**
 * The immersive opening: a tall scroll track with a sticky full-screen stage. Behind
 * the copy, a lazily loaded Three.js world flies the camera from Earth orbit through
 * the six journey scenes. Scroll drives the camera; each scene autoplays on arrival.
 *
 * Copy opacity is written straight to the DOM on scroll (no React render per frame);
 * React state changes only when the active scene changes.
 */
export function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const railFillRef = useRef<HTMLSpanElement>(null);
  const mobileBarRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(-1);
  const [mode, setMode] = useState<Mode>("loading");

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvasHost = canvasRef.current;
    if (!section || !stage || !canvasHost) return;

    let world: World | null = null;
    let disposed = false;
    let raf = 0;
    let inView = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowPower =
      window.matchMedia("(pointer: coarse)").matches ||
      window.innerWidth < 760 ||
      (navigator.hardwareConcurrency ?? 8) <= 4;

    const readScroll = () => {
      const rect = section.getBoundingClientRect();
      const travel = section.offsetHeight - stage.offsetHeight;
      const progress = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
      return progress * layout.total;
    };

    const show = (el: HTMLElement | null | undefined, opacity: number, lift = 18) => {
      if (!el) return;
      el.style.opacity = opacity.toFixed(3);
      el.style.transform = `translate3d(0, ${((1 - opacity) * lift).toFixed(1)}px, 0)`;
      el.style.visibility = opacity < 0.01 ? "hidden" : "visible";
    };

    const apply = () => {
      raf = 0;
      const scroll = readScroll();
      world?.setScroll(scroll);
      show(heroRef.current, heroOpacity(layout, scroll), -24);
      show(hintRef.current, heroOpacity(layout, scroll * 2.5), 0);
      panelRefs.current.forEach((panel, i) => show(panel, panelOpacity(layout, i, scroll)));
      const launched = launchProgress(layout, scroll);
      const first = layout.sceneCenter[0];
      const last = layout.sceneCenter[layout.sceneCenter.length - 1];
      const journeyProgress = Math.min(1, Math.max(0, (scroll - first) / (last - first)));
      if (railRef.current) show(railRef.current, Math.min(1, launched * 1.4), 0);
      if (mobileBarRef.current) show(mobileBarRef.current, Math.min(1, launched * 1.4), 0);
      if (railFillRef.current) railFillRef.current.style.transform = `scaleY(${journeyProgress.toFixed(4)})`;
      const next = activeScene(layout, scroll);
      setActive((prev) => (prev === next ? prev : next));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    apply();

    const toNdc = (x: number, y: number) => {
      const rect = stage.getBoundingClientRect();
      return [((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1] as const;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!world || !inView) return;
      const [x, y] = toNdc(event.clientX, event.clientY);
      world.setPointer(x, y);
    };
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!world || !touch || !inView) return;
      const [x, y] = toNdc(touch.clientX, touch.clientY);
      world.setPointer(x, y);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!world) return;
      const [x, y] = toNdc(event.clientX, event.clientY);
      world.pointerDown(x, y);
    };
    const onPointerLeave = () => world?.clearPointer();
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    stage.addEventListener("pointerdown", onPointerDown);
    document.documentElement.addEventListener("pointerleave", onPointerLeave);

    // Only render while the stage is on screen and the tab is visible.
    const sync = () => {
      if (!world) return;
      if (inView && !document.hidden) world.start();
      else world.stop();
    };
    const io = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.isIntersecting);
        sync();
      },
      { rootMargin: "100px 0px" },
    );
    io.observe(stage);
    document.addEventListener("visibilitychange", sync);

    const fontFamily =
      getComputedStyle(document.documentElement).getPropertyValue("--font-orbitron").trim() || "sans-serif";

    import("@/world/createWorld")
      .then(({ createWorld }) => createWorld(canvasHost, { fontFamily, reducedMotion, lowPower }))
      .then((created) => {
        if (disposed) {
          created.dispose();
          return;
        }
        world = created;
        world.setScroll(readScroll());
        if (new URLSearchParams(window.location.search).has("world-debug")) {
          (window as unknown as { __vbloomWorld: World }).__vbloomWorld = world;
        }
        setMode("webgl");
        sync();
      })
      .catch(() => {
        if (!disposed) setMode("fallback");
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
      stage.removeEventListener("pointerdown", onPointerDown);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", sync);
      io.disconnect();
      world?.dispose();
      world = null;
    };
  }, []);

  const scrollToScene = (index: number) => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    const travel = section.offsetHeight - stage.offsetHeight;
    const target = index < 0 ? 0 : layout.sceneCenter[index] / layout.total;
    const top = section.getBoundingClientRect().top + window.scrollY + target * travel;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  };

  const current = active >= 0 ? journey[active] : null;

  return (
    <section
      id="experience"
      ref={sectionRef}
      aria-label="The VBloom transformation journey"
      data-scroll-total={layout.total}
      className="relative"
      style={{ height: `calc(${layout.total} * 100svh + 100svh)` }}
    >
      <div ref={stageRef} className="bg-space-950 sticky top-0 h-svh w-full overflow-hidden">
        {/* Background layer: the 3D world (decorative; all story text is real DOM below). */}
        <div ref={canvasRef} aria-hidden="true" className="absolute inset-0" />
        {mode !== "webgl" && <FallbackBackdrop active={active} loading={mode === "loading"} />}

        {/* Foreground layer: the hero copy. */}
        <div
          ref={heroRef}
          className="pointer-events-none absolute inset-0 flex items-end pb-[max(7.5rem,14svh)] md:items-center md:pb-0"
        >
          <div className="pointer-events-auto mx-auto w-full max-w-7xl px-5 sm:px-8">
            <div className="max-w-xl">
              <p className="font-tech text-brand-300 text-[0.66rem] font-medium tracking-[0.28em] uppercase sm:text-xs">
                {hero.eyebrow}
              </p>
              <h1 className="font-display mt-5 text-5xl leading-[1.02] font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
                {hero.titleLead} <span className="text-gradient">{hero.titleAccent}</span>
              </h1>
              <p className="text-text-muted mt-6 max-w-md text-base leading-relaxed sm:text-lg">
                {hero.subhead}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={hero.primaryCta.href}
                  className="group text-space-950 hover:bg-brand-200 inline-flex items-center gap-3 rounded-full bg-white py-2 pr-2 pl-6 text-sm font-semibold transition"
                >
                  {hero.primaryCta.label}
                  <span className="bg-brand-500 grid h-9 w-9 place-items-center rounded-full text-white transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </a>
                <button
                  type="button"
                  onClick={() => scrollToScene(0)}
                  className="hover:border-brand-300 inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/5"
                >
                  {hero.secondaryCta.label}
                  <span aria-hidden="true">↓</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={hintRef}
          className="pointer-events-none absolute right-0 bottom-6 left-0 mx-auto flex w-full max-w-7xl items-end justify-between px-5 sm:px-8"
        >
          <p className="font-tech text-text-muted flex items-center gap-3 text-[0.62rem] tracking-[0.3em] uppercase">
            <span className="relative h-8 w-5 rounded-full border border-white/30">
              <span className="bg-brand-300 absolute top-1.5 left-1/2 h-1.5 w-1 -translate-x-1/2 [animation:drift_1.6s_ease-in-out_infinite] rounded-full" />
            </span>
            {hero.scrollHint}
          </p>
          {mode === "webgl" && (
            <p className="font-tech text-text-faint hidden text-[0.62rem] tracking-[0.3em] uppercase md:block">
              {hero.robotHint}
            </p>
          )}
        </div>

        {/* Scene copy panels, pinned while the camera settles in each scene. */}
        {journey.map((step, i) => (
          <div
            key={step.id}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            className="pointer-events-none invisible absolute inset-x-0 bottom-0 opacity-0 md:inset-y-0 md:flex md:items-center"
            style={{ ["--accent" as string]: step.accent }}
          >
            <div className="mx-auto w-full max-w-7xl px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8 md:pb-0 md:pl-40">
              <article
                className="glass pointer-events-auto max-w-md rounded-3xl p-6 shadow-2xl shadow-black/40 sm:p-8"
                aria-labelledby={`scene-${step.id}`}
              >
                <p className="font-tech flex items-center gap-3 text-[0.66rem] tracking-[0.28em] text-[var(--accent)] uppercase">
                  <span className="h-px w-8 bg-[var(--accent)]" />
                  {step.step} · {step.label}
                </p>
                <p className="text-text-faint mt-4 text-xs font-semibold tracking-[0.18em] uppercase">
                  {step.eyebrow}
                </p>
                <h2
                  id={`scene-${step.id}`}
                  className="font-display mt-2 text-2xl leading-tight font-semibold tracking-tight text-white sm:text-3xl"
                >
                  {step.title}
                </h2>
                <p className="text-text-muted mt-3 text-sm leading-relaxed sm:text-base">{step.body}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {step.tags.map((tag) => (
                    <li
                      key={tag}
                      className="text-text-muted rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
                {step.cta && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href={step.cta.primary.href}
                      className="group text-space-950 hover:bg-bloom-300 inline-flex items-center gap-3 rounded-full bg-white py-2 pr-2 pl-5 text-sm font-semibold transition"
                    >
                      {step.cta.primary.label}
                      <span className="bg-bloom-500 grid h-8 w-8 place-items-center rounded-full text-white">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </a>
                    <a
                      href={step.cta.secondary.href}
                      className="hover:border-bloom-300 inline-flex items-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition"
                    >
                      {step.cta.secondary.label}
                    </a>
                  </div>
                )}
              </article>
            </div>
          </div>
        ))}

        {/* Transformation Timeline: the doc's left-hand journey indicator. */}
        <nav
          ref={railRef}
          aria-label="Transformation timeline"
          className="invisible absolute top-1/2 left-5 hidden -translate-y-1/2 opacity-0 md:block lg:left-8"
        >
          <div className="relative pl-6">
            <span className="absolute top-2 bottom-2 left-[5px] w-px bg-white/12" />
            <span
              ref={railFillRef}
              className="from-signal-red via-brand-400 to-bloom-400 absolute top-2 bottom-2 left-[5px] w-px origin-top bg-gradient-to-b"
              style={{ transform: "scaleY(0)" }}
            />
            <ol className="space-y-5">
              {journey.map((step, i) => {
                const isActive = i === active;
                return (
                  <li key={step.id}>
                    <button
                      type="button"
                      onClick={() => scrollToScene(i)}
                      aria-current={isActive ? "step" : undefined}
                      className="group relative flex items-center gap-3 text-left"
                    >
                      <span
                        className="absolute -left-6 h-[11px] w-[11px] rounded-full border transition-all duration-300"
                        style={{
                          borderColor: isActive ? step.accent : "rgb(255 255 255 / 0.25)",
                          background: isActive ? step.accent : "#02030a",
                          boxShadow: isActive ? `0 0 14px ${step.accent}` : "none",
                        }}
                      />
                      <span
                        className={`font-tech text-[0.62rem] tracking-[0.2em] transition-colors ${
                          isActive ? "text-white" : "text-text-faint group-hover:text-text-muted"
                        }`}
                      >
                        {step.step}
                      </span>
                      <span
                        className={`text-xs font-semibold tracking-[0.16em] uppercase transition-colors ${
                          isActive ? "text-white" : "text-text-faint group-hover:text-text-muted"
                        }`}
                      >
                        {step.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </nav>

        {/* Phones: a compact step indicator instead of the rail. */}
        <div
          ref={mobileBarRef}
          className="invisible absolute top-20 left-4 flex items-center gap-2 opacity-0 md:hidden"
          aria-hidden="true"
        >
          {journey.map((step, i) => (
            <span
              key={step.id}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: i === active ? 26 : 10,
                background: i <= active ? step.accent : "rgb(255 255 255 / 0.2)",
              }}
            />
          ))}
          {current && (
            <span className="font-tech ml-2 text-[0.6rem] tracking-[0.24em] text-white/80 uppercase">
              {current.step} {current.label}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

/** Shown while the world loads, and permanently if WebGL is unavailable. */
function FallbackBackdrop({ active, loading }: { active: number; loading: boolean }) {
  const accent = active >= 0 ? journey[active].accent : "#8b7cff";
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="starfield absolute inset-0 opacity-70" />
      <div
        className="absolute inset-0 transition-[background] duration-700"
        style={{
          background: `radial-gradient(42rem 32rem at 72% 38%, ${accent}33, transparent 65%), radial-gradient(60rem 22rem at 50% 118%, rgb(61 139 255 / 0.28), transparent 70%)`,
        }}
      />
      {loading ? (
        <div className="absolute top-1/2 right-[18%] hidden h-24 w-24 -translate-y-1/2 rounded-full border border-white/10 md:block">
          <span className="border-brand-300 absolute inset-0 animate-spin rounded-full border-t [animation-duration:1.4s]" />
        </div>
      ) : (
        // Without WebGL: a still render of the same robot, so the story keeps its guide.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/robot-portrait.png"
          alt=""
          className="absolute top-0 right-0 h-full w-full [mask-image:radial-gradient(circle_at_70%_40%,black_30%,transparent_70%)] object-cover opacity-70 md:w-3/5"
        />
      )}
    </div>
  );
}
