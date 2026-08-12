# Architecture — links.vanshul.com

## What this is

A personal **linktree**: one page that points to every project and profile Vanshul
Goyal maintains. Its only jobs are to (1) render instantly and beautifully, (2) be
maximally discoverable by search engines and link unfurlers, and (3) never break a
link. Everything in this repo serves one of those three goals.

## Zero-backend by design

There is **no server, no database, and no API** — and that is a deliberate
architectural choice, not a gap.

| Concern | Why static wins here |
| --- | --- |
| **Performance** | A single pre-rendered HTML document is the fastest possible response; no cold starts, no queries, no hydration. |
| **Reliability** | Nothing to crash, patch, or scale. GitHub Pages' CDN serves it. |
| **Security** | No server attack surface, no secrets, no user data at rest. |
| **Cost** | Free hosting, indefinitely. |
| **SEO** | Crawlers get the full, final markup on first byte — no JS execution required to see the content. |

The page has exactly **one** third-party dependency at runtime: a deferred,
privacy-light analytics beacon (`https://vanshul.com/a.js`). It is loaded
`defer`, is `preconnect`ed for a faster handshake, and is explicitly ignored by
the service worker so it never blocks rendering or gets cached.

If a feature ever genuinely needs a backend (e.g. dynamic link click-through
stats surfaced on-page), the right move is a separate Cloudflare Worker on its own
subdomain — not turning this page into a server-rendered app. See
[ROADMAP.md](ROADMAP.md).

## Request flow

```
Browser ─▶ GitHub Pages CDN ─▶ index.html (HTML + inline CSS + tiny JS)
   │                                │
   │                                ├─▶ inline SVG favicon/avatar (0 requests)
   │                                ├─▶ /manifest.webmanifest + icons (PWA)
   │                                ├─▶ /sw.js (registers on load)
   │                                └─▶ https://vanshul.com/a.js (deferred beacon)
   ▼
Service worker (after first visit)
   ├─ navigations  → network-first, fall back to cached '/'
   └─ same-origin assets → cache-first, refresh in background
```

## Files

| File | Role |
| --- | --- |
| `index.html` | The whole site: semantic markup, inline CSS custom properties, and a few lines of vanilla JS (year stamp + SW registration). |
| `404.html` | Branded, `noindex` not-found page that routes back home. |
| `manifest.webmanifest` | PWA metadata: name, colors, and the icon set. |
| `sw.js` | Versioned service worker (see caching strategy below). |
| `icon.svg` | Square, maskable icon **source**. |
| `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` | Rasterized icons (see pipeline below). |
| `og.png` / `og.svg` | 1200×630 social preview (raster + source). |
| `sitemap.xml`, `robots.txt` | Generated + kept in sync on push. |
| `sitemap.config.json` | Declares `baseUrl`, the include globs, etc. |
| `scripts/gen-sitemap.mjs` | Zero-dependency sitemap/robots generator (shared across the vanshul.com repos). |
| `.well-known/security.txt` | RFC 9116 security contact. |
| `tests/` | vitest suite that encodes every invariant below. |

## The page itself

- **Layout:** a horizontal header (avatar + name/tagline), a featured hero card
  (`vanshul.com`), a two-column **Projects** grid, and a **Connect** row of icon
  buttons. All spacing/color is driven by CSS custom properties at the top of the
  `<style>` block.
- **No framework, no build:** the file you edit is the file that ships. This keeps
  the markup crawler-perfect and the repo approachable.
- **Accessibility:** one `h1`, labelled landmarks and sections, `aria-label` +
  `title` on icon-only links, a decorative `aria-hidden` avatar, visible
  `:focus-visible` rings, and a `prefers-reduced-motion` escape hatch.

## PWA caching strategy

The service worker (`sw.js`) is intentionally small and correct:

- **`install`** pre-caches the shell (`/`, `index.html`, manifest, icons, og) and
  `skipWaiting()`s.
- **`activate`** deletes any cache whose name ≠ the current `CACHE` version, then
  `clients.claim()`s.
- **`fetch`**:
  - Ignores non-GET and **all cross-origin** requests (analytics + outbound links
    are never touched).
  - **Navigations** → network-first, so link edits go live on the next visit;
    falls back to the cached page when offline.
  - **Same-origin assets** → cache-first with a background refresh.

**To ship an asset change:** bump `CACHE` (e.g. `links-v1` → `links-v2`). The old
cache is purged on `activate`.

## Icon pipeline

`icon.svg` is the single source of truth. The PNGs are rasterized from it with
[sharp](https://sharp.pixelplumbing.com):

```js
sharp('icon.svg', { density: 300 }).resize(size, size).png().toFile(out)
```

sizes: `192`, `512`, and `180` (apple-touch). The PNGs are committed so the site
stays install-ready without a build step; regenerate them only when `icon.svg`
changes. `sharp` is **not** a dependency of this repo — the one-off generation
borrows it from a sibling project.

## Automation & CI

- **`.github/workflows/ci.yml`** runs `npm test` on every push and PR.
- **`.github/workflows/sitemap.yml`** regenerates `sitemap.xml`/`robots.txt` on
  push (ignoring its own output to avoid a loop) and commits any change.
- This page's sitemap is also referenced by the family-wide sitemap index at
  `https://vanshul.com/sitemap-index.xml`, the single sitemap submitted to Google
  Search Console.

## Testing philosophy

`index.html` and the sibling files are the source of truth; the suite asserts the
invariants that keep them correct so a future edit can't silently regress SEO,
accessibility, the link inventory, or the PWA. Tests parse real files (via
`linkedom` / `JSON.parse`) and run the real sitemap generator as a black box —
nothing is mocked away. See the README's Testing section for the per-file
breakdown.

## Key decisions & trade-offs

- **Static over dynamic** — covered above; revisit only for a genuinely dynamic
  need, and then via a separate Worker.
- **Inline CSS/JS over bundles** — one request, no build; the file is small enough
  that readability doesn't suffer.
- **Dark-only theme** — the brand (and OG image) is dark; a light mode would double
  QA surface for little gain. Documented as declined in [ROADMAP.md](ROADMAP.md).
- **Not refactoring `gen-sitemap.mjs`** — it is shared verbatim across the
  vanshul.com repos; diverging it here to make it "prettier" would create drift.
  It is covered by black-box tests instead.
