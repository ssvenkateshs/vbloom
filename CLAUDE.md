@AGENTS.md

# VBloom website

Marketing site for **VBloom**, an AI and digital transformation company. One
page: an immersive scroll-driven 3D journey, followed by conventional sections.
Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Three.js. No backend.

The conventions you must follow are in `AGENTS.md`, imported above. This file
describes how the codebase is put together.

## Commands

```bash
npm run dev        # dev server on :3000
npm run lint       # ESLint (ignores the vendored DESIGN SKILLS folder)
npm run typecheck  # tsc --noEmit
npm run build      # production build
npm run format     # Prettier, with Tailwind class sorting
```

## Layout

```
src/
  content/site.ts            every word of copy, including the six journey steps
  app/                        layout (fonts, metadata), page composition, tokens
  components/
    experience/Experience.tsx sticky stage, hero copy, scene panels, timeline rail
    sections/                 Services, Product, Scenarios, Impact, InnovationLab, Pillars, FinalCta
    Header, Contact, Footer, Icons, Reveal, Section
  world/                      the 3D world (no React)
    createWorld.ts            renderer, studio env, bloom, camera spline, loop
    layout.ts                 scroll pacing, shared with the DOM (no three.js)
    robot.ts                  rigged procedural robot: IK arms, LED eyes
    hero.ts                   opening shot: robot, wordmark, halo, Earth orbit
    space.ts island.ts kit.ts wordmark.ts
    scenes/                   one builder per journey scene
DESIGN SKILLS/                the supplied lets-scroll skill (reference only)
UI Design.docx                the supplied design brief
```

## How it fits together

**The journey follows the lets-scroll model** from `DESIGN SKILLS/`: an interleaved
chain of *dive* segments (camera flies into a scene and settles) and *connector*
segments (pulls up, hops to the next), paced in viewport heights with the skill's
`lingerEase` remap so the camera dwells while the copy peaks. The difference from
the skill: scenes are rendered live in Three.js instead of pre-rendered AI video,
so there are no seams to match and each scene's animation autoplays on arrival.

**Scroll drives the camera, time drives the scenes.** `layout.ts` maps scroll to a
parameter on two Catmull-Rom splines (position and target). Each scene's
`update(dt, t, intro)` receives an `intro` value that runs 0 → 1 over ~3 s when
the camera arrives, and resets once the camera is far away.

**Copy is DOM, the world is decoration.** All story text is real HTML over an
`aria-hidden` canvas. Panel opacity is written straight to the DOM on scroll; React
re-renders only when the active scene changes.

**Hold poses dodge the copy.** In `createWorld.ts` each scene's hold pose slides the
camera sideways (or down on phones) so the scene composes beside its panel.

**Rendering budget:** dark studio PMREM environment (glossy black needs black
reflections), bloom above ~1.0 only, adaptive quality (pixel ratio, then bloom
off), rendering paused off-screen or when the tab is hidden, and only nearby
scenes are visible. Hero ≈ 100 draw calls.

## Debugging the world

Open `/?world-debug` and use `window.__vbloomWorld`:
`stats()`, `debugView([x,y,z], [tx,ty,tz], fov)` to pin the camera,
`debugObject(name)` and `debugSetVisible(name, bool)`. `public/robot-portrait.png`
was rendered this way (wordmark hidden) and doubles as the no-WebGL poster.

## Gotchas

- **Don't use Next's generated route types** (`LayoutProps`, `PageProps`); they
  don't exist on a clean checkout and CI typechecks before building.
- **`rm -rf .next` before a local typecheck** to reproduce CI honestly.
- **Three.js `Clock` is deprecated** (r183+); the world uses `Timer` but keeps its
  own clamped elapsed time, because rAF timestamps can produce a negative first delta.
- **A shader's `vUv.x` along a `TubeGeometry` is the path parameter**; the
  draw-in effect (`kit.tube`) relies on it.
- **Headless verification** needs Chromium with
  `--use-angle=swiftshader --enable-unsafe-swiftshader`. Software rendering is slow,
  so scene intros take ~25 s of wall time to finish in screenshots.
- **The `nextjs-agent-rules` block in `AGENTS.md` is managed by `next dev`.**
- **Don't commit `output: "export"`** in `next.config.ts`; it breaks `npm start`.

## Open items

Placeholders in `site.ts`: `email`, `phone`, `location`, `legalName`,
`social.linkedin`, and the product name/description (taken from the brief).
