<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# VBloom site conventions

- **All site copy lives in `src/content/site.ts`.** Change wording there, not in
  components. That includes the labels drawn inside the hero scene (`sceneLabels`).
- **Two surfaces, one palette.** The hero, About band and footer are near-black
  (`night-*`); everything else is light (`paper`, `mist`, `ink-*`). Violet
  (`brand-*`) is the accent, `bloom-*` the glow, `mint-*` a sparing positive accent.
  Tokens live in `src/app/globals.css`; use the generated utilities, not hex values.
  The intended feel is roughly 65% enterprise consultancy, 25% digital agency,
  10% futuristic AI: keep motion confined to the hero.
- The hero story is data-driven: `src/components/hero/scene.ts` holds every
  actor's pose per chapter (no React, no DOM), `StoryScene.tsx` renders it, and CSS
  transitions do the in-betweening. Add or move things by editing poses, not by
  adding timers.
- Every motion needs a quiet path: the story pauses for reduced motion, off-screen
  and hidden tabs; the pause button must stop all movement; the copy is real HTML
  and the scene stays `aria-hidden`.
- Do not add client logos, testimonials, case studies, named clients, employee
  counts, years in business, metrics or any other factual claim about the company
  unless a maintainer supplied it. VBloom is newly registered; invented social
  proof is not acceptable. Mock interfaces must stay labelled as illustrative, and
  Insights cards stay "Coming soon" until real articles exist.
- Before pushing: `npm run lint`, `npm run typecheck`, `npm run build`.
