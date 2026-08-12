#!/usr/bin/env node
// Link-health checker for the linktree. Verifies every OWNED destination still
// responds OK. Social platforms that reject bots (X, LinkedIn, Instagram) are
// intentionally skipped so the check stays low-noise and meaningful. Run
// directly (`node scripts/check-links.mjs`) or on a schedule in CI.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Hosts that answer automated requests with 999/403 — checking them is noise.
export const SKIP_HOSTS = [
  'x.com', 'twitter.com',
  'linkedin.com', 'www.linkedin.com',
  'instagram.com', 'www.instagram.com',
];

/** Extract unique absolute http(s) anchor hrefs from an HTML string. */
export function extractLinks(html) {
  const out = [];
  for (const m of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) {
    if (/^https?:\/\//i.test(m[1])) out.push(m[1]);
  }
  return [...new Set(out)];
}

/** Keep only URLs whose host we actually control / can reliably probe. */
export function checkable(urls) {
  return urls.filter((u) => {
    try { return !SKIP_HOSTS.includes(new URL(u).host); } catch { return false; }
  });
}

async function probe(url, timeoutMs = 15000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'user-agent': 'links.vanshul.com link-health' },
    });
    return { url, status: res.status, ok: res.ok };
  } catch (err) {
    return { url, status: 0, ok: false, error: err.message };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const urls = checkable(extractLinks(html));
  const results = await Promise.all(urls.map((u) => probe(u)));

  let failed = 0;
  for (const r of results) {
    if (!r.ok) failed++;
    console.log(`${r.ok ? '✓' : '✗'} ${r.status || 'ERR'}  ${r.url}${r.error ? `  (${r.error})` : ''}`);
  }
  console.log(`\n${results.length - failed}/${results.length} OK`);
  if (failed) process.exit(1);
}

// Run only when executed directly, so tests can import the pure helpers.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
