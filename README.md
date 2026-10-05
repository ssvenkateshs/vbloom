# VBloom website

Marketing site for **VBloom**, an AI and digital transformation company: an
immersive scroll-driven 3D journey (Three.js) followed by the business sections.
Built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4 and Three.js.
See `CLAUDE.md` for how the 3D world is put together.

---

## Run it in GitHub Codespaces

The repository ships a devcontainer, so a Codespace boots with Node 22, installs
dependencies and starts the dev server for you.

1. On GitHub: **Code → Codespaces → Create codespace on `main`**.
2. Wait for `npm ci` to finish (`postCreateCommand`).
3. The dev server starts automatically and port **3000** is forwarded. VS Code
   opens the **Simple Browser** preview; the **Ports** tab also gives a
   `*.app.github.dev` URL you can open in a normal browser tab.

If the server is not running, start it yourself:

```bash
npm run dev
```

### Sharing the preview

Port 3000 is **private** by default — only you can open the forwarded URL. To
show the site to someone else, open the **Ports** tab, right-click port 3000 and
set **Port Visibility → Public**, then share the URL.

> A Codespace preview is a *development* URL: it sleeps when the Codespace
> stops and the hostname changes when you rebuild. Use it for review and demos,
> not as the company's live site — see **Going live** below.

---

## Run it locally

```bash
npm ci
npm run dev        # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run format` | Prettier (with Tailwind class sorting) |

---

## Editing the content

**All copy lives in [`src/content/site.ts`](src/content/site.ts).** Company
details, nav links, hero text, the six services, the delivery approach, the
differentiators, industries, the about text and the contact options are plain
objects there — change them and the page updates. You should not need to touch a
component to change wording.

### Replace these placeholders before launch

In `src/content/site.ts`, the `company` object still holds stand-in values:

- `email` — `hello@vbloom.com`
- `phone` — `+91 00000 00000`
- `location` — `Bengaluru, India`
- `legalName` — set this to your registered entity name
- `social.linkedin` — your actual company page

The AI product's name and description come from the design brief (`product` in
`site.ts`) and need confirming.

There are deliberately **no client logos, testimonials or metrics** on the site. Add them
to `site.ts` and render a section once you have real ones you are permitted to
quote — invented social proof is the fastest way to lose a prospect's trust.

### Layout and design

- The 3D journey lives in `src/world/` (one file per scene in `src/world/scenes/`);
  the DOM layer is `src/components/experience/Experience.tsx`.
- Sections after the journey are in `src/components/sections/`.
- The site is dark-only. Tokens (violet brand, plasma, bloom teal, space blacks)
  are in `src/app/globals.css`.
- Visitors without WebGL, or with reduced motion, get a readable fallback: the same
  copy and timeline, with a still render of the robot or cuts instead of flight.

---

## Contact form

By default the form builds a `mailto:` link so it works on a freshly deployed
site with no backend. To receive submissions properly, point it at a form
backend (Formspree, Basin, your own API route) by setting:

```bash
NEXT_PUBLIC_CONTACT_ENDPOINT=https://formspree.io/f/xxxxxxx
```

The form then POSTs `FormData` to that URL and shows a success or error message.

---

## The Claude agent in GitHub

Three workflows are configured in `.github/workflows/`:

| Workflow | Trigger | What it does |
| --- | --- | --- |
| `claude.yml` | `@claude` in an issue, PR or review comment | Claude picks up the thread, can push commits and open PRs |
| `claude-code-review.yml` | Any opened/updated PR | Automatic code review with inline comments |
| `ci.yml` | Every push and PR | Lint, typecheck and build |

### One-time setup

The Claude workflows need an API key:

1. Create a key at <https://console.anthropic.com/settings/keys>.
2. In the repository: **Settings → Secrets and variables → Actions → New
   repository secret**.
3. Name it `ANTHROPIC_API_KEY` and paste the key.

Until that secret exists the two Claude workflows will fail; `ci.yml` works
without it. Also check **Settings → Actions → General → Workflow permissions**
is set to *Read and write permissions* so the agent can push branches.

Then just comment `@claude please add a careers section` on an issue.

---

## Going live

The Codespaces preview is for review. For the public site, pick a host:

- **Vercel** — import the repo, zero configuration, free tier covers this site.
- **Netlify** — same, with the Next.js runtime plugin.
- **Static export** — add `output: "export"` to `next.config.ts` and publish
  `out/` to GitHub Pages, S3 or any static host. The site has no server-side
  code, so this works as-is.

Whichever you choose, set `NEXT_PUBLIC_SITE_URL` to the real domain so the
Open Graph and canonical metadata are correct.
