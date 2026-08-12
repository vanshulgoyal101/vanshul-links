# SEO strategy — links.vanshul.com

This page is a personal linktree, so its SEO job is narrow but important: own the
branded queries (**"Vanshul Goyal"**, **"Curious Ape"**, **"vanshulgoyal101"**),
feed search engines a clean map of every owned property, and render a rich
preview wherever the URL is shared. Everything below is enforced by the test
suite in [`../tests`](../tests).

## 1. Crawlability & indexing

- **Canonical** — a self-referential `<link rel="canonical" href="https://links.vanshul.com/">`
  prevents duplicate-URL dilution (trailing slash, `www`, query strings).
- **Robots meta** — `index, follow, max-image-preview:large, max-snippet:-1` so
  Google may show large image previews and full snippets.
- **robots.txt** — `Allow: /` plus a `Sitemap:` line, kept in sync by the
  generator.
- **sitemap.xml** — a one-URL sitemap with `lastmod`, auto-regenerated on push.

## 2. Structured data (JSON-LD `@graph`)

A single `@graph` connects four entities by `@id` so search engines resolve one
coherent knowledge object rather than four loose blobs:

| Entity | Role |
| --- | --- |
| `WebSite` | Declares the site and its publisher. |
| `ProfilePage` | Marks the page type and its `primaryImageOfPage`. |
| `Person` | The identity: `name`, `alternateName` ("Curious Ape"), and a `sameAs` array of every profile/project — the core signal for a Knowledge Panel. |
| `ItemList` | An ordered list of the projects, each a `ListItem` with `position`, `url`, and `name`. |

`sameAs` is the highest-leverage field here: it tells Google that this page, the
portfolio, the games arcade, GitHub, X, LinkedIn, and Instagram are all the same
entity, consolidating authority across them.

## 3. Social / link previews

- **Open Graph** — `og:type=profile`, `og:title`, `og:description`, `og:url`,
  and a `1200×630` `og:image` with explicit `width`/`height`/`alt`.
- **Twitter** — `summary_large_image` with its own image + alt.

Correct dimensions and an absolute `https` image URL are asserted in tests so a
future edit can't silently break the preview.

## 4. Identity verification

Self-owned social links carry `rel="me"`, an
[IndieWeb](https://indieweb.org/rel-me) signal used by services (e.g. Mastodon
profile verification, IndieAuth) to confirm this page and those profiles belong
to the same person.

## 5. Performance & UX signals

Core Web Vitals feed ranking. This page keeps them effortless:

- One HTML document, inline CSS, no web fonts, no render-blocking bundles.
- `preconnect`/`dns-prefetch` to the analytics origin.
- `theme-color` + `color-scheme: dark` for a native-feeling mobile UI.
- `prefers-reduced-motion` support (accessibility is a quality signal).
- **Installable PWA** — a web app manifest, maskable icons, and a service worker
  make the page add-to-home-screen capable, which improves mobile engagement and
  repeat-visit signals. See [ARCHITECTURE.md](ARCHITECTURE.md#pwa-caching-strategy).

## 6. Cross-property sitemap index

`links.vanshul.com/sitemap.xml` is also referenced from the family-wide sitemap
index at `https://vanshul.com/sitemap-index.xml`, which is the single sitemap
submitted to Google Search Console. Adding this page's projects to its own
`ItemList` plus the parent index gives Google two independent paths to discover
every property.

## What is intentionally **not** done

- **No keyword stuffing.** The `keywords` meta is minimal and honest; Google
  ignores it anyway.
- **No non-live links.** Unlaunched domains (`cron`/`json`/`regex`/`tokens`,
  `adbrain`) are excluded; a test fails if one is added, since broken links hurt
  both users and crawl budget.
