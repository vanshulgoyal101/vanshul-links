# Roadmap — links.vanshul.com

A living record of what's shipped, what could come next, and what was
deliberately left out. The guiding rule: **every feature must be complete and
justified for a personal linktree** — no half-finished scaffolding, no cargo-cult
additions.

## Shipped

| Feature | Notes |
| --- | --- |
| Grouped link layout | Featured hero + Projects grid + Connect row. |
| Horizontal avatar/name header | SVG "curious ape" beside the name. |
| Rich SEO metadata | Title/description budgets, canonical, robots, Open Graph + Twitter cards. |
| JSON-LD `@graph` | `WebSite` + `ProfilePage` + `Person` (with `sameAs` + `description`) + `ItemList`. |
| `rel="me"` identity links | IndieWeb verification on owned profiles. |
| Auto sitemap + robots | Generated and committed on push; part of the family sitemap index. |
| Installable PWA | Manifest, maskable icons, versioned service worker (network-first HTML, cache-first assets). |
| Branded 404 | `noindex`, routes back home. |
| `security.txt` | RFC 9116 contact under `/.well-known/`. |
| Accessibility pass | Landmarks, labelled icons, focus rings, reduced-motion. |
| Automated link-health check | Scheduled, non-gating CI job probes every owned destination; skips bot-hostile socials. |
| Test suite + CI | 63 vitest tests across SEO, links, structure, PWA, pages, sitemap, and link-check; run on every push/PR. |
| Documentation | README + `docs/{ARCHITECTURE,SEO,ROADMAP}.md`. |

## Proposed / potential

Ideas worth considering, each with the bar it must clear to be worth doing.

- **On-page project status dots** — a live "up/down" indicator per project. Would
  need a tiny status source (a Cloudflare Worker pinging each domain, cached).
  Only worth it if outages are common enough to matter; otherwise it adds a
  backend for cosmetics.
- **Click-through analytics surfaced on-page** — "most visited" ordering. Requires
  reading aggregated beacon data; belongs in a separate Worker + endpoint, never
  inline. Do only if the ordering insight is actually acted on.
- **Icon generation script in-repo** — a committed `scripts/gen-icons.mjs` (with
  `sharp` as an optional dev dep) so icons regenerate without borrowing a sibling
  repo's install. Worth it only if `icon.svg` starts changing often.
- **Dynamic OG image** — per-share generated preview. Overkill for a single static
  page; the committed 1200×630 image already covers it.
- **RSS/JSON feed of projects** — machine-readable project list. The JSON-LD
  `ItemList` already serves discovery; a feed only helps if something consumes it.

## Intentionally declined

Recorded so they don't get re-litigated.

- **A backend / database** — nothing on this page needs server state. See
  [ARCHITECTURE.md](ARCHITECTURE.md#zero-backend-by-design).
- **Light mode / theme switch** — the brand and OG image are dark; a second theme
  doubles visual QA for negligible benefit.
- **Internationalisation** — single-language personal page; `hreflang`/translations
  would be noise.
- **Framework / build step** — would hurt crawlability and add a toolchain for a
  one-page site.
- **Linking not-yet-live projects** (`cron`, `json`, `regex`, `tokens`,
  `adbrain`) — broken links hurt users and crawl budget; a test fails if one is
  added. They can be added the moment they go live.
- **Keyword-stuffed meta** — Google ignores the keywords meta; honesty over spam.
