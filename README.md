# links.vanshul.com

A single-page **linktree** for Vanshul Goyal ("Curious Ape") — one place that
gathers every project and profile. Live at
**[links.vanshul.com](https://links.vanshul.com)**.

## What it is

A self-contained, dependency-free `index.html`: dark theme, an SVG "curious ape"
avatar/favicon, a `Curious Ape` tagline, and a vertical list of links. There is
no build step and no JavaScript framework — just HTML + inline CSS.

## Links (in order)

| Label | Target | Notes |
| --- | --- | --- |
| Vanshul.com | `https://vanshul.com` | Featured (first, highlighted) — the portfolio + blog. |
| Blog | `https://blog.vanshul.com` | Redirects to the portfolio blog section. |
| Games | `https://games.vanshul.com` | The Tiny Arcade browser games. |
| GitHub | `https://github.com/vanshulgoyal101` | |
| X / Twitter | `https://x.com/goyal_vanshul` | |
| LinkedIn | `https://www.linkedin.com/in/vanshul-goyal00/` | |
| Instagram | `https://www.instagram.com/vanshul_goyal/` | |
| Email | `mailto:vanshulg101@gmail.com` | |

External links open in a new tab with `rel="noopener"`.

## File layout

```
vanshul-links/
├── index.html      # The entire page (markup + inline CSS)
├── og.png / og.svg # Open Graph preview image
├── sitemap.xml     # Single-URL sitemap
├── robots.txt      # Allow all + sitemap reference
├── CNAME           # links.vanshul.com (GitHub Pages custom domain)
└── .nojekyll       # Serve files as-is (no Jekyll processing)
```

## SEO

The page ships a full metadata layer: keyword-rich title/description, canonical,
`robots`, Open Graph (`og:type=profile`) + Twitter card with a 1200×630 image,
and `ProfilePage` / `Person` **JSON-LD** whose `sameAs` lists all the profiles
above. `theme-color` is set for a dark mobile status bar.

## Deployment

Hosted on **GitHub Pages** from the repository root (no build). The `CNAME` file
maps the custom domain and `.nojekyll` disables Jekyll.

```bash
# Edit index.html, then:
git add -A && git commit -m "…" && git push origin main
```

GitHub Pages serves the change after a short propagation delay.

## Editing

- **Add/remove a link:** duplicate an `<a class="link">` block in `index.html`
  and, if it's a profile, add its URL to the `sameAs` array in the JSON-LD.
- **Change the featured link:** move the `featured` class to a different `<a>`.
- **Colours/spacing:** all tokens are CSS custom properties in the `<style>` block.
