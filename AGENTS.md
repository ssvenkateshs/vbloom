<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# VBloom site conventions

- **All site copy lives in `src/content/site.ts`.** Change wording there, not in
  components. Components in `src/components/` import from it.
- Design tokens (brand colours, semantic light/dark colours, fonts) are defined
  in `src/app/globals.css`. Use the Tailwind utilities they generate
  (`bg-brand-600`, `text-text-muted`, `border-card-border`, …) rather than
  hard-coded hex values, so both themes stay correct.
- Dark mode is class-based (`dark` on `<html>`), applied before paint by the
  inline script in `src/app/layout.tsx`. Never gate styles on
  `prefers-color-scheme` directly — use the `dark:` variant.
- Do not add client logos, testimonials, case studies, named clients, employee
  counts, years in business, or any other factual claim about the company unless
  a maintainer supplied it. VBloom is newly registered; invented social proof is
  not acceptable.
- Before pushing: `npm run lint`, `npm run typecheck`, `npm run build`.
