@AGENTS.md

# VBloom website

Marketing site for **VBloom**, an IT consulting and technology services company.
Single page, no backend, no database. Next.js 16 (App Router) + TypeScript +
Tailwind CSS 4.

The conventions you must follow are in `AGENTS.md`, imported above. This file
describes how the codebase is put together.

## Commands

```bash
npm run dev        # dev server on :3000
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run build      # production build
npm run format     # Prettier, with Tailwind class sorting
```

Run `lint`, `typecheck` and `build` before pushing. CI runs the same three, in
that order, on a clean checkout.

## Layout

```
src/
  content/site.ts      every word of copy on the site
  app/
    layout.tsx         metadata, fonts, pre-paint theme script
    page.tsx           composes the sections, Organization JSON-LD
    globals.css        design tokens, light/dark, reveal animation
    icon.svg           favicon
  components/          one file per section, plus Icons/Reveal/Section/ThemeToggle
```

## How it fits together

**Content and components are separated.** `src/content/site.ts` exports plain
objects for the company details, nav, hero, services, approach, differentiators,
industries, about and contact options. Components import from it and render.
A wording change should never require touching a component.

**Design tokens, not hex values.** `globals.css` defines the brand ramp
(`--color-brand-*`), a violet accent (`--color-accent-*`), and semantic colours
(`--page`, `--card`, `--text`, `--card-border`, …) that are redefined under
`:root.dark` and exposed through `@theme inline`. Use the utilities these
generate — `bg-brand-600`, `text-text-muted`, `border-card-border` — so both
themes stay correct automatically.

**Dark mode is class-based.** An inline script in `layout.tsx` reads
`localStorage` (falling back to `prefers-color-scheme`) and sets `dark` on
`<html>` before first paint, so there is no flash. `ThemeToggle` flips that
class and persists the choice; it holds no React state, and its icons are
chosen in CSS via the `dark:` variant, so it cannot disagree with the rendered
theme after hydration. Never gate styles on `prefers-color-scheme` directly.

**Reveal animations degrade safely.** `Reveal` adds `is-visible` to its node via
IntersectionObserver. The hiding rule is `.js .reveal { opacity: 0 }`, and the
`js` class comes from the same inline script — so if JavaScript never runs, the
content is plain and visible rather than stuck at zero opacity. `Reveal` toggles
the class on the DOM node directly rather than through state, which also keeps
the ~30 instances on the page from re-rendering.

**The contact form has no backend.** It POSTs `FormData` to
`NEXT_PUBLIC_CONTACT_ENDPOINT` when that is set, and otherwise builds a
`mailto:` link so the form still works on a fresh deploy.

## Gotchas

- **Do not use Next's generated route types** (`LayoutProps<"/">`,
  `PageProps<…>`). They are emitted into `.next/types/` by `next build` and
  `next dev`, so they do not exist on a clean checkout — and CI typechecks
  before it builds. Type props explicitly instead. This broke the first CI run.
- **A local `npm run typecheck` can pass on a dirty tree** for the same reason.
  To reproduce CI honestly, `rm -rf .next` first.
- **The `nextjs-agent-rules` block in `AGENTS.md` is managed by `next dev`.**
  Leave it; deleting it only recreates an uncommitted change. `next dev` leaves
  `CLAUDE.md` alone while `AGENTS.md` hosts that block.
- **`npm start` will not work if `output: "export"` is set** in
  `next.config.ts`. That line is intentionally absent; add it only for a static
  export, and do not commit it as the default.

## Content rules

Do not add client logos, testimonials, case studies, named clients, headcounts
or years-in-business unless a maintainer supplies them. VBloom is newly
registered; invented social proof is not acceptable. The About section states
plainly that the company is new.

Placeholder values still in `site.ts` — `email`, `phone`, `location`,
`legalName`, `social.linkedin` — need replacing before launch.

## Deploying

No server-side code, so anything works: Vercel or Netlify by importing the repo,
or a static export (`output: "export"`) published to GitHub Pages or S3. Set
`NEXT_PUBLIC_SITE_URL` to the real domain so canonical and Open Graph metadata
are right.
