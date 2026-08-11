// Shared fixtures for the test suite: parse index.html once into a DOM and
// expose small query helpers so individual specs stay declarative.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseHTML } from 'linkedom';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
export const { document } = parseHTML(html);

export const CANONICAL = 'https://links.vanshul.com/';
export const OG_IMAGE = 'https://links.vanshul.com/og.png';

/** Domains that are NOT live and must never be linked (would be broken links). */
export const FORBIDDEN_DOMAINS = [
  'cron.vanshul.com',
  'json.vanshul.com',
  'regex.vanshul.com',
  'tokens.vanshul.com',
  'adbrain-pied.vercel.app',
];

export const metaName = (name) =>
  document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ?? null;

export const metaProp = (prop) =>
  document.querySelector(`meta[property="${prop}"]`)?.getAttribute('content') ?? null;

export const jsonLd = () => {
  const el = document.querySelector('script[type="application/ld+json"]');
  return JSON.parse(el.textContent);
};

export const graphNode = (type) =>
  jsonLd()['@graph'].find((n) => n['@type'] === type);

export const anchors = () => [...document.querySelectorAll('a[href]')];
