@AGENTS.md

# VBloom website

Marketing site for **VBloom**, a technology services and digital transformation
company. One page in two parts, following the "Classic IT Services Homepage" brief:
a 30-second visual story in the hero (Experience A), then a calm, conventional
corporate site (Experience B). Next.js 16 (App Router) + TypeScript + Tailwind CSS 4.
No backend, no 3D engine.

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
  content/site.ts            every word of copy, including the six story chapters and scene labels
  app/                        layout (Manrope + Inter, metadata), page composition, tokens + scene CSS
  components/
    hero/Hero.tsx             story controller: copy panels, timeline, pause/play, quiet paths
    hero/StoryScene.tsx       the SVG scene, rendered from the active chapter
    hero/scene.ts             choreography: each actor's pose per chapter, links per chapter
    sections/                 ValueStrip, Services, AiSolutions, Industries, About, Insights, FinalCta
    Header, Contact, Footer, Icons (incl. Logo, Rosette), Reveal, Section
DESIGN SKILLS/                an earlier supplied skill (reference only)
UI Design.docx                an earlier supplied design brief
```

## How the hero works

**One continuous scene, not six slides.** The same organisation persists: six
system cards start scattered with broken links (Understand), connect to an AI core
(Think), feed a data platform with analytics (Know), gain a cloud foundation
underneath (Scale), get apps and devices on top (Build), and finally resolve into
six satellites around the business (Transform).

**Poses, not timelines.** `scene.ts` gives every actor a pose (`x, y, s, r, o`) for
each of the six chapters. `StoryScene` writes the active pose as an inline CSS
transform; `transition` in `globals.css` glides between poses. Links exist per
chapter and fade in after the actors settle. Ambient motion (flowing dashes,
bobbing, packets) is CSS keyframes plus a few SMIL `animateMotion` dots.

**The timeline is the clock.** The active progress bar runs a 5 s CSS animation;
its `animationend` advances the chapter. Pausing toggles `is-paused`, which pauses
the bar, every CSS animation in the scene and (via `pauseAnimations`) the SMIL dots.
The story pauses automatically for reduced motion, when the hero is off-screen and
when the tab is hidden.

**Server-rendered.** The scene is plain SVG, so chapter 1 is in the initial HTML;
nothing waits for JavaScript. All six chapters' copy is in the DOM, inactive ones
`inert` and `aria-hidden`.

The scene's viewBox is 560 × 520 and scales with its column (about 0.65× on phones),
so scene text is 12–15 px; `.detail` text is hidden below 640 px.

## Themes

Every colour token derives from four bases (`night-950`, `brand-500`, `bloom-500`,
`mint-400`) via `color-mix` in `globals.css`; a `[data-theme="…"]` block just sets
those four. `@theme static` keeps all tokens emitted because the hero SVG reads them
through inline `style` (SVG attributes don't reliably take `var()`). The default is
"Bliss" (periwinkle, lavender glow, mint on deep navy); its bases are the `@theme`
values. The floating `ThemePicker` (themes listed in `site.ts`) offers the
alternatives: it stores the choice in `localStorage`, accepts `?theme=ocean`, and
`themeBoot.ts` applies it before first paint.

## Gotchas

- **Don't use Next's generated route types** (`LayoutProps`, `PageProps`); they
  don't exist on a clean checkout and CI typechecks before building.
- **`rm -rf .next` before a local typecheck** to reproduce CI honestly.
- **SVG transforms are CSS here.** Actor groups are drawn around their own
  origin and use `transform-origin: 0 0`, so `translate → rotate → scale` acts
  about the actor's centre. Bobbing lives on an inner group so it doesn't fight
  the pose transition.
- **Scroll reveals hide content until scrolled into view** (only when JS runs).
  Full-page screenshots need `.reveal` forced to `.is-visible`.
- **The `nextjs-agent-rules` block in `AGENTS.md` is managed by `next dev`.**
- **Don't commit `output: "export"`** in `next.config.ts`; it breaks `npm start`.

## Open items

Placeholders in `site.ts`: `email`, `phone`, `location`, `legalName`,
`social.linkedin`.
