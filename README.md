# links.vanshul.com

[![ci](https://github.com/vanshulgoyal101/vanshul-links/actions/workflows/ci.yml/badge.svg)](https://github.com/vanshulgoyal101/vanshul-links/actions/workflows/ci.yml)

A single-page **linktree** for Vanshul Goyal ("Curious Ape") — one place that
gathers every live project and profile. Live at
**[links.vanshul.com](https://links.vanshul.com)**.

The whole site is one self-contained `index.html` (markup + inline CSS + a few
lines of vanilla JS). There is no framework and no build step: the page you edit
is the page that ships.

---

## Features

- **Zero runtime dependencies** — pure HTML/CSS/JS, served statically.
- **Grouped layout** — a featured hero, a two-column **Projects** grid, and a
  compact **Connect** row of social icons.
- **Horizontal header** — an SVG "curious ape" avatar beside the name/tagline.
- **First-class SEO** — a rich JSON-LD `@graph`, full Open Graph + Twitter
  cards, canonical URL, and an auto-synced sitemap/robots. See
  [docs/SEO.md](docs/SEO.md).
- **Accessible** — semantic landmarks, `aria-label`led icon buttons, visible
  focus rings, and `prefers-reduced-motion` support.
- **Tested** — a [vitest](https://vitest.dev) suite guards the SEO metadata,
  link inventory, page structure, and the sitemap generator.

---

## Links

| Group | Label | Target |
| --- | --- | --- |
| Featured | vanshul.com | `https://vanshul.com` |
| Project | Games | `https://games.vanshul.com` |
| Project | Blog | `https://blog.vanshul.com` |
| Project | Tools | `https://tools.vanshul.com` |
| Project | ctx | `https://ctx.vanshul.com` |
| Project | mcp | `https://mcp.vanshul.com` |
| Project | Solaride | `https://solaride.in` |
| Connect | GitHub | `https://github.com/vanshulgoyal101` |
| Connect | X / Twitter | `https://x.com/goyal_vanshul` |
| Connect | LinkedIn | `https://www.linkedin.com/in/vanshul-goyal00/` |
| Connect | Instagram | `https://www.instagram.com/vanshul_goyal/` |
| Connect | Email | `mailto:vanshulg101@gmail.com` |

External links open in a new tab with `rel="noopener"`; self-owned profiles also
carry `rel="me"` for identity verification. Only **live** destinations are
listed — the test suite fails if an unlaunched domain is linked.

---

## Project structure

```
vanshul-links/
├── index.html              # The entire page (markup + inline CSS + JS)
├── og.png / og.svg         # 1200×630 Open Graph preview image (raster + source)
├── sitemap.xml             # Single-URL sitemap (auto-generated)
├── robots.txt              # Allow all + sitemap reference (auto-synced)
├── sitemap.config.json     # Inputs for the sitemap generator
├── scripts/gen-sitemap.mjs # Zero-dep sitemap + robots generator
├── tests/                  # vitest suite (see below)
├── package.json            # Dev tooling + scripts (no runtime deps)
├── CNAME                   # links.vanshul.com (GitHub Pages custom domain)
├── .nojekyll               # Serve files as-is (no Jekyll processing)
└── .github/workflows/      # ci.yml (tests) + sitemap.yml (auto-sitemap)
```

---

## Development

Requires Node.js (LTS). Install the dev tooling once:

```bash
npm install
```

Scripts:

| Command | What it does |
| --- | --- |
| `npm test` | Run the full vitest suite once. |
| `npm run test:watch` | Re-run tests on change. |
| `npm run test:coverage` | Run with a V8 coverage report. |
| `npm run sitemap` | Regenerate `sitemap.xml` + `robots.txt`. |

There is no dev server to run — open `index.html` directly, or serve the folder
with any static server (e.g. `npx serve`).

---

## Testing

The suite treats `index.html` as the source of truth and asserts the invariants
that keep the page correct and discoverable:

- **`tests/seo.test.js`** — doctype, `lang`, charset, viewport; title and
  description length budgets; canonical; robots directives; Open Graph + Twitter
  cards; and a full parse of the JSON-LD `@graph` (WebSite / ProfilePage /
  Person / ItemList), including `@id` cross-references.
- **`tests/links.test.js`** — every new-tab link has `rel="noopener"`; only
  `https`/`mailto` URLs are used; the featured, project, and social link sets
  match exactly; self-owned profiles carry `rel="me"`; and no non-live domain is
  ever linked.
- **`tests/structure.test.js`** — single `main`/`footer`/`h1`, decorative avatar
  hidden from assistive tech, labelled sections, complete project cards, unique
  social `aria-label`s, and de-duplicated `id`s.
- **`tests/sitemap.test.js`** — the committed `sitemap.xml`/`robots.txt` are
  well-formed and consistent, plus a black-box run of `gen-sitemap.mjs` in a
  temp directory covering its file→URL mapping, exclude rules, `og:image`
  extraction, and robots sync.

CI runs `npm test` on every push and pull request via
[`.github/workflows/ci.yml`](.github/workflows/ci.yml).

---

## SEO

Metadata is engineered to rank and to render rich previews everywhere. The full
strategy — structured data, crawler directives, social cards, and the ranking
rationale — lives in **[docs/SEO.md](docs/SEO.md)**.

---

## Accessibility

- Semantic landmarks (`main`, `header`, `footer`, labelled `section`s).
- Icon-only social buttons expose `aria-label` + `title`; the decorative avatar
  is `aria-hidden`.
- Visible `:focus-visible` rings on every interactive element.
- `@media (prefers-reduced-motion: reduce)` disables transforms/transitions.

---

## Performance

- One HTML document, no external CSS/JS bundles, no web fonts.
- The only third-party request is a deferred analytics beacon; the page
  `preconnect`s / `dns-prefetch`es to its origin to shave the handshake.
- Favicon and avatar are inline SVG (no extra requests).

---

## Deployment

Hosted on **GitHub Pages** from the repository root — no build. `CNAME` maps the
custom domain and `.nojekyll` disables Jekyll.

```bash
# Edit index.html, then:
npm test
git add -A && git commit -m "…" && git push origin main
```

On push, [`sitemap.yml`](.github/workflows/sitemap.yml) regenerates
`sitemap.xml`/`robots.txt` and commits any change; GitHub Pages serves the update
after a short propagation delay.

---

## Editing guide

- **Add/remove a project:** duplicate an `<a class="card">` block in the Projects
  grid, then add its URL to both the Person `sameAs` array and the `ItemList` in
  the JSON-LD. Update `tests/links.test.js` so the expected set matches.
- **Add/remove a profile:** duplicate an `<a class="social">` block (keep
  `rel="me noopener"`), and add the URL to `sameAs`.
- **Change the featured link:** move the `featured` class to a different `<a>`.
- **Colours/spacing:** every token is a CSS custom property at the top of the
  `<style>` block.

After any change, run `npm test` before pushing.
