<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# VBloom site conventions

- **All site copy lives in `src/content/site.ts`.** Change wording there, not in
  components, and not inside the 3D scenes (their in-world labels are the only
  exception and come from the design brief).
- The site is **dark-only** (neon night). Design tokens live in
  `src/app/globals.css`; use the generated utilities (`bg-brand-500`,
  `text-text-muted`, `bg-space-950`, `text-bloom-300`, …) rather than hex values.
- `src/world/` is framework-agnostic Three.js. Keep React out of it; the
  `Experience` component is the only bridge. `src/world/layout.ts` must stay free
  of three.js so the copy panels and timeline work without WebGL.
- Every 3D effect needs a quiet path: honour `reducedMotion` (cut, don't fly),
  keep the no-WebGL fallback readable, and never block content on the canvas.
- Do not add client logos, testimonials, case studies, named clients, employee
  counts, years in business, metrics or any other factual claim about the company
  unless a maintainer supplied it. VBloom is newly registered; invented social
  proof is not acceptable. Scenarios must stay labelled as illustrative.
- Before pushing: `npm run lint`, `npm run typecheck`, `npm run build`.
